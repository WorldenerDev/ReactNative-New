import React, { useEffect, useState, useCallback } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AuthNavigator from "./NavigationContainer/AuthNavigator";
import { getItem } from "@utils/storage";
import { STORAGE_KEYS } from "@utils/storageKeys";
import { useDispatch, useSelector } from "react-redux";
import {
  setUser,
  exitGuestForSignIn,
  clearPendingAuthRedirect,
} from "@redux/slices/authSlice";
import MainNavigator from "./NavigationContainer/MainNavigator";
import { navigationRef } from "./navigationRef";
import { GUEST_RESTRICTED_SCREENS } from "@utils/authHelpers";
import navigationStrings from "./navigationStrings";
import { store } from "@redux/store";

const Routes = () => {
  const { user, pendingAuthRedirect, pendingAuthRoute } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const savedUser = await getItem(STORAGE_KEYS.USER_DATA);
        if (savedUser?.accessToken) {
          dispatch(setUser(savedUser));
        }
      } catch (err) {
        console.error("Error loading user from storage:", err);
      } finally {
        setBootstrapped(true);
      }
    };
    loadUserFromStorage();
  }, [dispatch]);

  const handleNavStateChange = useCallback(() => {
    const { user: currentUser } = store.getState().auth;
    if (!currentUser?.isGuest || !navigationRef.isReady()) {
      return;
    }
    const route = navigationRef.getCurrentRoute();
    if (route?.name && GUEST_RESTRICTED_SCREENS.has(route.name)) {
      dispatch(exitGuestForSignIn());
    }
  }, [dispatch]);

  const handleAuthReady = useCallback(() => {
    if (pendingAuthRedirect) {
      dispatch(clearPendingAuthRedirect());
    }
  }, [dispatch, pendingAuthRedirect]);

  if (!bootstrapped) {
    return null;
  }

  const authInitialRoute = pendingAuthRedirect
    ? pendingAuthRoute || navigationStrings.SIGNINSCREEN
    : navigationStrings.SPLASHSCREEN;

  return (
    <NavigationContainer ref={navigationRef} onStateChange={handleNavStateChange}>
      {user?.accessToken ? (
        <MainNavigator />
      ) : (
        <AuthNavigator
          initialRouteName={authInitialRoute}
          onReady={handleAuthReady}
        />
      )}
    </NavigationContainer>
  );
};

export default Routes;
