import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

import { API_BASE_URL } from '../../config/api';

// Async thunk for fetching all purchases
export const fetchPurchases = createAsyncThunk(
  'purchases/fetchPurchases',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/purchases`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk for creating a purchase
export const createPurchase = createAsyncThunk(
  'purchases/createPurchase',
  async (purchaseData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/purchases`, purchaseData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk for updating a purchase
export const updatePurchase = createAsyncThunk(
  'purchases/updatePurchase',
  async ({ id, purchaseData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/purchases/${id}`, purchaseData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk for deleting a purchase
export const deletePurchase = createAsyncThunk(
  'purchases/deletePurchase',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/purchases/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk for getting a single purchase
export const getPurchaseById = createAsyncThunk(
  'purchases/getPurchaseById',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/purchases/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  purchases: [],
  currentPurchase: null,
  loading: false,
  error: null
};

const purchaseSlice = createSlice({
  name: 'purchases',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPurchase: (state) => {
      state.currentPurchase = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch purchases
      .addCase(fetchPurchases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchases.fulfilled, (state, action) => {
        state.loading = false;
        state.purchases = action.payload;
      })
      .addCase(fetchPurchases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch purchases';
      })
      
      // Create purchase
      .addCase(createPurchase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPurchase.fulfilled, (state, action) => {
        state.loading = false;
        state.purchases.push(action.payload);
      })
      .addCase(createPurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create purchase';
      })
      
      // Update purchase
      .addCase(updatePurchase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePurchase.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.purchases.findIndex(purchase => purchase._id === action.payload._id);
        if (index !== -1) {
          state.purchases[index] = action.payload;
        }
        if (state.currentPurchase && state.currentPurchase._id === action.payload._id) {
          state.currentPurchase = action.payload;
        }
      })
      .addCase(updatePurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update purchase';
      })
      
      // Delete purchase
      .addCase(deletePurchase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePurchase.fulfilled, (state, action) => {
        state.loading = false;
        state.purchases = state.purchases.filter(purchase => purchase._id !== action.payload);
        if (state.currentPurchase && state.currentPurchase._id === action.payload) {
          state.currentPurchase = null;
        }
      })
      .addCase(deletePurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete purchase';
      })
      
      // Get purchase by ID
      .addCase(getPurchaseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPurchaseById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPurchase = action.payload;
      })
      .addCase(getPurchaseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch purchase details';
      });
  }
});

export const { clearError, clearCurrentPurchase } = purchaseSlice.actions;
export default purchaseSlice.reducer; 