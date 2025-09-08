// store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import cityTripReducer from "./slices/cityTripSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    cityTrip: cityTripReducer,
  },
});
