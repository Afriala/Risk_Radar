// RiskRadar - Role-Based Security Workspace (Dashboard)
// Demonstrates RBAC (Requirement 4) in action for Admin, Analyst, Executive, and Auditor
// Clean Corporate White Theme

import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // If user is Admin, fetch all registered users to demonstrate RBAC
  useEffect(() => {
    if (user?.role === 'Admin') {
      setLoadingUsers(true);
      userApi
        .listUsers()
        .then((res) => {
          if (res.success) setAllUsers(res.users);
        })
        .catch((err) => console.error('Failed to load users:', err))
        .finally(() => setLoadingUsers(false));
    }
  }, [user]);

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
        </div>
      </div>

      {/* Role-Specific Workspace View */}
      {user?.role === 'Admin' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-red-600" />
                <span>Admin User Management (RBAC Directory)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Restricted to Admin role only. Demonstrates RBAC enforcement from Module 1.
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 font-bold self-start sm:self-auto">
              Admin Privilege Level: 4
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {loadingUsers ? (
              <div className="p-8 text-center text-slate-500 text-sm">Loading user directory...</div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-sm text-slate-700 min-w-[640px]">
                  <thead className="bg-slate-50 text-xs uppercase font-mono text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 font-semibold whitespace-nowrap">User</th>
                      <th className="py-3 px-4 font-semibold whitespace-nowrap">Email</th>
                      <th className="py-3 px-4 font-semibold whitespace-nowrap">Role</th>
                      <th className="py-3 px-4 font-semibold whitespace-nowrap">Department</th>
                      <th className="py-3 px-4 font-semibold whitespace-nowrap">MFA</th>
                      <th className="py-3 px-4 font-semibold whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-normal">
                    {allUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">{u.name}</td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-500 whitespace-nowrap">{u.email}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold border ${
                              u.role === 'Admin'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : u.role === 'Analyst'
                                ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                                : u.role === 'Executive'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{u.department}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`text-xs font-mono font-bold ${
                              u.mfaEnabled ? 'text-emerald-700' : 'text-slate-400'
                            }`}
                          >
                            {u.mfaEnabled ? 'ENABLED' : 'OFF'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

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
