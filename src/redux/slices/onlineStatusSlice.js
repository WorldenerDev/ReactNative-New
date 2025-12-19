import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { updateOnlineStatus } from "@api/services/onlineStatusService";
import { endpoints } from "@api/endpoints";

export const updateUserOnlineStatus = createAsyncThunk(
  endpoints?.main?.updateOnlineStatus,
  async (isOnline, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth?.user?.accessToken || auth?.user?.token || auth?.token;

      if (!token) {
        return { isOnline, skipped: true };
      }

      const response = await updateOnlineStatus({ isOnline });
      return { isOnline, response };
    } catch (error) {
      console.warn("Failed to update online status:", error.message);
      return rejectWithValue({ isOnline, error: error.message });
    }
  }
);

const onlineStatusSlice = createSlice({
  name: "onlineStatus",
  initialState: {
    isOnline: false,
    loading: false,
    error: null,
  },
  reducers: {
    resetOnlineStatus: (state) => {
      state.isOnline = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateUserOnlineStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserOnlineStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (!action.payload.skipped) {
          state.isOnline = action.payload.isOnline;
        }
      })
      .addCase(updateUserOnlineStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error;
        if (action.payload?.isOnline !== undefined) {
          state.isOnline = action.payload.isOnline;
        }
      });
  },
});

export const { resetOnlineStatus } = onlineStatusSlice.actions;
export default onlineStatusSlice.reducer;

