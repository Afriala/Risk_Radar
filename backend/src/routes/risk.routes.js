// Risk Routes Configuration
// Module 3: Threat Intelligence & Lifecycle Workflow

import { Router } from 'express';
import {
  listRisks,
  createRisk,
  advanceRiskStage,
  updateRisk,
  deleteRisk,
} from '../controllers/risk.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// All authenticated roles can view risks
router.get('/', verifyToken, listRisks);

// Admin and Analyst can create, advance, and update risks; only Admin can delete
router.post('/', verifyToken, requireRole('Admin', 'Analyst'), createRisk);
router.put('/:id/advance', verifyToken, requireRole('Admin', 'Analyst'), advanceRiskStage);
router.put('/:id', verifyToken, requireRole('Admin', 'Analyst'), updateRisk);
router.delete('/:id', verifyToken, requireRole('Admin'), deleteRisk);

export default router;

