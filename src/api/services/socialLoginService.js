import googleSignInService from "./googleSignInService";
import appleSignInService from "./appleSignInService";

class SocialLoginService {
  constructor() {
    this.providers = {
      google: googleSignInService,
      apple: appleSignInService,
    };
  }

  // Get available providers
  getAvailableProviders() {
    const available = {};

    // Google is always available on both platforms
    available.google = true;

    // Apple is only available on iOS
    available.apple = appleSignInService.isAvailable;

    return available;
  }

  // Sign in with specified provider
  async signIn(provider) {
    try {
      if (!this.providers[provider]) {
        throw new Error(`Unsupported provider: ${provider}`);
      }

      const result = await this.providers[provider].signIn();

      if (result.success) {
        // Add provider info to the result
        result.provider = provider;
        return result;
      } else {
        return result;
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || "Social login failed",
        provider: provider,
      };
    }
  }

  // Sign out from specified provider
  async signOut(provider) {
    try {
      if (!this.providers[provider]) {
        throw new Error(`Unsupported provider: ${provider}`);
      }

      return await this.providers[provider].signOut();
    } catch (error) {
      return {
        success: false,
        error: error.message || "Sign out failed",
        provider: provider,
      };
    }
  }

  // Check if user is signed in to specified provider
  async isSignedIn(provider) {
    try {
      if (!this.providers[provider]) {
        throw new Error(`Unsupported provider: ${provider}`);
      }

      return await this.providers[provider].isSignedIn();
    } catch (error) {
      return false;
    }
  }

  // Get current user from specified provider
  async getCurrentUser(provider) {
    try {
      if (!this.providers[provider]) {
        throw new Error(`Unsupported provider: ${provider}`);
      }

      return await this.providers[provider].getCurrentUser();
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to get current user",
        provider: provider,
      };
    }
  }

  // Get debug information for all providers
  async debugConfiguration() {
    try {
      const debugInfo = {};

      for (const [provider, service] of Object.entries(this.providers)) {
        if (service.debugConfiguration) {
          debugInfo[provider] = await service.debugConfiguration();
        }
      }

      return debugInfo;
    } catch (error) {
      return { error: error.message };
    }
  }

  // Check availability for all providers
  async checkAllProvidersAvailability() {
    try {
      const availability = {};

      for (const [provider, service] of Object.entries(this.providers)) {
        if (service.checkAvailability) {
          availability[provider] = await service.checkAvailability();
        }
      }

      return availability;
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default new SocialLoginService();
