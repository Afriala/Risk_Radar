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
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [adminFeedback, setAdminFeedback] = useState(null); // { text, type: 'success' | 'error' }
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [copiedInvite, setCopiedInvite] = useState(false);

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

  useEffect(() => {
    if (user?.role === 'Admin') {
      fetchUsers();
      fetchLogs();
    }
  }, [user?.role, fetchUsers, fetchLogs]);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-white min-h-[calc(100vh-4rem)]">
      {/* Welcome & Role Banner - Clean White Corporate */}
      <div className="bg-gradient-to-r from-slate-50 via-white to-emerald-50/50 border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>SESSION AUTHENTICATED • MODULE 1 ACTIVE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Welcome back, <span className="text-emerald-600">{user?.name}</span>
          </h1>
          <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
            You are operating under the{' '}
            <strong className="text-slate-900 font-semibold">{user?.role}</strong> role in the{' '}
            <span className="text-emerald-700 font-mono font-medium">{user?.department}</span> department.
            Granular access controls enforce role-specific capabilities.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-center shadow-sm">
            <span className="block text-xs text-slate-500 uppercase tracking-wider font-mono">Assigned Role</span>
            <span className="text-base font-bold text-emerald-600">{user?.role}</span>
          </div>
          <div className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-center shadow-sm">
            <span className="block text-xs text-slate-500 uppercase tracking-wider font-mono">MFA Shield</span>
            <span className={`text-base font-bold ${user?.mfaEnabled ? 'text-emerald-600' : 'text-amber-600'}`}>
              {user?.mfaEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-center shadow-sm">
            <span className="block text-xs text-slate-500 uppercase tracking-wider font-mono">Session Guard</span>
            <span className="text-base font-bold text-emerald-600">Active (15m Idle)</span>
          </div>
        </div>
      </div>

      {/* Role-Specific Workspace View */}
      {user?.role === 'Admin' && (
        <div className="space-y-6">
          {/* Admin Header with Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-red-600" />
                <span>Admin User Management & RBAC Governance</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Restricted to Admin Level 4. Manage user approvals, role assignments, MFA policies, and account access.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Organization Invite Code Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono">
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers || loadingLogs ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Feedback Banner */}
          {adminFeedback && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 shadow-sm transition-all animate-fadeIn ${
                adminFeedback.type === 'success'
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
                  <thead className="bg-slate-50 text-xs uppercase font-mono text-slate-600 border-b border-slate-200">
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
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isSelf && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono">
                              Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                            </span>
                          </td>

                          {/* Email */}
                          <td className="py-3.5 px-4 font-mono text-xs text-slate-600 whitespace-nowrap">{u.email}</td>

                          {/* Role Dropdown (RBAC) */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {isSelf ? (
                              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold border bg-red-50 text-red-700 border-red-200 inline-block">
                                Admin (Protected)
                              </span>
                            ) : (
                              <div className="relative inline-block">
                                <select
                                  value={u.role}
                                  disabled={actionLoadingId === u.id}
                                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                  className={`text-xs font-mono font-bold py-1 px-2.5 pr-7 rounded-lg border appearance-none cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                                    u.role === 'Admin'
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
                          <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap font-medium">
                            {u.department}
                          </td>

                          {/* MFA Shield Toggle */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <button
                              onClick={() => handleToggleMfa(u.id, u.mfaEnabled)}
                              disabled={actionLoadingId === u.id}
                              title="Click to toggle mandatory MFA policy"
                              className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border transition hover:scale-105 active:scale-95 cursor-pointer ${
                                u.mfaEnabled
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
                                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-300 animate-pulse">
                                  Pending Approval
                                </span>
                              </div>
                            ) : isSuspended ? (
                              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-red-50 text-red-700 border border-red-300">
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
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition active:scale-95 cursor-pointer ${
                                    u.isActive
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
                <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-200">
                  System Security Audit Trail (SOC Real-Time Log)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
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
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 mt-0.5 ${
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
                        <span className="text-slate-300 font-semibold">
                          {log.actor} ➔ <span className="text-slate-400 font-normal">{log.target}</span>
                        </span>
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] font-sans">{log.details}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analyst Role Workspace */}
      {user?.role === 'Analyst' && (
        <div className="bg-white border border-cyan-200 rounded-2xl p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Cybersecurity Analyst Operations</h2>
              <p className="text-xs text-slate-500">Threat Logging & Asset Management Center</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            As an <strong>Analyst</strong>, you are authorized to log cyber threats, manage enterprise asset
            inventories (hardware, software, data), and track risk lifecycles from <em>Identified</em> to <em>Resolved</em>.
          </p>
          <div className="p-4 bg-cyan-50/60 border border-cyan-200 rounded-xl text-xs text-cyan-900 leading-relaxed">
            📌 <strong>Module 1 Status:</strong> Authentication and Analyst RBAC privileges verified. Modules 2 & 3 (Asset CRUD, Threat Logging, and Dynamic Heatmaps) will plug into this authorized workspace.
          </div>
        </div>
      )}

      {/* Executive Role Workspace */}
      {user?.role === 'Executive' && (
        <div className="bg-white border border-emerald-200 rounded-2xl p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Executive Risk & KPI Insights</h2>
              <p className="text-xs text-slate-500">Strategic Decision-Making Dashboard</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            As an <strong>Executive</strong>, you consume high-level KPI metrics, heatmaps, and automated PDF reports to drive enterprise security investments.
          </p>
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs text-emerald-900 leading-relaxed">
            📌 <strong>Module 1 Status:</strong> Executive session authenticated with role-based restriction. Heatmap and Report Export modules will display here.
          </div>
        </div>
      )}

      {/* Auditor Role Workspace */}
      {user?.role === 'Auditor' && (
        <div className="bg-white border border-amber-200 rounded-2xl p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">External Compliance & Audit Trail</h2>
              <p className="text-xs text-slate-500">Immutable Historical Logs & Verification</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            As an <strong>Auditor</strong>, your role provides read-only verification access to security compliance postures, audit logs, and risk lifecycle records.
          </p>
          <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
            📌 <strong>Module 1 Status:</strong> Auditor credentials and read-only compliance access verified.
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
          <h3 className="text-base font-bold text-slate-900 mb-1">User Management & RBAC</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            JWT session handling, password hashing, user registration, profile updates, and role-based permissions.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-mono font-bold uppercase mb-2">
            <Layers className="w-4 h-4" />
            <span>Module 2 (Upcoming)</span>
          </div>
          <h3 className="text-base font-bold text-slate-700 mb-1">Asset Inventory & Risks</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Hardware, software, and data asset tracking with risk lifecycle status workflows.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-mono font-bold uppercase mb-2">
            <Activity className="w-4 h-4" />
            <span>Module 3 (Upcoming)</span>
          </div>
          <h3 className="text-base font-bold text-slate-700 mb-1">Risk Scoring & Heatmap</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Dynamic 5 × 5 risk matrix, automated calculations, and PDF/CSV report exports.
          </p>
        </div>
      </div>
    </div>
  );
}
