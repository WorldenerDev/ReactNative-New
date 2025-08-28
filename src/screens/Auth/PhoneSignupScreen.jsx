import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ImageBackground,
} from "react-native";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import PhoneInput from "@components/PhoneInput";
import CustomInput from "@components/CustomInput";
import ButtonComp from "@components/ButtonComp";
import {
  getFontSize,
  getHeight,
  getHoriPadding,
  getVertiPadding,
  getWidth,
} from "@utils/responsive";
import navigationStrings from "@navigation/navigationStrings";
import { SafeAreaView } from "react-native-safe-area-context";
import imagePath from "@assets/icons";

const PhoneSignupScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
  });
  const [countryCode, setCountryCode] = useState("+1");

  const handleSignup = () => {
    if (!formData.fullName.trim() || !formData.phoneNumber.trim()) {
      // Show error toast or validation
      return;
    }

    // Navigate to OTP screen with user data
    navigation.navigate(navigationStrings.OTPSCREEN, {
      phoneNumber: countryCode + formData.phoneNumber,
      fullName: formData.fullName,
      isSignup: true,
    });
  };

  const handleSignIn = () => {
    navigation.navigate(navigationStrings.PHONELOGINSCREEN);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.upperSection}>
        <ImageBackground
          source={imagePath.BACKGROUND}
          style={styles.backgroundGradient}
        >
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
                {/* Full Name Input */}
                <CustomInput
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChangeText={(txt) =>
                    setFormData({ ...formData, fullName: txt })
                  }
                />

                {/* Phone Input */}
                <PhoneInput
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  value={formData.phoneNumber}
                  onChangeText={(txt) =>
                    setFormData({ ...formData, phoneNumber: txt })
                  }
                  countryCode={countryCode}
                  onCountryCodeChange={setCountryCode}
                />

                {/* Sign In Text */}
                <TouchableOpacity
                  style={styles.signinContainer}
                  onPress={handleSignIn}
                >
                  <Text style={styles.signinText}>
                    Already have an account?{" "}
                    <Text style={styles.signinLink}>Sign in</Text>
                  </Text>
                </TouchableOpacity>

                {/* Signup Button */}
                <ButtonComp
                  title="Create Account"
                  disabled={
                    !formData.fullName.trim() || !formData.phoneNumber.trim()
                  }
                  onPress={handleSignup}
                  containerStyle={styles.signupButton}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default PhoneSignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  upperSection: {
    height: "30%",
    width: "100%",
  },
  backgroundGradient: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
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
  signinContainer: {
    alignItems: "flex-end",
    marginTop: getVertiPadding(10),
    marginBottom: getVertiPadding(30),
  },
  signinText: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.bodyText,
  },
  signinLink: {
    color: colors.secondary,
    fontFamily: fonts.RobotoMedium,
  },
  signupButton: {
    marginTop: "auto",
    marginBottom: getVertiPadding(30),
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
