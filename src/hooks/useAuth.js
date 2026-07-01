import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { requireAuth as requireAuthHelper } from "@utils/authHelpers";
import { exitGuestForSignIn, exitGuestMode } from "@redux/slices/authSlice";

export function useAuth() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const isGuest = Boolean(user?.isGuest);
  const isAuthenticated = Boolean(user?.accessToken) && !isGuest;

  const requireAuth = useCallback(
    (message) => requireAuthHelper(dispatch, isGuest, message),
    [dispatch, isGuest]
  );

  const promptSignIn = useCallback(() => {
    dispatch(exitGuestForSignIn());
  }, [dispatch]);

  const leaveGuestMode = useCallback(() => {
    dispatch(exitGuestMode());
  }, [dispatch]);

  return {
    user,
    isGuest,
    isAuthenticated,
    requireAuth,
    promptSignIn,
    leaveGuestMode,
  };
}

export default useAuth;
