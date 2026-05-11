import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import supplierReducer from './slices/supplierSlice';
import purchaseReducer from './slices/purchaseSlice';
import saleReducer from './slices/saleSlice';
import userReducer from './slices/userSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    suppliers: supplierReducer,
    purchases: purchaseReducer,
    sales: saleReducer,
    users: userReducer,
  },
});

export default store; 