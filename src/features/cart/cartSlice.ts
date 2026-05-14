import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  mealId: string;
  mealName: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = { items: [] };

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<Omit<CartItem, "quantity">>) {
      const existing = state.items.find((i) => i.mealId === action.payload.mealId);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.mealId !== action.payload);
    },
    updateQuantity(state, action: PayloadAction<{ mealId: string; quantity: number }>) {
      const item = state.items.find((i) => i.mealId === action.payload.mealId);
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter((i) => i.mealId !== action.payload.mealId);
        } else {
          item.quantity = action.payload.quantity;
        }
      }
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
