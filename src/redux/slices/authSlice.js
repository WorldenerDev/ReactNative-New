import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  signup,
  otp,
  resendOtp,
  login,
  newPass,
  freelancerProfile,
} from "@api/services/authService";
import { endpoints } from "@api/endpoints";
import { handleAsyncCases } from "@utils/reduxHelpers";
import { setItem } from "@utils/storage";
import { STORAGE_KEYS } from "@utils/storageKeys";

// ----------------- Thunks -----------------
export const loginUser = createAsyncThunk(
  endpoints?.auth.login,
  async (payload, { rejectWithValue }) => {
    try {
      const res = await login(payload);
      console.log("Login Response: ", res);

      // const userData = {
      //     ...res?.data?.user,
      //     token: res?.data?.token,
      // };

      // if (
      //     res?.data?.token &&
      //     res?.data?.user?.hasOverview &&
      //     res?.data?.user?.hasProfessionalTitle &&
      //     res?.data?.user?.hasProfilePhoto
      // ) {
      //     console.log("Set user data called");
      //     await setItem(STORAGE_KEYS?.USER_DATA, userData);
      // }

      return res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const signupUser = createAsyncThunk(
  endpoints?.auth?.signup,
  async (payload, { rejectWithValue }) => {
    try {
      const res = await signup(payload);
      return res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const onOtp = createAsyncThunk(
  endpoints?.auth?.otp,
  async (payload, { rejectWithValue }) => {
    try {
      const res = await otp(payload);
      return res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const requestOtp = createAsyncThunk(
  endpoints?.auth?.resendOtp,
  async (payload, { rejectWithValue }) => {
    try {
      const res = await resendOtp(payload);
      return res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createNewPass = createAsyncThunk(
  endpoints?.auth?.resetPass,
  async (payload, { rejectWithValue }) => {
    try {
      const res = await newPass(payload);
      return res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createFreelancerProfile = createAsyncThunk(
  endpoints?.auth?.freelancer?.profile,
  async (payload, { rejectWithValue }) => {
    try {
      const res = await freelancerProfile(payload);
      return res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ----------------- Slice -----------------
const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, token: null, loading: false, error: null },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.token = action.payload.token || null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    handleAsyncCases(builder, signupUser, {
      onFulfilled: (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
      },
    });
    handleAsyncCases(builder, onOtp, {
      onFulfilled: (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
      },
    });
    handleAsyncCases(builder, requestOtp, {
      onFulfilled: (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
      },
    });
    handleAsyncCases(builder, loginUser, {
      onFulfilled: (state, action) => {
        state.user = action.payload;
        state.token = action.payload.token;
      },
    });
    handleAsyncCases(builder, createNewPass, {
      onFulfilled: (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
      },
    });
    handleAsyncCases(builder, createFreelancerProfile, {
      onFulfilled: (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
      },
    });
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
