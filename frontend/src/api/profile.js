// src/api/profile.js
import axiosInstance from "./axios";



// Get current user's profile
export const  getMyProfile = async () => {
  try {
    const res = await axiosInstance.get('/profile/me', {
      baseURL: 'http://127.0.0.1:5000' // Override baseURL for this call
    });
    console.log('Profile data:', res.data); // Check response
    return res.data;
  } catch (err) {
    console.error('Profile error:', err.response?.data);
    throw err;
  }
};
// Update current user's profile
export const updateMyProfile = async (profileData) => {
  const res = await axiosInstance.post(`/profile`, profileData)
 return res.data;
};

