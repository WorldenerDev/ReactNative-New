import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  signup,
  otp,
  resendOtp,
  login,
  SocialLogin,
  getCategory,
  SelectCategory,
} from "@api/services/authService";
import { getCategoriesTree } from "@api/services/mainServices";
import { endpoints } from "@api/endpoints";
import { handleAsyncCases } from "@utils/reduxHelpers";
import { setItem } from "@utils/storage";
import { STORAGE_KEYS } from "@utils/storageKeys";
import { updateUserOnlineStatus } from "./onlineStatusSlice";

// ----------------- Thunks -----------------
export const loginUser = createAsyncThunk(
  endpoints?.auth.login,
  async (payload, { rejectWithValue }) => {
    try {
      const res = await login(payload);
      if (res && res.statusCode && res.statusCode >= 400) {
        return rejectWithValue(res.message || "Login failed");
      }
      if (res && res.status === 0) {
        return rejectWithValue(res.message || "Login failed");
      }
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

export const googleAppleSignIn = createAsyncThunk(
  endpoints?.auth?.socialLogin,
  async (payload, { rejectWithValue }) => {
    try {
      const res = await SocialLogin(payload);
      const result = {
        ...res?.data,
        token: res?.accessToken,
      };
      await setItem(STORAGE_KEYS?.USER_DATA, result);
      return result;
    } catch (err) {
      return rejectWithValue(err.message || "Google Sign-In failed");
    }
  }
);

export const category = createAsyncThunk(
  endpoints?.auth?.getCategory,
  async (payload, { rejectWithValue }) => {
    try {
      const res = await getCategory(payload);
      return res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchCategoriesTree = createAsyncThunk(
  "auth/fetchCategoriesTree",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await getCategoriesTree(params);
      return res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);
export const postCategory = createAsyncThunk(
  endpoints?.auth?.selectCategory,
  async (payload, { rejectWithValue }) => {
    try {
      const res = await SelectCategory(payload);
      return res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch, getState }) => {
    const { auth } = getState();
    const token = auth?.user?.accessToken || auth?.user?.token || auth?.token;

    if (token) {
      try {
        await dispatch(updateUserOnlineStatus(false)).unwrap();
      } catch (error) {
        console.warn("Failed to set offline status on logout:", error);
      }
    }
    return true;
  }
);

// ----------------- Slice -----------------
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    loading: false,
    error: null,
    categories: [],
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.token = action.payload?.accessToken || action.payload?.token || null;
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
        state.token = action.payload?.accessToken || action.payload?.token || null;
      },
    });
    handleAsyncCases(builder, googleAppleSignIn, {
      onFulfilled: (state, action) => {
        state.user = action.payload;
        state.token = action.payload?.accessToken || action.payload?.token || null;
      },
    });
    handleAsyncCases(builder, category, {
      onFulfilled: (state, action) => {
        state.categories = action.payload?.data || action.payload || [];
      },
    });
    handleAsyncCases(builder, fetchCategoriesTree, {
      onFulfilled: (state, action) => {
        state.categories = action.payload?.data || action.payload || [];
      },
    });
    handleAsyncCases(builder, postCategory, {
      onFulfilled: (state, action) => {
        if (state.user && action.meta?.arg?.preferences) {
          state.user = {
            ...state.user,
            preferences: action.meta.arg.preferences,
            isPreference: true,
          };
        }
      },
    });
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
    });
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
