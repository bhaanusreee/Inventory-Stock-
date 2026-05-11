import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sales: [],
  loading: false,
  error: null
};

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    addSale: (state, action) => {
      state.sales.push({
        ...action.payload,
        id: Date.now(),
        date: new Date().toISOString()
      });
    },
    editSale: (state, action) => {
      const index = state.sales.findIndex(sale => sale.id === action.payload.id);
      if (index !== -1) {
        state.sales[index] = {
          ...state.sales[index],
          ...action.payload,
          updatedAt: new Date().toISOString()
        };
      }
    },
    deleteSale: (state, action) => {
      state.sales = state.sales.filter(sale => sale.id !== action.payload);
    },
    updateSaleStatus: (state, action) => {
      const { id, status } = action.payload;
      const sale = state.sales.find(s => s.id === id);
      if (sale) {
        sale.status = status;
        sale.updatedAt = new Date().toISOString();
      }
    }
  }
});

export const {
  addSale,
  editSale,
  deleteSale,
  updateSaleStatus
} = salesSlice.actions;

export default salesSlice.reducer; 