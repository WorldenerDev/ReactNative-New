import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { showToast } from "@components/AppToast";
import {
  clearPendingAuthRedirect,
  googleAppleSignIn,
  setUser,
} from "@redux/slices/authSlice";
import { getDeviceId } from "@utils/uiUtils";
import { getFCMToken } from "@utils/fcmToken";
import { logAuthToken } from "@utils/devAuthTokenLog";
import { removeItem } from "@utils/storage";
import { STORAGE_KEYS } from "@utils/storageKeys";
import {
  buildSocialLoginPayload,
  hasUsableName,
  isSocialLoginPayloadValid,
} from "@utils/socialLoginPayload";

/**
 * Shared Google/Apple login flow. If the backend user has no name after social
 * auth, prompts for one and re-submits via the existing socialLogin endpoint.
 */
const useSocialLogin = ({ logContext = "Social" } = {}) => {
  const dispatch = useDispatch();
  const [namePromptVisible, setNamePromptVisible] = useState(false);
  const [namePromptLoading, setNamePromptLoading] = useState(false);
  const [pendingSocial, setPendingSocial] = useState(null);

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

  const clearPendingSession = useCallback(async () => {
    setNamePromptVisible(false);
    setPendingSocial(null);
    await removeItem(STORAGE_KEYS.USER_DATA);
    await removeItem(STORAGE_KEYS.TOKEN);
  }, []);

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

        finalizeSession(user);
      } catch (error) {
        console.error("Social login error:", error);
        showToast("error", error?.message || "Login failed");
      }
    },
    [finalizeSession, runSocialLogin]
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
        finalizeSession(user);
      } catch (error) {
        console.error("Social name submit error:", error);
        showToast("error", error?.message || "Failed to save name");
      } finally {
        setNamePromptLoading(false);
      }
    },
    [finalizeSession, pendingSocial, runSocialLogin]
  );

  const handleNameCancel = useCallback(async () => {
    if (namePromptLoading) return;
    await clearPendingSession();
    showToast("info", "Sign-in cancelled. Please enter your name to continue.");
  }, [clearPendingSession, namePromptLoading]);

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
  };
};

export default useSocialLogin;
