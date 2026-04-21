import { createNoPayment, createOrder } from "@api/services/mainServices";
import colors from "@assets/colors";
import imagePath from "@assets/icons";
import { showToast } from "@components/AppToast";
import ButtonComp from "@components/ButtonComp";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import navigationStrings from "@navigation/navigationStrings";
import { getHeight, getHoriPadding } from "@utils/responsive";
import { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Payment = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState("2");
  const { trip_id } = route?.params || {};
  const createOrderApi = async () => {
    try {
      setLoading(true);
      const orderResponse = await createOrder({
        trip_id: trip_id,
        email_notification: "NONE",
      });
      if (orderResponse?.success === true) {
        // setOrderUuid(orderResponse?.data?.order_id);
        createNoPaymentApi(orderResponse?.data?.order_id);
      } else {
        showToast("error", orderResponse?.data?.message);
      }
      console.log("orderResponse", orderResponse);
    } catch (error) {
      console.log("error", error);
    } finally {
      setLoading(false);
    }
  };

  const createNoPaymentApi = async (orderUuid) => {
    try {
      setLoading(true);
      const noPaymentResponse = await createNoPayment({
        orderUuid: orderUuid,
      });
      if (noPaymentResponse?.success === true) {
        navigation.navigate(navigationStrings.PAYMENT_SUCCESS, {
          orderUuid: orderUuid,
        });

      } else {
        showToast("error", noPaymentResponse?.data?.message);
      }
      console.log("noPaymentResponse", noPaymentResponse);
    } catch (error) {
      console.log("error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainContainer loader={loading}>
      <Header title="Payment" />

      <View style={styles.screen}>
        <Text style={styles.sectionTitle}>Select A Payment Method</Text>

        <FlatList
          style={styles.cardList}
          data={[
            { id: "1", last4: "4187" },
            { id: "2", last4: "9387" },
          ]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.cardRow,
                selectedCardId === item.id && styles.cardRowSelected,
              ]}
              onPress={() => setSelectedCardId(item.id)}
            >
              <View style={styles.cardInfo}>
                <Text style={styles.cardNumber}>{`**** ${item.last4}`}</Text>
                <View style={styles.cardBrands}>
                  <Image
                    source={imagePath.MASTER_CARD}
                    style={styles.brandIcon}
                    resizeMode="contain"
                  />
                  <Image
                    source={imagePath.MASTER_CARD}
                    style={[styles.brandIcon, styles.brandIconOverlap]}
                    resizeMode="contain"
                  />
                </View>
              </View>
              <View style={styles.radioOuter}>
                {selectedCardId === item.id && (
                  <View style={styles.radioInner} />
                )}
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
              onPress={() =>
                navigation.navigate(navigationStrings.SAVE_CARD, {
                  trip_id,
                })
              }
            >
              <Text style={styles.addCardText}>Add Credit Card</Text>
              <Text style={styles.addCardPlus}>+</Text>
            </TouchableOpacity>
          }
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.footer}>
          <ButtonComp
            disabled={false}
            title="Pay Now"
            onPress={() => console.log("Pay Now")}
          />
        </View>
      </View>

      {/* Old design kept (commented)
      <View style={styles.container}>
        <Image
          source={imagePath.CARD_ICON}
          style={styles.cardIcon}
          resizeMode="contain"
        />
        <ButtonComp
          disabled={false}
          title="Pay Now"
          onPress={createOrderApi}
        />
      </View> */}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.black,
    marginBottom: getHeight(16),
  },
  cardList: {
    gap: getHeight(12),
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
  },
  cardNumber: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.black,
  },
  cardBrands: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandIcon: {
    width: 22,
    height: 22,
  },
  brandIconOverlap: {
    marginLeft: -8,
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
  continueButton: {
    backgroundColor: colors.black,
    borderRadius: 999,
    paddingVertical: getHeight(14),
    alignItems: "center",
  },
  continueButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  // old styles kept in case needed again
  container: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: "space-evenly",
  },
  cardIcon: {
    height: getHeight(200),
    width: "100%",
    alignSelf: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: getHoriPadding(10),
    height: getHeight(100),
  },
});
