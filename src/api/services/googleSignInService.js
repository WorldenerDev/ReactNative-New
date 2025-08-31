import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

class GoogleSignInService {
  constructor() {
    this.configure();
  }

  configure() {
    const config = {
      webClientId:
        "37468621091-2lb10p3k23hg2d6rqv0d95pv3rm4v0qt.apps.googleusercontent.com",
      iosClientId:
        "37468621091-2o02lnch59re6n7dt6264l9asktu2lkv.apps.googleusercontent.com",
      offlineAccess: true,
      hostedDomain: "",
      forceCodeForRefreshToken: true,
      scopes: ["profile", "email"],
    };

    try {
      GoogleSignin.configure(config);
    } catch (error) {
      console.error("GoogleSignInService: Configuration failed:", error);
    }
  }

  async signIn() {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      // Extract user data from the correct structure (data.user)
      const userData = {
        id: userInfo?.data?.user?.id || "unknown",
        email: userInfo?.data?.user?.email || "unknown",
        name: userInfo?.data?.user?.name || "unknown",
        givenName: userInfo?.data?.user?.givenName || "unknown",
        familyName: userInfo?.data?.user?.familyName || "unknown",
        photo: userInfo?.data?.user?.photo || null,
        hasPhoto: !!userInfo?.data?.user?.photo,
        idToken: userInfo?.data?.idToken || "missing",
        serverAuthCode: userInfo?.data?.serverAuthCode || "missing",
        scopes: userInfo?.data?.scopes || [],
      };

      return {
        success: true,
        data: userInfo,
        userData: userData,
      };
    } catch (error) {
      let errorMessage = "Google Sign-In failed";

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMessage = "Sign-In was cancelled";
      } else if (error.code === statusCodes.IN_PROGRESS) {
        errorMessage = "Sign-In is already in progress";
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessage = "Play Services not available";
      } else {
        errorMessage = error.message || "Unknown error occurred";
      }

      return {
        success: false,
        error: errorMessage,
        code: error.code,
      };
    }
  }

  async signOut() {
    try {
      await GoogleSignin.signOut();
      return {
        success: true,
        message: "Signed out successfully",
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
      const isSignedIn = await GoogleSignin.isSignedIn();
      return isSignedIn;
    } catch (error) {
      return false;
    }
  }

  async getCurrentUser() {
    try {
      const userInfo = await GoogleSignin.getCurrentUser();
      return {
        success: true,
        data: userInfo,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to get current user",
      };
    }
  }

  async getTokens() {
    try {
      const tokens = await GoogleSignin.getTokens();
      return {
        success: true,
        data: tokens,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to get tokens",
      };
    }
  }

  // Debug method to check configuration
  async debugConfiguration() {
    try {
      const isSignedIn = await this.isSignedIn();
      if (isSignedIn) {
        const currentUser = await this.getCurrentUser();
        const tokens = await this.getTokens();
        return { isSignedIn, currentUser, tokens };
      }
      return { isSignedIn: false };
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default new GoogleSignInService();
