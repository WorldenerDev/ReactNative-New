import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getGroupMessages } from "@api/services/mainServices";
import { endpoints } from "@api/endpoints";
import { handleAsyncCases } from "@utils/reduxHelpers";

// ----------------- Thunks -----------------

/**
 * Fetch group messages
 * @param {string} groupId - The group ID to fetch messages for
 */
export const fetchGroupMessages = createAsyncThunk(
  "chat/fetchGroupMessages",
  async (groupId, { rejectWithValue }) => {
    try {
      const res = await getGroupMessages(groupId);
      console.log("getGroupMessages response", res);
      return { groupId, messages: res?.data || res || [] };
    } catch (err) {
      console.error("Error fetching group messages:", err);
      return rejectWithValue(err.message || "Failed to fetch messages");
    }
  }
);

// ----------------- Slice -----------------
const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: {}, // Store messages by groupId: { groupId: [messages] }
    loading: false,
    error: null,
  },
  reducers: {
    // Add a single message to a group
    addMessage: (state, action) => {
      const { groupId, message } = action.payload;
      if (groupId && message) {
        if (!state.messages[groupId]) {
          state.messages[groupId] = [];
        }
        // Check if message already exists (avoid duplicates)
        const exists = state.messages[groupId].some(
          (msg) => msg._id === message._id
        );
        if (!exists) {
          state.messages[groupId].unshift(message); // Add to beginning
        }
      }
    },
    // Add multiple messages to a group
    addMessages: (state, action) => {
      const { groupId, messages } = action.payload;
      if (groupId && Array.isArray(messages)) {
        if (!state.messages[groupId]) {
          state.messages[groupId] = [];
        }
        // Merge messages, avoiding duplicates
        messages.forEach((message) => {
          const exists = state.messages[groupId].some(
            (msg) => msg._id === message._id
          );
          if (!exists) {
            state.messages[groupId].push(message);
          }
        });
        // Sort by createdAt (newest first)
        state.messages[groupId].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      }
    },
    // Clear messages for a specific group
    clearGroupMessages: (state, action) => {
      const groupId = action.payload;
      if (groupId) {
        delete state.messages[groupId];
      } else {
        // Clear all messages if no groupId provided
        state.messages = {};
      }
    },
    // Update a message in a group
    updateMessage: (state, action) => {
      const { groupId, messageId, updates } = action.payload;
      if (groupId && messageId && state.messages[groupId]) {
        const index = state.messages[groupId].findIndex(
          (msg) => msg._id === messageId
        );
        if (index !== -1) {
          state.messages[groupId][index] = {
            ...state.messages[groupId][index],
            ...updates,
          };
        }
      }
    },
    // Remove a message from a group
    removeMessage: (state, action) => {
      const { groupId, messageId } = action.payload;
      if (groupId && messageId && state.messages[groupId]) {
        state.messages[groupId] = state.messages[groupId].filter(
          (msg) => msg._id !== messageId
        );
      }
    },
  },
  extraReducers: (builder) => {
    handleAsyncCases(builder, fetchGroupMessages, {
      onFulfilled: (state, action) => {
        const { groupId, messages } = action.payload;
        if (groupId && Array.isArray(messages)) {
          // Sort messages by createdAt (newest first for GiftedChat)
          const sortedMessages = [...messages].sort(
            (a, b) =>
              new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
          );
          state.messages[groupId] = sortedMessages;
        }
      },
    });
  },
});

export const {
  addMessage,
  addMessages,
  clearGroupMessages,
  updateMessage,
  removeMessage,
} = chatSlice.actions;

export default chatSlice.reducer;

