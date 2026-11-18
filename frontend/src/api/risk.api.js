// Risk Register API Client
// Module 3: Threat Intelligence & Lifecycle Workflow

import { apiRequest } from './client';

export const riskApi = {
  listRisks: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/risks${query ? `?${query}` : ''}`);
  },

  createRisk: (riskData) => {
    return apiRequest('/risks', {
      method: 'POST',
      body: JSON.stringify(riskData),
    });
  },

  advanceRiskStage: (id) => {
    return apiRequest(`/risks/${id}/advance`, {
      method: 'PUT',
    });
  },

  updateRisk: (id, updates) => {
    return apiRequest(`/risks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  deleteRisk: (id) => {
    return apiRequest(`/risks/${id}`, {
      method: 'DELETE',
    });
  },
};

