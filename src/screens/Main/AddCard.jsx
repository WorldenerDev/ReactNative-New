import { saveStripePaymentMethod } from "@api/services/mainServices";
import useGuestScreenGuard from "@hooks/useGuestScreenGuard";
import colors from "@assets/colors";
import imagePath from "@assets/icons";
import { showToast } from "@components/AppToast";
import ButtonComp from "@components/ButtonComp";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import { STRIPE_PUBLISHABLE_KEY } from "@config/stripe";
import { usePayments } from "@hooks/usePayments";
import {
  addLocalCard,
  addOneTimeCard,
  clearSetupClientSecret,
  setSelectedCard,
} from "@redux/slices/paymentSlice";
import { CardField, useStripe } from "@stripe/stripe-react-native";
import { getHeight, getHoriPadding } from "@utils/responsive";
import useStickyBottomInset from "@hooks/useStickyBottomInset";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";


const AddCard = ({ navigation, route }) => {
  useGuestScreenGuard();
  const bottomInset = useStickyBottomInset();
  const dispatch = useDispatch();
  const forCheckout = Boolean(route?.params?.forCheckout);
  const [loading, setLoading] = useState(false);
  const [saveCard, setSaveCard] = useState(true);
  const [cardDetails, setCardDetails] = useState(null);
  const { addDevelopmentCard, prepareAddCard, getCards, payment } =
    usePayments();
  const { createPaymentMethod, confirmSetupIntent } = useStripe();
  const stripeCustomerId = useSelector((s) => s.payment.stripeCustomerId);
  const shouldSaveCard = !forCheckout || saveCard;

  const mapCardFromDetails = (paymentMethodId, extras = {}) => {
    const stripeCard = extras.Card || extras.card || {};
    return {
      id: paymentMethodId,
      brand:
        stripeCard.brand ||
        cardDetails?.brand ||
        extras.brand ||
        "Card",
      last4:
        stripeCard.last4 ||
        cardDetails?.last4 ||
        extras.last4 ||
        "0000",
      expMonth:
        stripeCard.expMonth ??
        cardDetails?.expiryMonth ??
        extras.expMonth,
      expYear:
        stripeCard.expYear ??
        cardDetails?.expiryYear ??
        extras.expYear,
    };
  };

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

      const { error: pmError, paymentMethod } = await createPaymentMethod({
        paymentMethodType: "Card",
      });

      if (pmError || !paymentMethod?.id) {
        showToast("error", pmError?.message || "Invalid card details.");
        return;
      }

      if (shouldSaveCard) {
        const clientSecret = await resolveClientSecret();
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
      }

      const mappedCard = mapCardFromDetails(paymentMethod.id, paymentMethod);

      if (shouldSaveCard) {
        await persistPaymentMethod(paymentMethod.id);
        dispatch(addLocalCard(mappedCard));
        const result = await getCards();
        const fetched = result?.payload?.items || [];
        if (!fetched.some((item) => item.id === paymentMethod.id)) {
          dispatch(addOneTimeCard(mappedCard));
        }
        dispatch(setSelectedCard(paymentMethod.id));
        showToast("success", "Card added.");
      } else {
        dispatch(addOneTimeCard(mappedCard));
        showToast("success", "Card added for this payment.");
      }

      dispatch(clearSetupClientSecret());
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
      if (!shouldSaveCard) {
        dispatch(
          addOneTimeCard(
            mapCardFromDetails(`mock_pm_once_${Date.now()}`, {
              brand: "Visa",
              last4: "4242",
              expMonth: 12,
              expYear: 2030,
            })
          )
        );
        showToast("success", "Card added for this payment.");
        navigation.goBack();
        return;
      }
      const res = await addDevelopmentCard();
      if (res?.ok) {
        navigation.goBack();
      }
    } finally {
      setLoading(false);
    }
  };

  const renderSaveCheckbox = () => {
    if (!forCheckout) {
      return null;
    }

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.saveRow}
        onPress={() => setSaveCard((value) => !value)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: saveCard }}
        accessibilityLabel="Save card"
      >
        <View style={[styles.checkbox, saveCard && styles.checkboxChecked]}>
          {saveCard ? (
            <Image
              source={imagePath.CHECK_ICON}
              style={styles.checkIcon}
              resizeMode="contain"
            />
          ) : null}
        </View>
        <Text style={styles.saveLabel}>Save card</Text>
      </TouchableOpacity>
    );
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
          {renderSaveCheckbox()}
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
          {renderSaveCheckbox()}
          <ButtonComp
            disabled={loading}
            title={
              loading
                ? shouldSaveCard
                  ? "Saving…"
                  : "Adding…"
                : shouldSaveCard
                  ? "Save card"
                  : "Continue"
            }
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
  saveRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    marginBottom: getHeight(16),
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: colors.black,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  checkboxChecked: {
    backgroundColor: colors.black,
  },
  checkIcon: {
    width: 12,
    height: 12,
    tintColor: colors.white,
  },
  saveLabel: {
    marginLeft: getHoriPadding(10),
    fontSize: 14,
    fontWeight: "500",
    color: colors.black,
  },
});
