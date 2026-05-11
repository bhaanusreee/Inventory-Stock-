import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  purchases: [],
  loading: false,
  error: null
};

const purchaseSlice = createSlice({
  name: 'purchases',
  initialState,
  reducers: {
    addPurchase: (state, action) => {
      state.purchases.push({
        ...action.payload,
        id: Date.now(),
        date: new Date().toISOString()
      });
    },
    editPurchase: (state, action) => {
      const index = state.purchases.findIndex(purchase => purchase.id === action.payload.id);
      if (index !== -1) {
        state.purchases[index] = {
          ...state.purchases[index],
          ...action.payload,
          updatedAt: new Date().toISOString()
        };
      }
    },
    deletePurchase: (state, action) => {
      state.purchases = state.purchases.filter(purchase => purchase.id !== action.payload);
    }
  }
});

export const {
  addPurchase,
  editPurchase,
  deletePurchase
} = purchaseSlice.actions;

export default purchaseSlice.reducer; 