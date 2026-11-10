// User Controller Implementation
// Handles User Profile Management, Security Credentials (Password/MFA), and Admin User Listing

import bcrypt from 'bcryptjs';
import { UserStore } from '../models/user.store.js';

// Minimum 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special symbol
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]).{8,}$/;

// 1. Get Authenticated User Profile
export const getProfile = async (req, res) => {
  try {
    const user = UserStore.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        mfaEnabled: user.mfaEnabled,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
};

// 2. Update Profile Details (Name, Department, MFA Preference)
export const updateProfile = async (req, res) => {
  try {
    const { name, department, mfaEnabled } = req.body;

    const updates = {};
    if (name && name.trim()) updates.name = name.trim();
    if (department && department.trim()) updates.department = department.trim();
    if (typeof mfaEnabled === 'boolean') updates.mfaEnabled = mfaEnabled;

    const updatedUser = UserStore.update(req.user.id, updates);
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        department: updatedUser.department,
        mfaEnabled: updatedUser.mfaEnabled,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

// 3. Update Security Credentials & Multi-factor Security Preferences
export const updateSecurityCredentials = async (req, res) => {
  try {
    const { currentPassword, newPassword, mfaEnabled } = req.body;
    const user = UserStore.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const updates = {};

    // If user wants to change password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to set a new password.',
        });
      }

      const isCurrentValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isCurrentValid) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect current password.',
        });
      }

      // Enforce strict 8+ char enterprise password complexity policy
      if (!PASSWORD_REGEX.test(newPassword)) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 8 characters long and contain uppercase, lowercase, a number, and a special character (!@#$%^&*).',
        });
      }

      const salt = await bcrypt.genSalt(10);
      updates.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    // If user toggles MFA preference
    if (typeof mfaEnabled === 'boolean') {
      updates.mfaEnabled = mfaEnabled;
    }

    const updatedUser = UserStore.update(req.user.id, updates);

    return res.json({
      success: true,
      message: 'Security credentials updated successfully.',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        department: updatedUser.department,
        mfaEnabled: updatedUser.mfaEnabled,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update credentials.' });
  }
};

// 4. Admin Only: List All Registered Users
export const listUsers = async (req, res) => {
  try {
    const users = UserStore.findAll().map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department,
      mfaEnabled: u.mfaEnabled,
      isActive: u.isActive,
      createdAt: u.createdAt,
    }));

    return res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
};
