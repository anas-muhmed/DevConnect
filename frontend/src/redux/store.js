import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import profileReducer from './profileSlice'; // ✅ Add this line

const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer, // ✅ Now profile data is in Redux!
  },
});

export default store;