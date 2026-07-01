import colors from "@assets/colors";
import useGuestScreenGuard from "@hooks/useGuestScreenGuard";
import imagePath from "@assets/icons";
import { showToast } from "@components/AppToast";
import ButtonComp from "@components/ButtonComp";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import { STRIPE_PUBLISHABLE_KEY } from "@config/stripe";
import { usePayments } from "@hooks/usePayments";
import navigationStrings from "@navigation/navigationStrings";
import useStickyBottomInset from "@hooks/useStickyBottomInset";
import { getHeight, getHoriPadding } from "@utils/responsive";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import {
  FlatList,
  Image,
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
  const { getCards, addDevelopmentCard, prepareAddCard } = usePayments();

  useFocusEffect(
    useCallback(() => {
      getCards().catch(() => {
        showToast("error", "Could not load payment methods.");
      });
    }, [getCards])
  );

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
          renderItem={({ item }) => (
            <View style={styles.cardRow}>
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
            </View>
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
    paddingHorizontal: getHoriPadding(16),
    paddingVertical: getHeight(14),
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
  brandSmall: {
    fontSize: 11,
    opacity: 0.55,
    marginTop: 4,
  },
  brandIcon: {
    width: 22,
    height: 22,
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
