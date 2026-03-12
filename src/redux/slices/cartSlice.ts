import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartItem, Product, Coupon } from "../../types";

interface CartState {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  appliedCoupon: Coupon | null;
}

const initialState: CartState = {
  items: [],
  subtotal: 0,
  discount: 0,
  total: 0,
  appliedCoupon: null,
};

const calculateTotals = (state: CartState) => {
  state.subtotal = state.items.reduce((total, item) => {
    const price = item.product.discountPrice || item.product.price;
    return total + price * item.quantity;
  }, 0);

  if (state.appliedCoupon) {
    if (state.appliedCoupon.discountType === 'percentage') {
      state.discount = (state.subtotal * state.appliedCoupon.discountValue) / 100;
    } else {
      state.discount = state.appliedCoupon.discountValue;
    }
  } else {
    state.discount = 0;
  }

  // Ensure discount doesn't exceed subtotal
  state.discount = Math.min(state.discount, state.subtotal);
  state.total = state.subtotal - state.discount;
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ product: Product; quantity: number }>) => {
      const existingItem = state.items.find(item => item.product._id === action.payload.product._id);
      
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      
      calculateTotals(state);
    },
    
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.product._id !== action.payload);
      
      // Remove coupon if cart becomes empty
      if (state.items.length === 0) {
        state.appliedCoupon = null;
      }
      
      calculateTotals(state);
    },
    
    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const item = state.items.find(item => item.product._id === action.payload.productId);
      if (item) {
        // Ensure quantity doesn't exceed stock and is at least 1
        item.quantity = Math.max(1, Math.min(action.payload.quantity, item.product.stock));
      }
      calculateTotals(state);
    },
    
    applyCoupon: (state, action: PayloadAction<Coupon>) => {
      state.appliedCoupon = action.payload;
      calculateTotals(state);
    },
    
    removeCoupon: (state) => {
      state.appliedCoupon = null;
      calculateTotals(state);
    },
    
    clearCart: (state) => {
      state.items = [];
      state.appliedCoupon = null;
      state.subtotal = 0;
      state.discount = 0;
      state.total = 0;
    }
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  applyCoupon,
  removeCoupon,
  clearCart
} = cartSlice.actions;

export default cartSlice.reducer;
