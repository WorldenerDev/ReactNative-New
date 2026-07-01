// Sign in screen
import fonts from "@assets/fonts";
import colors from "@assets/colors";
import ButtonComp from "@components/ButtonComp";
import StepTitle from "@components/StepTitle";
import React, { useState } from "react";
import { View, Text, StyleSheet, Platform, TouchableOpacity } from "react-native";
import {
  getFontSize,
  getHeight,
  getHoriPadding,
  getVertiPadding,
} from "@utils/responsive";
import navigationStrings from "@navigation/navigationStrings";
import ResponsiveContainer from "@components/container/ResponsiveContainer";
import { validateForm, validateMobileNumber } from "@utils/validators";
import { showToast } from "@components/AppToast";
import { useDispatch } from "react-redux";
import { googleAppleSignIn, guestLoginUser, loginUser, setUser } from "@redux/slices/authSlice";
import PhoneInput from "@components/PhoneInput";
import SocialLoginButtons from "@components/SocialLoginButtons";
import { getDeviceId } from "@utils/uiUtils";
import { logAuthToken } from "@utils/devAuthTokenLog";
import { getFCMToken } from "@utils/fcmToken";
import { buildSocialLoginPayload, isSocialLoginPayloadValid } from "@utils/socialLoginPayload";

const SignInScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [data, setData] = useState({
    countryCode: "+91",
    phoneNumber: "",
  });
  const handlePhoneNumberChange = (text) => {
    setData((prev) => ({ ...prev, phoneNumber: text }));
  };

  const handleCountryCodeChange = (code) => {
    setData((prev) => ({ ...prev, countryCode: code }));
  };

  const getFCMTokenForAuth = async () => {
    try {
      const fcmToken = await getFCMToken();
      console.log("FCM Token:", fcmToken);
      return fcmToken;
    } catch (error) {
      console.error("Error getting FCM token:", error);
      return null;
    }
  };

  const onPressSignin = async () => {
    try {
      const deviceId = await getDeviceId();
      const fcmToken = await getFCMTokenForAuth();
      console.log("fcmToken", fcmToken);
      const error = validateForm([
        { validator: validateMobileNumber, values: [data?.phoneNumber] },
      ]);
      if (error) {
        showToast("error", error);
        return;
      }

      const sendData = {
        phone_number: data?.countryCode + data?.phoneNumber,
        device_type: Platform.OS,
        device_id: deviceId,
        fcm_token: fcmToken || "not_available",
      };
      const result = await dispatch(loginUser(sendData));
      console.log("Login result:", result);
      logAuthToken("SignIn /login", result?.payload);
      if (result?.payload?.success) {
        console.log(
          "[SignIn] OTP sent — complete verification on the next screen; token logs as API_AUTH_TOKEN after OTP."
        );
        navigation.navigate(navigationStrings.OTPSCREEN, {
          fromScreen: "signin",
          phoneNumber: data?.countryCode + data?.phoneNumber,
          fcm_Token: fcmToken,
          deviceId,
          deviceType: Platform.OS,
        });
      } else {
        showToast("error", result?.payload);
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error?.message || "An error occurred during login. Please try again.";
      showToast("error", errorMessage);
    }
  };

  const handleSocialLoginSuccess = async (result, provider) => {
    console.log("Social login result receiveddd:", result, provider);

    const deviceId = await getDeviceId();
    const fcmToken = await getFCMTokenForAuth();
    try {
      const payload = buildSocialLoginPayload({
        provider: result?.provider || provider,
        result,
        deviceId,
        fcmToken,
      });
      if (!isSocialLoginPayloadValid(payload)) {
        showToast("error", "Social sign-in did not return a valid account id.");
        return;
      }
      const loginResult = await dispatch(googleAppleSignIn(payload));
      if (googleAppleSignIn.rejected.match(loginResult)) {
        showToast("error", loginResult.payload || "Login failed");
        return;
      }
      console.log(`${provider} login result in signin`, loginResult);
      logAuthToken(`SignIn ${provider}`, loginResult?.payload);
      const userInfo = {
        ...loginResult?.payload,
        token: loginResult?.payload?.accessToken,
      };
      dispatch(setUser(userInfo));
    } catch (error) {
      console.error("Social login error:", error);
      showToast("error", error.message || "Login failed");
    }
  };

  const handleSocialLoginError = (error) => {
    showToast("error", error.error || "Social login failed");
  };

  const handleGuestPress = async () => {
    try {
      const deviceId = await getDeviceId();
      const fcmToken = await getFCMTokenForAuth();
      const result = await dispatch(
        guestLoginUser({
          device_type: Platform.OS,
          device_id: deviceId,
          fcm_token: fcmToken || "not_available",
        })
      );
      if (guestLoginUser.rejected.match(result)) {
        showToast("error", result.payload || "Guest login failed");
      }
    } catch (error) {
      showToast("error", error?.message || "Guest login failed");
    }
  };

  return (
    <ResponsiveContainer>
      <View style={styles.screen}>
        <View style={styles.topSection}>
          <StepTitle
            title="Welcome"
            subtitle="Sign in or create an account using your mobile number"
            containerStyle={styles.titleContainer}
          />

          <PhoneInput
            placeholder="Enter mobile number"
            value={data.phoneNumber}
            onChangeText={handlePhoneNumberChange}
            countryCode={data.countryCode}
            onCountryCodeChange={handleCountryCodeChange}
          />

          <ButtonComp
            title="Continue"
            disabled={false}
            onPress={onPressSignin}
            containerStyle={styles.continueBtn}
          />

          <View style={styles.signUpRow}>
            <Text style={styles.signUpPrompt}>New here? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate(navigationStrings.SIGNUPSCREEN)}
              activeOpacity={0.7}
            >
              <Text style={styles.signUpLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.middleSection}>
          <SocialLoginButtons
            variant="stacked"
            onLoginSuccess={handleSocialLoginSuccess}
            onLoginError={handleSocialLoginError}
            onGuestPress={handleGuestPress}
          />
        </View>

        <Text style={styles.termsFooter}>
          By continuing, you agree to our{" "}
          <Text
            style={styles.termsLink}
            onPress={() =>
              navigation.navigate(navigationStrings.PRIVACYTERMS, {
                type: "term-condition",
              })
            }
          >
            Terms of Service
          </Text>{" "}
          and{" "}
          <Text
            style={styles.termsLink}
            onPress={() =>
              navigation.navigate(navigationStrings.PRIVACYTERMS, {
                type: "privacy-policy",
              })
            }
          >
            Privacy Policy
          </Text>
        </Text>
      </View>
    </ResponsiveContainer>
  );
};

export default SignInScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: getVertiPadding(8),
  },
  topSection: {
    paddingTop: getVertiPadding(24),
  },
  titleContainer: {
    marginTop: getVertiPadding(16),
    marginBottom: getVertiPadding(36),
  },
  continueBtn: {
    marginTop: getVertiPadding(28),
    width: "100%",
  },
  signUpRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: getVertiPadding(28),
  },
  middleSection: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: getVertiPadding(32),
  },
  signUpPrompt: {
    color: colors.lightText,
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
  },
  signUpLink: {
    color: colors.black,
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoBold,
  },
  termsFooter: {
    textAlign: "center",
    fontSize: getFontSize(12),
    lineHeight: getHeight(18),
    color: colors.lightText,
    fontFamily: fonts.RobotoRegular,
    paddingHorizontal: getHoriPadding(12),
    paddingTop: getVertiPadding(16),
  },
  termsLink: {
    color: colors.black,
    fontFamily: fonts.RobotoMedium,
    fontSize: getFontSize(12),
  },
});
