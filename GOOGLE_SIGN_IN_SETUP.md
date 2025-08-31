# Google Sign-In Setup Guide

## Prerequisites

- Google Cloud Console account
- React Native project with Android setup
- SHA-1 fingerprint of your debug keystore

## Step 1: Google Cloud Console Setup

### 1.1 Create a new project or select existing one

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down your **Project ID** and **Project Number**

### 1.2 Enable Google Sign-In API

1. In your project, go to **APIs & Services** > **Library**
2. Search for "Google Sign-In API" and enable it
3. Also enable "Google+ API" if available

### 1.3 Create OAuth 2.0 credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Select **Android** as application type
4. Fill in the details:
   - **Package name**: `com.worldener`
   - **SHA-1 certificate fingerprint**: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
5. Click **Create**
6. Note down the **Client ID**

### 1.4 Create Web Client ID (for server-side verification)

1. In the same credentials page, click **Create Credentials** > **OAuth 2.0 Client IDs**
2. Select **Web application**
3. Add authorized redirect URIs if needed
4. Note down the **Client ID**

## Step 2: Update Configuration Files

### 2.1 Update google-services.json

Replace the template `android/app/google-services.json` with the actual file from Google Cloud Console:

1. Go to **Project Settings** > **General**
2. Scroll down to **Your apps** section
3. Click **Add app** > **Android**
4. Enter package name: `com.worldener`
5. Enter SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
6. Download the `google-services.json` file
7. Replace the template file in `android/app/google-services.json`

### 2.2 Update src/config/googleSignIn.js

Replace the placeholder values with your actual credentials:

```javascript
export const GOOGLE_SIGN_IN_CONFIG = {
  webClientId: "YOUR_ACTUAL_WEB_CLIENT_ID.apps.googleusercontent.com",
  iosClientId: "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com", // For iOS if needed

  offlineAccess: true,
  hostedDomain: "",
  forceCodeForRefreshToken: true,

  scopes: ["profile", "email"],
};

export const GOOGLE_CLOUD_PROJECT_ID = "YOUR_ACTUAL_PROJECT_ID";
export const GOOGLE_CLOUD_PROJECT_NUMBER = "YOUR_ACTUAL_PROJECT_NUMBER";
```

## Step 3: Build and Test

### 3.1 Clean and rebuild

```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### 3.2 Test Google Sign-In

1. Run the app on a device/emulator with Google Play Services
2. Navigate to Sign In screen
3. Tap the Google icon
4. Complete the Google Sign-In flow

## Troubleshooting

### Common Issues:

1. **"Google Play services is not available"**

   - Ensure device has Google Play Services installed
   - Test on a physical device or emulator with Google Play Services

2. **"Developer error"**

   - Verify SHA-1 fingerprint matches exactly
   - Ensure package name matches exactly
   - Check if google-services.json is properly placed

3. **"Sign-in failed"**

   - Verify webClientId is correct
   - Check if Google Sign-In API is enabled
   - Ensure OAuth consent screen is configured

4. **Build errors**
   - Clean project: `cd android && ./gradlew clean`
   - Rebuild: `npx react-native run-android`

## Additional Configuration

### For Production:

1. Generate a release keystore
2. Get SHA-1 fingerprint of release keystore
3. Add release SHA-1 to Google Cloud Console
4. Update google-services.json with release configuration

### For iOS (if needed):

1. Add iOS app in Google Cloud Console
2. Get iOS Client ID
3. Update configuration with iOS settings
4. Configure iOS project with Google Sign-In

## Security Notes:

- Never commit real credentials to version control
- Use environment variables for sensitive data
- Implement proper token validation on your backend
- Consider implementing server-side verification of Google ID tokens

