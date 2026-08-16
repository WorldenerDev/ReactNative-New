import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from "react-native";
import React, { useState } from "react";
import ResponsiveContainer from "@components/container/ResponsiveContainer";
import StepTitle from "@components/StepTitle";
import CustomInput from "@components/CustomInput";
import PhoneInput from "@components/PhoneInput";
import {
  getFontSize,
  getHeight,
  getHoriPadding,
  getVertiPadding,
} from "@utils/responsive";
import ButtonComp from "@components/ButtonComp";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import navigationStrings from "@navigation/navigationStrings";
import { showToast } from "@components/AppToast";
import { useDispatch } from "react-redux";
import { signupUser, guestLoginUser } from "@redux/slices/authSlice";
import SocialLoginButtons from "@components/SocialLoginButtons";
import SocialNamePromptModal from "@components/SocialNamePromptModal";
import SocialPhonePromptModal from "@components/SocialPhonePromptModal";
import {
  validateForm,
  validateLetter,
  validateMobileNumber,
} from "@utils/validators";
import { objectToFormData } from "@utils/formDataHelper";
import { getDeviceId } from "@utils/uiUtils";
import { getFCMToken } from "@utils/fcmToken";
import useSocialLogin from "@hooks/useSocialLogin";

const SignUp = ({ navigation }) => {
  const dispatch = useDispatch();

  const [data, setData] = useState({
    name: "",
    phoneNumber: "",
    countryCode: "+91",
  });
  const {
    handleSocialLoginSuccess,
    handleSocialLoginError,
    namePromptVisible,
    namePromptLoading,
    handleNameSubmit,
    handleNameCancel,
    phonePromptVisible,
    phonePromptLoading,
    handleSendLinkPhoneOtp,
    handleVerifyLinkPhone,
    handleSkipPhone,
  } = useSocialLogin({ logContext: "SignUp", navigation });

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

  const handleGuestPress = async () => {
    try {
      const deviceId = await getDeviceId();
      const fcmToken = await getFCMToken();
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
            title="Create Account"
            subtitle="Enter your name and phone number to get started"
            containerStyle={styles.titleContainer}
          />

          <CustomInput
            variant="bordered"
            placeholder="Enter your name"
            value={data.name}
            onChangeText={(txt) => setData((prev) => ({ ...prev, name: txt }))}
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
            onPress={onClickContinue}
            containerStyle={styles.continueBtn}
          />

          <View style={styles.signInRow}>
            <Text style={styles.signInPrompt}>Have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate(navigationStrings.SIGNINSCREEN)}
              activeOpacity={0.7}
            >
              <Text style={styles.signInLink}>Sign in</Text>
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

      <SocialNamePromptModal
        visible={namePromptVisible}
        loading={namePromptLoading}
        onSubmit={handleNameSubmit}
        onCancel={handleNameCancel}
      />
      <SocialPhonePromptModal
        visible={phonePromptVisible}
        loading={phonePromptLoading}
        allowSkip
        onSendOtp={handleSendLinkPhoneOtp}
        onVerifyOtp={handleVerifyLinkPhone}
        onResendOtp={handleSendLinkPhoneOtp}
        onSkip={handleSkipPhone}
      />
    </ResponsiveContainer>
  );
};

export default SignUp;

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
    marginBottom: getVertiPadding(28),
  },
  continueBtn: {
    marginTop: getVertiPadding(24),
    width: "100%",
  },
  signInRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: getVertiPadding(24),
  },
  middleSection: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: getVertiPadding(24),
  },
  signInPrompt: {
    color: colors.lightText,
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
  },
  signInLink: {
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
