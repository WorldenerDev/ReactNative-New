import React, { useState } from 'react';
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
} from 'react-native';
import colors from '@assets/colors';
import fonts from '@assets/fonts';
import PhoneInput from '@components/PhoneInput';
import ButtonComp from '@components/ButtonComp';
import {
  getFontSize,
  getHeight,
  getHoriPadding,
  getVertiPadding,
  getWidth,
} from '@utils/responsive';
import navigationStrings from '@navigation/navigationStrings';
import { SafeAreaView } from 'react-native-safe-area-context';
import imagePath from '@assets/icons';
import Header from '@components/Header';

const PhoneLoginScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1');

  const handleLogin = () => {
    if (!phoneNumber.trim()) {
      // Show error toast or validation
      return;
    }
    console.log(countryCode + phoneNumber);
    // Navigate to OTP screen with phone number
    navigation.navigate(navigationStrings.OTPSCREEN, {
      phoneNumber: countryCode + phoneNumber,
    });
  };

  const handleGoogleLogin = () => {
    // Implement Google login
    console.log('Google login pressed');
  };

  const handleAppleLogin = () => {
    // Implement Apple login
    console.log('Apple login pressed');
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
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.lowerSection}>
              <View style={styles.formContainer}>
                {/* Phone Input */}
                <PhoneInput
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  countryCode={countryCode}
                  onCountryCodeChange={setCountryCode}
                />

                {/* Sign Up Text */}
                <TouchableOpacity
                  style={styles.signupContainer}
                  onPress={() =>
                    navigation.navigate(navigationStrings.PHONESIGNUPSCREEN)
                  }
                >
                  <Text style={styles.signupText}>
                    Don't have an account?{' '}
                    <Text style={styles.signupLink}>Sign up</Text>
                  </Text>
                </TouchableOpacity>

                {/* Login Button */}
                <ButtonComp
                  title="Continue"
                  disabled={!phoneNumber.trim()}
                  onPress={handleLogin}
                  containerStyle={styles.loginButton}
                />

                {/* Social Login Section */}
                <View style={styles.socialSection}>
                  <View style={styles.separatorContainer}>
                    <View style={styles.separator} />
                    <Text style={styles.orText}>or continue with</Text>
                    <View style={styles.separator} />
                  </View>

                  <View style={styles.socialButtonsContainer}>
                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={handleGoogleLogin}
                    >
                      <Image
                        source={imagePath.GOOGLE_ICON}
                        style={styles.socialIcon}
                      />
                      <Text style={styles.socialButtonText}>Google</Text>
                    </TouchableOpacity>

                    {Platform.OS === 'ios' && (
                      <TouchableOpacity
                        style={styles.socialButton}
                        onPress={handleAppleLogin}
                      >
                        <Image
                          source={imagePath.APPLE_ICON}
                          style={styles.socialIcon}
                        />
                        <Text style={styles.socialButtonText}>Apple</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default PhoneLoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  upperSection: {
    height: '30%',
    width: '100%',
  },
  backgroundGradient: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 35, 102, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
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
  signupContainer: {
    alignItems: 'flex-end',
    marginTop: getVertiPadding(10),
    marginBottom: getVertiPadding(30),
  },
  signupText: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.bodyText,
  },
  signupLink: {
    color: colors.secondary,
    fontFamily: fonts.RobotoMedium,
  },
  loginButton: {
    marginBottom: getVertiPadding(30),
  },
  socialSection: {
    marginTop: 'auto',
    paddingBottom: getVertiPadding(30),
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getVertiPadding(25),
  },
  separator: {
    flex: 1,
    height: getHeight(1),
    backgroundColor: colors.border,
  },
  orText: {
    marginHorizontal: getHoriPadding(15),
    fontSize: getFontSize(14),
    color: colors.placeholderText,
    fontFamily: fonts.RobotoMedium,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: Platform.OS === 'ios' ? 'space-between' : 'center',
    gap: getWidth(15),
  },
  socialButton: {
    flex: 1,
    backgroundColor: colors.input,
    paddingVertical: getVertiPadding(16),
    paddingHorizontal: getHoriPadding(20),
    borderRadius: getHeight(12),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: getWidth(8),
  },
  socialButtonText: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoMedium,
    color: colors.darkText,
  },
  socialIcon: {
    width: getWidth(20),
    height: getHeight(20),
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
