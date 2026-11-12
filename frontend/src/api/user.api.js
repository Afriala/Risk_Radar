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

  // Admin Level-4 Operations
  listUsers: () => apiRequest('/users'),

  provisionUser: (payload) =>
    apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateUserRole: (id, payload) =>
    apiRequest(`/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  updateUserStatus: (id, action) =>
    apiRequest(`/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ action }),
    }),

  toggleUserMfa: (id, mfaEnabled) =>
    apiRequest(`/users/${id}/mfa-force`, {
      method: 'PUT',
      body: JSON.stringify({ mfaEnabled }),
    }),

  deleteUser: (id) =>
    apiRequest(`/users/${id}`, {
      method: 'DELETE',
    }),

  getAuditLogs: () => apiRequest('/users/audit-logs'),
};
