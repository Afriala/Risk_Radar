// User Routes Configuration
import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  updateSecurityCredentials,
  listUsers,
} from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// Profile operations (Any authenticated user)
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.put('/credentials', verifyToken, updateSecurityCredentials);

// Granular Role-Based Access Control: Admin only can list all users
router.get('/', verifyToken, requireRole('Admin'), listUsers);

export default router;
