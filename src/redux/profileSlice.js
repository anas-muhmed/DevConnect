// src/redux/profileSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 🔄 Async thunk to fetch current user's profile
export const fetchMyProfile = createAsyncThunk(
  'profile/fetchMyProfile',
  async (_, thunkAPI) => {
    try {
      const res = await axios.get('/api/profile/me'); // adjust URL if needed
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message || 'Failed to fetch profile');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    profile: null,
    loading: false,
    error: null,
  },
  reducers: {
    // Optional: Add reducers like clearProfile() if needed
    clearProfile: (state) => {
      state.profile = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error fetching profile';
      });
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
