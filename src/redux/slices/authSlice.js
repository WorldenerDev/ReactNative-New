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
import googleSignInService from "@api/services/googleSignInService";

// ----------------- Thunks -----------------
export const loginUser = createAsyncThunk(
  endpoints?.auth.login,
  async (payload, { rejectWithValue }) => {
    try {
      console.log("Login Payload: ", payload);
      const res = await login(payload);
      console.log("Login Response: ", res);

      // Check if the API response indicates an error
      if (res && res.statusCode && res.statusCode >= 400) {
        // API returned an error response
        return rejectWithValue(res.message || "Login failed");
      }

      // Check if the API response has error status
      if (res && res.status === 0) {
        // API returned error status
        return rejectWithValue(res.message || "Login failed");
      }

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
      console.log("Login Error: ", err);
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

export const googleSignIn = createAsyncThunk(
  "auth/googleSignIn",
  async (_, { rejectWithValue }) => {
    try {
      const result = await googleSignInService.signIn();
      console.log("Google Signin Result:redux ", result);
      if (result.success) {
        // You can customize this based on your backend API
        const userData = {
          id: result.data.user.id,
          email: result.data.user.email,
          name: result.data.user.name,
          photo: result.data.user.photo,
          token: result.data.idToken, // Google ID token
          isGoogleUser: true,
        };
        return userData;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (err) {
      return rejectWithValue(err.message || "Google Sign-In failed");
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

    handleAsyncCases(builder, googleSignIn, {
      onFulfilled: (state, action) => {
        state.user = action.payload;
        state.token = action.payload.token;
      },
    });
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
