// Auth API Services - Enterprise Cybersecurity Specification
import { apiRequest } from './client';

export const authApi = {
  register: (payload) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  verifyMfa: (payload) =>
    apiRequest('/auth/verify-mfa', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  resendMfa: (payload) =>
    apiRequest('/auth/resend-mfa', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  forgotPassword: (payload) =>
    apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  verifyResetCode: (payload) =>
    apiRequest('/auth/verify-reset-code', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  resetPassword: (payload) =>
    apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  logout: () =>
    apiRequest('/auth/logout', {
      method: 'POST',
    }),
};
