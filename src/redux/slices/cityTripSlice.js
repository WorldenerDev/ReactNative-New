import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getCityTrips,
  createCityTrip,
  updateCityTrip,
  deleteCityTrip,
} from "@api/services/cityTripService"; // 👈 your API calls here
import { endpoints } from "@api/endpoints";
import { handleAsyncCases } from "@utils/reduxHelpers";
import { getAllCity, getEventForYou } from "@api/services/mainServices";

// ----------------- Thunks -----------------

// Fetch trips
export const fetchAllCity = createAsyncThunk(
  endpoints?.main?.getAllCity,
  async (payload, { rejectWithValue }) => {
    try {
      const res = await getAllCity(payload);
      console.log("All city respnce on reducer", res);
      return res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);
export const fetchEventForYou = createAsyncThunk(
  endpoints?.main?.getEventForYou,
  async (payload, { rejectWithValue }) => {
    try {
      const res = await getEventForYou();
      //   console.log("All event for you respnce", res);
      return res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const cityTripSlice = createSlice({
  name: "cityTrip",
  initialState: {
    city: [],
    eventForYou: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearTrips: (state) => {
      state.city = [];
    },
  },
  extraReducers: (builder) => {
    // Handle fetching cities
    handleAsyncCases(builder, fetchAllCity, {
      onFulfilled: (state, action) => {
        state.city = action.payload?.data || action.payload || [];
      },
    });

    // Handle fetching events for you
    handleAsyncCases(builder, fetchEventForYou, {
      onFulfilled: (state, action) => {
        state.eventForYou = action.payload?.data || action.payload || [];
      },
    });
  },
});

export const { clearTrips } = cityTripSlice.actions;
export default cityTripSlice.reducer;
