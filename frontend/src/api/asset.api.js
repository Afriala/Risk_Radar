// Asset Inventory API Client
// Module 2: Enterprise IT Asset Management

import { apiRequest } from './client';

export const assetApi = {
  listAssets: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/assets${query ? `?${query}` : ''}`);
  },

  createAsset: (assetData) => {
    return apiRequest('/assets', {
      method: 'POST',
      body: JSON.stringify(assetData),
    });
  },

  updateAsset: (id, updates) => {
    return apiRequest(`/assets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  deleteAsset: (id) => {
    return apiRequest(`/assets/${id}`, {
      method: 'DELETE',
    });
  },
};

