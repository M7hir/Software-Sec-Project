import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { authReducer } from '../pages/auth/authSlice';
import { tasksReducer } from '../pages/home/taskSlice';

const loadState = () => {
  if (typeof window === 'undefined') return undefined;

  try {
    const authState = sessionStorage.getItem('authState');
    const tasksState = sessionStorage.getItem('tasksState');

    return {
      auth: authState ? JSON.parse(authState) : undefined,
      tasks: tasksState ? JSON.parse(tasksState) : undefined,
    };
  } catch (error) {
    console.error('Failed to load persisted state:', error);
    return undefined;
  }
};

const saveState = (state) => {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.setItem('authState', JSON.stringify(state.auth));
    sessionStorage.setItem('tasksState', JSON.stringify(state.tasks));
  } catch (error) {
    console.error('Failed to save persisted state:', error);
  }
};

// 1. Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  tasks: tasksReducer,
});

const preloadedState = loadState();

export const store = configureStore({
  reducer: rootReducer,
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionSerializableCheck: ['payload'],
      },
    }),
});

store.subscribe(() => {
  saveState(store.getState());
});