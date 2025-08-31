import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import socialLoginService from "../api/services/socialLoginService";
import { colors } from "../assets/colors";

const SocialLoginButtons = ({ onLoginSuccess, onLoginError }) => {
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
      <Text style={styles.title}>Sign in with</Text>

      {/* Google Sign-In Button */}
      {availableProviders.google && (
        <TouchableOpacity
          style={[styles.button, styles.googleButton]}
          onPress={handleGoogleLogin}
          disabled={isLoading}
        >
          <Text style={styles.googleButtonText}>
            {isLoading ? "Signing in..." : "Continue with Google"}
          </Text>
        </TouchableOpacity>
      )}

      {/* Apple Sign-In Button - Only show on iOS */}
      {Platform.OS === "ios" && availableProviders.apple && (
        <TouchableOpacity
          style={[styles.button, styles.appleButton]}
          onPress={handleAppleLogin}
          disabled={isLoading}
        >
          <Text style={styles.appleButtonText}>
            {isLoading ? "Signing in..." : "Continue with Apple"}
          </Text>
        </TouchableOpacity>
      )}

      {/* Debug Info */}
      <View style={styles.debugContainer}>
        <Text style={styles.debugText}>
          Available providers:{" "}
          {Object.keys(availableProviders)
            .filter((key) => availableProviders[key])
            .join(", ")}
        </Text>
        <Text style={styles.debugText}>Platform: {Platform.OS}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    color: colors.black,
  },
  button: {
    width: "100%",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  googleButton: {
    backgroundColor: "#4285F4",
  },
  googleButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  appleButton: {
    backgroundColor: "#000000",
  },
  appleButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  debugContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    width: "100%",
  },
  debugText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginBottom: 5,
  },
});

export default SocialLoginButtons;
