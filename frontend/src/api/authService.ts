// src/services/authService.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const setAuthToken = (token: string): void => {
  console.log('🔐 Setting auth token:', token ? token.substring(0, 20) + '...' : 'null');
  
  if (token) {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_token_timestamp', Date.now().toString());
    
    // ✅ IMPORTANT: Set default axios headers
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('✅ Axios default headers set with token');
  } else {
    clearAuthData();
  }
};

export const getAuthToken = (): string | null => {
  const token = localStorage.getItem('auth_token');
  console.log('🔍 Getting auth token:', token ? 'Present' : 'Missing');
  return token;
};

export const getUserId = (): string | null => {
  const userId = localStorage.getItem('user_id');
  console.log('👤 Getting user ID:', userId || 'Not found');
  return userId;
};

// ✅ Add this function to check current axios headers
export const checkCurrentAuth = () => {
  console.log('📋 Current Axios headers:', axios.defaults.headers.common);
  console.log('🔑 Stored token:', getAuthToken() ? 'Yes' : 'No');
  console.log('👤 Stored user ID:', getUserId() || 'None');
};

export const setUserId = (userId: string): void => {
  localStorage.setItem('user_id', userId);
  localStorage.setItem('user_email', ''); // Optional: Store email for offline
  localStorage.setItem('user_name', ''); // Optional: Store name for offline
};

export const setUserDetails = (user: { email: string; name: string }): void => {
  localStorage.setItem('user_email', user.email);
  localStorage.setItem('user_name', user.name);
};

export const clearAuthData = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_token_timestamp');
  localStorage.removeItem('user_id');
  localStorage.removeItem('user_email');
  localStorage.removeItem('user_name');
  delete axios.defaults.headers.common['Authorization'];
};

// Token expire check
export const isTokenValid = (): boolean => {
  const token = getAuthToken();
  const timestamp = localStorage.getItem('auth_token_timestamp');
  
  if (!token || !timestamp) return false;
  
  const tokenAge = Date.now() - parseInt(timestamp);
  // Token 7 days tak valid (in milliseconds)
  return tokenAge < 7 * 24 * 60 * 60 * 1000;
};

// Initialize axios with token if available
export const initializeAuth = (): void => {
  const token = getAuthToken();
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};