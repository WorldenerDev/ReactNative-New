import { showToast } from "@components/AppToast";
import { usePaymentStripe } from "@context/PaymentStripeContext";
import {
  clearSetupClientSecret,
  fetchPaymentMethods,
  removePaymentMethod,
  setLastClientSecret,
  setSelectedCard,
  setSetupClientSecret,
  setStripeCustomerId,
} from "@redux/slices/paymentSlice";
import * as paymentApi from "../services/payment";
import { useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

/**
 * Stripe + mock payment actions. Uses {@link PaymentStripeContext} for `confirmSetupIntent` / `confirmPayment` when a publishable key is set.
 */
export function usePayments() {
  const dispatch = useDispatch();
  const stripe = usePaymentStripe();
  const payment = useSelector((s) => s.payment);
  const user = useSelector((s) => s.auth.user);
  const busyRef = useRef(false);

  const fetchSetupIntent = useCallback(async () => {
    const setupResult = await paymentApi.runPaymentApi(() =>
      paymentApi.createSetupIntent({
        customerId: payment.stripeCustomerId,
        tripId: payment.tripId,
        user,
      })
    );
    const { clientSecret, customerId } = setupResult;

    if (customerId) {
      dispatch(setStripeCustomerId(customerId));
    }
    if (clientSecret) {
      dispatch(setSetupClientSecret(clientSecret));
    }

    return setupResult;
  }, [
    dispatch,
    payment.stripeCustomerId,
    payment.tripId,
    user,
  ]);

  const getCards = useCallback(() => {
    return dispatch(fetchPaymentMethods());
  }, [dispatch]);

  const selectCard = useCallback(
    (id) => {
      dispatch(setSelectedCard(id));
    },
    [dispatch]
  );

  const deleteCard = useCallback(
    async (id) => {
      if (busyRef.current) {
        return { ok: false };
      }
      busyRef.current = true;
      try {
        await dispatch(removePaymentMethod(id)).unwrap();
        showToast("success", "Card removed.");
        return { ok: true };
      } catch (e) {
        showToast("error", String(e));
        return { ok: false };
      } finally {
        busyRef.current = false;
      }
    },
    [dispatch]
  );

  /** Calls `/get-client-secret` (via createSetupIntent) before opening the add-card screen. */
  const prepareAddCard = useCallback(async () => {
    if (busyRef.current) {
      return { ok: false };
    }
    busyRef.current = true;
    try {
      const { clientSecret } = await fetchSetupIntent();
      if (!clientSecret) {
        showToast("error", "Could not initialize card setup.");
        return { ok: false };
      }
      return { ok: true, clientSecret };
    } catch (e) {
      showToast("error", e?.message || "Could not initialize card setup.");
      return { ok: false };
    } finally {
      busyRef.current = false;
    }
  }, [fetchSetupIntent]);

  const addCard = useCallback(
    async (cardDetails) => {
      if (busyRef.current) {
        return { ok: false };
      }
      if (!cardDetails?.complete) {
        showToast("error", "Please enter complete card details.");
        return { ok: false };
      }
      busyRef.current = true;
      try {
        let clientSecret = payment.setupClientSecret;

        if (!clientSecret) {
          const setupResult = await fetchSetupIntent();
          clientSecret = setupResult.clientSecret;
        }

        if (!clientSecret) {
          showToast("error", "Missing setup secret. Go back and try again.");
          return { ok: false };
        }

        if (paymentApi.isMockClientSecret(clientSecret)) {
          await new Promise((r) => setTimeout(r, 450));
          const rawLast4 = cardDetails?.last4 || "4242";
          const last4 = String(rawLast4)
            .replace(/\s/g, "")
            .slice(-4)
            .padStart(4, "0");
          paymentApi.appendMockSavedCard({
            id: `mock_pm_${Date.now()}`,
            brand: cardDetails?.brand || "Card",
            last4,
            isDefault: false,
          });
          await dispatch(fetchPaymentMethods()).unwrap();
          dispatch(clearSetupClientSecret());
          showToast("success", "Card added.");
          return { ok: true };
        }

        if (!stripe?.createPaymentMethod || !stripe?.confirmSetupIntent) {
          showToast(
            "error",
            "Stripe is not configured. Set STRIPE_PUBLISHABLE_KEY to add a real card."
          );
          return { ok: false };
        }

        const { error: pmError, paymentMethod } =
          await stripe.createPaymentMethod({
            paymentMethodType: "Card",
          });

        if (pmError || !paymentMethod?.id) {
          showToast("error", pmError?.message || "Invalid card details.");
          return { ok: false };
        }

        const { error, setupIntent } = await stripe.confirmSetupIntent(
          clientSecret,
          {
            paymentMethodType: "Card",
            paymentMethodData: {
              paymentMethodId: paymentMethod.id,
            },
          }
        );

        if (error) {
          showToast("error", error.message || "Could not add card.");
          return { ok: false };
        }

        const status = String(setupIntent?.status || "").toLowerCase();
        if (status !== "succeeded") {
          showToast(
            "error",
            `Card setup incomplete (${setupIntent?.status || "unknown"}).`
          );
          return { ok: false };
        }

        await dispatch(fetchPaymentMethods()).unwrap();
        dispatch(clearSetupClientSecret());
        showToast("success", "Card added.");
        return { ok: true };
      } catch (e) {
        showToast("error", e?.message || "Failed to add card.");
        return { ok: false };
      } finally {
        busyRef.current = false;
      }
    },
    [dispatch, fetchSetupIntent, payment.setupClientSecret, stripe]
  );

  const addDevelopmentCard = useCallback(async () => {
    if (busyRef.current) {
      return { ok: false };
    }
    busyRef.current = true;
    try {
      paymentApi.appendMockSavedCard({
        id: `mock_pm_dev_${Date.now()}`,
        brand: "Visa",
        last4: "4242",
        isDefault: false,
      });
      await dispatch(fetchPaymentMethods()).unwrap();
      showToast("success", "Development card added.");
      return { ok: true };
    } catch (e) {
      showToast("error", e?.message || "Failed to add card.");
      return { ok: false };
    } finally {
      busyRef.current = false;
    }
  }, [dispatch]);

  const pay = useCallback(async () => {
    if (busyRef.current) {
      return { ok: false };
    }
    if (!payment?.selectedId) {
      showToast("error", "Select a payment method.");
      return { ok: false };
    }
    const amount =
      payment?.amountMinor != null && payment.amountMinor > 0
        ? payment.amountMinor
        : null;
    if (amount == null) {
      showToast(
        "error",
        "Missing cart total. Go back through the cart checkout so the amount can be set."
      );
      return { ok: false };
    }

    busyRef.current = true;
    try {
      const { clientSecret } = await paymentApi.runPaymentApi(() =>
        paymentApi.createPaymentIntent({
          amount,
          currency: payment.currency || "usd",
          paymentMethodId: payment.selectedId,
          cartId: payment.cartId,
        })
      );
      dispatch(setLastClientSecret(clientSecret));

      if (paymentApi.isMockClientSecret(clientSecret)) {
        await new Promise((r) => setTimeout(r, 500));
        return { ok: true };
      }

      if (!stripe?.confirmPayment) {
        showToast(
          "error",
          "Stripe is not configured. Set STRIPE_PUBLISHABLE_KEY to pay with a real card."
        );
        return { ok: false };
      }

      const { error, paymentIntent } = await stripe.confirmPayment(
        clientSecret,
        {
          paymentMethodType: "Card",
          paymentMethodData: {
            paymentMethodId: payment.selectedId,
          },
        }
      );

      if (error) {
        showToast("error", error.message || "Payment failed.");
        return { ok: false };
      }

      const status = paymentIntent?.status;
      if (
        status != null &&
        String(status).toLowerCase() !== "succeeded"
      ) {
        showToast("error", `Payment status: ${status}`);
        return { ok: false };
      }

      return { ok: true };
    } catch (e) {
      showToast("error", e?.message || "Payment failed.");
      return { ok: false };
    } finally {
      busyRef.current = false;
    }
  }, [dispatch, payment, stripe]);

  return {
    payment,
    getCards,
    selectCard,
    deleteCard,
    prepareAddCard,
    addCard,
    pay,
    addDevelopmentCard,
  };
}
