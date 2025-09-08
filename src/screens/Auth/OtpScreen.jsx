import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import ButtonComp from "@components/ButtonComp";
import Header from "@components/Header";
import StepTitle from "@components/StepTitle";
import ResponsiveContainer from "@components/container/ResponsiveContainer";
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
import { loginUser, onOtp, requestOtp, setUser } from "@redux/slices/authSlice";
import { STORAGE_KEYS } from "@utils/storageKeys";
import { setItem } from "@utils/storage";

const OtpScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { fromScreen, phoneNumber } = route?.params || {};
  const [code, setCode] = useState(["", "", "", "", "", ""]);
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

    if (text && index < 5) {
      const nextInput = `input_${index + 1}`;
      inputs[nextInput]?.focus();
    }
  };

  const handleResend = async () => {
    try {
      if (!canResend) return;
      setCanResend(false);
      setTimer(60);
      const sendData = {
        phone_number: phoneNumber,
        device_type: Platform.OS,
      };
      const result = await dispatch(loginUser(sendData));

      console.log("Resend OTP result:", result);
    } catch (error) {
      console.log("Error resending OTP:", error);
    }

    // Implement resend logic here
  };

  const verifyCode = async () => {
    try {
      const codeString = code.join("");
      if (codeString.length !== 6) {
        return;
      }

      const sendData = {
        phone_number: phoneNumber,
        otp: codeString,
      };
      const result = await dispatch(onOtp(sendData));
      console.log("signup Otp Verify result ", result);
      if (result?.payload?.success && fromScreen === "signin") {
        if (result?.payload?.data?.isPreference) {
          await setItem(STORAGE_KEYS?.USER_DATA, result?.payload?.data);
          dispatch(setUser(result?.payload?.data));
        } else if (result?.payload?.success) {
          await setItem(
            STORAGE_KEYS?.TOKEN,
            result?.payload?.data?.accessToken
          );
          navigation.navigate(navigationStrings.INTERESTS, {
            userData: result?.payload?.data,
          });
        }
      } else if (result?.payload?.success) {
        await setItem(STORAGE_KEYS?.TOKEN, result?.payload?.data?.accessToken);
        navigation.navigate(navigationStrings.INTERESTS, {
          userData: result?.payload?.data,
        });
      }
    } catch (error) {
      console.log("Error verifying code:", error);
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return "";
    // Format phone number as +91 921 898 4456
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length >= 10) {
      const countryCode = cleaned.substring(0, cleaned.length - 10);
      const number = cleaned.substring(cleaned.length - 10);
      return `+${countryCode} ${number.substring(0, 3)} ${number.substring(
        3,
        6
      )} ${number.substring(6)}`;
    }
    return phone;
  };

  const getScreenTitle = () => {
    if (fromScreen === "signup") {
      return "Confirm your phone number";
    }
    return "Verify your phone number";
  };

  const getScreenSubtitle = () => {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (fromScreen === "signup") {
      return `We've sent a 6-digit verification code to your phone number : ${formattedPhone}`;
    }
    return `We've sent a 6-digit verification code to ${formattedPhone}`;
  };

  return (
    <ResponsiveContainer>
      <Header />
      <StepTitle title={getScreenTitle()} subtitle={getScreenSubtitle()} />

      <View style={styles.formContainer}>
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

        <Text style={styles.resendTimer}>
          Resend code in : {Math.floor(timer / 60)} min{" "}
          {timer % 60 > 0 ? `${timer % 60}s` : ""}
        </Text>

        <ButtonComp
          title="Continue"
          disabled={code.some((digit) => digit === "")}
          onPress={verifyCode}
          containerStyle={styles.continueButton}
        />

        <TouchableOpacity
          style={styles.resendContainer}
          onPress={handleResend}
          disabled={!canResend}
        >
          <Text
            style={[styles.resendText, canResend && styles.resendTextActive]}
          >
            {canResend ? "Resend Code" : "Resend Code"}
          </Text>
        </TouchableOpacity>
      </View>
    </ResponsiveContainer>
  );
};

export default OtpScreen;

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    marginTop: getVertiPadding(40),
    alignItems: "center",
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "nowrap",
    marginBottom: getVertiPadding(40),
    width: "100%",
    paddingHorizontal: getHoriPadding(10),
    gap: getWidth(6),
  },
  codeInput: {
    width: getWidth(45),
    height: getHeight(50),
    borderRadius: getRadius(8),
    backgroundColor: colors.white,
    textAlign: "center",
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoMedium,
    color: colors.darkText,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: getWidth(40),
    maxWidth: getWidth(50),
  },
  resendTimer: {
    fontSize: getFontSize(14),
    color: colors.placeholderText,
    fontFamily: fonts.RobotoRegular,
    textAlign: "center",
    marginBottom: getVertiPadding(40),
  },
  continueButton: {
    marginBottom: getVertiPadding(30),
    width: "100%",
  },
  resendContainer: {
    alignItems: "center",
    paddingVertical: getVertiPadding(10),
  },
  resendText: {
    fontSize: getFontSize(14),
    color: colors.secondary,
    fontFamily: fonts.RobotoRegular,
  },
  resendTextActive: {
    color: colors.black,
    fontFamily: fonts.RobotoMedium,
  },
});
