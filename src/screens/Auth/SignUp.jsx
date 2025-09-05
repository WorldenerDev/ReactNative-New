import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import React, { useState } from "react";
import ResponsiveContainer from "@components/container/ResponsiveContainer";
import Header from "@components/Header";
import StepTitle from "@components/StepTitle";
import CustomInput from "@components/CustomInput";
import PhoneInput from "@components/PhoneInput";
import {
  getFontSize,
  getHeight,
  getHoriPadding,
  getRadius,
  getVertiPadding,
  getWidth,
} from "@utils/responsive";
import ButtonComp from "@components/ButtonComp";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import navigationStrings from "@navigation/navigationStrings";
import { showToast } from "@components/AppToast";
import { useDispatch } from "react-redux";
import {
  signupUser,
  setUser,
  loginUser,
  googleAppleSignIn,
} from "@redux/slices/authSlice";
import SocialLoginButtons from "@components/SocialLoginButtons";
import {
  validateForm,
  validateLetter,
  validateMobileNumber,
} from "@utils/validators";
import { objectToFormData } from "@utils/formDataHelper";
import { getDeviceId, getDeviceType } from "@utils/uiUtils";

const SignUp = ({ navigation }) => {
  const dispatch = useDispatch();

  const [data, setData] = useState({
    name: "",
    phoneNumber: "9891678848",
    countryCode: "+91",
    agree: false,
  });

  const handlePhoneNumberChange = (text) => {
    setData((prev) => ({ ...prev, phoneNumber: text }));
  };

  const handleCountryCodeChange = (code) => {
    setData((prev) => ({ ...prev, countryCode: code }));
  };

  const onClickContinue = async () => {
    try {
      const deviceId = await getDeviceId();
      const error = validateForm([
        { validator: validateLetter, values: [data?.name, "Name", 4] },
        { validator: validateMobileNumber, values: [data?.phoneNumber] },
      ]);

      if (error) {
        showToast("error", error);
        return;
      } else if (!data.agree) {
        showToast("error", "Please accept the terms and conditions");
        return;
      }
      const newData = {
        name: data?.name,
        phone_number: data?.countryCode + data?.phoneNumber,
        device_type: Platform.OS,
        device_id: deviceId,
      };
      const formData = objectToFormData(newData);
      const result = await dispatch(signupUser(formData));
      console.log("Signup result:", result);
      if (result?.payload?.success) {
        navigation.navigate(navigationStrings.OTPSCREEN, {
          fromScreen: "signup",
          phoneNumber: data?.countryCode + data?.phoneNumber,
        });
      }
    } catch (error) {
      showToast("error", error);
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
        console.log("Google login result in signup", loginResult);
        const userInfo = {
          ...loginResult?.payload,
          token: loginResult?.payload?.accessToken,
        };
        console.log(userInfo);
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
        console.log(userInfo);
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
    // Handle guest mode - navigate to main screen or show appropriate message
    showToast("info", "Continuing as guest");
    // You can navigate to main screen or handle guest mode as needed
    // navigation.navigate(navigationStrings.MAIN_NAVIGATOR);
  };

  return (
    <ResponsiveContainer>
      <Header />
      <StepTitle
        title="Create Account"
        subtitle="Enter your name and phone number to get started"
      />

      <View style={styles.formContainer}>
        <CustomInput
          placeholder="Enter Your Name"
          value={data.name}
          onChangeText={(txt) => setData({ ...data, name: txt })}
        />

        <PhoneInput
          placeholder="Enter Your Number"
          value={data.phoneNumber}
          onChangeText={handlePhoneNumberChange}
          countryCode={data.countryCode}
          onCountryCodeChange={handleCountryCodeChange}
        />

        <TouchableOpacity
          style={styles.signinContainer}
          onPress={() => navigation.navigate(navigationStrings.SIGNINSCREEN)}
        >
          <Text style={styles.signinText}>
            Have an account? <Text style={styles.signinLink}>Sign in</Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={[styles.checkbox, data.agree && styles.checkboxChecked]}
            onPress={() => setData({ ...data, agree: !data.agree })}
          >
            {data.agree && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
          <Text style={styles.termsText}>
            I accept the <Text style={styles.link}>Terms and Conditions</Text> &{" "}
            <Text style={styles.link}>Privacy Policy</Text>.
          </Text>
        </View>

        <ButtonComp
          title="Continue"
          disabled={false}
          onPress={onClickContinue}
          containerStyle={styles.continueBtn}
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

export default SignUp;

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    marginTop: getVertiPadding(20),
  },
  signinContainer: {
    alignItems: "flex-end",
    marginTop: getVertiPadding(10),
    marginBottom: getVertiPadding(20),
  },
  signinText: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
  },
  signinLink: {
    color: colors.black,
    fontFamily: fonts.RobotoMedium,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: getVertiPadding(30),
    paddingRight: getHoriPadding(20),
  },
  checkbox: {
    width: getWidth(20),
    height: getHeight(20),
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: getRadius(4),
    marginRight: getHoriPadding(12),
    marginTop: getVertiPadding(2),
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.white,
    fontSize: getFontSize(12),
    fontWeight: "bold",
  },
  termsText: {
    flex: 1,
    fontSize: getFontSize(14),
    color: colors.lightText,
    lineHeight: getHeight(20),
    fontFamily: fonts.RobotoRegular,
  },
  link: {
    color: colors.black,
    fontFamily: fonts.RobotoMedium,
    fontSize: getFontSize(14),
  },
  continueBtn: {
    marginBottom: getVertiPadding(30),
  },
});
