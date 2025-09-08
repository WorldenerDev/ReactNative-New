// Sign in screen
import fonts from "@assets/fonts";
import colors from "@assets/colors";
import ButtonComp from "@components/ButtonComp";
import Header from "@components/Header";
import StepTitle from "@components/StepTitle";
import React, { useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import {
  getFontSize,
  getHeight,
  getVertiPadding,
  getWidth,
} from "@utils/responsive";
import navigationStrings from "@navigation/navigationStrings";
import ResponsiveContainer from "@components/container/ResponsiveContainer";
import { validateForm, validateMobileNumber } from "@utils/validators";
import { showToast } from "@components/AppToast";
import { useDispatch } from "react-redux";
import { googleAppleSignIn, loginUser, setUser } from "@redux/slices/authSlice";
import PhoneInput from "@components/PhoneInput";
import SocialLoginButtons from "@components/SocialLoginButtons";
import { getDeviceId, getDeviceType } from "@utils/uiUtils";

const SignInScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [data, setData] = useState({
    countryCode: "+91",
    phoneNumber: "9891678848",
  });
  const handlePhoneNumberChange = (text) => {
    setData((prev) => ({ ...prev, phoneNumber: text }));
  };

  const handleCountryCodeChange = (code) => {
    setData((prev) => ({ ...prev, countryCode: code }));
  };

  const onPressSignin = async () => {
    try {
      const deviceId = await getDeviceId();
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
      };
      const result = await dispatch(loginUser(sendData));
      console.log("Login result:", result);
      if (result?.payload?.success) {
        navigation.navigate(navigationStrings.OTPSCREEN, {
          fromScreen: "signin",
          phoneNumber: data?.countryCode + data?.phoneNumber,
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
    try {
      if (result?.provider === "google") {
        console.log("google provider result ", result);
        const data = {
          name: result?.userData?.givenName,
          email: result?.userData?.email,
          device_type: getDeviceType(),
          social_id: result?.userData?.id,
          device_id: deviceId,
          fcm_token: "not given",
        };
        const loginResult = await dispatch(googleAppleSignIn(data));
        console.log("Google login result in signin", loginResult);
        const userInfo = {
          ...loginResult?.payload,
          token: loginResult?.payload?.accessToken,
        };
        dispatch(setUser(userInfo));
      } else {
        ///This one is pending sometimes email not received
        const data = {
          name: result?.userData?.givenName,
          email: result?.userData?.email,
          device_type: getDeviceType(),
          social_id: result?.userData?.id,
          device_id: deviceId,
          fcm_token: "not given",
        };
        const loginResult = await dispatch(googleAppleSignIn(data));
        console.log("Google login result in signin", loginResult);
        const userInfo = {
          ...loginResult?.payload,
          token: loginResult?.payload?.accessToken,
        };
        dispatch(setUser(userInfo));
      }
    } catch (error) {
      console.error("Social login error:", error);
      showToast("error", error.message || "Login failed");
    }
  };

  const handleSocialLoginError = (error) => {
    showToast("error", error.error || "Social login failed");
  };

  const handleGuestPress = () => {
    showToast("info", "Continuing as guest");
  };

  return (
    <ResponsiveContainer>
      <Header />
      <StepTitle
        title="Welcome Back"
        subtitle="Enter the phone number associated with your account"
      />

      <View style={styles.formContainer}>
        <PhoneInput
          placeholder="Enter Your Number"
          value={data.phoneNumber}
          onChangeText={handlePhoneNumberChange}
          countryCode={data.countryCode}
          onCountryCodeChange={handleCountryCodeChange}
        />
      </View>

      <View style={styles.SignupBtn}>
        <Text style={styles.SignupText}>Don't have an account?</Text>
        <Text
          onPress={() => navigation.navigate(navigationStrings.SIGNUPSCREEN)}
          style={{ color: colors.black, fontFamily: fonts.RobotoMedium }}
        >
          SignUp
        </Text>
      </View>

      <View style={styles.bottomActions}>
        <ButtonComp
          title="Continue"
          disabled={false}
          onPress={onPressSignin}
          containerStyle={styles.signInBtn}
        />

        <SocialLoginButtons
          onLoginSuccess={handleSocialLoginSuccess}
          onLoginError={handleSocialLoginError}
          onGuestPress={handleGuestPress}
        />
      </View>
    </ResponsiveContainer>
  );
};

export default SignInScreen;

const styles = StyleSheet.create({
  formContainer: {
    marginTop: getVertiPadding(20),
  },
  SignupBtn: {
    alignSelf: "flex-end",
    marginTop: getVertiPadding(10),
    marginBottom: getVertiPadding(20),
    flexDirection: "row",
    gap: getWidth(5),
  },
  SignupText: {
    color: colors.lightText,
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
  },
  bottomActions: {
    marginTop: "auto",
    paddingBottom: getVertiPadding(30),
  },
  signInBtn: {
    marginBottom: getVertiPadding(100),
  },
});
