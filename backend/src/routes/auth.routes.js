// Auth Routes Configuration - Enterprise Specification
import { Router } from 'express';
import {
  register,
  login,
  verifyMfa,
  resendMfa,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  logout,
} from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { loginRateLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

// Registration & Authentication
router.post('/register', register);
router.post('/login', loginRateLimiter, login);
router.post('/verify-mfa', verifyMfa);
router.post('/resend-mfa', resendMfa);

// Password Recovery Workflow
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

// Session Revocation
router.post('/logout', verifyToken, logout);

export default router;
