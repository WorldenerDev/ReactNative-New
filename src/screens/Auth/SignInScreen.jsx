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
import {
  validateEmail,
  validateForm,
  validatePassword,
} from "@utils/validators";
import { showToast } from "@components/AppToast";
import { useDispatch } from "react-redux";
import { loginUser, setUser, googleSignIn } from "@redux/slices/authSlice";
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
    if (!data.phoneNumber.trim()) {
      showToast("error", "Please enter your phone number");
      return;
    }

    navigation.navigate(navigationStrings.OTPSCREEN, {
      fromScreen: "signin",
      phoneNumber: data.countryCode + data.phoneNumber,
    });
    return;
  };

  const handleSocialLoginSuccess = (result) => {
    showToast("success", `${result.provider} Sign-In successful!`);

    // Store user data in Redux
    dispatch(setUser(result.userData));

    // You can navigate to main screen or handle as needed
    // navigation.navigate(navigationStrings.MAIN_NAVIGATOR);
  };

  const handleSocialLoginError = (error) => {
    showToast("error", error.error || "Social login failed");
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
        <Text style={styles.SignupText}>Don’t have an account?</Text>
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

        <View style={styles.separatorWrapper}>
          <View style={styles.separator} />
          <Text style={styles.orText}>or connect with</Text>
          <View style={styles.separator} />
        </View>

        <SocialLoginButtons
          onLoginSuccess={handleSocialLoginSuccess}
          onLoginError={handleSocialLoginError}
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
  separatorWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: getVertiPadding(20),
  },
  separator: {
    flex: 1,
    height: getHeight(2),
    backgroundColor: colors.border,
  },
  orText: {
    marginHorizontal: 10,
    fontSize: getFontSize(15),
    color: colors.placeholderText,
    fontFamily: fonts.RobotoBold,
    fontWeight: "600",
  },
});
