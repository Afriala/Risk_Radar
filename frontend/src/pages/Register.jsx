// RiskRadar - User Registration Page
// Clean Corporate White Theme
// Features full registration workflow, email verification check, department & role assignment

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, KeyRound, Building, UserCheck, AlertCircle, Activity } from 'lucide-react';

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
  const [wakingUp, setWakingUp] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setWakingUp(false);

    // If server is cold-sleeping, alert the user after 2.5s that it's spinning up
    const wakeTimer = setTimeout(() => {
      setWakingUp(true);
    }, 2500);

    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      clearTimeout(wakeTimer);
      setLoading(false);
      setWakingUp(false);
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Secure Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                />
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
              {loading ? (wakingUp ? 'Waking Cloud Server...' : 'Creating Account...') : 'Complete Registration & Launch'}
            </button>

            {loading && wakingUp && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 animate-pulse">
                <Activity className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-amber-900">Cloud backend is waking up (Cold Start)</p>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    Render Free Tier spins down after 15 min of inactivity. Initial boot takes ~25-35s — once awake, all operations are instant!
                  </p>
                </div>
              </div>
            )}
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
