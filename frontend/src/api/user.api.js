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

  // Operational Analyst & General User Operations (PoLP compliant)
  getTeamRoster: () => apiRequest('/users/team-roster'),

  getMyLogs: () => apiRequest('/users/my-logs'),

  extendSession: () =>
    apiRequest('/users/extend-session', {
      method: 'POST',
    }),

  getApiKey: () => apiRequest('/users/api-key'),

  regenerateApiKey: () =>
    apiRequest('/users/api-key/regenerate', {
      method: 'POST',
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
