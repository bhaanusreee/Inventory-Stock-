import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sellers: [],
};

const sellerSlice = createSlice({
  name: 'sellers',
  initialState,
  reducers: {
    addSeller: (state, action) => {
      state.sellers.push({ ...action.payload, id: Date.now() });
    },
    editSeller: (state, action) => {
      const index = state.sellers.findIndex(seller => seller.id === action.payload.id);
      if (index !== -1) {
        state.sellers[index] = action.payload;
      }
    },
    deleteSeller: (state, action) => {
      state.sellers = state.sellers.filter(seller => seller.id !== action.payload);
    },
  },
});

export const { addSeller, editSeller, deleteSeller } = sellerSlice.actions;
export default sellerSlice.reducer; 