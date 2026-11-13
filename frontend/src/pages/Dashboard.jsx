// RiskRadar - Role-Based Security Workspace (Dashboard)
// Demonstrates RBAC (Requirement 4) in action for Admin, Analyst, Executive, and Auditor
// Features Interactive Admin Management: Role Dropdown, User Approval/Suspension, Force MFA, and Real-Time Security Audit Trail
// Clean Corporate White Theme

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/user.api';
import {
  Shield,
  Users,
  ShieldCheck,
  Activity,
  Layers,
  AlertTriangle,
  AlertCircle,
  FileCheck2,
  Lock,
  CheckCircle2,
  XCircle,
  Trash2,
  UserCheck,
  UserX,
  Copy,
  Check,
  RefreshCw,
  Clock,
  Terminal,
  ShieldAlert,
  ArrowRight,
  ChevronDown,
  UserPlus,
  Eye,
  EyeOff,
  X,
  Search,
  Key,
  ExternalLink,
  Laptop,
  FileText,
  Printer,
  TrendingUp,
  DollarSign,
} from 'lucide-react';

export default function Dashboard() {
  const { user, extendSession } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [adminFeedback, setAdminFeedback] = useState(null); // { text, type: 'success' | 'error' }
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Operational Analyst & General User State (PoLP Compliant)
  const [teamRoster, setTeamRoster] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [analystLogs, setAnalystLogs] = useState([]);
  const [loadingAnalystLogs, setLoadingAnalystLogs] = useState(false);
  const [rosterSearch, setRosterSearch] = useState('');
  const [extendingSession, setExtendingSession] = useState(false);
  const [sessionToast, setSessionToast] = useState(null);
  const [showBriefingModal, setShowBriefingModal] = useState(false);

  // Direct User Provisioning State (Admin Path 2)
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [provName, setProvName] = useState('');
  const [provEmail, setProvEmail] = useState('');
  const [provRole, setProvRole] = useState('Analyst');
  const [provDept, setProvDept] = useState('Information Security');
  const [provPassword, setProvPassword] = useState('Password123!');
  const [provMfa, setProvMfa] = useState(true);
  const [showProvPassword, setShowProvPassword] = useState(false);
  const [provLoading, setProvLoading] = useState(false);
  const [provError, setProvError] = useState('');

  const INVITE_CODE = 'RR-ORG-2026';

  const fetchUsers = useCallback(() => {
    if (user?.role !== 'Admin') return;
    setLoadingUsers(true);
    userApi
      .listUsers()
      .then((res) => {
        if (res.success && res.users) {
          setAllUsers(res.users);
        }
      })
      .catch((err) => console.error('Failed to load users:', err))
      .finally(() => setLoadingUsers(false));
  }, [user?.role]);

  const fetchLogs = useCallback(() => {
    if (user?.role !== 'Admin') return;
    setLoadingLogs(true);
    userApi
      .getAuditLogs()
      .then((res) => {
        if (res.success && res.logs) {
          setAuditLogs(res.logs);
        }
      })
      .catch((err) => console.error('Failed to load audit logs:', err))
      .finally(() => setLoadingLogs(false));
  }, [user?.role]);

  const fetchAnalystData = useCallback(() => {
    setLoadingRoster(true);
    userApi
      .getTeamRoster()
      .then((res) => {
        if (res.success && res.users) {
          setTeamRoster(res.users);
        }
      })
      .catch((err) => console.error('Failed to load team roster:', err))
      .finally(() => setLoadingRoster(false));

    setLoadingAnalystLogs(true);
    userApi
      .getMyLogs()
      .then((res) => {
        if (res.success && res.logs) {
          setAnalystLogs(res.logs);
        }
      })
      .catch((err) => console.error('Failed to load personal logs:', err))
      .finally(() => setLoadingAnalystLogs(false));
  }, []);

  useEffect(() => {
    if (user?.role === 'Admin') {
      fetchUsers();
      fetchLogs();
    } else {
      fetchAnalystData();
    }
  }, [user?.role, fetchUsers, fetchLogs, fetchAnalystData]);

  const handleSessionExtend = async () => {
    setExtendingSession(true);
    try {
      await extendSession();
      setSessionToast('Active session successfully extended (+15 mins) under NIST SP 800-63B policy.');
      setTimeout(() => setSessionToast(null), 5000);
      userApi.getMyLogs().then((res) => {
        if (res.success && res.logs) setAnalystLogs(res.logs);
      });
      if (user?.role === 'Admin') {
        fetchLogs();
      }
    } catch (err) {
      setSessionToast('Failed to extend session: ' + (err.message || 'Error'));
      setTimeout(() => setSessionToast(null), 5000);
    } finally {
      setExtendingSession(false);
    }
  };

  const filteredRoster = teamRoster.filter((u) => {
    if (!rosterSearch) return true;
    const q = rosterSearch.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q) ||
      (u.department || '').toLowerCase().includes(q)
    );
  });

  const showFeedback = (text, type = 'success') => {
    setAdminFeedback({ text, type });
    setTimeout(() => setAdminFeedback(null), 5000);
  };

  // 1. Role Change Handler (RBAC Dropdown)
  const handleRoleChange = async (userId, newRole) => {
    setActionLoadingId(userId);
    try {
      const res = await userApi.updateUserRole(userId, { role: newRole });
      if (res.success) {
        showFeedback(res.message, 'success');
        fetchUsers();
        fetchLogs();
      }
    } catch (err) {
      showFeedback(err.message || 'Failed to update role.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // 2. Status Change Handler (Approve / Suspend / Activate)
  const handleStatusChange = async (userId, action) => {
    setActionLoadingId(userId);
    try {
      const res = await userApi.updateUserStatus(userId, action);
      if (res.success) {
        showFeedback(res.message, 'success');
        fetchUsers();
        fetchLogs();
      }
    } catch (err) {
      showFeedback(err.message || 'Failed to update user status.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // 3. Force MFA Toggle Handler
  const handleToggleMfa = async (userId, currentState) => {
    setActionLoadingId(userId);
    try {
      const nextState = !currentState;
      const res = await userApi.toggleUserMfa(userId, nextState);
      if (res.success) {
        showFeedback(res.message, 'success');
        fetchUsers();
        fetchLogs();
      }
    } catch (err) {
      showFeedback(err.message || 'Failed to toggle MFA.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // 4. Delete / Reject User Handler
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to permanently delete user '${userName}'? This action cannot be undone.`)) {
      return;
    }
    setActionLoadingId(userId);
    try {
      const res = await userApi.deleteUser(userId);
      if (res.success) {
        showFeedback(res.message, 'success');
        fetchUsers();
        fetchLogs();
      }
    } catch (err) {
      showFeedback(err.message || 'Failed to delete user.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // 5. Copy Invite Code
  const handleCopyInvite = () => {
    navigator.clipboard.writeText(INVITE_CODE);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2500);
  };

  // 6. Direct User Provisioning Submit Handler (Admin Path 2)
  const handleProvisionSubmit = async (e) => {
    e.preventDefault();
    setProvError('');

    if (!provName.trim() || !provEmail.trim()) {
      setProvError('Full name and email address are required.');
      return;
    }

    setProvLoading(true);
    try {
      const res = await userApi.provisionUser({
        name: provName.trim(),
        email: provEmail.trim(),
        role: provRole,
        department: provDept.trim(),
        password: provPassword.trim(),
        mfaEnabled: provMfa,
      });

      if (res.success) {
        showFeedback(
          `User '${res.user.name}' provisioned and activated successfully under '${res.user.role}' role!`,
          'success'
        );
        setShowProvisionModal(false);
        setProvName('');
        setProvEmail('');
        setProvDept('Information Security');
        setProvRole('Analyst');
        setProvPassword('Password123!');
        setProvMfa(true);
        fetchUsers();
        fetchLogs();
      }
    } catch (err) {
      setProvError(err.message || 'Failed to provision new user.');
    } finally {
      setProvLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8 space-y-8 bg-white min-h-[calc(100vh-4rem)]">
      {/* Welcome & Role Banner - Eye-Catching Enterprise White Theme */}
      <div className={`border rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
        user?.role === 'Executive'
          ? 'bg-[#f0fbf6] border-[#bbf7d0]'
          : 'bg-gradient-to-r from-slate-50 via-white to-emerald-50/60 border-slate-200/90'
      }`}>
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono font-bold tracking-wide">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>SESSION AUTHENTICATED • MODULE 1 ACTIVE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, <span className="text-emerald-600">{user?.name}</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl leading-relaxed">
            You are operating under the{' '}
            <strong className="text-slate-900 font-bold">{user?.role}</strong> role in the{' '}
            <strong className="text-emerald-700 font-bold font-sans">{user?.department || 'Executive Board'}</strong>{user?.role === 'Executive' ? '' : ' department'}. Granular access controls enforce role-specific capabilities.
          </p>
        </div>

                {user?.role === 'Executive' ? (
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2.5 rounded-xl bg-emerald-50/80 border border-emerald-300 text-center min-w-[140px]">
              <span className="block text-[10px] font-mono font-bold uppercase text-emerald-700">ASSIGNED ROLE</span>
              <span className="text-sm font-bold text-emerald-900 font-mono">Executive (Level 2)</span>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-white border border-emerald-300 text-center min-w-[110px]">
              <span className="block text-[10px] font-mono font-bold uppercase text-slate-500">MFA SHIELD</span>
              <span className="text-sm font-bold text-emerald-700">Enabled</span>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-white border border-emerald-300 text-center min-w-[140px]">
              <span className="block text-[10px] font-mono font-bold uppercase text-slate-500">DEPARTMENT</span>
              <span className="text-sm font-bold text-emerald-900 font-mono">{user?.department || 'Executive Board'}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto">
            {/* Card 1: Role */}
            <div className="px-5 py-3.5 rounded-2xl bg-white border border-slate-200 text-center shadow-xs min-w-[150px] flex flex-col justify-center">
              <span className="block text-xs text-slate-500 uppercase tracking-wider font-mono font-bold mb-1">
                Assigned Role
              </span>
              <span className="text-lg font-extrabold text-emerald-700 tracking-tight">
                {user?.role}
              </span>
            </div>

            {/* Card 2: MFA Shield */}
            <div className="px-5 py-3.5 rounded-2xl bg-white border border-slate-200 text-center shadow-xs min-w-[150px] flex flex-col justify-center">
              <span className="block text-xs text-slate-500 uppercase tracking-wider font-mono font-bold mb-1">
                MFA Security
              </span>
              <span
                className={`text-lg font-extrabold tracking-tight ${
                  user?.mfaEnabled ? 'text-emerald-700' : 'text-amber-600'
                }`}
              >
                {user?.mfaEnabled ? '✓ Enabled' : '⚠ Off'}
              </span>
            </div>

            {/* Card 3: Session Guard */}
            <div className="px-5 py-3.5 rounded-2xl bg-white border border-slate-200 text-center shadow-xs min-w-[165px] flex flex-col justify-between items-center">
              <span className="block text-xs text-slate-500 uppercase tracking-wider font-mono font-bold mb-1">
                Session Guard
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Protected
                </span>
                <button
                  type="button"
                  onClick={handleSessionExtend}
                  disabled={extendingSession}
                  title="Renew 15-minute rolling idle session (NIST SP 800-63B)"
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition active:scale-95 cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                >
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{extendingSession ? '...' : '+15m'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global Session Feedback Toast */}
      {sessionToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{sessionToast}</span>
          </div>
          <button onClick={() => setSessionToast(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Role-Specific Workspace View */}
      {user?.role === 'Admin' && (
        <div className="space-y-6">
          {/* Admin Header with Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
                <Users className="w-6 h-6 text-red-600" />
                <span>Admin User Management & RBAC Governance</span>
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Restricted to Admin Level 4. Manage user approvals, role assignments, MFA policies, and account access.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Direct Provisioning Button (Admin Path 2) */}
              <button
                onClick={() => {
                  setProvError('');
                  setShowProvisionModal(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-600/20 transition active:scale-95 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Add New User</span>
              </button>

              {/* Organization Invite Code Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-mono">
                <span className="text-slate-500 font-sans font-medium">Invite Code:</span>
                <span className="font-bold text-emerald-700">{INVITE_CODE}</span>
                <button
                  onClick={handleCopyInvite}
                  title="Copy Enterprise Authorization Code"
                  className="hover:text-emerald-600 transition ml-1"
                >
                  {copiedInvite ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <button
                onClick={() => {
                  fetchUsers();
                  fetchLogs();
                }}
                title="Refresh directory data"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-sm transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers || loadingLogs ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Feedback Banner */}
          {adminFeedback && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 shadow-sm transition-all animate-fadeIn ${adminFeedback.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                  : 'bg-red-50 border border-red-300 text-red-900'
                }`}
            >
              {adminFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span className="font-medium">{adminFeedback.text}</span>
            </div>
          )}

          {/* Interactive User Management Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {loadingUsers && allUsers.length === 0 ? (
              <div className="p-10 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Loading enterprise user directory...</span>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-sm text-slate-700 min-w-[760px]">
                  <thead className="bg-slate-100/90 text-xs uppercase font-mono font-bold tracking-wider text-slate-700 border-b border-slate-300">
                    <tr>
                      <th className="py-3 px-4 font-semibold whitespace-nowrap">User</th>
                      <th className="py-3 px-4 font-semibold whitespace-nowrap">Email</th>
                      <th className="py-3 px-4 font-semibold whitespace-nowrap">Role (RBAC)</th>
                      <th className="py-3 px-4 font-semibold whitespace-nowrap">Department</th>
                      <th className="py-3 px-4 font-semibold whitespace-nowrap">MFA Shield</th>
                      <th className="py-3 px-4 font-semibold whitespace-nowrap">Status</th>
                      <th className="py-3 px-4 font-semibold whitespace-nowrap text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-normal">
                    {allUsers.map((u) => {
                      const isSelf = u.id === user?.id;
                      const isPending = !u.isActive && u.status === 'pending_approval';
                      const isSuspended = !u.isActive && u.status === 'suspended';

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition">
                          {/* Name */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              <span>{u.name}</span>
                              {isSelf && (
                                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-300">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 font-mono">
                              Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                            </span>
                          </td>

                          {/* Email */}
                          <td className="py-4 px-4 font-mono text-sm text-slate-700 font-medium whitespace-nowrap">{u.email}</td>

                          {/* Role Dropdown (RBAC) */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {isSelf ? (
                              <span className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold border bg-red-50 text-red-700 border-red-200 inline-block">
                                Admin (Protected)
                              </span>
                            ) : (
                              <div className="relative inline-block">
                                <select
                                  value={u.role}
                                  disabled={actionLoadingId === u.id}
                                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                  className={`text-xs font-mono font-bold py-1 px-2.5 pr-7 rounded-lg border appearance-none cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${u.role === 'Admin'
                                      ? 'bg-red-50 text-red-700 border-red-300'
                                      : u.role === 'Analyst'
                                        ? 'bg-cyan-50 text-cyan-700 border-cyan-300'
                                        : u.role === 'Executive'
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                          : 'bg-amber-50 text-amber-700 border-amber-300'
                                    }`}
                                >
                                  <option value="Admin">Admin</option>
                                  <option value="Analyst">Analyst</option>
                                  <option value="Executive">Executive</option>
                                  <option value="Auditor">Auditor</option>
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-2 pointer-events-none" />
                              </div>
                            )}
                          </td>

                          {/* Department */}
                          <td className="py-4 px-4 text-sm text-slate-800 whitespace-nowrap font-medium">{u.department}</td>

                          {/* MFA Shield Toggle */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <button
                              onClick={() => handleToggleMfa(u.id, u.mfaEnabled)}
                              disabled={actionLoadingId === u.id}
                              title="Click to toggle mandatory MFA policy"
                              className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border transition hover:scale-105 active:scale-95 cursor-pointer ${u.mfaEnabled
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                                }`}
                            >
                              {u.mfaEnabled ? 'ENABLED' : 'OFF'}
                            </button>
                          </td>

                          {/* Account Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {isPending ? (
                              <div className="flex items-center gap-1.5">
                                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-50 text-amber-700 border border-amber-300 animate-pulse">
                                  Pending Approval
                                </span>
                              </div>
                            ) : isSuspended ? (
                              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-red-50 text-red-700 border border-red-300">
                                Suspended
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Active
                              </span>
                            )}
                          </td>

                          {/* Actions Column */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-right">
                            {isSelf ? (
                              <span className="text-xs text-slate-400 italic font-mono">—</span>
                            ) : isPending ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleStatusChange(u.id, 'approve')}
                                  disabled={actionLoadingId === u.id}
                                  title="Approve registration application"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition active:scale-95 cursor-pointer"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.name)}
                                  disabled={actionLoadingId === u.id}
                                  title="Reject registration application"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition active:scale-95 cursor-pointer"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleStatusChange(u.id, u.isActive ? 'suspend' : 'activate')}
                                  disabled={actionLoadingId === u.id}
                                  title={u.isActive ? 'Suspend account access' : 'Reactivate account'}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition active:scale-95 cursor-pointer ${u.isActive
                                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                                    }`}
                                >
                                  {u.isActive ? 'Suspend' : 'Activate'}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.name)}
                                  disabled={actionLoadingId === u.id}
                                  title="Permanently remove user"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition active:scale-95 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* System Security Audit Trail (Real-Time SOC Event Logs) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md text-slate-100">
            <div className="px-5 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-mono font-bold tracking-wider uppercase text-slate-100">System Security Audit Trail (SOC Real-Time Log)</h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE AUDIT MONITOR
              </span>
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/60 font-mono text-xs">
              {auditLogs.length === 0 ? (
                <div className="p-6 text-center text-slate-500">No security audit logs recorded yet.</div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-3.5 hover:bg-slate-800/40 transition flex items-start gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold shrink-0 mt-0.5 ${log.severity === 'SUCCESS'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : log.severity === 'WARNING'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : log.severity === 'ALERT'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                    >
                      {log.action}
                    </span>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-200 font-bold text-sm">
                          {log.actor} ➔ <span className="text-slate-300 font-medium">{log.target}</span>
                        </span>
                        <span className="text-xs text-slate-400 font-mono shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs font-sans leading-relaxed">{log.details}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analyst Role Workspace (Level 3 Operations) */}
      {user?.role === 'Analyst' && (
        <div className="space-y-6">
          {/* Analyst Operational Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-100 text-cyan-800 border border-cyan-300">
                  CLEARANCE LEVEL 3
                </span>
                <span className="text-xs font-bold text-slate-600 font-mono">
                  PoLP ENFORCED
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 mt-1">
                <ShieldCheck className="w-6 h-6 text-cyan-600" />
                <span>Cybersecurity Analyst Operations & SOC Workspace</span>
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Authorized for Threat Logging, Asset Inventories & Risk Lifecycle Operations under Principle of Least Privilege.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={handleSessionExtend}
                disabled={extendingSession}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{extendingSession ? 'Extending...' : 'Extend Session (+15m)'}</span>
              </button>
              <a
                href="/profile"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold transition active:scale-95 cursor-pointer"
              >
                <Key className="w-3.5 h-3.5 text-slate-600" />
                <span>My Profile & API Key</span>
              </a>
              <button
                type="button"
                onClick={fetchAnalystData}
                disabled={loadingRoster}
                title="Refresh Team Roster and Logs"
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition active:scale-95 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loadingRoster ? 'animate-spin text-cyan-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* 1. Analyst RBAC Clearance Matrix (Level 3) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-200 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">My RBAC Clearance Matrix (Security Operations Level 3)</h3>
                  <p className="text-xs text-slate-500">Explicit Capabilities Granted vs Restricted (PoLP Enforced)</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-cyan-50 text-cyan-800 border border-cyan-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
                CLEARANCE VERIFIED
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Authorized Operations Column */}
              <div className="space-y-3 bg-emerald-50/40 border border-emerald-200/80 rounded-xl p-4">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Authorized Capabilities (Operational Scope)</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-start gap-2 bg-white/90 p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">Threat & Vulnerability Logging (Module 2):</strong>
                      <span className="text-slate-600 block mt-0.5">Authorized to log CVE vectors, incident descriptions, and assign initial impact levels.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 bg-white/90 p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">Asset Inventory Cataloging (Module 2):</strong>
                      <span className="text-slate-600 block mt-0.5">Full authority to create, update, and manage Hardware, Software, and Sensitive Data assets.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 bg-white/90 p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">Risk Lifecycle Transitions:</strong>
                      <span className="text-slate-600 block mt-0.5">Advance risk status through <em>Identified ➔ Assessing ➔ Mitigated ➔ Resolved</em>.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 bg-white/90 p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">Personal Credentials & 2-Step MFA Shield (FR-06):</strong>
                      <span className="text-slate-600 block mt-0.5">Self-service password rotation (8+ char NIST policy), personal API key, and 6-digit MFA OTP.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 bg-white/90 p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">Active Session Extender (FR-07):</strong>
                      <span className="text-slate-600 block mt-0.5">Extend active session (+15m) to prevent auto-logout while performing ongoing threat analyses.</span>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Restricted Operations Column (PoLP Enforced) */}
              <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase tracking-wider font-mono">
                  <Lock className="w-4 h-4 text-slate-500" />
                  <span>Restricted Capabilities (Principle of Least Privilege)</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-800">User Account Deletion:</strong>
                      <span className="text-slate-500 block mt-0.5">Locked — Only System Administrators (Level 4) may permanently purge user accounts from directory.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-800">Role & Privilege Escalation (RBAC Modification):</strong>
                      <span className="text-slate-500 block mt-0.5">Locked — Promoting or demoting user roles requires administrative authorization.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-800">Direct User Provisioning:</strong>
                      <span className="text-slate-500 block mt-0.5">Locked — Creating immediate active accounts without verification is restricted to Admin.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-800">Enterprise Invite Code Configuration:</strong>
                      <span className="text-slate-500 block mt-0.5">Locked — Organization onboarding keys (<code className="text-emerald-700 font-mono">RR-ORG-2026</code>) are managed by Administration.</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 2. SOC Team Directory / Personnel Roster (Read-Only) */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/60">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
                    <Users className="w-5 h-5 text-cyan-600" />
                    <span>SOC Team Directory & Personnel Roster</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-300">
                    READ-ONLY (PoLP)
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1">Directory of organization personnel for cross-functional threat escalation. Edit/Delete actions are disabled for Level 3 Analysts.</p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter roster by name or dept..."
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>
            </div>

            {loadingRoster ? (
              <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-600" />
                <span>Loading security personnel directory...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-mono uppercase text-[11px] tracking-wider">
                      <th className="py-3 px-4 font-semibold">Team Member</th>
                      <th className="py-3 px-4 font-semibold">Role (RBAC)</th>
                      <th className="py-3 px-4 font-semibold">Department</th>
                      <th className="py-3 px-4 font-semibold">MFA Shield</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Clearance Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredRoster.map((u) => {
                      const isMe = u.email === user?.email;
                      return (
                        <tr key={u.id} className={`hover:bg-slate-50/70 transition ${isMe ? 'bg-cyan-50/30' : ''}`}>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 font-bold text-xs">
                                {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {isMe && (
                                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-cyan-100 text-cyan-800 border border-cyan-300">You</span>
                                  )}
                                </div>
                                <span className="text-xs text-slate-600 font-mono">{u.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${
                                u.role === 'Admin'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : u.role === 'Analyst'
                                  ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                                  : u.role === 'Executive'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">{u.department || 'General IT'}</td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                                u.mfaEnabled
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}
                            >
                              {u.mfaEnabled ? 'ENABLED' : 'OFF'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Active
                            </span>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-right font-mono text-xs font-bold">
                            <span className="text-slate-500">
                              {u.role === 'Admin'
                                ? 'Level 4 • Governance'
                                : u.role === 'Analyst'
                                ? 'Level 3 • SecOps'
                                : u.role === 'Executive'
                                ? 'Level 2 • KPI View'
                                : 'Level 1 • Audit'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 3. My Personal Security Activity Log (Real-Time Terminal) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md text-slate-100">
            <div className="px-5 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-mono font-bold tracking-wider uppercase text-slate-100">My Personal Security Activity Log (Analyst Audit Trail)</h3>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                LIVE PERSONAL MONITOR
              </span>
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/60 font-mono text-xs">
              {loadingAnalystLogs ? (
                <div className="p-6 text-center text-slate-500">Loading audit records...</div>
              ) : analystLogs.length === 0 ? (
                <div className="p-6 text-center text-slate-500">No security audit logs recorded for your account yet.</div>
              ) : (
                analystLogs.map((log) => (
                  <div key={log.id} className="p-3.5 hover:bg-slate-800/40 transition flex items-start gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold shrink-0 mt-0.5 ${
                        log.severity === 'SUCCESS'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : log.severity === 'WARNING'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : log.severity === 'ALERT'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {log.action}
                    </span>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-200 font-bold text-sm">
                          {log.actor} ➔ <span className="text-slate-300 font-medium">{log.target}</span>
                        </span>
                        <span className="text-xs text-slate-400 font-mono shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs font-sans leading-relaxed">{log.details}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Executive Role Workspace (Level 2 Strategic Oversight) */}
      {user?.role === 'Executive' && (
        <div className="space-y-6">
          {/* Top 4 KPI Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Enterprise Risk Score */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[145px]">
              <span className="text-sm font-bold text-slate-900 block">Enterprise Risk Score</span>
              <div className="flex items-center justify-between my-1">
                <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                  18.4 <span className="text-xl font-normal text-slate-600 font-sans">/ 25</span>
                </div>
                {/* Speedometer Gauge SVG matching screenshot */}
                <svg className="w-16 h-12 shrink-0 -mb-2" viewBox="0 0 100 60">
                  <path d="M 15 50 A 35 35 0 0 1 85 50" fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 15 50 A 35 35 0 0 1 85 50" fill="none" stroke="#059669" strokeWidth="8" strokeDasharray="110" strokeDashoffset="28" strokeLinecap="round" />
                  <line x1="50" y1="50" x2="72" y2="28" stroke="#064e3b" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="50" cy="50" r="4.5" fill="#064e3b" />
                </svg>
              </div>
              <span className="text-xs text-slate-500 font-medium">Critical limit is 25</span>
            </div>

            {/* Card 2: Total Defended Assets */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[145px]">
              <span className="text-sm font-bold text-slate-900 block">Total Defended Assets</span>
              <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight my-1">
                94
              </div>
              <span className="text-xs text-slate-500 font-medium">Fully Monitored</span>
            </div>

            {/* Card 3: SOC Defense Readiness */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[145px]">
              <span className="text-sm font-bold text-slate-900 block">SOC Defense Readiness</span>
              <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight my-1">
                92% Compliance
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block">
                  Meets Target
                </span>
              </div>
            </div>

            {/* Card 4: Active Threat Defense */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[145px]">
              <span className="text-sm font-bold text-slate-900 block">Active Threat Defense</span>
              <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight my-1 flex items-baseline gap-1.5">
                <span>4</span>
                <span className="text-xl font-bold text-orange-600">Critical</span>
              </div>
              <span className="text-xs text-slate-500 font-medium">Under mitigation</span>
            </div>
          </div>

          {/* Executive Quick Decision Hub ⚡ */}
          <div className="space-y-3 pt-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="text-lg">⚖</span>
              <span>Executive Quick Decision Hub</span>
              <span className="text-amber-500">⚡</span>
            </h3>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setShowBriefingModal(true)}
                className="px-6 py-2.5 rounded-full text-sm font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Generate Executive Security Brief</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSessionToast('SOC Threat Briefing request dispatched to On-Duty Security Operations personnel.');
                  setTimeout(() => setSessionToast(null), 5000);
                }}
                className="px-6 py-2.5 rounded-full text-sm font-bold bg-white hover:bg-emerald-50 text-emerald-800 border-2 border-emerald-500 transition active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Request SOC Threat Briefing</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSessionToast('Audit Attestation Verified: Enterprise conforms with ISO 27001, SOC 2, and NIST SP 800-63B standards.');
                  setTimeout(() => setSessionToast(null), 5000);
                }}
                className="px-6 py-2.5 rounded-full text-sm font-bold bg-white hover:bg-emerald-50 text-emerald-800 border-2 border-emerald-500 transition active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Review Audit Attestation</span>
              </button>
            </div>
          </div>

          {/* Bottom Grid: On-Duty Team Roster (Left) & Governance Audit Trail (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pt-2">
            {/* Left Column: On-Duty SOC Defense Team Roster */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-700" />
                <span>On-Duty SOC Defense Team Roster</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Member 1: Afri Alam (Analyst) */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-center flex flex-col items-center justify-between space-y-2">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
                      alt="Afri Alam"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://ui-avatars.com/api/?name=Afri+Alam&background=0284c7&color=fff';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs truncate">Afri Alam (Analyst)</div>
                    <div className="text-[11px] text-slate-500 font-mono truncate">analyst@riskradar.io</div>
                  </div>
                  <div>
                    <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                      Analyst
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-rose-600 flex items-center justify-center gap-1.5 pt-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>Active On-Call</span>
                  </div>
                </div>

                {/* Member 2: Mahabubur Rahman */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-center flex flex-col items-center justify-between space-y-2">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
                      alt="Mahabubur Rahman"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://ui-avatars.com/api/?name=Mahabubur+Rahman&background=e11d48&color=fff';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs truncate">Mahabubur Rahman</div>
                    <div className="text-[11px] text-slate-500 font-mono truncate">admin@riskradar.io</div>
                  </div>
                  <div>
                    <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      SOC Director
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-emerald-700 flex items-center justify-center gap-1.5 pt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Active On-Duty</span>
                  </div>
                </div>

                {/* Member 3: Afri Alam (SecOps) */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-center flex flex-col items-center justify-between space-y-2">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center">
                    <img
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150"
                      alt="Afri Alam"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://ui-avatars.com/api/?name=Afri+Alam&background=059669&color=fff';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs truncate">Afri Alam (SecOps)</div>
                    <div className="text-[11px] text-slate-500 font-mono truncate">afri.sec@riskradar.io</div>
                  </div>
                  <div>
                    <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Threat Response
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-emerald-700 flex items-center justify-center gap-1.5 pt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Active On-Duty</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: High-Impact Governance Audit Trail */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-700" />
                <span>High-Impact Governance Audit Trail</span>
              </h3>

              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden divide-y divide-slate-100">
                {/* Item 1 */}
                <div className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">Audit Completed</div>
                      <div className="text-xs text-slate-500 font-mono">Cyber Risk Review • Completed • executive_board</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-200 inline-block">
                      Success
                    </span>
                    <span className="block text-xs text-slate-400 font-mono mt-0.5">10m ago</span>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">Access Granted</div>
                      <div className="text-xs text-slate-500 font-mono">Secure Data Room • Granted • Executive Leader</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-blue-100 text-blue-700 border border-blue-200 inline-block">
                      info
                    </span>
                    <span className="block text-xs text-slate-400 font-mono mt-0.5">1h ago</span>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0 mt-0.5">
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">Policy Updated</div>
                      <div className="text-xs text-slate-500 font-mono">Asset Risk Strategy v3.4 • Updated • executive_board</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-purple-100 text-purple-700 border border-purple-200 inline-block">
                      Update
                    </span>
                    <span className="block text-xs text-slate-400 font-mono mt-0.5">4h ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auditor Role Workspace (Level 1 Compliance & Attestation) */}
      {user?.role === 'Auditor' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  CLEARANCE LEVEL 1
                </span>
                <span className="text-xs font-semibold text-slate-500 font-mono">
                  COMPLIANCE AUDIT
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 mt-1">
                <FileCheck2 className="w-6 h-6 text-amber-600" />
                <span>External Compliance & Security Audit Trail</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Read-only attestation workspace. Full verification access to immutable event logs with zero data modification permissions.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={handleSessionExtend}
                disabled={extendingSession}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{extendingSession ? 'Extending...' : 'Extend Session (+15m)'}</span>
              </button>
            </div>
          </div>

          {/* Auditor Clearance Matrix */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Auditor Regulatory Verification Scope (ISO 27001 / SOC 2)</h3>
            <p className="text-xs text-slate-500 mb-4">Strict enforcement of the Principle of Least Privilege: Auditors have full read-only transparency and zero destructive authority.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200">
                <span className="font-bold text-emerald-800 block mb-1">✓ Authorized Attestations</span>
                <p className="text-slate-600 leading-relaxed">
                  Verify cryptographic password policies (bcrypt 10 salt rounds), review all historical user authentication logs, attest to 15-minute idle timeout compliance.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">✕ Prohibited Modifications</span>
                <p className="text-slate-500 leading-relaxed">
                  Zero database write authority. Cannot alter risk ratings, modify user roles, delete log trails, or adjust security configuration settings.
                </p>
              </div>
            </div>
          </div>

          {/* Immutable Audit Log Terminal */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md text-slate-100">
            <div className="px-5 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-mono font-bold tracking-wider uppercase text-slate-100">Regulatory Compliance Audit Trail (Read-Only Attestation)</h3>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                IMMUTABLE AUDIT STREAM
              </span>
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/60 font-mono text-xs">
              {analystLogs.length === 0 ? (
                <div className="p-6 text-center text-slate-500">No security audit logs available for review.</div>
              ) : (
                analystLogs.map((log) => (
                  <div key={log.id} className="p-3.5 hover:bg-slate-800/40 transition flex items-start gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold shrink-0 mt-0.5 ${
                        log.severity === 'SUCCESS'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : log.severity === 'WARNING'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : log.severity === 'ALERT'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {log.action}
                    </span>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-200 font-bold text-sm">
                          {log.actor} ➔ <span className="text-slate-300 font-medium">{log.target}</span>
                        </span>
                        <span className="text-xs text-slate-400 font-mono shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs font-sans leading-relaxed">{log.details}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Module Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="bg-white border border-emerald-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-mono font-bold uppercase mb-2">
            <Lock className="w-4 h-4" />
            <span>Module 1 Completed</span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 mb-1">User Management & RBAC</h3><p className="text-sm text-slate-600 leading-relaxed">
            JWT session handling, password hashing, user registration, profile updates, and role-based permissions.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-mono font-bold uppercase mb-2">
            <Layers className="w-4 h-4" />
            <span>Module 2 (Upcoming)</span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-800 mb-1">Asset Inventory & Risks</h3><p className="text-sm text-slate-600 leading-relaxed">
            Hardware, software, and data asset tracking with risk lifecycle status workflows.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-mono font-bold uppercase mb-2">
            <Activity className="w-4 h-4" />
            <span>Module 3 (Upcoming)</span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-800 mb-1">Risk Scoring & Heatmap</h3><p className="text-sm text-slate-600 leading-relaxed">
            Dynamic 5 × 5 risk matrix, automated calculations, and PDF/CSV report exports.
          </p>
        </div>
      </div>

      {/* DIRECT USER PROVISIONING MODAL (Admin Path 2) */}
      {showProvisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Provision New Enterprise User</h3>
                  <p className="text-xs text-slate-500">Direct Admin Onboarding (Instant Active Account)</p>
                </div>
              </div>
              <button
                onClick={() => setShowProvisionModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleProvisionSubmit} className="p-6 space-y-4 text-xs">
              {provError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{provError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={provName}
                  onChange={(e) => setProvName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Corporate Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. s.jenkins@riskradar.io"
                  value={provEmail}
                  onChange={(e) => setProvEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Role (RBAC) *</label>
                  <select
                    value={provRole}
                    onChange={(e) => setProvRole(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Analyst">Analyst</option>
                    <option value="Admin">Admin</option>
                    <option value="Executive">Executive</option>
                    <option value="Auditor">Auditor</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Threat Intelligence"
                    value={provDept}
                    onChange={(e) => setProvDept(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Initial Temporary Password *</label>
                <div className="relative">
                  <input
                    type={showProvPassword ? 'text' : 'password'}
                    required
                    value={provPassword}
                    onChange={(e) => setProvPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowProvPassword(!showProvPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showProvPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Must meet 8+ char policy (uppercase, lowercase, number, symbol).</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Mandatory 2-Step MFA Policy</p>
                  <p className="text-[11px] text-slate-500">Require 6-digit OTP code on user login.</p>
                </div>
                <input
                  type="checkbox"
                  checked={provMfa}
                  onChange={(e) => setProvMfa(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowProvisionModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={provLoading}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25 transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {provLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                  <span>{provLoading ? 'Provisioning...' : 'Provision & Activate'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXECUTIVE SECURITY BRIEFING MODAL */}
      {showBriefingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Executive Cybersecurity Posture Brief</h3>
                  <p className="text-xs text-slate-500 font-mono">CLASSIFICATION: RESTRICTED • CISO BOARD OF DIRECTORS</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBriefingModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs text-slate-700 max-h-[75vh] overflow-y-auto">
              {/* Executive Summary Banner */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 text-sm">Strategic Posture Summary</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-200/80 text-emerald-800">
                    STATUS: DEFENDED
                  </span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Enterprise defense operations remain within acceptable risk parameters. Overall enterprise risk score is maintained at 18.4 / 25 under active mitigation strategies. All 94 critical assets are monitored with active containment protocols.
                </p>
              </div>

              {/* KPI Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="block text-[10px] font-mono font-bold text-slate-500 uppercase">Risk Score</span>
                  <span className="text-lg font-mono font-bold text-slate-900">18.4 / 25</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="block text-[10px] font-mono font-bold text-slate-500 uppercase">Defended Assets</span>
                  <span className="text-lg font-mono font-bold text-slate-900">94 Total</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="block text-[10px] font-mono font-bold text-slate-500 uppercase">SOC Readiness</span>
                  <span className="text-lg font-mono font-bold text-emerald-700">92% Target</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="block text-[10px] font-mono font-bold text-slate-500 uppercase">Active Threats</span>
                  <span className="text-lg font-mono font-bold text-orange-600">4 Critical</span>
                </div>
              </div>

              {/* Actionable Directives */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-mono">Executive Directives & Mitigation Timeline:</h4>
                <ul className="space-y-2 text-slate-600 list-disc list-inside">
                  <li><strong className="text-slate-800">CVE Remediation:</strong> SOC defense unit assigned to patch 4 critical perimeter assets within 48-hour SLA.</li>
                  <li><strong className="text-slate-800">RBAC Governance:</strong> Principle of Least Privilege strictly enforced across all 4 clearance tiers.</li>
                  <li><strong className="text-slate-800">Session Shielding:</strong> NIST SP 800-63B 15-minute rolling idle session renewal verified across all user accounts.</li>
                </ul>
              </div>

              {/* Attestation Stamp */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>AUDIT REF: RR-EXEC-2026-B1</span>
                <span>GENERATED: {new Date().toLocaleDateString()}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowBriefingModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Executive Brief</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
