// src/api/apiService.ts

import { authenticatedFetch, handleApiResponse } from '../utils/apiErrorHandler';
import { AUTH_TOKEN } from './apiUrl'; // Assuming you have this constant

const BASE_URL = 'http://103.214.132.20:8002';

// General purpose function for making API calls
async function apiCall(url: string, options: RequestInit = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': AUTH_TOKEN,
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await authenticatedFetch(url, config);
  return handleApiResponse(response); // Use the handler to parse JSON and re-check for errors
}

// Export specific functions for your components to use
export const api = {
  get: (endpoint: string, params?: Record<string, any>) => {
    const url = new URL(`${BASE_URL}/${endpoint}`);
    if (params) {
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    }
    return apiCall(url.toString(), { method: 'GET' });
  },

  post: (endpoint: string, body: any) => {
    return apiCall(`${BASE_URL}/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
  
  // You can add put, delete, etc. as needed
  put: (endpoint: string, body: any) => {
    return apiCall(`${BASE_URL}/${endpoint}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },
};