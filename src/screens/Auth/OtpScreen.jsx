import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  ImageBackground,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import ButtonComp from "@components/ButtonComp";

import {
  getFontSize,
  getHeight,
  getRadius,
  getVertiPadding,
  getWidth,
  getHoriPadding,
} from "@utils/responsive";
import navigationStrings from "@navigation/navigationStrings";
import { useDispatch } from "react-redux";
import { onOtp, requestOtp } from "@redux/slices/authSlice";
import { STORAGE_KEYS } from "@utils/storageKeys";
import { setItem } from "@utils/storage";
import { SafeAreaView } from "react-native-safe-area-context";
import imagePath from "@assets/icons";

const OtpScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { fromScreen, email, phoneNumber } = route?.params || {};
  const [code, setCode] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputs = {};

  useEffect(() => {
    let interval;
    if (!canResend && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [canResend, timer]);

  const handleChange = (text, index) => {
    if (text.length > 1) return;
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 3) {
      const nextInput = `input_${index + 1}`;
      inputs[nextInput]?.focus();
    }
  };

  const handleResend = () => {
    if (!canResend) return;
    const data = { email };
    dispatch(requestOtp(data)).then((res) => {
      console.log("OTP Resent!", res);
      setCanResend(false);
      setTimer(60);
    });
  };

  const verifyCode = async () => {
    const codeString = code.join("");
    const data = {
      email,
      otp: codeString,
    };
    dispatch(onOtp(data)).then(async (res) => {
      console.log("After fill otp res ", res);
      if (res?.payload?.success) {
        if (res?.payload?.data?.token) {
          await setItem(STORAGE_KEYS?.TOKEN, res?.payload?.data?.token);
        }
        if (fromScreen === "signup") {
          if (res?.payload?.data?.user?.userType === "freelancer") {
            navigation.navigate(navigationStrings.PROFILE_SETUP);
          } else {
            navigation.navigate(navigationStrings.EMPLOYERKYC);
          }
        } else {
          navigation.navigate(navigationStrings.RESETPASSWORDSCREEN);
        }
      }
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.upperSection}>
        <ImageBackground
          source={imagePath.BACKGROUND}
          style={styles.backgroundGradient}
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Image
              source={imagePath.BACK_ICON}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <Image
            source={imagePath.LOGO_TRANSPARENT}
            style={styles.logo}
            resizeMode="contain"
          />
        </ImageBackground>
      </View>
      <SafeAreaView style={styles.container}>
        {/* Lower 70% - Form Section with Keyboard Avoidance */}
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.lowerSection}>
              <View style={styles.formContainer}>
                {/* OTP Sent Text */}
                <Text style={styles.otpSentText}>
                  OTP successfully sent to{" "}
                  <Text style={styles.phoneNumberText}>
                    {phoneNumber || email}
                  </Text>
                </Text>

                {/* Code Input */}
                <Text style={styles.label}>Code</Text>
                <View style={styles.codeContainer}>
                  {code.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => (inputs[`input_${index}`] = ref)}
                      style={styles.codeInput}
                      value={digit}
                      onChangeText={(text) => handleChange(text, index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      autoFocus={index === 0}
                    />
                  ))}
                </View>

                {/* Resend Timer */}
                <Text style={styles.resendTimer}>
                  Resend code in 00:{timer < 10 ? `0${timer}` : timer}
                </Text>

                {/* Verify Button */}
                <ButtonComp
                  disabled={code.some((digit) => digit === "")}
                  title="Verify Code"
                  onPress={verifyCode}
                  containerStyle={styles.verifyButton}
                />

                {/* Resend Link */}
                <View style={styles.resendContainer}>
                  <Text style={styles.resendText}>Didn't receive a Code? </Text>
                  <Text onPress={handleResend} style={styles.resendLink}>
                    Resend Code
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default OtpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  upperSection: {
    height: "30%",
    width: "100%",
    position: "relative",
  },
  backgroundGradient: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: getVertiPadding(60),
    left: getWidth(20),
    zIndex: 1,
    padding: getVertiPadding(10),
  },
  backIcon: {
    width: getWidth(24),
    height: getHeight(24),
    tintColor: colors.white,
  },
  logo: {
    width: getWidth(120),
    height: getHeight(120),
  },
  lowerSection: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: getHeight(30),
    borderTopRightRadius: getHeight(30),
    marginTop: getHeight(-30),
    paddingTop: getHeight(40),
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: getHoriPadding(24),
    paddingTop: getHeight(20),
  },
  otpSentText: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoMedium,
    color: colors.darkText,
    textAlign: "center",
    marginBottom: getVertiPadding(30),
  },
  phoneNumberText: {
    color: colors.secondary,
    fontFamily: fonts.RobotoMedium,
  },
  label: {
    fontSize: getFontSize(15),
    fontFamily: fonts.RobotoMedium,
    color: colors.darkText,
    marginBottom: getVertiPadding(10),
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: getVertiPadding(30),
  },
  codeInput: {
    width: getWidth(60),
    height: getHeight(60),
    borderRadius: getRadius(30),
    backgroundColor: colors.input,
    textAlign: "center",
    fontSize: getFontSize(20),
    fontFamily: fonts.RobotoMedium,
    color: colors.darkText,
  },
  resendTimer: {
    fontSize: getFontSize(13),
    color: colors.primary,
    fontFamily: fonts.RobotoMedium,
    textAlign: "center",
    marginBottom: getVertiPadding(30),
  },
  verifyButton: {
    marginBottom: getVertiPadding(30),
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: "auto",
    paddingBottom: getVertiPadding(30),
  },
  resendText: {
    fontSize: getFontSize(13),
    color: colors.placeholderText,
    fontFamily: fonts.RobotoRegular,
  },
  resendLink: {
    fontSize: getFontSize(13),
    color: colors.secondary,
    fontFamily: fonts.RobotoMedium,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
});
