import colors from "@assets/colors";
import useGuestScreenGuard from "@hooks/useGuestScreenGuard";
import { showToast } from "@components/AppToast";
import ButtonComp from "@components/ButtonComp";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import { STRIPE_PUBLISHABLE_KEY } from "@config/stripe";
import { usePayments } from "@hooks/usePayments";
import navigationStrings from "@navigation/navigationStrings";
import useStickyBottomInset from "@hooks/useStickyBottomInset";
import CardBrandIcon from "@components/CardBrandIcon";
import { formatCardBrand } from "@utils/cardBrand";
import { getHeight, getHoriPadding } from "@utils/responsive";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";


const SavedCards = ({ navigation }) => {
  useGuestScreenGuard();
  const bottomInset = useStickyBottomInset();
  const [addingCard, setAddingCard] = useState(false);
  const { items, status } = useSelector((s) => s.payment);
  const { getCards, deleteCard, addDevelopmentCard, prepareAddCard } =
    usePayments();

  useFocusEffect(
    useCallback(() => {
      getCards().catch(() => {
        showToast("error", "Could not load payment methods.");
      });
    }, [getCards])
  );

  const formatExpiry = (month, year) => {
    if (month == null || year == null) return null;
    const mm = String(month).padStart(2, "0");
    const yy = String(year).slice(-2);
    return `${mm}/${yy}`;
  };

  const onDelete = (item) => {
    Alert.alert(
      "Remove card",
      `Remove card ending in ${item.last4}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => deleteCard(item.id),
        },
      ],
      { cancelable: true }
    );
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
    <MainContainer loader={status === "loading" || addingCard}>
      <Header title="Saved Cards" />

      <View style={styles.screen}>
        <FlatList
          style={styles.cardList}
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: bottomInset + getHeight(24) }}
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
          renderItem={({ item }) => {
            const expiry = formatExpiry(item.expMonth, item.expYear);
            return (
              <View style={styles.cardRow}>
                <View style={styles.cardInfo}>
                  <View style={styles.cardTextCol}>
                    <Text style={styles.cardNumber}>{`•••• ${item.last4}`}</Text>
                    <Text style={styles.expiryText}>
                      {expiry ? `Expires ${expiry}` : "Expiry unavailable"}
                    </Text>
                    <Text style={styles.brandSmall}>
                      {formatCardBrand(item.brand)}
                    </Text>
                  </View>
                  <View style={styles.cardActions}>
                    <CardBrandIcon brand={item.brand} />
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={`Remove card ending in ${item.last4}`}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      onPress={() => onDelete(item)}
                    >
                      <Text style={styles.removeText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
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
      </View>
    </MainContainer>
  );
};

export default SavedCards;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: getHoriPadding(16),
    paddingTop: getHeight(16),
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
    minHeight: getHeight(88),
    paddingHorizontal: getHoriPadding(16),
    paddingVertical: getHeight(18),
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
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
  expiryText: {
    fontSize: 13,
    color: colors.black,
    opacity: 0.7,
    marginTop: 6,
  },
  brandSmall: {
    fontSize: 11,
    opacity: 0.55,
    marginTop: 4,
  },
  cardActions: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    alignSelf: "stretch",
    paddingVertical: 2,
  },
  removeText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.black,
    marginTop: getHeight(16),
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
});
