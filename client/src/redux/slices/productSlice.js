import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Create async thunk for fetching products
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async () => {
    // For now, return the products from localStorage or an empty array
    const storedProducts = localStorage.getItem('products');
    return storedProducts ? JSON.parse(storedProducts) : [];
  }
);

const initialState = {
  products: [],
  loading: false,
  error: null
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    addProduct: (state, action) => {
      console.log('Adding product:', action.payload);
      state.products.push({
        ...action.payload,
        id: Date.now().toString(),
        salesCount: 0,
        createdAt: new Date().toISOString()
      });
      console.log('Updated products state:', state.products);
      // Update localStorage
      localStorage.setItem('products', JSON.stringify(state.products));
    },
    editProduct: (state, action) => {
      const index = state.products.findIndex(product => product.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = {
          ...state.products[index],
          ...action.payload,
          updatedAt: new Date().toISOString()
        };
        // Update localStorage
        localStorage.setItem('products', JSON.stringify(state.products));
      }
    },
    deleteProduct: (state, action) => {
      state.products = state.products.filter(product => product.id !== action.payload);
      // Update localStorage
      localStorage.setItem('products', JSON.stringify(state.products));
    },
    updateStock: (state, action) => {
      const { id, quantity, type } = action.payload;
      const product = state.products.find(p => p.id === id);
      if (product) {
        if (type === 'add') {
          product.quantity = (product.quantity || 0) + quantity;
        } else if (type === 'remove') {
          product.quantity = Math.max(0, (product.quantity || 0) - quantity);
        }
        // Update localStorage
        localStorage.setItem('products', JSON.stringify(state.products));
      }
    },
    incrementSales: (state, action) => {
      const product = state.products.find(p => p.id === action.payload);
      if (product) {
        product.salesCount = (product.salesCount || 0) + 1;
        // Update localStorage
        localStorage.setItem('products', JSON.stringify(state.products));
      }
    },
    setProducts: (state, action) => {
      state.products = action.payload;
      // Update localStorage
      localStorage.setItem('products', JSON.stringify(state.products));
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const {
  addProduct,
  editProduct,
  deleteProduct,
  updateStock,
  incrementSales,
  setProducts
} = productSlice.actions;

export default productSlice.reducer; 