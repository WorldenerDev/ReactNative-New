import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getCityTrips,
  createCityTrip,
  updateCityTrip,
  deleteCityTrip,
} from "@api/services/cityTripService"; // 👈 your API calls here
import { endpoints } from "@api/endpoints";
import { handleAsyncCases } from "@utils/reduxHelpers";
import { guestLoginUser } from "@redux/slices/authSlice";
import {
  getAllCity,
  getEventForYou,
  getEventForYouCityId,
  getPopularEvents,
  getTrip,
  deleteTrip,
  getTripBycity,
} from "@api/services/mainServices";

// ----------------- Thunks -----------------

// Fetch trips
export const fetchAllCity = createAsyncThunk(
  endpoints?.main?.getAllCity,
  async (payload, { rejectWithValue }) => {
    try {
      const res = await getAllCity(payload);
      // console.log("All city respnce on reducer", res);
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
      const { preferencesKey: _preferencesKey, ...apiParams } = payload || {};
      const res = await getEventForYou(apiParams);
      return res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);
export const fetchEventForYouCityID = createAsyncThunk(
  "cityTrip/fetchEventForYouCityID",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await getEventForYouCityId(payload);
      console.log("Event for you by city ID response", res);
      return res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);
export const fetchPopularEvent = createAsyncThunk(
  endpoints?.main?.getPopularEvents,
  async (payload, { rejectWithValue }) => {
    try {
      const res = await getPopularEvents(payload);
      console.log("Popular event by city Id response", res);
      return res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);
export const fetchUserTrip = createAsyncThunk(
  endpoints?.main?.getTrips,
  async (payload, { rejectWithValue }) => {
    try {
      const res = await getTrip(payload);
      console.log("getTrip response", res);
      return res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Delete trip (API call only, no state update)
export const deleteUserTrip = createAsyncThunk(
  "cityTrip/deleteTrip",
  async (tripId, { rejectWithValue }) => {
    try {
      const res = await deleteTrip(tripId);
      console.log("deleteTrip response", res);
      return { tripId, response: res };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Fetch trips by city
export const fetchTripByCity = createAsyncThunk(
  "cityTrip/fetchTripByCity",
  async (cityId, { rejectWithValue }) => {
    try {
      const res = await getTripBycity(cityId);
      console.log("getTripBycity response", res);
      return { ...res, cityId }; // Include cityId in response for storage
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
    eventForYouPreferencesKey: null,
    trip: [],
    tripsByCity: {}, // Map to store trips by cityId: { cityId: [trips] }
    loading: false,
    error: null,
  },
  reducers: {
    clearTrips: (state) => {
      state.city = [];
    },
    clearTripsByCity: (state, action) => {
      const cityId = action.payload;
      if (cityId) {
        delete state.tripsByCity[cityId];
      } else {
        state.tripsByCity = {};
      }
    },
  },
  extraReducers: (builder) => {
    // Handle fetching cities
    handleAsyncCases(builder, fetchAllCity, {
      onFulfilled: (state, action) => {
        state.city = action.payload?.data || action.payload || [];
      },
    });

    // For You: only block the UI on first load; background refreshes stay silent.
    builder
      .addCase(fetchEventForYou.pending, (state) => {
        state.error = null;
        if (state.eventForYou.length === 0) {
          state.loading = true;
        }
      })
      .addCase(fetchEventForYou.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.data ?? action.payload;
        state.eventForYou = Array.isArray(data) ? data : [];
        const preferencesKey = action.meta?.arg?.preferencesKey;
        if (preferencesKey !== undefined) {
          state.eventForYouPreferencesKey = preferencesKey;
        }
      })
      .addCase(fetchEventForYou.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder.addCase(guestLoginUser.fulfilled, (state) => {
      state.eventForYou = [];
      state.eventForYouPreferencesKey = null;
    });

    // Handle popular events by city (CityDetail)
    handleAsyncCases(builder, fetchPopularEvent);

    // Handle events for you by city id (CityDetail)
    handleAsyncCases(builder, fetchEventForYouCityID);
    handleAsyncCases(builder, fetchUserTrip, {
      onFulfilled: (state, action) => {
        state.trip = action.payload?.data?.trips || action.payload || [];
      },
    });
    handleAsyncCases(builder, fetchTripByCity, {
      onFulfilled: (state, action) => {
        const trips = action.payload?.data || [];
        const cityId = action.payload?.cityId;

        // Store trips by cityId in map for access across screens
        if (cityId) {
          state.tripsByCity[cityId] = trips;
        } else if (trips.length > 0 && trips[0]?.city_id?.city_id) {
          // Fallback: extract cityId from first trip if not provided
          const extractedCityId = trips[0].city_id.city_id;
          state.tripsByCity[extractedCityId] = trips;
        }
      },
    });
  },
});

export const { clearTrips, clearTripsByCity } = cityTripSlice.actions;
export default cityTripSlice.reducer;
