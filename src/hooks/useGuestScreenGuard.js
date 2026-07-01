import { useEffect } from "react";
import useAuth from "@hooks/useAuth";

/** Redirects guests to Sign In when they land on a restricted screen. */
export function useGuestScreenGuard() {
  const { isGuest, requireAuth } = useAuth();

  useEffect(() => {
    if (isGuest) {
      requireAuth();
    }
  }, [isGuest, requireAuth]);
}

export default useGuestScreenGuard;
