import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { showToast } from "@components/AppToast";
import {
  clearPendingAuthRedirect,
  googleAppleSignIn,
  setUser,
} from "@redux/slices/authSlice";
import {
  sendLinkPhoneOtp,
  verifyLinkPhone,
} from "@api/services/authService";
import { getDeviceId } from "@utils/uiUtils";
import { getFCMToken } from "@utils/fcmToken";
import { logAuthToken } from "@utils/devAuthTokenLog";
import { removeItem, setItem } from "@utils/storage";
import { STORAGE_KEYS } from "@utils/storageKeys";
import navigationStrings from "@navigation/navigationStrings";
import {
  buildSocialLoginPayload,
  hasUsableName,
  hasUsablePhone,
  isSocialLoginPayloadValid,
} from "@utils/socialLoginPayload";

/**
 * Shared Google/Apple login flow. If the backend user has no name after social
 * auth, prompts for one. If they have no phone, optionally offer to link one.
 */
const useSocialLogin = ({ logContext = "Social", navigation } = {}) => {
  const dispatch = useDispatch();
  const [namePromptVisible, setNamePromptVisible] = useState(false);
  const [namePromptLoading, setNamePromptLoading] = useState(false);
  const [pendingSocial, setPendingSocial] = useState(null);
  const [phonePromptVisible, setPhonePromptVisible] = useState(false);
  const [phonePromptLoading, setPhonePromptLoading] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  const finalizeSession = useCallback(
    (loginPayload) => {
      const userInfo = {
        ...loginPayload,
        token: loginPayload?.accessToken,
      };
      dispatch(setUser(userInfo));
      dispatch(clearPendingAuthRedirect());
    },
    [dispatch]
  );

  const completeAuth = useCallback(
    async (user) => {
      const userInfo = {
        ...user,
        token: user?.accessToken,
      };

      if (user?.isPreference) {
        await setItem(STORAGE_KEYS.USER_DATA, userInfo);
        finalizeSession(userInfo);
        return;
      }

      await setItem(STORAGE_KEYS.TOKEN, user?.accessToken);
      if (navigation?.navigate) {
        navigation.navigate(navigationStrings.INTERESTS, { userData: userInfo });
        return;
      }
      await setItem(STORAGE_KEYS.USER_DATA, userInfo);
      finalizeSession(userInfo);
    },
    [finalizeSession, navigation]
  );

  const clearPendingSession = useCallback(async () => {
    setNamePromptVisible(false);
    setPendingSocial(null);
    setPhonePromptVisible(false);
    setPendingUser(null);
    await removeItem(STORAGE_KEYS.USER_DATA);
    await removeItem(STORAGE_KEYS.TOKEN);
  }, []);

  const continueAfterProfile = useCallback(
    async (user) => {
      if (!hasUsablePhone(user?.phone_number)) {
        const token = user?.accessToken || user?.token;
        if (token) {
          await setItem(STORAGE_KEYS.TOKEN, token);
        }
        setPendingUser(user);
        setPhonePromptVisible(true);
        return;
      }
      await completeAuth(user);
    },
    [completeAuth]
  );

  const runSocialLogin = useCallback(
    async ({ result, provider, nameOverride, deviceId, fcmToken }) => {
      const payload = buildSocialLoginPayload({
        provider: result?.provider || provider,
        result,
        deviceId,
        fcmToken,
        nameOverride,
      });

      if (!isSocialLoginPayloadValid(payload)) {
        showToast("error", "Social sign-in did not return a valid account id.");
        return null;
      }

      const loginResult = await dispatch(googleAppleSignIn(payload));
      if (googleAppleSignIn.rejected.match(loginResult)) {
        showToast("error", loginResult.payload || "Login failed");
        return null;
      }

      logAuthToken(`${logContext} ${provider}`, loginResult?.payload);
      return loginResult.payload;
    },
    [dispatch, logContext]
  );

  const handleSocialLoginSuccess = useCallback(
    async (result, provider) => {
      try {
        const deviceId = await getDeviceId();
        const fcmToken = await getFCMToken();
        const user = await runSocialLogin({
          result,
          provider,
          deviceId,
          fcmToken,
        });
        if (!user) return;

        if (!hasUsableName(user?.name)) {
          setPendingSocial({ result, provider, deviceId, fcmToken });
          setNamePromptVisible(true);
          return;
        }

        await continueAfterProfile(user);
      } catch (error) {
        console.error("Social login error:", error);
        showToast("error", error?.message || "Login failed");
      }
    },
    [continueAfterProfile, runSocialLogin]
  );

  const handleNameSubmit = useCallback(
    async (name) => {
      if (!pendingSocial) return;

      setNamePromptLoading(true);
      try {
        const user = await runSocialLogin({
          ...pendingSocial,
          nameOverride: name,
        });
        if (!user) return;

        if (!hasUsableName(user?.name)) {
          showToast("error", "Could not save your name. Please try again.");
          return;
        }

        setNamePromptVisible(false);
        setPendingSocial(null);
        await continueAfterProfile(user);
      } catch (error) {
        console.error("Social name submit error:", error);
        showToast("error", error?.message || "Failed to save name");
      } finally {
        setNamePromptLoading(false);
      }
    },
    [continueAfterProfile, pendingSocial, runSocialLogin]
  );

  const handleNameCancel = useCallback(async () => {
    if (namePromptLoading) return;
    await clearPendingSession();
    showToast("info", "Sign-in cancelled. Please enter your name to continue.");
  }, [clearPendingSession, namePromptLoading]);

  const handleSendLinkPhoneOtp = useCallback(async (phoneNumber) => {
    setPhonePromptLoading(true);
    try {
      await sendLinkPhoneOtp({ phone_number: phoneNumber });
      showToast("success", "OTP sent to your mobile number");
      return true;
    } catch (error) {
      return false;
    } finally {
      setPhonePromptLoading(false);
    }
  }, []);

  const handleVerifyLinkPhone = useCallback(
    async (phoneNumber, otp) => {
      if (!pendingUser) return;
      setPhonePromptLoading(true);
      try {
        const res = await verifyLinkPhone({
          phone_number: phoneNumber,
          otp,
        });
        const updated = res?.data || {};
        const nextUser = {
          ...pendingUser,
          ...updated,
          phone_number: updated.phone_number || phoneNumber,
          accessToken: pendingUser.accessToken || updated.accessToken,
          token: pendingUser.token || pendingUser.accessToken,
        };
        setPhonePromptVisible(false);
        setPendingUser(null);
        await completeAuth(nextUser);
      } catch (error) {
        // apiClient already toasts
      } finally {
        setPhonePromptLoading(false);
      }
    },
    [completeAuth, pendingUser]
  );

  const handleSkipPhone = useCallback(() => {
    if (phonePromptLoading) return;
    const user = pendingUser;
    setPhonePromptVisible(false);
    setPendingUser(null);
    if (user) {
      completeAuth(user);
    }
  }, [completeAuth, pendingUser, phonePromptLoading]);

  const handleSocialLoginError = useCallback((error) => {
    showToast("error", error?.error || "Social login failed");
  }, []);

  return {
    handleSocialLoginSuccess,
    handleSocialLoginError,
    namePromptVisible,
    namePromptLoading,
    handleNameSubmit,
    handleNameCancel,
    phonePromptVisible,
    phonePromptLoading,
    handleSendLinkPhoneOtp,
    handleVerifyLinkPhone,
    handleSkipPhone,
  };
};

export default useSocialLogin;
