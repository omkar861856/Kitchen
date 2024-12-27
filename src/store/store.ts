import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Default storage (localStorage)
import rootReducer from './rootReducer';


const persistConfig = {
  key: 'root',
  storage,
  whitelist: ["menu", "cart", 'notifications', 'auth', 'app'], // Reducers to persist
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['cart/setCart', 'persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['cart.createdAt', 'cart.updatedAt', 'register'],  // Ignore Date fields
      },
    }),
});

// Persistor for PersistGate
export const persistor = persistStore(store);

// RootState and AppDispatch types
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;