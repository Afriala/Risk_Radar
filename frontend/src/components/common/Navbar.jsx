// RiskRadar - Cybersecurity Top Navigation Bar (Authenticated State)
// Clean Corporate White Theme with Full Device Responsiveness (PC & Mobile)

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  LogOut,
  LayoutDashboard,
  Globe,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

const roleBadgeColors = {
  Admin: 'bg-red-50 text-red-700 border-red-200',
  Analyst: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Executive: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Auditor: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const hideOnRoutes = ['/', '/login', '/register'];
  if (!isAuthenticated || hideOnRoutes.includes(location.pathname)) return null;

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-sm transition-all duration-200">
      {/* Top Navbar Row - Responsive Wide Container (w-full max-w-[1680px]) */}
      <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 h-20 sm:h-24 flex items-center justify-between gap-3">
        
        {/* Brand Logo - Same prominent size as Public Site */}
        <Link
          to="/dashboard"
          className="flex items-center shrink-0 transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer py-1"
        >
          <img
            src="/riskradar-logo.jpg"
            alt="RiskRadar - See the Risk. Secure the Future."
            className="h-12 sm:h-14 md:h-16 lg:h-20 w-auto max-w-[180px] sm:max-w-[220px] md:max-w-none object-contain rounded-xl bg-white px-2.5 sm:px-3 py-1 sm:py-1.5 shadow-sm border border-slate-200 hover:shadow-emerald-500/20 transition"
          />
        </Link>

        {/* Desktop Navigation Links (md:flex) */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-3">
          <Link
            to="/dashboard"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
              isActive('/dashboard')
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-600" />
            <span>Workspace</span>
          </Link>

          <Link
            to="/profile"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
              isActive('/profile')
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 text-emerald-600" />
            <span>Profile & Security</span>
          </Link>

          <Link
            to="/"
            title="View Public Landing Page"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>Public Site</span>
          </Link>
        </nav>

        {/* Desktop User Identity & Logout (md:flex) */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <div className="flex flex-col text-right">
            <span className="text-sm font-bold text-slate-900 leading-tight truncate max-w-[180px]">
              {user?.name}
            </span>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <span
                className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
                  roleBadgeColors[user?.role] || 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {user?.role}
              </span>
              <span className="text-[11px] text-slate-500 truncate max-w-[120px]">• {user?.department}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Secure Logout"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile Action Area (< md) */}
        <div className="flex md:hidden items-center gap-2">
          {/* Compact Role Badge */}
          <span
            className={`text-[10px] font-mono font-bold px-2 py-1 rounded-md border ${
              roleBadgeColors[user?.role] || 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {user?.role}
          </span>

          {/* Hamburger Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition active:scale-95 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5 text-slate-900" />}
          </button>
        </div>

      </div>

      {/* Mobile Slide-Down Drawer (< md) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/98 px-4 pt-4 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
          
          {/* Mobile User Summary Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 font-bold text-sm shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${
                roleBadgeColors[user?.role] || 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {user?.role}
            </span>
          </div>

          {/* Mobile Navigation Links */}
          <div className="space-y-1.5">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition ${
                isActive('/dashboard')
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                <span>Workspace ({user?.role})</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition ${
                isActive('/profile')
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-emerald-600" />
                <span>Profile & Security</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>Public Landing Page</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>

          {/* Mobile Logout Button */}
          <div className="pt-2 border-t border-slate-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out from RiskRadar</span>
            </button>
          </div>

        </div>
      )}
    </header>
  );
}
