import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { deleteStripeCard, getStripeCardList } from "@api/services/mainServices";
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
      expMonth:
        card.expMonth ??
        card.exp_month ??
        card.card?.expMonth ??
        card.card?.exp_month,
      expYear:
        card.expYear ??
        card.exp_year ??
        card.card?.expYear ??
        card.card?.exp_year,
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
      const res = await deleteStripeCard({
        paymentMethodId,
        payment_method_id: paymentMethodId,
      });
      if (res?.success !== true) {
        return rejectWithValue(res?.message || "Failed to delete card");
      }
      return paymentMethodId;
    } catch (e) {
      return rejectWithValue(e?.message || "Failed to delete card");
    }
  }
);

const initialState = {
  items: [],
  oneTimeItems: [],
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
      const idx = state.items.findIndex((i) => i.id === card.id);
      if (idx >= 0) {
        state.items[idx] = { ...state.items[idx], ...card };
      } else {
        state.items.push(card);
      }
      state.selectedId = card.id;
    },
    addOneTimeCard: (state, action) => {
      const card = action.payload;
      const idx = state.oneTimeItems.findIndex((i) => i.id === card.id);
      if (idx >= 0) {
        state.oneTimeItems[idx] = { ...state.oneTimeItems[idx], ...card };
      } else {
        state.oneTimeItems.push(card);
      }
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
        const fetched = action.payload?.items || [];
        state.items = fetched;
        state.oneTimeItems = state.oneTimeItems.filter(
          (card) => !fetched.some((item) => item.id === card.id)
        );
        const selectedExists =
          fetched.some((i) => i.id === state.selectedId) ||
          state.oneTimeItems.some((i) => i.id === state.selectedId);
        if (state.selectedId && !selectedExists) {
          state.selectedId = null;
        }
        if (!state.selectedId && fetched.length > 0) {
          const def =
            fetched.find((i) => i.isDefault) || fetched[0];
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
        state.oneTimeItems = state.oneTimeItems.filter((i) => i.id !== id);
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
  addOneTimeCard,
  clearPaymentError,
  setLastClientSecret,
  setSetupClientSecret,
  clearSetupClientSecret,
} = paymentSlice.actions;

export default paymentSlice.reducer;
