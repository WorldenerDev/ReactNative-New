import React, { useEffect, useRef, useState } from "react";
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
import { loginUser, onOtp, setUser } from "@redux/slices/authSlice";
import { STORAGE_KEYS } from "@utils/storageKeys";
import { setItem } from "@utils/storage";
import { logAuthToken } from "@utils/devAuthTokenLog";

const OTP_LENGTH = 6;

const OtpScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { fromScreen, phoneNumber, fcm_Token, deviceId, deviceType } =
    route?.params || {};
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRef = useRef(null);

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

  useEffect(() => {
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(focusTimer);
  }, []);

  const handleOtpChange = (text) => {
    setOtp(text.replace(/\D/g, "").slice(0, OTP_LENGTH));
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const handleResend = async () => {
    try {
      if (!canResend) return;
      setCanResend(false);
      setTimer(60);
      setOtp("");
      focusInput();

      const sendData = {
        phone_number: phoneNumber,
        device_type: Platform.OS,
      };
      const result = await dispatch(loginUser(sendData));
      console.log("Resend OTP result:", result);
    } catch (error) {
      console.log("Error resending OTP:", error);
    }
  };

  const verifyCode = async () => {
    try {
      if (otp.length !== OTP_LENGTH) {
        return;
      }

      const sendData = {
        phone_number: phoneNumber,
        otp,
        fcm_token: fcm_Token || "not_available",
        device_id: deviceId,
        device_type: deviceType || Platform.OS,
      };
      const result = await dispatch(onOtp(sendData));
      console.log("signup Otp Verify result ", result);
      if (onOtp.rejected.match(result) || !result?.payload?.success) {
        return;
      }

      const userData = result?.payload?.data;
      logAuthToken("OTP verifyOtp", userData ?? result?.payload);

      if (userData?.isPreference) {
        await setItem(STORAGE_KEYS?.USER_DATA, userData);
        dispatch(setUser(userData));
        return;
      }

      await setItem(STORAGE_KEYS?.TOKEN, userData?.accessToken);
      navigation.navigate(navigationStrings.INTERESTS, { userData });
    } catch (error) {
      console.log("Error verifying code:", error);
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return "";
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

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}:${String(secs).padStart(2, "0")}`;
    }
    return `${secs}s`;
  };

  const getScreenTitle = () => {
    if (fromScreen === "signup") {
      return "Confirm your phone number";
    }
    return "Verify your phone number";
  };

  const formattedPhone = formatPhoneNumber(phoneNumber);
  const isCodeComplete = otp.length === OTP_LENGTH;
  const cells = Array.from({ length: OTP_LENGTH }, (_, index) => otp[index] || "");

  return (
    <ResponsiveContainer>
      <View style={styles.screen}>
        <View style={styles.topSection}>
          <StepTitle
            title={getScreenTitle()}
            subtitle={`Enter the 6-digit code sent to ${formattedPhone}`}
            containerStyle={styles.titleContainer}
          />

          <View style={styles.codeWrapper}>
            <View style={styles.codeContainer} pointerEvents="none">
              {cells.map((digit, index) => {
                const isActive = index === otp.length && otp.length < OTP_LENGTH;
                const isFilled = digit !== "";

                return (
                  <View
                    key={index}
                    style={[
                      styles.codeCell,
                      isFilled && styles.codeCellFilled,
                      isActive && styles.codeCellActive,
                    ]}
                  >
                    <Text style={styles.codeDigit}>{digit}</Text>
                  </View>
                );
              })}
            </View>
            <TextInput
              ref={inputRef}
              value={otp}
              onChangeText={handleOtpChange}
              keyboardType="number-pad"
              maxLength={OTP_LENGTH}
              textContentType="oneTimeCode"
              autoComplete={
                Platform.OS === "android" ? "sms-otp" : "one-time-code"
              }
              importantForAutofill="yes"
              autoFocus
              caretHidden
              style={styles.hiddenInput}
            />
          </View>

          <ButtonComp
            title="Continue"
            disabled={!isCodeComplete}
            onPress={verifyCode}
            containerStyle={styles.continueBtn}
          />
        </View>

        <View style={styles.middleSection}>
          {!canResend ? (
            <Text style={styles.resendTimer}>
              Resend code in {formatTimer(timer)}
            </Text>
          ) : (
            <View style={styles.resendRow}>
              <Text style={styles.resendPrompt}>Didn't receive the code? </Text>
              <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                <Text style={styles.resendLink}>Resend</Text>
              </TouchableOpacity>
            </View>
          )}
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

export default OtpScreen;

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
  codeWrapper: {
    width: "100%",
    height: getHeight(52),
    marginBottom: getVertiPadding(8),
    position: "relative",
  },
  hiddenInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
    color: "transparent",
    fontSize: 1,
    zIndex: 2,
  },
  codeContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: getWidth(8),
    zIndex: 1,
  },
  codeCell: {
    flex: 1,
    height: getHeight(52),
    borderRadius: getRadius(12),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: getWidth(52),
    alignItems: "center",
    justifyContent: "center",
  },
  codeCellFilled: {
    borderColor: colors.black,
  },
  codeCellActive: {
    borderColor: colors.black,
    borderWidth: 1.5,
  },
  codeDigit: {
    fontSize: getFontSize(18),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
    textAlign: "center",
  },
  continueBtn: {
    marginTop: getVertiPadding(28),
    width: "100%",
  },
  middleSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: getVertiPadding(32),
  },
  resendTimer: {
    fontSize: getFontSize(14),
    color: colors.lightText,
    fontFamily: fonts.RobotoRegular,
    textAlign: "center",
  },
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  resendPrompt: {
    fontSize: getFontSize(14),
    color: colors.lightText,
    fontFamily: fonts.RobotoRegular,
  },
  resendLink: {
    fontSize: getFontSize(14),
    color: colors.black,
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
