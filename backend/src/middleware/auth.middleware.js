// Auth Middleware - JWT Verification & Session Check
// Handles token validation, idle timeout / expiration, and explicit revocation

import jwt from 'jsonwebtoken';
import { UserStore } from '../models/user.store.js';

// Revoked token store (for logout handling)
export const revokedTokens = new Set();

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  // Check if token was explicitly revoked via logout
  if (revokedTokens.has(token)) {
    return res.status(401).json({
      success: false,
      message: 'Session has been revoked or logged out. Please log in again.',
    });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'riskradar_default_dev_secret_key_2026';
    const decoded = jwt.verify(token, jwtSecret);

    const user = UserStore.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is inactive or no longer exists.',
      });
    }

    // Attach user and raw token to request
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      mfaEnabled: user.mfaEnabled,
    };
    req.token = token;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session has expired due to idle timeout. Please log in again.',
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Invalid authentication token.',
    });
  }
};
