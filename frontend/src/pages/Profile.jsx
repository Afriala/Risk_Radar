// RiskRadar - User Profile & Security Credentials Page
// Clean Corporate White Theme
// Fulfills Requirement: Account credential updates, profile management, and multi-factor security preferences

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/user.api';
import { User, Shield, KeyRound, Smartphone, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Profile() {
  const { user, refreshProfile } = useAuth();

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

    if (newPassword.length < 6) {
      setSecurityMsg({ text: 'New password must be at least 6 characters.', type: 'error' });
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
      await userApi.updateProfile({ mfaEnabled: nextState });
      setMfaEnabled(nextState);
      await refreshProfile();
      setSecurityMsg({
        text: `MFA has been ${nextState ? 'enabled' : 'disabled'} for your account.`,
        type: 'success',
      });
    } catch (err) {
      setSecurityMsg({ text: err.message, type: 'error' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8 bg-white min-h-[calc(100vh-4rem)]">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <User className="w-6 h-6 text-emerald-600" />
          <span>User Profile & Security Credentials</span>
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          Manage your enterprise identity, access privileges, and multi-factor security credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Account Summary Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 h-fit shadow-sm">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 font-bold text-xl">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
              <p className="text-xs text-slate-500 font-mono">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-200 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Assigned Role</span>
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {user?.role}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Department</span>
              <span className="text-slate-900 font-semibold">{user?.department}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Account ID</span>
              <span className="text-xs text-slate-500 font-mono">{user?.id?.substring(0, 12)}...</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">MFA Status</span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded font-mono font-bold ${
                  mfaEnabled ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}
              >
                {mfaEnabled ? 'ACTIVE' : 'OFF'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Columns: Forms */}
        <div className="md:col-span-2 space-y-8">
          {/* Section 1: Basic Profile Details */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              <span>Personal Information</span>
            </h3>

            {profileMsg.text && (
              <div
                className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
                  profileMsg.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {profileMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Enterprise Email (Immutable)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-500 cursor-not-allowed font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {profileLoading ? 'Saving...' : 'Update Profile Details'}
              </button>
            </form>
          </div>

          {/* Section 2: Security Credentials & Password */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-emerald-600" />
              <span>Change Security Password</span>
            </h3>

            {securityMsg.text && (
              <div
                className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
                  securityMsg.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {securityMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                <span>{securityMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={securityLoading}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition disabled:opacity-50 cursor-pointer"
              >
                {securityLoading ? 'Verifying...' : 'Set New Password'}
              </button>
            </form>
          </div>

          {/* Section 3: Multi-Factor Authentication (MFA) Preferences */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Multi-Factor Authentication (MFA)</span>
              </h4>
              <p className="text-xs text-slate-500 max-w-md">
                Adds an additional layer of security by requiring multi-factor authentication upon sign-in.
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleMFA}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition uppercase tracking-wider cursor-pointer border ${
                mfaEnabled
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
            >
              {mfaEnabled ? '✓ MFA Enabled' : 'Enable MFA'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
