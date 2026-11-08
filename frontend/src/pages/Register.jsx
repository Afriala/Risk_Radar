// RiskRadar - Enterprise Personnel Registration
// Strict Cybersecurity Specification:
// 1. Mandatory Enterprise Admin Invite / Authorization Code (e.g. RR-ORG-2026)
// 2. Strict 8+ Character Password Complexity Policy with live checklist & eye toggle
// 3. Restricted Registration: Accounts created in 'pending_approval' (isActive: false)
// 4. No auto-login or bypass: Displays clear Pending Admin Verification confirmation screen

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  UserPlus,
  Mail,
  KeyRound,
  Building,
  UserCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ArrowRight,
  ArrowLeft,
  Key,
} from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    inviteCode: '',
    department: 'Cyber Defense',
    role: 'Analyst',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState(null); // When set, displays Pending Approval view

  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
    if (fieldError) setFieldError('');
  };

  // Password Complexity Evaluation
  const password = formData.password;
  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
  const isPasswordValid = hasMinLen && hasUpper && hasLower && hasNumber && hasSpecial;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldError('');

    if (!formData.inviteCode.trim()) {
      setError('Enterprise Admin Invite / Authorization Code is required.');
      setFieldError('inviteCode');
      return;
    }

    if (!isPasswordValid) {
      setError('Password must satisfy all 5 enterprise security requirements.');
      setFieldError('password');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        inviteCode: formData.inviteCode.trim(),
        department: formData.department.trim(),
        role: formData.role,
      });

      if (res.success && res.pendingApproval) {
        setSubmittedData({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          department: formData.department,
        });
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
      if (err.field) setFieldError(err.field);
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
          Personnel Clearance Onboarding Portal
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-white border border-slate-200 py-8 px-6 shadow-xl shadow-slate-200/70 rounded-2xl sm:px-10">

          {/* VIEW A: REGISTRATION SUBMITTED (PENDING APPROVAL) */}
          {submittedData ? (
            <div className="text-center space-y-5 animate-in fade-in duration-200">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center mx-auto shadow-sm">
                <Clock className="w-8 h-8 text-amber-600 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-900">
                  Registration Submitted for Approval
                </h2>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Your account has been registered with status <strong className="font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">pending_approval</strong>.
                </p>
              </div>

              {/* Security Policy Explanatory Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800 border-b border-slate-200 pb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Enterprise Security Compliance Protocol</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  To prevent unauthorized public access, a <strong>System Administrator</strong> must verify your organizational credentials and activate your personnel clearance before you can sign in to the RiskRadar workspace.
                </p>
                <div className="pt-2 border-t border-slate-200 font-mono text-[11px] text-slate-500 grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400">Personnel:</span> {submittedData.name}
                  </div>
                  <div>
                    <span className="text-slate-400">Email:</span> {submittedData.email}
                  </div>
                  <div>
                    <span className="text-slate-400">Role:</span> {submittedData.role}
                  </div>
                  <div>
                    <span className="text-slate-400">Status:</span> Pending Verification
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3">
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-md shadow-emerald-600/20"
                >
                  <span>Return to Sign In Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            /* VIEW B: PERSONNEL ONBOARDING FORM */
            <div>
              <div className="mb-6 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-900">Personnel Clearance Application</h2>
              </div>

              {error && (
                <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Afri Alam Dipto"
                      className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                    />
                  </div>
                </div>

                {/* Corporate Email */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Enterprise Corporate Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="analyst@organization.io"
                      className={`w-full bg-white border ${
                        fieldError === 'email' ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20'
                      } rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition`}
                    />
                  </div>
                  {fieldError === 'email' && (
                    <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
                  )}
                </div>

                {/* Enterprise Authorization Code */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Enterprise Admin Authorization Code
                    </label>
                    <span className="text-[11px] text-emerald-700 font-mono font-semibold">e.g. RR-ORG-2026</span>
                  </div>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      name="inviteCode"
                      required
                      value={formData.inviteCode}
                      onChange={handleChange}
                      placeholder="RR-ORG-2026"
                      className={`w-full bg-white border ${
                        fieldError === 'inviteCode' ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20'
                      } rounded-lg pl-10 pr-3.5 py-2.5 text-sm font-mono uppercase text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition`}
                    />
                  </div>
                  {fieldError === 'inviteCode' && (
                    <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
                  )}
                </div>

                {/* Department & Role */}
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
                        placeholder="Information Security"
                        className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                      Clearance Role
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                    >
                      <option value="Analyst">Security Analyst</option>
                      <option value="Executive">Executive / Management</option>
                      <option value="Auditor">Compliance Auditor</option>
                      <option value="Admin">System Administrator</option>
                    </select>
                  </div>
                </div>

                {/* Password with Eye Toggle & Live 5-Point Checklist */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Secure Password
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">Policy: 8+ chars</span>
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

                  {/* Real-time 5-Point Password Policy Checklist */}
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <p className="text-[11px] font-semibold text-slate-700 mb-1">
                      Enterprise Password Policy:
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      <span className={`flex items-center gap-1.5 font-medium ${hasMinLen ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                        {hasMinLen ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-0.5"></span>}
                        Min 8 characters
                      </span>
                      <span className={`flex items-center gap-1.5 font-medium ${hasUpper ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                        {hasUpper ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-0.5"></span>}
                        Uppercase (A–Z)
                      </span>
                      <span className={`flex items-center gap-1.5 font-medium ${hasLower ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                        {hasLower ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-0.5"></span>}
                        Lowercase (a–z)
                      </span>
                      <span className={`flex items-center gap-1.5 font-medium ${hasNumber ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                        {hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-0.5"></span>}
                        Number (0–9)
                      </span>
                      <span className={`flex items-center gap-1.5 font-medium col-span-2 ${hasSpecial ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                        {hasSpecial ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-0.5"></span>}
                        Special symbol (!@#$%^&*)
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !isPasswordValid}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-md shadow-emerald-600/20 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  {loading ? 'Submitting Application...' : 'Submit Application for Admin Approval'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-200 pt-5">
                <span>Already an authorized personnel? </span>
                <Link to="/login" className="font-semibold text-emerald-700 hover:underline">
                  Sign In with Credentials
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
