import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Default storage (localStorage)
import menuReducer from './slices/menuSlice'
import cartReducer from './slices/cartSlice'
import orderReducer from './slices/ordersSlice'
import socketReducer from './slices/socketSlice'

import exampleReducer from './slices/exampleSlice';

const rootReducer = combineReducers({
  example: exampleReducer,
  menu: menuReducer,
  cart: cartReducer,
  orders: orderReducer,
  socket: socketReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: [ "menu", "cart"], // Reducers to persist
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['cart/setCart','persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['cart.createdAt', 'cart.updatedAt', 'register'],  // Ignore Date fields
      },
    }),
});

// Persistor for PersistGate
export const persistor = persistStore(store);

// RootState and AppDispatch types
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;