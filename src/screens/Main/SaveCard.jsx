import { addCard } from "@api/services/mainServices";
import colors from "@assets/colors";
import { showToast } from "@components/AppToast";
import ButtonComp from "@components/ButtonComp";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import { STRIPE_PUBLISHABLE_KEY } from "@config/stripe";
import navigationStrings from "@navigation/navigationStrings";
import { CardField, useStripe } from "@stripe/stripe-react-native";
import { getHeight, getHoriPadding } from "@utils/responsive";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

/** Legacy flow: raw card → backend `addCard`. Prefer {@link AddCard} + SetupIntent for new work. */
function SaveCardWithStripe({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState(null);
  const [savingCard, setSavingCard] = useState(false);
  const { createPaymentMethod } = useStripe();

  const handleContinue = async () => {
    if (!cardDetails?.complete) {
      showToast("error", "Please enter complete card details.");
      return;
    }

    try {
      setSavingCard(true);
      setLoading(true);
      const { error } = await createPaymentMethod({
        paymentMethodType: "Card",
        card: cardDetails,
      });

      if (error) {
        showToast("error", error.message || "Unable to add card.");
        return;
      }

      const { number, cvc, expiryMonth, expiryYear } = cardDetails || {};

      await addCard({
        cardNumber: number,
        expMonth: String(expiryMonth),
        expYear: String(expiryYear),
        cvc,
      });

      showToast("success", "Card added successfully.");
      navigation.goBack();
    } catch (err) {
      console.log("SaveCard handleContinue error", err);
      showToast("error", "Something went wrong while saving card.");
    } finally {
      setSavingCard(false);
      setLoading(false);
    }
  };

  return (
    <MainContainer loader={loading}>
      <Header title="Add Credit Card" />

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

        <View style={styles.footer}>
          <ButtonComp
            disabled={savingCard}
            title={savingCard ? "Saving..." : "Continue"}
            onPress={handleContinue}
          />
        </View>
      </View>
    </MainContainer>
  );
}

const SaveCard = ({ navigation }) => {
  if (!STRIPE_PUBLISHABLE_KEY) {
    return (
      <MainContainer>
        <Header title="Add Credit Card" />
        <View style={styles.screen}>
          <Text style={styles.fallbackText}>
            Stripe is not configured. Use checkout &quot;Add credit card&quot;
            for the mock card flow, or set STRIPE_PUBLISHABLE_KEY and restart
            the app.
          </Text>
          <ButtonComp
            title="Go to new add card"
            onPress={() =>
              navigation.replace(navigationStrings.ADD_CARD)
            }
          />
        </View>
      </MainContainer>
    );
  }

  return <SaveCardWithStripe navigation={navigation} />;
};

export default SaveCard;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: getHoriPadding(16),
    paddingTop: getHeight(16),
    paddingBottom: getHeight(24),
    backgroundColor: colors.white,
  },
  fallbackText: {
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
    marginTop: "auto",
  },
});
