// Sign in screen
import fonts from "@assets/fonts";
import colors from "@assets/colors";
import imagePath from "@assets/icons";
import ButtonComp from "@components/ButtonComp";
import Header from "@components/Header";
import StepTitle from "@components/StepTitle";
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import {
  getFontSize,
  getHeight,
  getHoriPadding,
  getVertiPadding,
  getWidth,
} from "@utils/responsive";
import navigationStrings from "@navigation/navigationStrings";
import ResponsiveContainer from "@components/container/ResponsiveContainer";
import { validateForm, validateMobileNumber } from "@utils/validators";
import { showToast } from "@components/AppToast";
import { useDispatch } from "react-redux";
import { loginUser, setUser } from "@redux/slices/authSlice";
import { setItem } from "@utils/storage";
import { STORAGE_KEYS } from "@utils/storageKeys";
import PhoneInput from "@components/PhoneInput";
import SocialLoginButtons from "@components/SocialLoginButtons";

const SignInScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [data, setData] = useState({
    countryCode: "+1",
    phoneNumber: "",
  });

  const handlePhoneNumberChange = (text) => {
    setData((prev) => ({ ...prev, phoneNumber: text }));
  };

  const handleCountryCodeChange = (code) => {
    setData((prev) => ({ ...prev, countryCode: code }));
  };

  const onPressSignin = async () => {
    const error = validateForm([
      { validator: validateMobileNumber, values: [data?.phoneNumber] },
    ]);
    if (error) {
      showToast("error", error);
      return;
    } else {
      const res = await loginUser(data.countryCode + data.phoneNumber);
      console.log("responce", res);
      try {
      } catch (error) {}
    }
    navigation.navigate(navigationStrings.OTPSCREEN, {
      fromScreen: "signin",
      phoneNumber: data.countryCode + data.phoneNumber,
    });
    return;
  };

  const handleSocialLoginSuccess = (result) => {
    showToast("success", `${result.provider} Sign-In successful!`);
    dispatch(setUser(result.userData));
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
