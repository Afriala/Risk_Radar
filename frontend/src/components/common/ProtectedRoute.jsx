// Role-Based Protected Route Component - Enterprise Clean White Theme
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Shield } from 'lucide-react';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-700">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-600">Verifying RiskRadar Security Credentials...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated users are redirected directly to /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role authorization guard
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 p-6">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl p-8 text-center shadow-xl">
          <ShieldAlert className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied (403)</h2>
          <p className="text-slate-600 text-sm mb-4 leading-relaxed">
            Your role is <strong className="text-emerald-700 font-bold">{user?.role}</strong>. You do not possess sufficient clearance privileges to access this enterprise resource.
          </p>
          <a
            href="/"
            className="inline-block px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition shadow-sm"
          >
            Return to Authorized Workspace
          </a>
        </div>
      </div>
    );
  }

  return children;
}
