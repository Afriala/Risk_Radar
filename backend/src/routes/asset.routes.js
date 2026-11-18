// Asset Routes Configuration
// Module 2: Enterprise IT Asset Inventory

import { Router } from 'express';
import {
  listAssets,
  createAsset,
  updateAsset,
  deleteAsset,
} from '../controllers/asset.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// All authenticated roles can view asset inventory
router.get('/', verifyToken, listAssets);

// Admin and Analyst can register and update assets; only Admin can delete
router.post('/', verifyToken, requireRole('Admin', 'Analyst'), createAsset);
router.put('/:id', verifyToken, requireRole('Admin', 'Analyst'), updateAsset);
router.delete('/:id', verifyToken, requireRole('Admin'), deleteAsset);

export default router;

