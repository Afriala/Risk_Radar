// RiskRadar - Login Portal
// Clean Corporate White Theme
// Features official branding, email validation, password verification, error handling & quick demo role selectors

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, ArrowRight, KeyRound, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click fill for presentation & testing
  const fillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-block mb-3">
          <img
            src="/riskradar-logo.jpg"
            alt="RiskRadar - See the Risk. Secure the Future."
            className="h-16 sm:h-20 w-auto mx-auto object-contain rounded-xl bg-white px-3.5 py-2 shadow-sm border border-slate-200 hover:scale-105 transition"
          />
        </Link>
        <p className="text-xs text-slate-500 uppercase tracking-widest font-mono font-semibold">
          Enterprise Security Access Portal
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white border border-slate-200 py-8 px-6 shadow-xl shadow-slate-200/70 rounded-2xl sm:px-10">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-600" />
            <span>Sign In to Access Security Workspace</span>
          </h2>

          {error && (
            <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Enterprise Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@riskradar.io"
                  className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <span className="text-[11px] text-slate-400 font-mono">Min 8 chars (#, abc, 123)</span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="••••••••••••"
                  className={`w-full bg-white border ${
                    error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20'
                  } rounded-lg pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && (
                <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-md shadow-emerald-600/20 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In Securely'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Role Selectors (1-Click Fill) */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2.5">
              Quick Role Demo (1-Click Fill)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => fillDemo('admin@riskradar.io')}
                className="p-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg transition text-left cursor-pointer"
              >
                👑 <strong>Admin</strong>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('analyst@riskradar.io')}
                className="p-2.5 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-800 rounded-lg transition text-left cursor-pointer"
              >
                🛡️ <strong>Analyst</strong>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('executive@riskradar.io')}
                className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg transition text-left cursor-pointer"
              >
                📊 <strong>Executive</strong>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('auditor@riskradar.io')}
                className="p-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-lg transition text-left cursor-pointer"
              >
                📑 <strong>Auditor</strong>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 text-center">
              Password for all demo accounts: <code className="text-slate-700 font-semibold bg-slate-100 px-1.5 py-0.5 rounded">Password123!</code>
            </p>
          </div>

          <div className="mt-6 text-center text-xs text-slate-600 flex items-center justify-between">
            <Link to="/" className="text-slate-600 hover:text-slate-900 transition">
              ← Back to Home
            </Link>
            <div>
              Need an account?{' '}
              <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-semibold underline">
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
