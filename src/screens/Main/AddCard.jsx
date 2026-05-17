import colors from "@assets/colors";
import { showToast } from "@components/AppToast";
import ButtonComp from "@components/ButtonComp";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import { STRIPE_PUBLISHABLE_KEY } from "@config/stripe";
import { usePayments } from "@hooks/usePayments";
import { CardField } from "@stripe/stripe-react-native";
import { getHeight, getHoriPadding } from "@utils/responsive";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const AddCard = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState(null);
  const { addCard, addDevelopmentCard } = usePayments();

  const handleContinue = async () => {
    if (!cardDetails?.complete) {
      showToast("error", "Please enter complete card details.");
      return;
    }
    try {
      setLoading(true);
      const res = await addCard(cardDetails);
      if (res?.ok) {
        navigation.goBack();
      }
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
      <MainContainer loader={loading}>
        <Header title="Add card" />
        <View style={styles.screen}>
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
    <MainContainer loader={loading}>
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

        <View style={styles.footer}>
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
