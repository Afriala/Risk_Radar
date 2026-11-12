// User Controller Implementation
// Handles User Profile Management, Security Credentials (Password/MFA), and Admin User Listing

import bcrypt from 'bcryptjs';
import { UserStore } from '../models/user.store.js';
import { AuditStore } from '../models/audit.store.js';

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

// 4. Admin Only: Direct Provisioning of New User (Path 2: Instant Active Account)
export const provisionUserByAdmin = async (req, res) => {
  try {
    const { name, email, password, role, department, mfaEnabled = true } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Full name and email address are required fields.',
      });
    }

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid corporate email address.',
      });
    }

    const existingUser = UserStore.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists in the directory.',
      });
    }

    const ALLOWED_ROLES = ['Admin', 'Analyst', 'Executive', 'Auditor'];
    const assignedRole = ALLOWED_ROLES.includes(role) ? role : 'Analyst';

    // Password validation: user provided or default 'Password123!'
    const initialPassword = password && password.trim() ? password.trim() : 'Password123!';
    if (!PASSWORD_REGEX.test(initialPassword)) {
      return res.status(400).json({
        success: false,
        message:
          'Initial password must be at least 8 characters long and contain uppercase, lowercase, a number, and a special character (!@#$%^&*).',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(initialPassword, salt);

    // Save with isActive: true (Instantly active because Administrator directly provisioned it)
    const newUser = UserStore.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: assignedRole,
      department: department?.trim() || 'General IT',
      isActive: true,
    });

    // Update with status active and MFA preference
    UserStore.update(newUser.id, {
      mfaEnabled: Boolean(mfaEnabled),
      status: 'active',
    });

    AuditStore.log({
      action: 'USER_PROVISIONED',
      actor: `${req.user.name} (${req.user.role})`,
      target: `${newUser.name} (${newUser.email})`,
      details: `Administrator directly provisioned and activated account under '${assignedRole}' role in '${department || 'General IT'}'.`,
      severity: 'SUCCESS',
    });

    return res.status(201).json({
      success: true,
      message: `User '${newUser.name}' provisioned and activated successfully under '${assignedRole}' role.`,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        mfaEnabled: Boolean(mfaEnabled),
        status: 'active',
      },
      initialPassword,
    });
  } catch (error) {
    console.error('Provisioning error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during user provisioning.',
    });
  }
};

// 5. Admin Only: List All Registered Users with Extended RBAC Metrics
export const listUsers = async (req, res) => {
  try {
    const users = UserStore.findAll().map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department,
      mfaEnabled: Boolean(u.mfaEnabled),
      isActive: Boolean(u.isActive),
      status: u.status || (u.isActive ? 'active' : 'pending_approval'),
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

// 5. Admin Only: Change User Role & Department (RBAC with Self-Demotion Lock)
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, department } = req.body;
    const ALLOWED_ROLES = ['Admin', 'Analyst', 'Executive', 'Auditor'];

    const targetUser = UserStore.findById(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Target user not found.' });
    }

    // Zero-loophole safety: Admin cannot demote their own account to prevent lockout
    if (req.user.id === id && role && role !== 'Admin') {
      return res.status(400).json({
        success: false,
        message: 'Security Violation: Administrators cannot demote their own account.',
      });
    }

    const updates = {};
    if (role) {
      if (!ALLOWED_ROLES.includes(role)) {
        return res.status(400).json({ success: false, message: `Role must be one of [${ALLOWED_ROLES.join(', ')}].` });
      }
      updates.role = role;
    }

    if (department && department.trim()) {
      updates.department = department.trim();
    }

    const oldRole = targetUser.role;
    const updatedUser = UserStore.update(id, updates);

    // Audit log
    AuditStore.log({
      action: 'ROLE_UPDATED',
      actor: `${req.user.name} (${req.user.role})`,
      target: `${updatedUser.name} (${updatedUser.email})`,
      details: `Role updated from '${oldRole}' to '${updatedUser.role}'${department ? ` and department to '${updatedUser.department}'` : ''}.`,
      severity: 'WARNING',
    });

    return res.json({
      success: true,
      message: `User '${updatedUser.name}' role successfully updated to '${updatedUser.role}'.`,
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update user role.' });
  }
};

// 6. Admin Only: Approve, Suspend, or Activate User Account
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' | 'suspend' | 'activate'

    const targetUser = UserStore.findById(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Target user not found.' });
    }

    // Zero-loophole safety: Admin cannot suspend their own account
    if (req.user.id === id && action === 'suspend') {
      return res.status(400).json({
        success: false,
        message: 'Security Violation: You cannot suspend your own active administrative account.',
      });
    }

    const updates = {};
    let auditAction = 'STATUS_CHANGE';
    let severity = 'INFO';
    let feedbackMsg = '';

    if (action === 'approve') {
      updates.isActive = true;
      updates.status = 'active';
      auditAction = 'USER_APPROVED';
      severity = 'SUCCESS';
      feedbackMsg = `Account for '${targetUser.name}' has been approved and activated.`;
    } else if (action === 'suspend') {
      updates.isActive = false;
      updates.status = 'suspended';
      auditAction = 'USER_SUSPENDED';
      severity = 'WARNING';
      feedbackMsg = `Account for '${targetUser.name}' has been suspended. Access revoked.`;
    } else if (action === 'activate') {
      updates.isActive = true;
      updates.status = 'active';
      auditAction = 'USER_ACTIVATED';
      severity = 'SUCCESS';
      feedbackMsg = `Account for '${targetUser.name}' has been reactivated.`;
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Permitted actions: 'approve', 'suspend', 'activate'.",
      });
    }

    const updatedUser = UserStore.update(id, updates);

    AuditStore.log({
      action: auditAction,
      actor: `${req.user.name} (${req.user.role})`,
      target: `${updatedUser.name} (${updatedUser.email})`,
      details: feedbackMsg,
      severity,
    });

    return res.json({
      success: true,
      message: feedbackMsg,
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update user status.' });
  }
};

// 7. Admin Only: Force Toggle MFA for a User
export const toggleUserMfa = async (req, res) => {
  try {
    const { id } = req.params;
    const { mfaEnabled } = req.body;

    const targetUser = UserStore.findById(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Target user not found.' });
    }

    const nextState = typeof mfaEnabled === 'boolean' ? mfaEnabled : !targetUser.mfaEnabled;
    const updatedUser = UserStore.update(id, { mfaEnabled: nextState });

    AuditStore.log({
      action: 'MFA_POLICY_TOGGLED',
      actor: `${req.user.name} (${req.user.role})`,
      target: `${updatedUser.name} (${updatedUser.email})`,
      details: `Administrator ${nextState ? 'enforced' : 'disabled'} mandatory MFA shield.`,
      severity: nextState ? 'SUCCESS' : 'WARNING',
    });

    return res.json({
      success: true,
      message: `MFA shield successfully ${nextState ? 'enabled' : 'disabled'} for ${updatedUser.name}.`,
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to toggle MFA.' });
  }
};

// 8. Admin Only: Permanently Delete User Account
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const targetUser = UserStore.findById(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Target user not found.' });
    }

    // Zero-loophole safety: Admin cannot delete themselves
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'Security Violation: Administrators cannot delete their own account.',
      });
    }

    const removed = UserStore.delete(id);
    if (!removed) {
      return res.status(500).json({ success: false, message: 'Failed to delete user.' });
    }

    AuditStore.log({
      action: 'USER_DELETED',
      actor: `${req.user.name} (${req.user.role})`,
      target: `${targetUser.name} (${targetUser.email})`,
      details: `User account '${targetUser.name}' was permanently removed by Administrator.`,
      severity: 'ALERT',
    });

    return res.json({
      success: true,
      message: `User '${targetUser.name}' has been permanently deleted from directory.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
};

// 9. Admin Only: Get Security Audit Trail Logs
export const getAuditLogs = async (req, res) => {
  try {
    const logs = AuditStore.findAll(50);
    return res.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve audit trail logs.' });
  }
};
