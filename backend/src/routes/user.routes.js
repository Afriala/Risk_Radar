// User Routes Configuration
import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  updateSecurityCredentials,
  getTeamRoster,
  getMyAuditLogs,
  extendUserSession,
  getApiKey,
  regenerateApiKey,
  listUsers,
  provisionUserByAdmin,
  updateUserRole,
  updateUserStatus,
  toggleUserMfa,
  deleteUser,
  getAuditLogs,
} from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// Profile & Personal Security Operations (Any authenticated user)
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.put('/credentials', verifyToken, updateSecurityCredentials);
router.get('/team-roster', verifyToken, getTeamRoster);
router.get('/my-logs', verifyToken, getMyAuditLogs);
router.post('/extend-session', verifyToken, extendUserSession);
router.get('/api-key', verifyToken, getApiKey);
router.post('/api-key/regenerate', verifyToken, regenerateApiKey);

// Granular Role-Based Access Control (Admin Clearance Level 4)
router.get('/', verifyToken, requireRole('Admin'), listUsers);
router.post('/', verifyToken, requireRole('Admin'), provisionUserByAdmin);
router.get('/audit-logs', verifyToken, requireRole('Admin'), getAuditLogs);
router.put('/:id/role', verifyToken, requireRole('Admin'), updateUserRole);
router.put('/:id/status', verifyToken, requireRole('Admin'), updateUserStatus);
router.put('/:id/mfa-force', verifyToken, requireRole('Admin'), toggleUserMfa);
router.delete('/:id', verifyToken, requireRole('Admin'), deleteUser);

export default router;
