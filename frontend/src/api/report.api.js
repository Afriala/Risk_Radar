// Reporting & Analytics API Client
// Module 3: Executive KPI Dashboard & Report Export Engine
// Contributor: Afri Alam Dipto (ID: 232-35-643)

import { apiRequest } from './client.js';

export const reportApi = {
  /**
   * Functional Requirement 8: Retrieve Executive KPI Summary & Security Posture Score
   */
  async getExecutiveSummary() {
    return apiRequest('/reports/summary');
  },

  /**
   * Functional Requirement 10: Fetch full datasets for automated export
   */
  async getExportData(dataset = 'all') {
    return apiRequest(`/reports/export?dataset=${encodeURIComponent(dataset)}`);
  },
};

