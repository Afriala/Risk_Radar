// RiskRadar - Enterprise Password Recovery Portal
// 3-Step Verification: 1. Verify Registered Email -> 2. Verify 6-Digit OTP -> 3. Set New 8+ Char Password

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import {
  KeyRound,
  Mail,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Check,
  Lock,
  RefreshCw,
} from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [simulatedCode, setSimulatedCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Password complexity checks
  const hasMinLen = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newPassword);
  const passwordsMatch = newPassword && newPassword === confirmPassword;
  const isPasswordValid = hasMinLen && hasUpper && hasLower && hasNumber && hasSpecial;

  // Step 1: Submit Email
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldError('');
    setLoading(true);

    try {
      const res = await authApi.forgotPassword({ email: email.trim() });
      if (res.success) {
        if (res.resetCode) {
          setSimulatedCode(res.resetCode);
        }
        setStep(2);
      }
    } catch (err) {
      setError(err.message || 'Failed to verify email address.');
      if (err.field) setFieldError(err.field);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify 6-digit Code
  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.verifyResetCode({ email: email.trim(), code: code.trim() });
      if (res.success) {
        setStep(3);
      }
    } catch (err) {
      setError(err.message || 'Invalid 6-digit verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Resend Code Handler
  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setError('');
    try {
      const res = await authApi.forgotPassword({ email: email.trim() });
      if (res.resetCode) {
        setSimulatedCode(res.resetCode);
      }
      setResendCooldown(30);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError('Could not resend code. Please try again.');
    }
  };

  // Step 3: Set New Password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('Password does not satisfy all enterprise complexity requirements.');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match. Please retype carefully.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.resetPassword({
        email: email.trim(),
        code: code.trim(),
        newPassword,
      });

      if (res.success) {
        navigate('/login?reset=success');
      }
    } catch (err) {
      setError(err.message || 'Failed to update password.');
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
            alt="RiskRadar Logo"
            className="h-16 sm:h-20 w-auto mx-auto object-contain rounded-xl bg-white px-3.5 py-2 shadow-sm border border-slate-200"
          />
        </Link>
        <p className="text-xs text-slate-500 uppercase tracking-widest font-mono font-semibold">
          Enterprise Security Recovery Portal
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white border border-slate-200 py-8 px-6 shadow-xl shadow-slate-200/70 rounded-2xl sm:px-10">

          {/* Stepper Progress Header */}
          <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between text-xs">
            <span className={`font-semibold flex items-center gap-1.5 ${step === 1 ? 'text-emerald-700' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${step >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                1
              </span>
              Verify Email
            </span>
            <span className="text-slate-300">──</span>
            <span className={`font-semibold flex items-center gap-1.5 ${step === 2 ? 'text-emerald-700' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${step >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                2
              </span>
              6-Digit OTP
            </span>
            <span className="text-slate-300">──</span>
            <span className={`font-semibold flex items-center gap-1.5 ${step === 3 ? 'text-emerald-700' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${step === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                3
              </span>
              New Password
            </span>
          </div>

          {/* Top Error Alert */}
          {error && (
            <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Simulated Security Toast (For Academic & Demo Verification) */}
          {simulatedCode && step >= 2 && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs shadow-sm">
              <div className="flex items-center gap-2 font-bold text-emerald-800 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Enterprise Security Dispatch (Simulated Email)</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Your single-use 6-digit identity recovery code is:
              </p>
              <div className="mt-2 py-1.5 px-3 bg-white rounded-lg border border-emerald-300 text-center font-mono text-lg font-black text-emerald-700 tracking-widest select-all">
                {simulatedCode}
              </div>
            </div>
          )}

          {/* STEP 1: VERIFY EMAIL */}
          {step === 1 && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Reset Credentials</h3>
                <p className="text-xs text-slate-500">
                  Enter your registered corporate email to receive a 6-digit identity verification code.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Corporate Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                      if (fieldError) setFieldError('');
                    }}
                    placeholder="e.g. analyst@riskradar.io"
                    className={`w-full bg-white border ${
                      fieldError === 'email' ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20'
                    } rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition`}
                  />
                </div>
                {fieldError === 'email' && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{error || 'This email address is not registered in the RiskRadar directory.'}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Validating Directory...' : 'Send Verification Code'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </form>
          )}

          {/* STEP 2: VERIFY 6-DIGIT CODE */}
          {step === 2 && (
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Enter Security Code</h3>
                <p className="text-xs text-slate-500">
                  Please enter the 6-digit security OTP code dispatched for <strong className="text-slate-700 font-mono">{email}</strong>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  6-Digit OTP Code
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.replace(/\D/g, ''));
                      if (error) setError('');
                    }}
                    placeholder="123456"
                    className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-3.5 py-2.5 text-base font-mono tracking-widest text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition text-center"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0}
                  className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-slate-500 hover:text-slate-800"
                >
                  Change email
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Verifying Code...' : 'Verify & Continue'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 3: SET NEW 8+ CHAR PASSWORD */}
          {step === 3 && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Set New Password</h3>
                <p className="text-xs text-slate-500">
                  Create a new password that satisfies all enterprise cybersecurity policies.
                </p>
              </div>

              {/* New Password Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Enter at least 8 characters"
                    className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Live Password Checklist */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <p className="text-[11px] font-semibold text-slate-600 mb-1">Complexity Requirements:</p>
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

              {/* Confirm Password Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Retype new password"
                    className={`w-full bg-white border ${
                      confirmPassword && !passwordsMatch
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20'
                    } rounded-lg pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="mt-1 text-xs text-red-600 font-medium">Passwords do not match.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !isPasswordValid || !passwordsMatch}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Updating Credentials...' : 'Save & Secure Account'}
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
