import { saveStripePaymentMethod } from "@api/services/mainServices";
import useGuestScreenGuard from "@hooks/useGuestScreenGuard";
import colors from "@assets/colors";
import { showToast } from "@components/AppToast";
import ButtonComp from "@components/ButtonComp";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import { STRIPE_PUBLISHABLE_KEY } from "@config/stripe";
import { usePayments } from "@hooks/usePayments";
import { clearSetupClientSecret } from "@redux/slices/paymentSlice";
import { CardField, useStripe } from "@stripe/stripe-react-native";
import { getHeight, getHoriPadding } from "@utils/responsive";
import useStickyBottomInset from "@hooks/useStickyBottomInset";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { StyleSheet, Text, View } from "react-native";


const AddCard = ({ navigation }) => {
  useGuestScreenGuard();
  const bottomInset = useStickyBottomInset();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState(null);
  const { addDevelopmentCard, prepareAddCard, getCards, payment } =
    usePayments();
  const { createPaymentMethod, confirmSetupIntent } = useStripe();
  const stripeCustomerId = useSelector((s) => s.payment.stripeCustomerId);

  useEffect(() => {
    if (!STRIPE_PUBLISHABLE_KEY || payment.setupClientSecret) {
      return;
    }
    prepareAddCard().catch(() => {});
  }, [payment.setupClientSecret, prepareAddCard]);

  const resolveClientSecret = async () => {
    if (payment.setupClientSecret) {
      return payment.setupClientSecret;
    }
    const res = await prepareAddCard();
    if (!res?.ok || !res.clientSecret) {
      throw new Error("Could not initialize card setup.");
    }
    return res.clientSecret;
  };

  const persistPaymentMethod = async (paymentMethodId) => {
    try {
      await saveStripePaymentMethod({
        paymentMethodId,
        payment_method_id: paymentMethodId,
        stripeCustomerId,
        customerId: stripeCustomerId,
      });
    } catch (error) {
      console.log("saveStripePaymentMethod error", error);
    }
  };

  const handleContinue = async () => {
    if (!cardDetails?.complete) {
      showToast("error", "Please enter complete card details.");
      return;
    }

    try {
      setLoading(true);
      const clientSecret = await resolveClientSecret();

      const { error: pmError, paymentMethod } = await createPaymentMethod({
        paymentMethodType: "Card",
      });

      if (pmError || !paymentMethod?.id) {
        showToast("error", pmError?.message || "Invalid card details.");
        return;
      }

      const { error, setupIntent } = await confirmSetupIntent(clientSecret, {
        paymentMethodType: "Card",
        paymentMethodData: {
          paymentMethodId: paymentMethod.id,
        },
      });

      if (error) {
        showToast("error", error.message || "Could not add card.");
        return;
      }

      const status = String(setupIntent?.status || "").toLowerCase();
      if (status !== "succeeded") {
        showToast(
          "error",
          `Card setup incomplete (${setupIntent?.status || "unknown"}).`
        );
        return;
      }

      await persistPaymentMethod(paymentMethod.id);
      await getCards();
      dispatch(clearSetupClientSecret());
      showToast("success", "Card added.");
      navigation.goBack();
    } catch (err) {
      console.log("AddCard handleContinue error", err);
      showToast("error", err?.message || "Failed to add card.");
    } finally {
      setLoading(false);
    }
  };

  const handleMockOnly = async () => {
    try {
      setLoading(true);
      const res = await addDevelopmentCard();
      if (res?.ok) {
        navigation.goBack();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!STRIPE_PUBLISHABLE_KEY) {
    return (
      <MainContainer>
        <Header title="Add card" />
        <View style={[styles.screen, { paddingBottom: bottomInset + getHeight(16) }]}>
          <Text style={styles.infoText}>
            No Stripe publishable key is configured. You can still add an
            in-memory mock card for local testing (no CardField / no native
            Stripe UI without a key).
          </Text>
          <ButtonComp title="Add mock test card" onPress={handleMockOnly} />
        </View>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <Header title="Add cards" />

      <View style={styles.screen}>
        <View style={styles.cardFieldContainer}>
          <CardField
            postalCodeEnabled={false}
            autofocus
            cardStyle={{
              backgroundColor: "#FFFFFF",
              textColor: colors.black,
            }}
            style={styles.cardField}
            onCardChange={(card) => {
              setCardDetails(card);
            }}
          />
        </View>

        <View style={[styles.footer, { paddingBottom: bottomInset + getHeight(16) }]}>
          <ButtonComp
            disabled={loading}
            title={loading ? "Saving…" : "Save card"}
            onPress={handleContinue}
          />
        </View>
      </View>
    </MainContainer>
  );
};

export default AddCard;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: getHoriPadding(16),
    paddingTop: getHeight(16),
    paddingBottom: getHeight(24),
    backgroundColor: colors.white,
  },
  infoText: {
    fontSize: 14,
    color: colors.black,
    marginBottom: getHeight(20),
    lineHeight: 20,
  },
  cardFieldContainer: {
    marginBottom: getHeight(24),
  },
  cardField: {
    width: "100%",
    height: getHeight(50),
  },
  footer: {
    alignItems: "center",
    paddingBottom: getHeight(40),
  },
});
