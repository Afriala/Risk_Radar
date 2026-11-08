// Auth Controller Implementation
// Handles User Registration, Authentication (Login), and Secure Logout

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserStore } from '../models/user.store.js';
import { revokedTokens } from '../middleware/auth.middleware.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]).{8,}$/;
const ALLOWED_ROLES = ['Admin', 'Analyst', 'Executive', 'Auditor'];

// Helper to sign JWT token
const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'riskradar_default_dev_secret_key_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '2h';
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn }
  );
};

// 1. User Registration Workflow
export const register = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.',
      });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and contain a combination of letters, numbers, and special characters (e.g. #, @, $, !).',
      });
    }

    // Role validation (defaults to Analyst)
    const assignedRole = ALLOWED_ROLES.includes(role) ? role : 'Analyst';

    // Check if email already in use
    const existingUser = UserStore.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Password Hashing
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Persist new user
    const newUser = UserStore.create({
      name,
      email,
      passwordHash,
      role: assignedRole,
      department: department || 'General IT',
    });

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        mfaEnabled: newUser.mfaEnabled,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again.',
    });
  }
};

// 2. User Login Workflow
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const user = UserStore.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email address.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This account has been disabled. Please contact your administrator.',
      });
    }

    // Verify password hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please verify and try again.',
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        mfaEnabled: user.mfaEnabled,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.',
    });
  }
};

// 3. Secure Session Revocation (Logout)
export const logout = async (req, res) => {
  try {
    if (req.token) {
      revokedTokens.add(req.token);
    }
    return res.json({
      success: true,
      message: 'Session revoked successfully. Logged out.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error during logout.',
    });
  }
};
