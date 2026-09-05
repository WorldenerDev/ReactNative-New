import { createStripePaymentIntent } from "@api/services/mainServices";
import useGuestScreenGuard from "@hooks/useGuestScreenGuard";
import colors from "@assets/colors";
import imagePath from "@assets/icons";
import { showToast } from "@components/AppToast";
import ButtonComp from "@components/ButtonComp";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import { STRIPE_PUBLISHABLE_KEY } from "@config/stripe";
import { usePayments } from "@hooks/usePayments";
import navigationStrings from "@navigation/navigationStrings";
import { setCheckoutContext } from "@redux/slices/paymentSlice";
import { getHeight, getHoriPadding } from "@utils/responsive";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";


const Payment = ({ navigation, route }) => {
  useGuestScreenGuard();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [addingCard, setAddingCard] = useState(false);
  const { items, selectedId, status } = useSelector((s) => s.payment);
  const { trip_id, cart_id, orderUuid, amount_minor, currency } =
    route?.params || {};
  const { getCards, selectCard, addDevelopmentCard, prepareAddCard } =
    usePayments();

  useFocusEffect(
    useCallback(() => {
      dispatch(
        setCheckoutContext({
          cartId: cart_id,
          tripId: trip_id,
          amountMinor: amount_minor,
          currency: currency,
        })
      );
      getCards().catch(() => {
        showToast("error", "Could not load payment methods.");
      });
    }, [dispatch, getCards, trip_id, cart_id, amount_minor, currency])
  );

  const handlePayNow = async () => {
    if (!selectedId) {
      showToast("error", "Select a payment method.");
      return;
    }
    if (!orderUuid) {
      showToast("error", "Order not found. Please retry checkout.");
      return;
    }
    if (!amount_minor || !currency) {
      showToast("error", "Order total is missing. Please retry checkout.");
      return;
    }
    try {
      setLoading(true);
      const paymentIntentResponse = await createStripePaymentIntent({
        amount: amount_minor,
        currency,
        paymentMethodId: selectedId,
        orderUuid,
        description: "Musement booking payment",
      });

      if (paymentIntentResponse?.success === true) {
        showToast("success", "Payment initiated successfully.");
        navigation.navigate(navigationStrings.PAYMENT_SUCCESS, {
          orderUuid,
        });
      } else {
        showToast(
          "error",
          paymentIntentResponse?.message ||
            paymentIntentResponse?.data?.message ||
            "Payment failed."
        );
      }
    } catch (error) {
      console.log("handlePayNow error", error);
      showToast("error", error?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async () => {
    if (!STRIPE_PUBLISHABLE_KEY) {
      navigation.navigate(navigationStrings.ADD_CARD);
      return;
    }

    try {
      setAddingCard(true);
      const res = await prepareAddCard();
      if (res?.ok) {
        navigation.navigate(navigationStrings.ADD_CARD);
      }
    } finally {
      setAddingCard(false);
    }
  };

  return (
    <MainContainer loader={loading || status === "loading" || addingCard}>
      <Header title="Payment" />

      <View style={styles.screen}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.manageRow}
          onPress={() => navigation.navigate(navigationStrings.PAYMENT_METHODS)}
        >
          <Text style={styles.manageText}>Manage payment methods</Text>
          <Image
            source={imagePath.RIGHT_ICON}
            style={styles.chevron}
            tintColor={colors.black}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Select a payment method</Text>

        <FlatList
          style={styles.cardList}
          data={items}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No saved cards yet.</Text>
              {!STRIPE_PUBLISHABLE_KEY ? (
                <ButtonComp
                  title="Add mock test card"
                  onPress={() => addDevelopmentCard()}
                  containerStyle={styles.mockBtn}
                />
              ) : null}
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.cardRow,
                selectedId === item.id && styles.cardRowSelected,
              ]}
              onPress={() => selectCard(item.id)}
            >
              <View style={styles.cardInfo}>
                <View style={styles.cardTextCol}>
                  <Text style={styles.cardNumber}>{`•••• ${item.last4}`}</Text>
                  <Text style={styles.brandSmall}>{item.brand || "Card"}</Text>
                </View>
                <Image
                  source={imagePath.CARD_ICON}
                  style={styles.brandIcon}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.radioOuter}>
                {selectedId === item.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => (
            <View style={{ height: getHeight(12) }} />
          )}
          ListFooterComponent={
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.addCardRow}
              onPress={handleAddCard}
            >
              <Text style={styles.addCardText}>Add credit card</Text>
              <Text style={styles.addCardPlus}>+</Text>
            </TouchableOpacity>
          }
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.footer}>
          <ButtonComp
            disabled={!selectedId || loading}
            title="Pay now"
            onPress={handlePayNow}
          />
        </View>
      </View>
    </MainContainer>
  );
};

export default Payment;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: getHoriPadding(16),
    paddingTop: getHeight(16),
    paddingBottom: getHeight(24),
  },
  manageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: getHeight(12),
    marginBottom: getHeight(8),
  },
  manageText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.black,
  },
  chevron: {
    width: 16,
    height: 16,
    tintColor: colors.black,
    opacity: 0.45,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.black,
    marginBottom: getHeight(16),
  },
  cardList: {
    flexGrow: 0,
  },
  emptyWrap: {
    paddingVertical: getHeight(24),
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: colors.black,
    opacity: 0.55,
    marginBottom: getHeight(12),
  },
  mockBtn: {
    marginTop: getHeight(4),
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: getHoriPadding(16),
    paddingVertical: getHeight(14),
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
  },
  cardRowSelected: {
    borderWidth: 1,
    borderColor: colors.black,
  },
  cardInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: getHoriPadding(12),
    flex: 1,
  },
  cardTextCol: {
    flex: 1,
  },
  cardNumber: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.black,
  },
  brandSmall: {
    fontSize: 11,
    opacity: 0.55,
    marginTop: 4,
  },
  brandIcon: {
    width: 22,
    height: 22,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.black,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.black,
  },
  addCardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: getHoriPadding(16),
    paddingVertical: getHeight(14),
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    marginTop: getHeight(4),
  },
  addCardText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.black,
  },
  addCardPlus: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.black,
  },
  footer: {
    flex: 1,
    justifyContent: "flex-end",
  },
});
