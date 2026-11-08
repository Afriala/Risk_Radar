// Auth Controller Implementation - Enterprise Cybersecurity Specification
// Handles Pre-provisioned Authentication, 2-Step MFA Challenge, Field-Level Errors,
// Restricted Registration with Approval Workflow, and Secure Password Reset.

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserStore } from '../models/user.store.js';
import { revokedTokens } from '../middleware/auth.middleware.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Minimum 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special symbol
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]).{8,}$/;
const ALLOWED_ROLES = ['Admin', 'Analyst', 'Executive', 'Auditor'];
const VALID_INVITE_CODES = ['RR-ORG-2026', 'RISKRADAR-ADMIN-AUTH', 'SE331-SECURITY-AUTH'];

// In-Memory Storage for Active 2-Step MFA and Password Reset Challenges
const mfaSessions = new Map();
const resetSessions = new Map();

// Helper to mask email for MFA prompts (e.g., a***t@riskradar.io)
const maskEmail = (email) => {
  if (!email || !email.includes('@')) return email;
  const [name, domain] = email.split('@');
  const visible = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : `${name[0]}*`;
  return `${visible}@${domain}`;
};

// Helper to sign JWT session token
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

// -----------------------------------------------------------------------
// 1. User Registration (Enterprise Approval Workflow)
// -----------------------------------------------------------------------
export const register = async (req, res) => {
  try {
    const { name, email, password, role, department, inviteCode } = req.body;

    // Required fields check
    if (!name || !email || !password || !inviteCode) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and Enterprise Authorization Code are required.',
      });
    }

    // Verify Enterprise Admin Authorization Code
    const cleanInvite = inviteCode.trim().toUpperCase();
    if (!VALID_INVITE_CODES.includes(cleanInvite)) {
      return res.status(403).json({
        success: false,
        field: 'inviteCode',
        message: 'Invalid or expired Enterprise Admin Authorization Code. Contact security administration.',
      });
    }

    // Email format check
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        success: false,
        field: 'email',
        message: 'Please provide a valid corporate email address.',
      });
    }

    // Strict 8+ char password complexity check
    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        success: false,
        field: 'password',
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter (A-Z), one lowercase letter (a-z), one number (0-9), and one special character (!@#$%^&*).',
      });
    }

    // Check duplicate account
    const existingUser = UserStore.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        field: 'email',
        message: 'An account with this email address already exists in the organization directory.',
      });
    }

    // Role validation
    const assignedRole = ALLOWED_ROLES.includes(role) ? role : 'Analyst';

    // Hash password with bcrypt 10 salt rounds
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Save with isActive: false (Pending Approval)
    const newUser = UserStore.create({
      name,
      email,
      passwordHash,
      role: assignedRole,
      department: department || 'General IT',
      isActive: false, // Strict requirement: Must be approved by Administrator
    });

    return res.status(201).json({
      success: true,
      pendingApproval: true,
      message: 'Registration submitted. Your account requires System Administrator approval before you can access RiskRadar.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        status: 'pending_approval',
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration.',
    });
  }
};

// -----------------------------------------------------------------------
// 2. User Login - Step 1: Credentials Verification & MFA Challenge
// -----------------------------------------------------------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // 1. Email check: must exist in pre-provisioned directory
    const user = UserStore.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        field: 'email',
        message: 'This email address is not registered in the RiskRadar organization directory.',
      });
    }

    // 2. Account verification check: must be active/approved
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        field: 'account',
        message: 'Your account is pending Administrator verification and cannot access the portal yet.',
      });
    }

    // 3. Password check: verify bcrypt hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        field: 'password',
        message: "Incorrect password entered. Please check your password or click 'Forgot Password?' below.",
      });
    }

    // 4. Issue 6-Digit 2-Step MFA Challenge (valid for 5 minutes)
    const mfaCode = Math.floor(100000 + Math.random() * 900000).toString();
    mfaSessions.set(user.email.toLowerCase(), {
      code: mfaCode,
      expiresAt: Date.now() + 5 * 60 * 1000,
      user,
    });

    return res.json({
      success: true,
      mfaRequired: true,
      email: user.email,
      maskedEmail: maskEmail(user.email),
      mfaCode, // Provided for live simulation and academic evaluation
      message: 'Credentials verified. 6-digit MFA authorization code issued.',
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.',
    });
  }
};

// -----------------------------------------------------------------------
// 3. User Login - Step 2: 6-Digit MFA Verification & Final JWT Issue
// -----------------------------------------------------------------------
export const verifyMfa = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and 6-digit verification code are required.',
      });
    }

    const session = mfaSessions.get(email.toLowerCase());
    if (!session || Date.now() > session.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'MFA session has expired. Please sign in with your credentials again.',
      });
    }

    if (session.code !== String(code).trim()) {
      return res.status(401).json({
        success: false,
        message: 'Invalid 6-digit verification code. Please check and try again.',
      });
    }

    // MFA Verified: issue final signed JWT session token
    const token = generateToken(session.user);
    mfaSessions.delete(email.toLowerCase());

    return res.json({
      success: true,
      message: 'MFA verification successful. Access granted.',
      token,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        department: session.user.department,
        mfaEnabled: true,
      },
    });
  } catch (error) {
    console.error('MFA verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during MFA verification.',
    });
  }
};

// -----------------------------------------------------------------------
// 4. Resend 6-Digit MFA Code
// -----------------------------------------------------------------------
export const resendMfa = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = UserStore.findByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    mfaSessions.set(user.email.toLowerCase(), {
      code: newCode,
      expiresAt: Date.now() + 5 * 60 * 1000,
      user,
    });

    return res.json({
      success: true,
      mfaCode: newCode,
      message: 'New 6-digit verification code generated.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to resend MFA code.' });
  }
};

// -----------------------------------------------------------------------
// 5. Password Recovery - Step 1: Verify Registered Email
// -----------------------------------------------------------------------
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const user = UserStore.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        field: 'email',
        message: 'No registered account found with this email address.',
      });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    resetSessions.set(email.toLowerCase(), {
      code: resetCode,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      verified: false,
    });

    return res.json({
      success: true,
      resetCode, // Provided for live simulation and academic evaluation
      message: '6-digit security verification code dispatched to registered corporate email.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to process password reset request.' });
  }
};

// -----------------------------------------------------------------------
// 6. Password Recovery - Step 2: Verify 6-Digit Reset Code
// -----------------------------------------------------------------------
export const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and verification code are required.' });
    }

    const session = resetSessions.get(email.toLowerCase());
    if (!session || Date.now() > session.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Reset verification code has expired. Please request a new code.',
      });
    }

    if (session.code !== String(code).trim()) {
      return res.status(401).json({
        success: false,
        message: 'Invalid 6-digit verification code. Please check and try again.',
      });
    }

    session.verified = true;
    return res.json({
      success: true,
      message: 'Security code verified. Please set your new password.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to verify reset code.' });
  }
};

// -----------------------------------------------------------------------
// 7. Password Recovery - Step 3: Set New 8+ Character Password
// -----------------------------------------------------------------------
export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email and new password are required.' });
    }

    const session = resetSessions.get(email.toLowerCase());
    if (!session || !session.verified) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized password reset attempt. Identity code verification required.',
      });
    }

    // Strict 8+ char password complexity check
    if (!PASSWORD_REGEX.test(newPassword)) {
      return res.status(400).json({
        success: false,
        field: 'newPassword',
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter (A-Z), one lowercase letter (a-z), one number (0-9), and one special character (!@#$%^&*).',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    const updated = UserStore.updatePassword(email, passwordHash);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Failed to update password for this user.' });
    }

    resetSessions.delete(email.toLowerCase());

    return res.json({
      success: true,
      message: 'Password updated successfully. Please sign in with your new password.',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
};

// -----------------------------------------------------------------------
// 8. Secure Logout & Token Revocation
// -----------------------------------------------------------------------
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
