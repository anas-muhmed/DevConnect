// store/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { fetchMyProfile } from './profileSlice';

const getStoredUser = () => {
  const localUser = localStorage.getItem('user');
  const sessionUser = sessionStorage.getItem('user');
  return localUser ? JSON.parse(localUser) : sessionUser ? JSON.parse(sessionUser) : null;
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: getStoredUser(),
  },
  reducers: {
    loginSuccess: (state, action) => {
      const { user, rememberMe } = action.payload;
      state.user = user;

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('user', JSON.stringify(user));
      // Optional: store token if you're not using httpOnly cookie
      // storage.setItem('token', user.token);
        return async (dispatch) => {
        dispatch(fetchMyProfile());
      };
    },

    logout: (state) => {
      state.user = null;
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    },

    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };

      // Update in the correct storage (where user originally stored)
      const stored = localStorage.getItem('user') ? localStorage : sessionStorage;
      stored.setItem('user', JSON.stringify(state.user));
    },
  },
});

export const { loginSuccess, logout, updateProfile } = authSlice.actions;

// Selector
export const selectUser = (state) => state.auth.user;

export default authSlice.reducer;
