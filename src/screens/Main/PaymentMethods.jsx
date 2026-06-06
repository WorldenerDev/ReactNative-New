import colors from "@assets/colors";
import imagePath from "@assets/icons";
import { showToast } from "@components/AppToast";
import ButtonComp from "@components/ButtonComp";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import { STRIPE_PUBLISHABLE_KEY } from "@config/stripe";
import { usePayments } from "@hooks/usePayments";
import navigationStrings from "@navigation/navigationStrings";
import { getHeight, getHoriPadding } from "@utils/responsive";
import useStickyBottomInset from "@hooks/useStickyBottomInset";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PaymentMethods = ({ navigation }) => {
  const bottomInset = useStickyBottomInset();
  const [addingCard, setAddingCard] = useState(false);
  const { payment, getCards, selectCard, deleteCard, addDevelopmentCard, prepareAddCard } =
    usePayments();

  useFocusEffect(
    useCallback(() => {
      getCards().catch(() => {
        showToast("error", "Could not load saved cards.");
      });
    }, [getCards])
  );

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

  const onSelect = (id) => {
    selectCard(id);
    showToast("success", "Payment method selected.");
    navigation.goBack();
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
    <MainContainer loader={payment.status === "loading" || addingCard}>
      <Header title="Payment methods" />

      <View style={styles.screen}>
        <FlatList
          data={payment.items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            payment.items.length === 0 ? styles.emptyList : null,
            { paddingBottom: bottomInset + getHeight(24) },
          ]}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No saved cards yet.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.cardRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.cardRowMain}
                onPress={() => onSelect(item.id)}
              >
                <Image
                  source={imagePath.CARD_ICON}
                  style={styles.brandIcon}
                  resizeMode="contain"
                />
                <View style={styles.cardMeta}>
                  <Text style={styles.brandText}>{item.brand || "Card"}</Text>
                  <Text style={styles.last4}>{`•••• ${item.last4}`}</Text>
                  {item.isDefault ? (
                    <Text style={styles.defaultPill}>Default</Text>
                  ) : null}
                </View>
                {payment.selectedId === item.id ? (
                  <View style={styles.check}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                ) : (
                  <View style={styles.radioOuter} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                onPress={() => onDelete(item)}
              >
                <Image
                  source={imagePath.DELETE_ICON}
                  style={styles.trash}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          )}
          ItemSeparatorComponent={() => (
            <View style={{ height: getHeight(10) }} />
          )}
          ListFooterComponent={
            <View style={styles.footerBlock}>
              <ButtonComp
                title="Add new card"
                onPress={handleAddCard}
              />
              {!STRIPE_PUBLISHABLE_KEY ? (
                <View style={{ marginTop: getHeight(12) }}>
                  <ButtonComp
                    title="Add mock test card"
                    onPress={() => addDevelopmentCard()}
                  />
                </View>
              ) : null}
            </View>
          }
        />
      </View>
    </MainContainer>
  );
};

export default PaymentMethods;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: getHoriPadding(16),
    paddingTop: getHeight(12),
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
  },
  emptyText: {
    textAlign: "center",
    color: colors.black,
    opacity: 0.55,
    fontSize: 15,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingVertical: getHeight(10),
    paddingHorizontal: getHoriPadding(12),
  },
  cardRowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  brandIcon: {
    width: 28,
    height: 28,
    marginRight: getHoriPadding(10),
  },
  cardMeta: {
    flex: 1,
  },
  brandText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.black,
  },
  last4: {
    fontSize: 13,
    color: colors.black,
    opacity: 0.7,
    marginTop: 2,
  },
  defaultPill: {
    marginTop: 6,
    alignSelf: "flex-start",
    fontSize: 11,
    fontWeight: "600",
    color: colors.white,
    backgroundColor: colors.black,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: "hidden",
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
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.black,
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "700",
  },
  trash: {
    width: 22,
    height: 22,
    marginLeft: getHoriPadding(8),
    tintColor: colors.black,
  },
  footerBlock: {
    marginTop: getHeight(20),
    marginBottom: getHeight(24),
  },
});
