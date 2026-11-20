// Reporting & Analytics Routes Configuration
// Module 3: Executive KPI Dashboard & Report Export Engine
// Contributor: Afri Alam Dipto (ID: 232-35-643)

import { Router } from 'express';
import { getExecutiveSummary, getReportExportData } from '../controllers/report.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// Functional Requirement 8: Executive KPI Metrics
// Accessible to all authenticated stakeholders (Admin, Analyst, Executive, Auditor)
router.get(
  '/summary',
  verifyToken,
  requireRole('Admin', 'Analyst', 'Executive', 'Auditor'),
  getExecutiveSummary
);

// Functional Requirement 10: Automated Compliance Export Data
router.get(
  '/export',
  verifyToken,
  requireRole('Admin', 'Analyst', 'Executive', 'Auditor'),
  getReportExportData
);

export default router;

