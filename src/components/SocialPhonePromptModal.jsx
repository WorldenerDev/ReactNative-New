import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TextInput,
} from "react-native";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import PhoneInput from "@components/PhoneInput";
import ButtonComp from "@components/ButtonComp";
import {
  getFontSize,
  getHoriPadding,
  getRadius,
  getVertiPadding,
} from "@utils/responsive";
import { validateMobileNumber } from "@utils/validators";

const OTP_LENGTH = 6;

const SocialPhonePromptModal = ({
  visible,
  loading = false,
  allowSkip = true,
  onSendOtp,
  onVerifyOtp,
  onResendOtp,
  onSkip,
  onClose,
}) => {
  const [step, setStep] = useState("phone");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullPhone, setFullPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible) {
      setStep("phone");
      setCountryCode("+91");
      setPhoneNumber("");
      setFullPhone("");
      setOtp("");
      setError("");
    }
  }, [visible]);

  const handleSendOtp = async () => {
    const validationError = validateMobileNumber(phoneNumber);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    const nextFullPhone = `${countryCode}${phoneNumber}`;
    const sent = await onSendOtp?.(nextFullPhone);
    if (sent) {
      setFullPhone(nextFullPhone);
      setOtp("");
      setStep("otp");
    }
  };

  const handleVerify = async () => {
    if (otp.length !== OTP_LENGTH) {
      setError("OTP must be exactly 6 digits");
      return;
    }
    setError("");
    await onVerifyOtp?.(fullPhone, otp);
  };

  const handleResend = async () => {
    setOtp("");
    setError("");
    await onResendOtp?.(fullPhone);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={
        loading ? undefined : allowSkip ? onSkip : onClose
      }
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.backdrop} />
        <View style={styles.card}>
          <Text style={styles.title}>
            {step === "otp" ? "Verify your number" : "Add your mobile number"}
          </Text>
          <Text style={styles.subtitle}>
            {step === "otp"
              ? `Enter the 6-digit code we sent to ${fullPhone}.`
              : "Add a number so friends can find you in their contacts. You can skip this and add it later in your profile."}
          </Text>

          {step === "phone" ? (
            <>
              <PhoneInput
                placeholder="Enter mobile number"
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text);
                  if (error) setError("");
                }}
                countryCode={countryCode}
                onCountryCodeChange={setCountryCode}
                editable={!loading}
                containerStyle={styles.phoneInput}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <ButtonComp
                title={loading ? "Sending..." : "Continue"}
                disabled={loading || !phoneNumber.trim()}
                onPress={handleSendOtp}
                containerStyle={styles.button}
              />
            </>
          ) : (
            <>
              <TextInput
                style={styles.otpInput}
                value={otp}
                onChangeText={(text) => {
                  setOtp(text.replace(/\D/g, "").slice(0, OTP_LENGTH));
                  if (error) setError("");
                }}
                keyboardType="number-pad"
                maxLength={OTP_LENGTH}
                editable={!loading}
                placeholder="Enter OTP"
                placeholderTextColor={colors.lightText}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <ButtonComp
                title={loading ? "Verifying..." : "Verify"}
                disabled={loading || otp.length !== OTP_LENGTH}
                onPress={handleVerify}
                containerStyle={styles.button}
              />
              <TouchableOpacity
                onPress={handleResend}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={styles.resend}>Resend code</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setStep("phone");
                  setOtp("");
                  setError("");
                }}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={styles.changeNumber}>Change number</Text>
              </TouchableOpacity>
            </>
          )}

          {loading ? (
            <ActivityIndicator color={colors.primary} style={styles.spinner} />
          ) : allowSkip ? (
            <TouchableOpacity onPress={onSkip} activeOpacity={0.7}>
              <Text style={styles.skip}>Skip for now</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.skip}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default SocialPhonePromptModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: getHoriPadding(24),
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: getRadius(16),
    paddingHorizontal: getHoriPadding(20),
    paddingVertical: getVertiPadding(24),
    zIndex: 1,
  },
  title: {
    fontSize: getFontSize(20),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
    marginBottom: getVertiPadding(8),
  },
  subtitle: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    lineHeight: getFontSize(20),
    marginBottom: getVertiPadding(20),
  },
  button: {
    width: "100%",
    marginTop: getVertiPadding(16),
  },
  phoneInput: {
    paddingVertical: 0,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: getRadius(12),
    paddingHorizontal: getHoriPadding(16),
    paddingVertical: getVertiPadding(14),
    fontSize: getFontSize(20),
    letterSpacing: 8,
    textAlign: "center",
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  errorText: {
    marginTop: getVertiPadding(8),
    color: colors.error,
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoRegular,
  },
  resend: {
    marginTop: getVertiPadding(16),
    textAlign: "center",
    color: colors.black,
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoMedium,
  },
  changeNumber: {
    marginTop: getVertiPadding(10),
    textAlign: "center",
    color: colors.lightText,
    fontSize: getFontSize(13),
    fontFamily: fonts.RobotoRegular,
  },
  skip: {
    marginTop: getVertiPadding(16),
    textAlign: "center",
    color: colors.lightText,
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoMedium,
  },
  spinner: {
    marginTop: getVertiPadding(16),
  },
});
