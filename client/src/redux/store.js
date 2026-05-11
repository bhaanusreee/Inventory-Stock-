import { configureStore, combineReducers } from '@reduxjs/toolkit';
import sellerReducer from './slices/sellerSlice';
import profileReducer from './slices/profileSlice';
import productReducer from './slices/productSlice';
import salesReducer from './slices/salesSlice';
import purchaseReducer from './slices/purchaseSlice';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { createLogger } from 'redux-logger';

const logger = createLogger({
  collapsed: true,
  timestamp: false
});

const rootReducer = combineReducers({
  sellers: sellerReducer,
  profile: profileReducer,
  products: productReducer,
  sales: salesReducer,
  purchases: purchaseReducer
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['sellers', 'profile', 'products', 'sales', 'purchases'] // persist these reducers
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(logger),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);
export default store; 