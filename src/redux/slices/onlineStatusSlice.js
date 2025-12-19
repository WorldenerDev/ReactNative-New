import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { updateOnlineStatus } from "@api/services/onlineStatusService";
import { endpoints } from "@api/endpoints";

export const updateUserOnlineStatus = createAsyncThunk(
  endpoints?.main?.updateOnlineStatus,
  async (isOnline, { getState }) => {
    const { auth } = getState();
    const token = auth?.user?.accessToken || auth?.user?.token || auth?.token;

    if (!token) {
      return { isOnline, skipped: true };
    }

    await updateOnlineStatus({ isOnline });
    return { isOnline };
  }
);

const onlineStatusSlice = createSlice({
  name: "onlineStatus",
  initialState: {
    isOnline: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(updateUserOnlineStatus.fulfilled, (state, action) => {
      if (!action.payload.skipped) {
        state.isOnline = action.payload.isOnline;
      }
    });
  },
});

export default onlineStatusSlice.reducer;

