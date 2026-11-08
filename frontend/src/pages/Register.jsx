// RiskRadar - User Registration Page
// Clean Corporate White Theme
// Features full registration workflow, email verification check, department & role assignment

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, KeyRound, Building, UserCheck, AlertCircle, Eye, EyeOff, Check } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Cyber Defense',
    role: 'Analyst',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  // Live password validation checks
  const password = formData.password;
  const hasMinLen = password.length >= 8;
  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
  const isPasswordValid = hasMinLen && hasLetters && hasNumbers && hasSpecial;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('Password must be at least 8 characters long and include a combination of letters (abc), numbers (123), and a special symbol (like #, @, $, !).');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
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
          Personnel Onboarding Portal
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-white border border-slate-200 py-8 px-6 shadow-xl shadow-slate-200/70 rounded-2xl sm:px-10">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            <span>Create RiskRadar Account</span>
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
                Full Name
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Afri Alam"
                  className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Enterprise Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="afri@organization.com"
                  className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Secure Password
                </label>
                <span className="text-[11px] text-slate-400 font-mono">Min 8 chars (#, abc, 123)</span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="e.g. SecurePass#2026"
                  className={`w-full bg-white border ${
                    formData.password && !isPasswordValid
                      ? 'border-amber-300 focus:border-amber-500 focus:ring-amber-500/20'
                      : formData.password && isPasswordValid
                      ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/20'
                      : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20'
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

              {/* Real-time Password Requirements Checklist */}
              <div className="mt-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <p className="text-[11px] font-semibold text-slate-600 mb-1">Password Requirements:</p>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <span className={`flex items-center gap-1.5 font-medium ${hasMinLen ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                    {hasMinLen ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-0.5"></span>}
                    At least 8 chars
                  </span>
                  <span className={`flex items-center gap-1.5 font-medium ${hasLetters ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                    {hasLetters ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-0.5"></span>}
                    Letters (a-z, A-Z)
                  </span>
                  <span className={`flex items-center gap-1.5 font-medium ${hasNumbers ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                    {hasNumbers ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-0.5"></span>}
                    Numbers (0-9)
                  </span>
                  <span className={`flex items-center gap-1.5 font-medium ${hasSpecial ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                    {hasSpecial ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-0.5"></span>}
                    Special symbol (#, @, !)
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Department
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="e.g. IT Security"
                    className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Initial Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                >
                  <option value="Analyst">Analyst (Threat Logger)</option>
                  <option value="Executive">Executive (KPI Viewer)</option>
                  <option value="Auditor">Auditor (Compliance)</option>
                  <option value="Admin">Admin (System Access)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-md shadow-emerald-600/20 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              {loading ? 'Creating Account...' : 'Complete Registration & Launch'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
