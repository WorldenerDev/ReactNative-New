import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Image,
} from "react-native";
import socialLoginService from "../api/services/socialLoginService";
import colors from "@assets/colors";
import imagePath from "@assets/icons";
import { getFontSize, getHeight, getWidth } from "@utils/responsive";

const SocialLoginButtons = ({ onLoginSuccess, onLoginError, onGuestPress }) => {
  const [availableProviders, setAvailableProviders] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkProvidersAvailability();
  }, []);

  const checkProvidersAvailability = async () => {
    try {
      const providers = socialLoginService.getAvailableProviders();
      setAvailableProviders(providers);
    } catch (error) {
      console.error("Failed to check providers availability:", error);
    }
  };

  const handleSocialLogin = async (provider) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const result = await socialLoginService.signIn(provider);

      if (result.success) {
        console.log(`${provider} login successful:`, result.userData);
        onLoginSuccess?.(result);
      } else {
        console.error(`${provider} login failed:`, result.error);
        onLoginError?.(result);
        Alert.alert("Login Failed", result.error);
      }
    } catch (error) {
      console.error(`${provider} login error:`, error);
      onLoginError?.({ success: false, error: error.message, provider });
      Alert.alert("Login Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => handleSocialLogin("google");
  const handleAppleLogin = () => handleSocialLogin("apple");

  return (
    <View style={styles.container}>
      {/* Separator with "or connect with" text */}
      <View style={styles.separatorWrapper}>
        <View style={styles.separator} />
        <Text style={styles.orText}>or connect with</Text>
        <View style={styles.separator} />
      </View>

      {/* Circular Social Login Buttons */}
      <View style={styles.socialButtonsContainer}>
        {/* Google Sign-In Button */}
        {availableProviders.google && (
          <TouchableOpacity
            style={[styles.circularButton, styles.googleButton]}
            onPress={handleGoogleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Image
              source={imagePath.GOOGLE_ICON}
              style={styles.circularIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}

        {/* Apple Sign-In Button - Only show on iOS */}
        {Platform.OS === "ios" && availableProviders.apple && (
          <TouchableOpacity
            style={[styles.circularButton, styles.appleButton]}
            onPress={handleAppleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Image
              source={imagePath.APPLE_ICON}
              style={styles.circularIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Continue as guest button */}
      <TouchableOpacity
        style={styles.guestButton}
        onPress={onGuestPress}
        activeOpacity={0.8}
      >
        <Text style={styles.guestText}>Continue as guest</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: getWidth(20),
    alignItems: "center",
    width: "100%",
  },
  separatorWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: getHeight(30),
    width: "100%",
  },
  separator: {
    flex: 1,
    height: getHeight(1),
    backgroundColor: colors.border || "#E0E0E0",
  },
  orText: {
    marginHorizontal: getWidth(15),
    fontSize: getFontSize(14),
    color: colors.placeholderText || "#666666",
    fontFamily: "System",
    fontWeight: "500",
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: getWidth(30),
    marginBottom: getHeight(30),
  },
  circularButton: {
    width: getWidth(60),
    height: getWidth(60),
    borderRadius: getWidth(30),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  circularIcon: {
    width: getWidth(32),
    height: getWidth(32),
  },
  googleButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  appleButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  guestButton: {
    alignItems: "center",
    paddingVertical: getHeight(10),
  },
  guestText: {
    fontSize: getFontSize(16),
    color: colors.black,
    fontFamily: "System",
    fontWeight: "600",
  },
});

export default SocialLoginButtons;
