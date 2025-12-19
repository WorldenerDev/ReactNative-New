// store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import cityTripReducer from "./slices/cityTripSlice";
import chatReducer from "./slices/chatSlice";
import onlineStatusReducer from "./slices/onlineStatusSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cityTrip: cityTripReducer,
    chat: chatReducer,
    onlineStatus: onlineStatusReducer,
  },
});
