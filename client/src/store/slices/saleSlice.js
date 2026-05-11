import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

import { API_BASE_URL } from '../../config/api';

// Async thunk for fetching all sales
export const fetchSales = createAsyncThunk(
  'sales/fetchSales',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/sales`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk for creating a sale
export const createSale = createAsyncThunk(
  'sales/createSale',
  async (saleData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/sales`, saleData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk for updating a sale
export const updateSale = createAsyncThunk(
  'sales/updateSale',
  async ({ id, saleData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/sales/${id}`, saleData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk for deleting a sale
export const deleteSale = createAsyncThunk(
  'sales/deleteSale',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/sales/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk for getting a single sale
export const getSaleById = createAsyncThunk(
  'sales/getSaleById',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/sales/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  sales: [],
  currentSale: null,
  loading: false,
  error: null
};

const saleSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentSale: (state) => {
      state.currentSale = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch sales
      .addCase(fetchSales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = action.payload;
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch sales';
      })
      
      // Create sale
      .addCase(createSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSale.fulfilled, (state, action) => {
        state.loading = false;
        state.sales.push(action.payload);
      })
      .addCase(createSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create sale';
      })
      
      // Update sale
      .addCase(updateSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSale.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.sales.findIndex(sale => sale._id === action.payload._id);
        if (index !== -1) {
          state.sales[index] = action.payload;
        }
        if (state.currentSale && state.currentSale._id === action.payload._id) {
          state.currentSale = action.payload;
        }
      })
      .addCase(updateSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update sale';
      })
      
      // Delete sale
      .addCase(deleteSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSale.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = state.sales.filter(sale => sale._id !== action.payload);
        if (state.currentSale && state.currentSale._id === action.payload) {
          state.currentSale = null;
        }
      })
      .addCase(deleteSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete sale';
      })
      
      // Get sale by ID
      .addCase(getSaleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSaleById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSale = action.payload;
      })
      .addCase(getSaleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch sale details';
      });
  }
});

export const { clearError, clearCurrentSale } = saleSlice.actions;
export default saleSlice.reducer; 