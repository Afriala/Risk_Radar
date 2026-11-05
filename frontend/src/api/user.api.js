// User Profile & Management API Services
import { apiRequest } from './client';

export const userApi = {
  getProfile: () => apiRequest('/users/profile'),

  updateProfile: (payload) =>
    apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  updateCredentials: (payload) =>
    apiRequest('/users/credentials', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  listUsers: () => apiRequest('/users'),
};
