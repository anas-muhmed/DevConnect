import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Main instance
const axiosInstance = axios.create({ baseURL, withCredentials: true });

// Special instance just for refresh token calls
const refreshAxios = axios.create({ 
  baseURL,
  withCredentials: true 
});

// Request interceptor
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && 
        !originalRequest._retry &&
        !originalRequest.url.includes('/auth/refresh')) {
      
      originalRequest._retry = true;
      
      try {
        // Use dedicated refresh instance
        const { data } = await refreshAxios.get('/auth/refresh');
        
        // Store new token where the original came from
        const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
        storage.setItem('token', data.token);
        
        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return axiosInstance(originalRequest);
        
      } catch (refreshError) {
        // Nuclear cleanup
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;