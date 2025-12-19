import React, { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useDispatch } from "react-redux";
import { store } from "@redux/store";
import { updateUserOnlineStatus } from "@redux/slices/onlineStatusSlice";

const getToken = (state) =>
  state.auth?.user?.accessToken || state.auth?.user?.token || state.auth?.token;

const AppStateHandler = () => {
  const dispatch = useDispatch();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      const token = getToken(store.getState());

      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active" &&
        token
      ) {
        dispatch(updateUserOnlineStatus(true));
      } else if (
        appState.current === "active" &&
        nextAppState.match(/inactive|background/) &&
        token
      ) {
        dispatch(updateUserOnlineStatus(false));
      }

      appState.current = nextAppState;
    });

    if (appState.current === "active" && getToken(store.getState())) {
      dispatch(updateUserOnlineStatus(true));
    }

    return () => subscription?.remove();
  }, [dispatch]);

  return null;
};

export default AppStateHandler;
