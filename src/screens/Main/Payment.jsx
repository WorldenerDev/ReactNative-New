import { StyleSheet, Text, View, Image } from "react-native";
import React, { useState } from "react";
import MainContainer from "@components/container/MainContainer";
import ButtonComp from "@components/ButtonComp";
import Header from "@components/Header";
import colors from "@assets/colors";
import {
  createOrder,
  createNoPayment,
} from "@api/services/mainServices";
import { getHeight, getHoriPadding, getVertiPadding, getWidth } from "@utils/responsive";
import { showToast } from "@components/AppToast";
import navigationStrings from "@navigation/navigationStrings";
import imagePath from "@assets/icons";

const Payment = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const { trip_id } = route.params;
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
            navigation.navigate(navigationStrings.PAYMENT_SUCCESS,{
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
     

      <View style={styles.container}>
        <Image source={imagePath.CARD_ICON} style={styles.cardIcon} resizeMode="contain" />
        <ButtonComp disabled={false} title="Pay Now" onPress={createOrderApi} />
        {/* <View style={styles.buttonContainer}></View>
        <ButtonComp
          disabled={false}
          title="Buy Now"
          onPress={createNoPaymentApi}
        />
        <View style={styles.buttonContainer}></View>
        <ButtonComp
          disabled={false}
          title="Download Now"
          onPress={createDownloadApi}
        /> */}
      </View>
    </MainContainer>
  );
};

export default Payment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: 'space-evenly'
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
