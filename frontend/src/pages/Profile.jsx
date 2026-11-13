// RiskRadar - User Profile & Security Credentials Page
// Clean Corporate White Theme
// Fulfills Requirements FR-06 & FR-07: Account credential updates, profile management,
// multi-factor security preferences, Developer/SOC API Keys, Alert preferences, and Active Session Guard

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/user.api';
import {
  User,
  Shield,
  KeyRound,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  Clock,
  Bell,
  Laptop,
  LogOut,
  Lock,
} from 'lucide-react';

export default function Profile() {
  const { user, refreshProfile, extendSession, logout } = useAuth();

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  // Security credentials fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityMsg, setSecurityMsg] = useState({ text: '', type: '' });
  const [securityLoading, setSecurityLoading] = useState(false);

  // MFA toggle
  const [mfaEnabled, setMfaEnabled] = useState(!!user?.mfaEnabled);

  // Developer & SOC API Key State (FR-06)
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [keyLoading, setKeyLoading] = useState(false);
  const [keyMsg, setKeyMsg] = useState({ text: '', type: '' });

  // Security Alert Preferences State (FR-06)
  const [alertPrefs, setAlertPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem('riskradar_alert_prefs');
      return saved ? JSON.parse(saved) : { criticalRisks: true, dailyDigest: true, anomalyAlerts: true };
    } catch {
      return { criticalRisks: true, dailyDigest: true, anomalyAlerts: true };
    }
  });
  const [alertToast, setAlertToast] = useState('');

  // Active Session Extender State (FR-07)
  const [extendingSession, setExtendingSession] = useState(false);
  const [sessionMsg, setSessionMsg] = useState('');

  // Fetch API Key on Mount
  useEffect(() => {
    userApi
      .getApiKey()
      .then((res) => {
        if (res.success && res.apiKey) {
          setApiKey(res.apiKey);
        }
      })
      .catch((err) => console.error('Failed to load API key:', err));
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ text: '', type: '' });
    setProfileLoading(true);

    try {
      const res = await userApi.updateProfile({ name, department });
      await refreshProfile();
      setProfileMsg({ text: res.message || 'Profile updated successfully.', type: 'success' });
    } catch (err) {
      setProfileMsg({ text: err.message, type: 'error' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setSecurityMsg({ text: '', type: '' });

    if (newPassword !== confirmPassword) {
      setSecurityMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]).{8,}$/;
    if (!PASSWORD_REGEX.test(newPassword)) {
      setSecurityMsg({
        text: 'New password must be at least 8 characters long and contain uppercase, lowercase, a number, and a special character (!@#$%^&*).',
        type: 'error',
      });
      return;
    }

    setSecurityLoading(true);
    try {
      const res = await userApi.updateCredentials({ currentPassword, newPassword });
      setSecurityMsg({ text: res.message || 'Password changed successfully.', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setSecurityMsg({ text: err.message, type: 'error' });
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleToggleMFA = async () => {
    const nextState = !mfaEnabled;
    try {
      await userApi.updateCredentials({ mfaEnabled: nextState });
      setMfaEnabled(nextState);
      await refreshProfile();
      setSecurityMsg({
        text: `MFA shield has been ${nextState ? 'enabled' : 'disabled'} for your account.`,
        type: 'success',
      });
    } catch (err) {
      setSecurityMsg({ text: err.message, type: 'error' });
    }
  };

  const handleCopyApiKey = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleRegenerateApiKey = async () => {
    if (!window.confirm('Are you sure you want to regenerate your SOC API Key? Existing integrations will immediately lose access.')) {
      return;
    }
    setKeyLoading(true);
    setKeyMsg({ text: '', type: '' });
    try {
      const res = await userApi.regenerateApiKey();
      if (res.success && res.apiKey) {
        setApiKey(res.apiKey);
        setKeyMsg({ text: res.message || 'API key successfully regenerated.', type: 'success' });
      }
    } catch (err) {
      setKeyMsg({ text: err.message || 'Failed to regenerate API key.', type: 'error' });
    } finally {
      setKeyLoading(false);
    }
  };

  const handleToggleAlert = (key) => {
    const updated = { ...alertPrefs, [key]: !alertPrefs[key] };
    setAlertPrefs(updated);
    try {
      localStorage.setItem('riskradar_alert_prefs', JSON.stringify(updated));
    } catch {}
    setAlertToast(`Notification preference for '${key}' updated.`);
    setTimeout(() => setAlertToast(''), 3000);
  };

  const handleExtendSessionClick = async () => {
    setExtendingSession(true);
    try {
      await extendSession();
      setSessionMsg('Active session successfully renewed (+15 mins) under NIST SP 800-63B policy.');
      setTimeout(() => setSessionMsg(''), 5000);
    } catch (err) {
      setSessionMsg('Failed to extend session: ' + err.message);
      setTimeout(() => setSessionMsg(''), 5000);
    } finally {
      setExtendingSession(false);
    }
  };

  return (
    <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-10 space-y-8 bg-white min-h-[calc(100vh-4rem)]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-semibold mb-2">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>SECURITY CREDENTIALS & PROFILE MANAGEMENT • FR-06 & FR-07</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <User className="w-7 h-7 text-emerald-600" />
            <span>User Profile & Security Governance</span>
          </h1>
          <p className="text-slate-600 text-sm mt-1 max-w-3xl leading-relaxed">
            Manage your personal enterprise identity, cryptographic passwords, 2-Step MFA protection, SOC API automation tokens, and active session duration.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExtendSessionClick}
            disabled={extendingSession}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{extendingSession ? 'Extending...' : 'Extend Session (+15m)'}</span>
          </button>
          <button
            type="button"
            onClick={() => logout()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-300 hover:border-red-200 text-xs font-bold transition active:scale-95 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Session Toast Notification */}
      {sessionMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{sessionMsg}</span>
        </div>
      )}

      {/* Main Grid: Left Account Card + Right Functional Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Account Summary Card & Device Security */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 font-extrabold text-2xl">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-900 truncate">{user?.name}</h2>
                <p className="text-xs text-slate-500 font-mono truncate">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {user?.role} Role
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-200 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Department</span>
                <span className="text-slate-900 font-semibold">{user?.department || 'Information Security'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Account ID</span>
                <span className="text-slate-500 font-mono">{user?.id?.substring(0, 14)}...</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Account Status</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Active & Approved
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">MFA Shield</span>
                <span
                  className={`px-2 py-0.5 rounded font-mono font-bold ${
                    mfaEnabled
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {mfaEnabled ? 'ENABLED' : 'OFF'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Clearance Level</span>
                <span className="font-mono text-slate-700 font-bold">
                  {user?.role === 'Admin'
                    ? 'Level 4 (Admin Governance)'
                    : user?.role === 'Analyst'
                    ? 'Level 3 (SOC Operations)'
                    : user?.role === 'Executive'
                    ? 'Level 2 (Executive KPI)'
                    : 'Level 1 (Auditor)'}
                </span>
              </div>
            </div>
          </div>

          {/* Active Session & Device Information Card (FR-07) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-xs">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Laptop className="w-4 h-4 text-emerald-600" />
              <span>Active Session & Device Guard (FR-07)</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Your session is isolated to this browser window tab using <code className="text-emerald-700 font-mono">sessionStorage</code>. Closing the tab immediately destroys the cryptographic token.
            </p>

            <div className="space-y-2.5 pt-2 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Device Environment</span>
                <span className="font-semibold text-slate-800">Windows 11 / Chrome</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Inactivity Timeout</span>
                <span className="font-mono font-bold text-emerald-700">15-Min Rolling (NIST)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Auth Token Protocol</span>
                <span className="font-mono text-slate-700">JWT + 2-Step Challenge</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExtendSessionClick}
              disabled={extendingSession}
              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold text-xs transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{extendingSession ? 'Extending...' : 'Extend Active Session (+15m)'}</span>
            </button>
          </div>
        </div>

        {/* Right 2 Columns: Profile Details, Password, MFA, API Key, Alerts */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Basic Profile Details */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              <span>Personal Identity & Department (FR-06)</span>
            </h3>

            {profileMsg.text && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                  profileMsg.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {profileMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Enterprise Email (Immutable)</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {profileLoading ? 'Saving...' : 'Update Profile Details'}
              </button>
            </form>
          </div>

          {/* Section 2: Security Credentials & Password */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-emerald-600" />
              <span>Rotate Security Password (Cryptographic Policy)</span>
            </h3>

            {securityMsg.text && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                  securityMsg.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {securityMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{securityMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">New Password (8+ Chars)</label>
                  <input
                    type="password"
                    required
                    placeholder="Uppercase, lowercase, number, symbol"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={securityLoading}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                {securityLoading ? 'Verifying...' : 'Set New Cryptographic Password'}
              </button>
            </form>
          </div>

          {/* Section 3: 2-Step Multi-Factor Authentication (MFA) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-600" />
                <span>2-Step Multi-Factor Authentication (MFA Shield)</span>
              </h4>
              <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                Requires a 6-digit verification code sent via secure challenge on every login, protecting your account against credential theft.
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleMFA}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition uppercase tracking-wider cursor-pointer border ${
                mfaEnabled
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
            >
              {mfaEnabled ? '✓ MFA Shield Enabled' : 'Enable MFA Shield'}
            </button>
          </div>

          {/* Section 4: Personal Developer & SOC API Key (FR-06) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Key className="w-5 h-5 text-cyan-600" />
                  <span>Personal SOC & Developer API Key (FR-06)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Authorize automated scripts, SIEM ingestion pipelines, and vulnerability scanners using your personal bearer token.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-50 text-cyan-800 border border-cyan-200 shrink-0">
                SCOPES: READ/WRITE
              </span>
            </div>

            {keyMsg.text && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  keyMsg.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {keyMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{keyMsg.text}</span>
              </div>
            )}

            {/* API Key Box */}
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 flex items-center justify-between">
                <span>
                  {showApiKey
                    ? apiKey || 'rr_live_soc_analyst_••••••••••••••••'
                    : apiKey
                    ? `${apiKey.substring(0, 15)}••••••••••••••••••••••••`
                    : 'Loading token...'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="text-slate-400 hover:text-slate-700 transition ml-2 cursor-pointer"
                  title={showApiKey ? 'Hide key' : 'Show full key'}
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopyApiKey}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={handleRegenerateApiKey}
                disabled={keyLoading}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${keyLoading ? 'animate-spin' : ''}`} />
                <span>Regenerate</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px] font-mono">
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                scope: threats:read-write
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                scope: assets:read-write
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                scope: audit:read-own
              </span>
            </div>
          </div>

          {/* Section 5: SOC Security Notification & Alert Preferences (FR-06) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-600" />
              <span>SOC Security Notification Preferences</span>
            </h4>
            <p className="text-xs text-slate-500">
              Customize real-time dispatch channels for automated risk alerts and threat intelligence feeds.
            </p>

            {alertToast && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{alertToast}</span>
              </div>
            )}

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition">
                <div>
                  <strong className="text-slate-900 block">Critical CVSS Risk In-App Alerts</strong>
                  <span className="text-slate-500">Instant visual alert banner when a High/Critical CVE is logged.</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleAlert('criticalRisks')}
                  className={`px-3 py-1 rounded-lg font-bold font-mono transition cursor-pointer text-xs ${
                    alertPrefs.criticalRisks
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {alertPrefs.criticalRisks ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition">
                <div>
                  <strong className="text-slate-900 block">Daily Morning SOC Threat Digest Email</strong>
                  <span className="text-slate-500">Daily 08:00 AM summary of catalogued vulnerabilities and heatmaps.</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleAlert('dailyDigest')}
                  className={`px-3 py-1 rounded-lg font-bold font-mono transition cursor-pointer text-xs ${
                    alertPrefs.dailyDigest
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {alertPrefs.dailyDigest ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition">
                <div>
                  <strong className="text-slate-900 block">Session & Unrecognized IP Login Alerts</strong>
                  <span className="text-slate-500">Immediate security email if account is accessed from a new device or IP.</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleAlert('anomalyAlerts')}
                  className={`px-3 py-1 rounded-lg font-bold font-mono transition cursor-pointer text-xs ${
                    alertPrefs.anomalyAlerts
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {alertPrefs.anomalyAlerts ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
