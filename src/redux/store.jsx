import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Default local storage for web
import { combineReducers } from 'redux';
import userReducer from './userSlice'; // Adjust this path to your user slice
import tasksReducer from './tasksSlice'; // New tasksSlice to manage tasks
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';

// Persist configuration
const persistConfig = {
  key: 'root', // Root level key
  storage, // Use local storage to persist
  version: 1,
  migrate: async (state) => { // Automates state versioning and clearing of outdated persisted data, 
    // If state is undefined, reset to initial state (or clear it)
    if (!state || !state._persist) {
      return undefined; // Clear persisted state
    }

    // Check if the version matches
    if (state._persist.version !== persistConfig.version) {
      return undefined; // Clear persisted state for version mismatch
    }

    return state; // If version matches, return the state
  },
};

// Combine reducers
const rootReducer = combineReducers({
  user: userReducer, // Add more reducers if needed
  tasks: tasksReducer, // Adding tasks slice here

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
