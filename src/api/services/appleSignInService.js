import { appleAuth } from "@invertase/react-native-apple-authentication";
import { Platform } from "react-native";

class AppleSignInService {
  constructor() {
    this.isAvailable = false;
    this.checkAvailability();
  }

  async checkAvailability() {
    try {
      this.isAvailable = await appleAuth.isSupported;
      return this.isAvailable;
    } catch (error) {
      console.error("AppleSignInService: Availability check failed:", error);
      this.isAvailable = false;
      return false;
    }
  }

  async signIn() {
    try {
      console.log("Apple Sign-In: Starting authentication...");

      // Check availability first
      const availability = await this.checkAvailability();
      console.log("Apple Sign-In: Availability check result:", availability);

      if (!this.isAvailable) {
        throw new Error("Apple Sign-In is not available on this device");
      }

      console.log(
        "Apple Sign-In: Device supports Apple Sign-In, proceeding..."
      );

      // Request authorization
      const requestConfig = {
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      };

      console.log("Apple Sign-In: Request config:", requestConfig);

      const appleAuthRequestResponse = await appleAuth.performRequest(
        requestConfig
      );
      console.log(
        "Apple Sign-In: Raw response received:",
        appleAuthRequestResponse
      );

      // Extract user data
      const { authorizationCode, identityToken, email, fullName, user } =
        appleAuthRequestResponse;

      // Create user data object
      const userData = {
        id: user || "unknown",
        email: email || "unknown",
        name: fullName
          ? `${fullName.givenName || ""} ${fullName.familyName || ""}`.trim()
          : "unknown",
        givenName: fullName?.givenName || "unknown",
        familyName: fullName?.familyName || "unknown",
        photo: null, // Apple doesn't provide profile photos
        hasPhoto: false,
        idToken: identityToken || "missing",
        authorizationCode: authorizationCode || "missing",
        provider: "apple",
      };

      return {
        success: true,
        data: appleAuthRequestResponse,
        userData: userData,
      };
    } catch (error) {
      console.error("Apple Sign-In Error Details:", {
        code: error.code,
        message: error.message,
        name: error.name,
        stack: error.stack,
        fullError: error,
      });

      let errorMessage = "Apple Sign-In failed";
      let errorCode = error.code;

      // Handle specific Apple Sign-In error codes
      switch (error.code) {
        case appleAuth.Error.CANCELED:
          errorMessage = "Sign-In was cancelled by user";
          break;
        case appleAuth.Error.INVALID_RESPONSE:
          errorMessage = "Invalid response from Apple";
          break;
        case appleAuth.Error.NOT_HANDLED:
          errorMessage = "Sign-In request not handled";
          break;
        case appleAuth.Error.UNKNOWN:
          errorMessage = "Unknown Apple Sign-In error";
          break;
        case 1000:
          errorMessage = "Apple Sign-In configuration error - check your setup";
          break;
        case 1001:
          errorMessage = "Apple Sign-In not available on this device";
          break;
        case 1002:
          errorMessage = "Apple Sign-In authorization failed";
          break;
        default:
          errorMessage =
            error.message || "Apple Sign-In failed with unknown error";
          errorCode = error.code || "UNKNOWN";
      }

      return {
        success: false,
        error: errorMessage,
        code: errorCode,
        details: {
          originalError: error.message,
          errorName: error.name,
          errorCode: error.code,
        },
      };
    }
  }

  async signOut() {
    try {
      // Apple doesn't have a sign-out method like Google
      // You should handle this in your app's state management
      return {
        success: true,
        message: "Apple Sign-In doesn't require explicit sign-out",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Sign out failed",
      };
    }
  }

  async isSignedIn() {
    try {
      // Apple doesn't provide a persistent sign-in state
      // You should manage this in your app's state management
      return false;
    } catch (error) {
      return false;
    }
  }

  async getCurrentUser() {
    try {
      // Apple doesn't provide a way to get current user info
      // You should store user info in your app's state management
      return {
        success: false,
        error: "Apple Sign-In doesn't provide current user info",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to get current user",
      };
    }
  }

  // Get user credentials for existing users
  async getCredentialStateForUser(userId) {
    try {
      if (!this.isAvailable) {
        throw new Error("Apple Sign-In is not available on this device");
      }

      const credentialState = await appleAuth.getCredentialStateForUser(userId);
      return {
        success: true,
        credentialState: credentialState,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to get credential state",
      };
    }
  }

  // Debug method to check configuration
  async debugConfiguration() {
    try {
      const availability = await this.checkAvailability();
      const platform = Platform.OS;

      // Additional debugging info
      const debugInfo = {
        isAvailable: availability,
        platform: platform,
        appleAuthSupported: appleAuth.isSupported,
        appleAuthAvailable: this.isAvailable,
        deviceInfo: {
          platform: platform,
          version: Platform.Version,
        },
      };

      console.log("Apple Sign-In Debug Info:", debugInfo);
      return debugInfo;
    } catch (error) {
      console.error("Apple Sign-In Debug Error:", error);
      return { error: error.message };
    }
  }

  // Test method to verify Apple Sign-In setup
  async testConfiguration() {
    try {
      console.log("=== Apple Sign-In Configuration Test ===");

      // Test 1: Check if package is imported correctly
      console.log("1. Package import test:", {
        appleAuth: typeof appleAuth,
        appleAuthError: appleAuth.Error,
        appleAuthOperation: appleAuth.Operation,
        appleAuthScope: appleAuth.Scope,
      });

      // Test 2: Check device support
      const deviceSupport = await appleAuth.isSupported;
      console.log("2. Device support test:", deviceSupport);

      // Test 3: Check availability
      const availability = await this.checkAvailability();
      console.log("3. Availability test:", availability);

      // Test 4: Check if running on iOS
      const isIOS = Platform.OS === "ios";
      console.log("4. Platform test:", { platform: Platform.OS, isIOS });

      return {
        success: true,
        tests: {
          packageImport: typeof appleAuth === "object",
          deviceSupport,
          availability,
          platform: Platform.OS,
          isIOS,
        },
      };
    } catch (error) {
      console.error("Apple Sign-In Configuration Test Failed:", error);
      return {
        success: false,
        error: error.message,
        details: error,
      };
    }
  }
}

export default new AppleSignInService();
