import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import MainContainer from "@components/container/MainContainer";
import ButtonComp from "@components/ButtonComp";
import Header from "@components/Header";
import colors from "@assets/colors";
import { createOrder, createNoPayment } from "@api/services/mainServices";
import { getHeight, getHoriPadding } from "@utils/responsive";

const Payment = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [orderUuid, setOrderUuid] = useState("");
  const { trip_id } = route.params;
  const createOrderApi = async () => {
    try {
      setLoading(true);
      const orderResponse = await createOrder({
        trip_id: trip_id,
        email_notification: "NONE",
      });
      setOrderUuid(orderResponse?.data?.order_id);
      console.log("orderResponse", orderResponse);
    } catch (error) {
      console.log("error", error);
    } finally {
      setLoading(false);
    }
  };

  const createNoPaymentApi = async () => {
    try {
      setLoading(true);
      const noPaymentResponse = await createNoPayment({
        orderUuid: orderUuid,
      });
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
        <ButtonComp disabled={false} title="Pay Now" onPress={createOrderApi} />
        <View style={styles.buttonContainer}></View>
        <ButtonComp
          disabled={false}
          title="Buy Now"
          onPress={createNoPaymentApi}
        />
      </View>
    </MainContainer>
  );
};

export default Payment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: getHoriPadding(10),
    height: getHeight(100),
  },
});
