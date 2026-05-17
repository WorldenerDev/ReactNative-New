import { showToast } from "@components/AppToast";
import { usePaymentStripe } from "@context/PaymentStripeContext";
import {
  fetchPaymentMethods,
  removePaymentMethod,
  setLastClientSecret,
  setSelectedCard,
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
  const busyRef = useRef(false);

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
        const { clientSecret } = await paymentApi.runPaymentApi(() =>
          paymentApi.createSetupIntent({})
        );

        if (paymentApi.isMockClientSecret(clientSecret)) {
          await new Promise((r) => setTimeout(r, 450));
          const rawLast4 = cardDetails?.last4 || "4242";
          const last4 = String(rawLast4).replace(/\s/g, "").slice(-4).padStart(4, "0");
          paymentApi.appendMockSavedCard({
            id: `mock_pm_${Date.now()}`,
            brand: cardDetails?.brand || "Card",
            last4,
            isDefault: false,
          });
          await dispatch(fetchPaymentMethods()).unwrap();
          showToast("success", "Card added.");
          return { ok: true };
        }

        if (!stripe?.confirmSetupIntent) {
          showToast(
            "error",
            "Stripe is not configured. Set STRIPE_PUBLISHABLE_KEY to add a real card."
          );
          return { ok: false };
        }

        const { error, setupIntent } = await stripe.confirmSetupIntent(
          clientSecret,
          {
            paymentMethodType: "Card",
          }
        );

        if (error) {
          showToast("error", error.message || "Could not add card.");
          return { ok: false };
        }

        const rawPm = setupIntent?.paymentMethod;
        const pm =
          typeof rawPm === "object" && rawPm !== null ? rawPm : null;
        const card =
          pm?.Card ||
          pm?.card ||
          pm?.PaymentMethod?.card ||
          pm?.paymentMethod?.card;
        const pmId =
          pm?.id ||
          setupIntent?.paymentMethodId ||
          (typeof rawPm === "string" ? rawPm : null);

        if (pmId && !paymentApi.isPaymentBackendConfigured()) {
          paymentApi.appendMockSavedCard({
            id: pmId,
            brand: card?.brand || card?.displayBrand || "Card",
            last4: card?.last4 || "0000",
            isDefault: false,
          });
        }
        await dispatch(fetchPaymentMethods()).unwrap();
        showToast("success", "Card added.");
        return { ok: true };
      } catch (e) {
        showToast("error", e?.message || "Failed to add card.");
        return { ok: false };
      } finally {
        busyRef.current = false;
      }
    },
    [dispatch, stripe]
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
    addCard,
    pay,
    addDevelopmentCard,
  };
}
