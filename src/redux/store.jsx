import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Default local storage for web
import { combineReducers } from 'redux';
import userReducer from './userSlice'; // Adjust this path to your user slice
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';

// Persist configuration
const persistConfig = {
  key: 'root', // Root level key
  storage, // Use local storage to persist
};

// Combine reducers
const rootReducer = combineReducers({
  user: userReducer, // Add more reducers if needed
});

// Apply persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the Redux store with middleware adjustments
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Create the persistor
export const persistor = persistStore(store);
