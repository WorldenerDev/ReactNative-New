// store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import cityTripReducer from "./slices/cityTripSlice";
import chatReducer from "./slices/chatSlice";
import onlineStatusReducer from "./slices/onlineStatusSlice";
import { updateUserOnlineStatus } from "./slices/onlineStatusSlice";

const onlineStatusMiddleware = (store) => (next) => (action) => {
  const prevState = store.getState();
  const prevToken =
    prevState.auth?.user?.accessToken ||
    prevState.auth?.user?.token ||
    prevState.auth?.token;

  const result = next(action);

  const state = store.getState();
  const token =
    state.auth?.user?.accessToken ||
    state.auth?.user?.token ||
    state.auth?.token;

  if (token && !prevToken) {
    store.dispatch(updateUserOnlineStatus(true));
  }

  return result;
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cityTrip: cityTripReducer,
    chat: chatReducer,
    onlineStatus: onlineStatusReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(onlineStatusMiddleware),
});
