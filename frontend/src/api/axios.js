import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_BASE_URL;

const getBaseURL = () => {
  if (!rawBaseURL) {
    return '/api';
  }
  const cleanUrl = rawBaseURL.replace(/\/+$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

const API = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token to outgoing requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tripwise_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle global auth errors (e.g. expired token)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear invalid/expired token
      localStorage.removeItem('tripwise_token');
    }
    return Promise.reject(error);
  }
);

export default API;
