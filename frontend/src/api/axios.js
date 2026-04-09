import axios from "axios";
import { toast } from "react-toastify";

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api';

// 🎯 Main axios instance for API calls
const axiosInstance = axios.create({ 
  baseURL, 
  withCredentials: true // CRITICAL: Send cookies with every request
});

// 🔄 Separate instance for refresh calls (avoid interceptor loops)
const refreshAxios = axios.create({ 
  baseURL,
  withCredentials: true 
});

// 📊 Track refresh state to prevent multiple simultaneous refreshes
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ⬆️ REQUEST INTERCEPTOR: Attach token to every request
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// ⬇️ RESPONSE INTERCEPTOR: Handle 401 errors with automatic token refresh
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // 🚨 Handle 401 Unauthorized (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Don't retry refresh endpoint itself
      if (originalRequest.url.includes('/auth/refresh')) {
        console.error('❌ Refresh token invalid or expired');
        performLogout('Session expired. Please login again.');
        return Promise.reject(error);
      }

      // 🔒 Prevent multiple simultaneous refresh attempts
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('🔄 Access token expired, refreshing...');
        
        // Call refresh endpoint (sends httpOnly cookie automatically)
        const { data } = await refreshAxios.get('/auth/refresh');
        
        const newToken = data.token;
        
        // Update stored token
        const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
        storage.setItem('token', newToken);
        
        // Update user data if provided
        if (data.user) {
          storage.setItem('user', JSON.stringify(data.user));
        }
        
        console.log('✅ Token refreshed successfully');
        
        // Process queued requests
        processQueue(null, newToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
        
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError.response?.data);
        processQueue(refreshError, null);
        
        const errorCode = refreshError.response?.data?.code;
        
        if (errorCode === 'NO_REFRESH_TOKEN') {
          performLogout('Please login to continue.');
        } else if (errorCode === 'INVALID_REFRESH_TOKEN') {
          performLogout('Session expired. Please login again.');
        } else {
          performLogout('Authentication failed. Please login again.');
        }
        
        return Promise.reject(refreshError);
        
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

// 🚪 Logout helper function
const performLogout = (message) => {
  // Clear all auth data
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  
  // Show message to user
  if (message) {
    toast.info(message);
  }
  
  // Redirect to login (avoid infinite loops)
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login';
  }
};

export default axiosInstance;