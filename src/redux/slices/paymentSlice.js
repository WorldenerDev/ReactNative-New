import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getStripeCardList } from "@api/services/mainServices";
import * as paymentApi from "../../services/payment";
import { expireSession, logoutUser } from "@redux/slices/authSlice";

const mapStripeCardList = (cards) =>
  (Array.isArray(cards) ? cards : [])
    .map((card) => ({
      id:
        card.id ||
        card.paymentMethodId ||
        card.payment_method_id ||
        card.pm_id,
      brand:
        card.brand ||
        card.card_brand ||
        card.card?.brand ||
        card.card?.displayBrand ||
        "Card",
      last4:
        card.last4 ||
        card.last_four ||
        card.card?.last4 ||
        "0000",
      expMonth: card.expMonth ?? card.exp_month ?? card.card?.expMonth,
      expYear: card.expYear ?? card.exp_year ?? card.card?.expYear,
    }))
    .filter((card) => Boolean(card.id));

export const fetchPaymentMethods = createAsyncThunk(
  "payment/fetchPaymentMethods",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getStripeCardList();
      if (res?.success !== true) {
        return rejectWithValue(res?.message || "Failed to load cards");
      }
      return { items: mapStripeCardList(res.data) };
    } catch (e) {
      return rejectWithValue(e?.message || "Failed to load cards");
    }
  }
);

export const removePaymentMethod = createAsyncThunk(
  "payment/removePaymentMethod",
  async (paymentMethodId, { rejectWithValue }) => {
    try {
      await paymentApi.runPaymentApi(() =>
        paymentApi.deletePaymentMethod({ paymentMethodId })
      );
      return paymentMethodId;
    } catch (e) {
      return rejectWithValue(e?.message || "Failed to delete card");
    }
  }
);

const initialState = {
  items: [],
  selectedId: null,
  status: "idle",
  error: null,
  cartId: null,
  tripId: null,
  amountMinor: null,
  currency: "usd",
  stripeCustomerId: null,
  setupClientSecret: null,
  lastClientSecret: null,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    setSelectedCard: (state, action) => {
      state.selectedId = action.payload;
    },
    setCheckoutContext: (state, action) => {
      const p = action.payload || {};
      if (p.cartId !== undefined) {
        state.cartId = p.cartId;
      }
      if (p.tripId !== undefined) {
        state.tripId = p.tripId;
      }
      if (p.amountMinor !== undefined) {
        state.amountMinor = p.amountMinor;
      }
      if (p.currency !== undefined) {
        state.currency = p.currency || "usd";
      }
      if (p.stripeCustomerId !== undefined) {
        state.stripeCustomerId = p.stripeCustomerId;
      }
    },
    setStripeCustomerId: (state, action) => {
      state.stripeCustomerId = action.payload || null;
    },
    addLocalCard: (state, action) => {
      const card = action.payload;
      state.items.push(card);
      state.selectedId = card.id;
    },
    clearPaymentError: (state) => {
      state.error = null;
    },
    setLastClientSecret: (state, action) => {
      state.lastClientSecret = action.payload;
    },
    setSetupClientSecret: (state, action) => {
      state.setupClientSecret = action.payload || null;
    },
    clearSetupClientSecret: (state) => {
      state.setupClientSecret = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPaymentMethods.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload?.items || [];
        if (
          state.selectedId &&
          !state.items.some((i) => i.id === state.selectedId)
        ) {
          state.selectedId = null;
        }
        if (!state.selectedId && state.items.length > 0) {
          const def =
            state.items.find((i) => i.isDefault) || state.items[0];
          state.selectedId = def.id;
        }
      })
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed";
      })
      .addCase(removePaymentMethod.fulfilled, (state, action) => {
        const id = action.payload;
        state.items = state.items.filter((i) => i.id !== id);
        if (state.selectedId === id) {
          state.selectedId = state.items[0]?.id ?? null;
        }
      })
      .addCase(removePaymentMethod.rejected, (state, action) => {
        state.error = action.payload || "Delete failed";
      })
      .addCase(logoutUser.fulfilled, () => ({ ...initialState }))
      .addCase(expireSession.fulfilled, () => ({ ...initialState }));
  },
});

export const {
  setSelectedCard,
  setCheckoutContext,
  setStripeCustomerId,
  addLocalCard,
  clearPaymentError,
  setLastClientSecret,
  setSetupClientSecret,
  clearSetupClientSecret,
} = paymentSlice.actions;

export default paymentSlice.reducer;
