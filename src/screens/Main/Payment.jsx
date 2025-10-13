import { StyleSheet, Text, View, Linking } from "react-native";
import React, { useState } from "react";
import MainContainer from "@components/container/MainContainer";
import ButtonComp from "@components/ButtonComp";
import Header from "@components/Header";
import colors from "@assets/colors";
import {
  createOrder,
  createNoPayment,
  downloadVoucher,
} from "@api/services/mainServices";
import { getHeight, getHoriPadding } from "@utils/responsive";
import { showToast } from "@components/AppToast";

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
  const createDownloadApi = async () => {
    try {
      setLoading(true);
      const downloadResponse = await downloadVoucher({
        orderUuid: orderUuid,
      });
      console.log("downloadResponse", downloadResponse);

      // Check if there are any vouchers with URLs in the items
      let voucherUrl = null;
      if (downloadResponse?.data?.items) {
        for (const item of downloadResponse.data.items) {
          if (item.vouchers && item.vouchers.length > 0) {
            for (const voucher of item.vouchers) {
              if (voucher.url) {
                voucherUrl = voucher.url;
                break;
              }
            }
            if (voucherUrl) break;
          }
        }
      }

      if (voucherUrl) {
        console.log("voucherUrl", voucherUrl);
        // Open the voucher URL
        const supported = await Linking.canOpenURL(voucherUrl);
        if (supported) {
          await Linking.openURL(voucherUrl);
        } else {
          console.log("Cannot open URL:", voucherUrl);
          showToast("error", "Cannot open voucher URL");
        }
      } else {
        // Show toast if no voucher URL found
        showToast("info", "No voucher available for download");
      }
    } catch (error) {
      console.log("error", error);
      showToast("error", "Failed to download voucher");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainContainer loader={loading}>
      <Header title="Payment" />
      <View style={styles.buttonContainer}></View>

      <View style={styles.container}>
        <ButtonComp disabled={false} title="Pay Now" onPress={createOrderApi} />
        <View style={styles.buttonContainer}></View>
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
