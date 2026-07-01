import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  signup,
  otp,
  resendOtp,
  login,
  logout as logoutApi,
  SocialLogin,
  getCategory,
  SelectCategory,
  guestLogin,
} from "@api/services/authService";
import { getCategoriesTree } from "@api/services/mainServices";
import { endpoints } from "@api/endpoints";
import { handleAsyncCases } from "@utils/reduxHelpers";
import { setItem, removeItem } from "@utils/storage";
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
        accessToken: res?.data?.accessToken || res?.accessToken,
        token: res?.data?.accessToken || res?.accessToken,
        isGuest: false,
      };
      await setItem(STORAGE_KEYS?.USER_DATA, result);
      return result;
    } catch (err) {
      return rejectWithValue(err.message || "Google Sign-In failed");
    }
  }
);

export const guestLoginUser = createAsyncThunk(
  endpoints?.auth?.guestLogin,
  async (payload, { rejectWithValue }) => {
    try {
      const res = await guestLogin(payload);
      if (!res?.success && res?.status === 0) {
        return rejectWithValue(res?.message || "Guest login failed");
      }
      const userData = {
        ...(res?.data || {}),
        accessToken: res?.data?.accessToken,
        isGuest: true,
      };
      await setItem(STORAGE_KEYS.USER_DATA, userData);
      return userData;
    } catch (err) {
      return rejectWithValue(err?.message || "Guest login failed");
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

    if (token && !auth?.user?.isGuest) {
      try {
        await dispatch(updateUserOnlineStatus(false)).unwrap();
      } catch (error) {
        console.warn("Failed to set offline status on logout:", error);
      }

      try {
        await logoutApi();
      } catch (error) {
        console.warn("Failed to clear server session on logout:", error);
      }
    }

    await removeItem(STORAGE_KEYS.USER_DATA);
    await removeItem(STORAGE_KEYS.TOKEN);
    return true;
  }
);

export const exitGuestForSignIn = createAsyncThunk(
  "auth/exitGuestForSignIn",
  async (authRoute = "SignInScreen") => {
    await removeItem(STORAGE_KEYS.USER_DATA);
    await removeItem(STORAGE_KEYS.TOKEN);
    return authRoute;
  }
);

export const exitGuestMode = createAsyncThunk(
  "auth/exitGuestMode",
  async () => {
    await removeItem(STORAGE_KEYS.USER_DATA);
    await removeItem(STORAGE_KEYS.TOKEN);
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
    pendingAuthRedirect: false,
    pendingAuthRoute: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.token = action.payload?.accessToken || action.payload?.token || null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.pendingAuthRedirect = false;
    },
    clearPendingAuthRedirect: (state) => {
      state.pendingAuthRedirect = false;
      state.pendingAuthRoute = null;
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
        const user = action.payload?.data || action.payload?.user || action.payload;
        state.user = { ...user, isGuest: false };
        state.token = user?.accessToken || action.payload?.token || null;
        state.pendingAuthRedirect = false;
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
        state.pendingAuthRedirect = false;
      },
    });
    handleAsyncCases(builder, guestLoginUser, {
      onFulfilled: (state, action) => {
        state.user = action.payload;
        state.token = action.payload?.accessToken || null;
        state.pendingAuthRedirect = false;
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
      state.pendingAuthRedirect = false;
    });
    builder.addCase(exitGuestForSignIn.fulfilled, (state, action) => {
      state.user = null;
      state.token = null;
      state.pendingAuthRedirect = true;
      state.pendingAuthRoute = action.payload || "SignInScreen";
    });
    builder.addCase(exitGuestMode.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.pendingAuthRedirect = false;
    });
  },
});

export const { setUser, logout, clearPendingAuthRedirect } = authSlice.actions;
export default authSlice.reducer;
