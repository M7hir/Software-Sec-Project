import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER, 
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import { authReducer } from '../pages/auth/authSlice';
import { tasksReducer } from '../pages/home/taskSlice';

// 1. Combine your reducers
const rootReducer = combineReducers({
  auth: authReducer,
  tasks : tasksReducer
});

// 2. Create the persist configuration
const persistConfig = {
  key: 'auth-storage',
  storage,
  // whitelist: ['auth'] // Only persist the 'auth' slice (optional)
  // blacklist: ['ui']   // Don't persist 'ui' slice (optional)
};

// 3. Create the persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 4. Configure the store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions to avoid console warnings
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);