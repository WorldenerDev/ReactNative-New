import { Image, StyleSheet, Text, View, Linking, Alert } from 'react-native'
import React, { useState } from 'react'
import MainContainer from '@components/container/MainContainer'
import Header from '@components/Header'
import ButtonComp from '@components/ButtonComp'
import { getHeight, getWidth, getFontSize } from '@utils/responsive'
import imagePath from '@assets/icons'
import colors from '@assets/colors'
import fonts from '@assets/fonts'
import { downloadVoucher } from '@api/services/mainServices'
import { showToast } from '@components/AppToast'
import navigationStrings from '@navigation/navigationStrings'

const PaymentSuccess = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const { orderUuid } = route.params;

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
        // Show booking details in alert if no voucher URL found
        try {
          const data = downloadResponse?.data;
          if (data?.items?.[0]?.product) {
            const item = data.items[0];
            const product = item.product;
            const customer = data.customer;

            const alertMessage = `Title: ${
              product?.title || "N/A"
            }\nTicket Type: ${
              product?.price_tag?.price_feature || "N/A"
            }\nTicket Holder: ${
              product?.price_tag?.ticket_holder || "N/A"
            }\nDate: ${product?.date || "N/A"}\n\nTransaction Code: ${
              item?.transaction_code || "N/A"
            }\nOrder By: ${
              customer
                ? `${customer?.firstname || ""} ${
                    customer?.lastname || ""
                  }`.trim()
                : "N/A"
            }\nPurchase Date: ${data?.date || "N/A"}\n\nReference No: ${
              data?.identifier || "N/A"
            }\nMeeting Point: ${
              product?.meeting_point || "N/A"
            }\nTotal Price: ${data?.total_price?.formatted_value || "N/A"}`;

            Alert.alert("Booking Details", alertMessage, [
              {
                text: "OK",
                onPress: () => {
                  navigation.reset({
                    index: 0,
                    routes: [
                      {
                        name: navigationStrings.BOTTOM_TAB,
                        state: {
                          routes: [
                            {
                              name: navigationStrings.HOME,
                            },
                          ],
                        },
                      },
                    ],
                  });
                },
              },
            ]);
          } else {
            showToast("success", downloadResponse?.message);
          }
        } catch (error) {
          console.log("Error extracting booking details:", error);
          showToast("success", downloadResponse?.message);
        }
      }
    } catch (error) {
      console.log("error", error);
      showToast("error", "Failed to download voucher");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    // Call the download API and then navigate
    createDownloadApi();
  };

  return (
    <MainContainer loader={loading}>
      <Header title="Payment Success" />
      <View style={styles.successContainer}>
        <Image source={imagePath.SUCCESS_ICON} style={styles.successIcon} />
        <Text style={styles.successTitle}>Success!</Text>
        <Text style={styles.successMessage}>Purchase Successful</Text>
        <ButtonComp
          title="Continue"
          onPress={handleContinue}
          disabled={false}
          containerStyle={styles.buttonContainer}
        />
      </View>
    </MainContainer>
  )
}

export default PaymentSuccess

const styles = StyleSheet.create({
  successContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: getHeight(100),
  },
  successIcon: {
    width: getWidth(100),
    height: getHeight(100),
    marginBottom: getHeight(30),
  },
  successTitle: {
    fontSize: getFontSize(28),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
    marginBottom: getHeight(10),
    textAlign: 'center',
  },
  successMessage: {
    fontSize: getFontSize(18),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    marginBottom: getHeight(50),
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    // maxWidth: getWidth(200),
  },
})