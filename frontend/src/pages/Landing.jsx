// RiskRadar - Enterprise Business Landing Page
// Clean Corporate White Theme (Light Mode Default)
// Features: Side-by-Side Nav & Cards, Big Logo, High-Contrast Typography,
// About Us, and Contact Us (dipto2305341643@diu.edu.bd).

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  ArrowRight,
  Activity,
  FileCheck2,
  Lock,
  Flame,
  CheckCircle2,
  XCircle,
  Mail,
  Copy,
  Check,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Github,
  Linkedin,
} from 'lucide-react';

export default function Landing() {
  const { isAuthenticated, user, logout } = useAuth();
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const officialEmail = 'dipto2305341643@diu.edu.bd';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(officialEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-white text-slate-900 font-sans antialiased selection:bg-emerald-500/20 selection:text-emerald-900">

      {/* Main Navigation Header - Clean White Corporate */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-200">
        <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 h-20 sm:h-24 flex items-center justify-between gap-3 sm:gap-4">

          {/* Brand Logo - Responsive sizing across all devices */}
          <Link
            to="/"
            className="flex items-center shrink-0 transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer py-1"
          >
            <img
              src="/riskradar-logo.jpg"
              alt="RiskRadar - See the Risk. Secure the Future."
              className="h-12 sm:h-14 md:h-16 lg:h-20 w-auto max-w-[180px] sm:max-w-[220px] md:max-w-none object-contain rounded-xl bg-white px-2.5 sm:px-3 py-1 sm:py-1.5 shadow-sm border border-slate-200 hover:shadow-emerald-500/20 transition"
            />
          </Link>

          {/* Side-by-Side Desktop Navigation Links (md:flex) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold text-slate-700 whitespace-nowrap">
            <a
              href="#overview"
              className="hover:text-emerald-600 transition-all duration-150 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            >
              Platform
            </a>
            <a
              href="#roles"
              className="hover:text-emerald-600 transition-all duration-150 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            >
              4 Stakeholder Roles
            </a>
            <a
              href="#problem-solution"
              className="hover:text-emerald-600 transition-all duration-150 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            >
              Business Value
            </a>
            <a
              href="#about-us"
              className="hover:text-emerald-600 transition-all duration-150 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            >
              About Us
            </a>
            <a
              href="#compliance"
              className="hover:text-emerald-600 transition-all duration-150 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            >
              Compliance
            </a>
            <a
              href="#contact-us"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer text-xs font-bold"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact Us</span>
            </a>
          </nav>

          {/* Desktop Right Action Bar (md:flex) */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-200 shadow-md shadow-emerald-600/20 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>Workspace ({user?.role})</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={logout}
                  title="Secure Logout"
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-200 shadow-md shadow-emerald-600/25 hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <span>Launch Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Right Controls (< md) */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-sm flex items-center gap-1"
              >
                <span>Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-sm"
              >
                Launch Portal
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Mobile Menu"
              className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition active:scale-95 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5 text-slate-900" />}
            </button>
          </div>

        </div>

        {/* Mobile Slide-Down Drawer (< md) */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white/98 px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <nav className="space-y-1">
              <a
                href="#overview"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                <span>Platform Overview</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
              <a
                href="#roles"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                <span>4 Stakeholder Roles</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
              <a
                href="#problem-solution"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                <span>Business Value</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
              <a
                href="#about-us"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                <span>About Our Team</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
              <a
                href="#contact-us"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                <span>Contact Security Team</span>
                <ChevronRight className="w-4 h-4 text-emerald-500" />
              </a>
            </nav>

            {/* Mobile Auth / Portal Row */}
            <div className="pt-3 border-t border-slate-200">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                      <p className="text-[11px] font-mono text-emerald-700 font-semibold">{user?.role} • {user?.department}</p>
                    </div>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200"
                    >
                      Logout
                    </button>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
                  >
                    <span>Enter Stakeholder Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center py-2.5 px-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
                  >
                    Launch Portal
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section - Clean Corporate White with Subtle Tech Grid */}
      <section
        id="overview"
        className="w-full relative border-b border-slate-200 py-16 sm:py-20 lg:py-24 overflow-hidden bg-white"
        style={{
          backgroundImage: 'radial-gradient(rgba(16, 185, 129, 0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6">

              {/* Category Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold hover:scale-105 transition-all duration-200 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0"></span>
                <span>ENTERPRISE CYBERSECURITY RISK MANAGEMENT</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.15]">
                Identify & Visualize Your Organization's{' '}
                <span className="text-emerald-600 underline decoration-emerald-500/40 decoration-4">
                  Cybersecurity Risks
                </span>
              </h1>

              {/* Narrative Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Modern enterprises cannot rely on static, error-prone spreadsheets. RiskRadar delivers{' '}
                <strong className="text-slate-900 font-semibold">automated risk scoring</strong> based on asset criticality, paired with{' '}
                <strong className="text-slate-900 font-semibold">dynamic visual heatmaps</strong> to empower security teams and executive leadership with
                actionable insights for proactive decision-making.
              </p>

              {/* Dual Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/login"
                  className="px-6 py-3.5 rounded-xl text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-200 shadow-lg shadow-emerald-600/25 hover:scale-105 hover:-translate-y-0.5 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Access Stakeholder Portal</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="#roles"
                  className="px-6 py-3.5 rounded-xl text-base font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Explore 4 Roles
                </a>
              </div>

              {/* Metric Highlights Row (Side-by-Side) */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-6 border-t border-slate-200 text-center sm:text-left">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:scale-105 transition-all duration-200">
                  <div className="text-2xl sm:text-3xl font-black text-emerald-600">100%</div>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">Automated Scoring</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:scale-105 transition-all duration-200">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">5 × 5</div>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">Dynamic Heatmap</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:scale-105 transition-all duration-200">
                  <div className="text-2xl sm:text-3xl font-black text-emerald-600">4 Roles</div>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">Strict RBAC Portals</div>
                </div>
              </div>
            </div>

            {/* Right Column: Clean White Posture Preview Card */}
            <div className="lg:col-span-5 w-full max-w-full">
              <div className="relative bg-white border border-slate-200 rounded-2xl p-6 shadow-xl shadow-slate-200/80 hover:shadow-2xl transition-all duration-300">

                {/* Window Bar */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-400"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                    <span className="text-xs font-mono text-slate-500 ml-2">riskradar-posture.live</span>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                    ACTIVE MONITOR
                  </span>
                </div>

                {/* Risk Posture Score Card */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-4 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs uppercase font-mono text-slate-500 tracking-wider font-semibold">Enterprise Risk Index</span>
                    <div className="text-3xl font-black text-slate-900 mt-0.5 flex items-baseline gap-1.5">
                      <span>18.4</span>
                      <span className="text-xs text-slate-500 font-normal">/ 25.0</span>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-red-100 border border-red-300 text-red-700 text-xs font-bold font-mono text-right">
                    HIGH THREAT LEVEL
                  </div>
                </div>

                {/* 5x5 Heatmap Matrix Preview */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-700">5×5 Risk Matrix Heatmap Preview</span>
                    <span className="text-xs text-slate-500 font-mono">Impact × Likelihood</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[10px] font-mono text-center">
                    {/* Row 5 */}
                    <div className="p-2 rounded bg-amber-100 text-amber-900 font-bold border border-amber-200">15</div>
                    <div className="p-2 rounded bg-amber-200 text-amber-950 font-bold border border-amber-300">18</div>
                    <div className="p-2 rounded bg-red-200 text-red-950 font-bold border border-red-300">20</div>
                    <div className="p-2 rounded bg-red-500 text-white font-black animate-pulse flex items-center justify-center shadow-sm">
                      24🔥
                    </div>
                    <div className="p-2 rounded bg-red-600 text-white font-black">25</div>
                    {/* Row 4 */}
                    <div className="p-2 rounded bg-yellow-100 text-yellow-900 font-bold border border-yellow-200">10</div>
                    <div className="p-2 rounded bg-amber-100 text-amber-900 font-bold border border-amber-200">14</div>
                    <div className="p-2 rounded bg-amber-200 text-amber-900 font-bold border border-amber-300">16</div>
                    <div className="p-2 rounded bg-red-200 text-red-900 font-bold border border-red-300">19</div>
                    <div className="p-2 rounded bg-red-500 text-white font-bold">22</div>
                    {/* Row 3 */}
                    <div className="p-2 rounded bg-emerald-100 text-emerald-900 font-bold border border-emerald-200">6</div>
                    <div className="p-2 rounded bg-yellow-100 text-yellow-900 font-bold border border-yellow-200">9</div>
                    <div className="p-2 rounded bg-amber-100 text-amber-900 font-bold border border-amber-200">12</div>
                    <div className="p-2 rounded bg-amber-200 text-amber-900 font-bold border border-amber-300">15</div>
                    <div className="p-2 rounded bg-red-200 text-red-900 font-bold border border-red-300">18</div>
                    {/* Row 2 */}
                    <div className="p-2 rounded bg-emerald-100 text-emerald-900 font-bold border border-emerald-200">3</div>
                    <div className="p-2 rounded bg-emerald-200 text-emerald-950 font-bold border border-emerald-300">5</div>
                    <div className="p-2 rounded bg-yellow-100 text-yellow-900 font-bold border border-yellow-200">8</div>
                    <div className="p-2 rounded bg-amber-100 text-amber-900 font-bold border border-amber-200">10</div>
                    <div className="p-2 rounded bg-amber-100 text-amber-900 font-bold border border-amber-200">12</div>
                    {/* Row 1 */}
                    <div className="p-2 rounded bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200">1</div>
                    <div className="p-2 rounded bg-emerald-100 text-emerald-900 font-semibold border border-emerald-200">2</div>
                    <div className="p-2 rounded bg-emerald-100 text-emerald-900 font-semibold border border-emerald-200">3</div>
                    <div className="p-2 rounded bg-yellow-100 text-yellow-900 font-semibold border border-yellow-200">4</div>
                    <div className="p-2 rounded bg-yellow-100 text-yellow-900 font-semibold border border-yellow-200">5</div>
                  </div>
                </div>

                {/* Asset Counter */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono font-semibold">Hardware</span>
                    <span className="font-bold text-slate-900 text-sm">48 Assets</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono font-semibold">Software</span>
                    <span className="font-bold text-emerald-700 text-sm">32 Assets</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono font-semibold">Data Assets</span>
                    <span className="font-bold text-red-600 text-sm">14 Assets</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section: The 4 Specialized Stakeholder Portals (Clean White Cards) */}
      <section id="roles" className="w-full py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">

          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-mono font-bold">
              ROLE-BASED ACCESS CONTROL (RBAC)
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
              Four Specialized Stakeholder Portals
            </h2>
            <p className="text-slate-600 text-sm mt-3">
              RiskRadar delivers dedicated workspaces for each enterprise role, enforcing strict authentication,
              privilege separation, and contextual threat visibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Role 1: Analyst */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 hover:border-cyan-400 cursor-pointer flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700 mb-4 group-hover:scale-110 transition">
                  <Shield className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono uppercase font-bold text-cyan-700 tracking-wider">
                  Operational Center
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">Cybersecurity Analyst</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Logs emerging threats, tracks hardware/software/data assets, and transitions risk lifecycles through{' '}
                  <em>Identified</em>, <em>Assessed</em>, <em>Mitigating</em>, and <em>Resolved</em>.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-100">
                <Link
                  to="/login"
                  className="text-xs font-bold text-cyan-700 hover:text-cyan-800 flex items-center justify-between"
                >
                  <span>Enter Analyst Hub</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Role 2: Admin */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 hover:border-red-400 cursor-pointer flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-700 mb-4 group-hover:scale-110 transition">
                  <Lock className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono uppercase font-bold text-red-700 tracking-wider">
                  Governance Console
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">System Administrator</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Maintains access controls, manages user credentials and onboarding, enforces Multi-Factor Authentication
                  (MFA), and oversees infrastructure security.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-100">
                <Link
                  to="/login"
                  className="text-xs font-bold text-red-700 hover:text-red-800 flex items-center justify-between"
                >
                  <span>Enter Admin Console</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Role 3: Executive */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 hover:border-emerald-400 cursor-pointer flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-4 group-hover:scale-110 transition">
                  <Activity className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono uppercase font-bold text-emerald-700 tracking-wider">
                  Strategic Boardroom
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">Executive Leadership</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Consumes high-level KPI dashboards, dynamic visual heatmaps, and automated PDF reports to inform
                  proactive strategic risk-mitigation investments.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-100">
                <Link
                  to="/login"
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center justify-between"
                >
                  <span>Enter Boardroom</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Role 4: Auditor */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 hover:border-amber-400 cursor-pointer flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-4 group-hover:scale-110 transition">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono uppercase font-bold text-amber-700 tracking-wider">
                  Compliance Vault
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">External Auditor</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Reviews historical risk logs, compliance postures, and system audit trails during formal evaluations with
                  read-only integrity.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-100">
                <Link
                  to="/login"
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center justify-between"
                >
                  <span>Enter Audit Vault</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section: Business Value (Side-by-Side Cards) */}
      <section id="problem-solution" className="w-full py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">

            {/* The Problem */}
            <div className="p-8 rounded-2xl bg-red-50/70 border border-red-200 flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-xs font-mono font-bold text-red-700 uppercase tracking-wider">
                  The Business Problem
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mt-1 mb-3">
                  Static Spreadsheets Increase Vulnerability Windows
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Modern enterprises manage distributed digital infrastructures. Manual tracking via Excel spreadsheets
                  is inefficient, error-prone, and leads to:
                </p>
                <ul className="space-y-2.5 mt-4 text-sm text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>Inconsistent, subjective, and delayed risk scoring across departments.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>Increased vulnerability window frames leading to devastating breach risk.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>Non-compliance penalties and zero real-time visibility for leadership.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-red-200 text-xs font-mono text-red-700 font-bold">
                Result: High operational overhead & severe security exposure
              </div>
            </div>

            {/* The Solution */}
            <div className="p-8 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider">
                  The RiskRadar Solution
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mt-1 mb-3">
                  Automated Evaluation & Dynamic Heatmaps
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  RiskRadar continuously evaluates organizational posture through automated algorithms based on asset
                  criticality:
                </p>
                <ul className="space-y-2.5 mt-4 text-sm text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Dynamic scoring formula combining likelihood & impact per critical asset.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Dynamic visual heatmaps offering real-time departmental visibility.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Integrated automated PDF/CSV report generation for strategic board decisions.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-emerald-200 text-xs font-mono text-emerald-800 font-bold">
                Result: Strengthened security resilience & proactive decision-making
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section: About Us (Side-by-Side Team Cards) */}
      <section id="about-us" className="w-full py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-mono font-bold">
              ABOUT OUR PROJECT & TEAM
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
              Building the Future of Cyber Resilience
            </h2>
            <p className="text-slate-600 text-sm mt-3">
              RiskRadar was designed as an enterprise cyber resilience platform to bridge the critical gap
              between raw technical vulnerability data and executive decision-making.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Contributor Card 1 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-3.5">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 font-black text-lg shrink-0">
                    MR
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Mahabubur Rahman</h3>
                    <p className="text-xs font-mono text-emerald-700 font-semibold">Student ID: 232-35-706</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Focused on secure credential management, session invalidation, automated risk scoring engines, and heatmap matrix visualizations.
                </p>
              </div>

              {/* Social Profiles */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2.5">
                <a
                  href="https://www.linkedin.com/in/mahabubur-rahman-sakib-09b46b43a/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition active:scale-95 cursor-pointer"
                >
                  <Linkedin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>LinkedIn</span>
                </a>
                <a
                  href="https://github.com/Mrsakib13"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200 transition active:scale-95 cursor-pointer"
                >
                  <Github className="w-3.5 h-3.5 text-slate-800 shrink-0" />
                  <span>GitHub</span>
                </a>
              </div>
            </div>

            {/* Contributor Card 2 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-3.5">
                  <div className="w-12 h-12 rounded-full bg-cyan-100 border border-cyan-300 flex items-center justify-center text-cyan-800 font-black text-lg shrink-0">
                    AA
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Afri Alam</h3>
                    <p className="text-xs font-mono text-cyan-700 font-semibold">Student ID: 232-35-643</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Focused on user onboarding & authentication workflows, asset inventory CRUD, threat severity logging, and executive KPI dashboards.
                </p>
              </div>

              {/* Social Profiles */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2.5">
                <a
                  href="https://www.linkedin.com/in/afri-alam/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition active:scale-95 cursor-pointer"
                >
                  <Linkedin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>LinkedIn</span>
                </a>
                <a
                  href="https://github.com/Afriala"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200 transition active:scale-95 cursor-pointer"
                >
                  <Github className="w-3.5 h-3.5 text-slate-800 shrink-0" />
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Contact Us (Clean Corporate Card) */}
      <section id="contact-us" className="w-full py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-emerald-50 via-slate-50 to-white border border-emerald-200 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-lg">

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-bold border border-emerald-300">
              <Mail className="w-3.5 h-3.5" />
              <span>OFFICIAL CONTACT POINT</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Contact Enterprise Security Team
            </h2>

            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              Have questions regarding RiskRadar's automated scoring algorithms, RBAC policies, or academic evaluation? Get in touch directly:
            </p>

            {/* Email Box & Actions */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-white border border-slate-300 rounded-xl px-5 py-3 shadow-sm">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-mono text-sm sm:text-base font-bold text-slate-900 break-all select-all">
                  {officialEmail}
                </span>
              </div>

              <div className="w-full sm:w-auto flex items-center justify-center gap-2">
                <button
                  onClick={handleCopyEmail}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold transition hover:bg-slate-800 cursor-pointer shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Email</span>
                    </>
                  )}
                </button>

                <a
                  href={`mailto:${officialEmail}?subject=RiskRadar%20Inquiry`}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer shadow-sm shadow-emerald-600/20"
                >
                  <span>Send Mail</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Footer */}
      <footer id="compliance" className="w-full bg-slate-50 py-12 border-t border-slate-200 text-slate-600 text-xs">
        <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-200 text-center md:text-left">

            <div className="flex items-center justify-center">
              <img
                src="/riskradar-logo.jpg"
                alt="RiskRadar Logo"
                className="h-12 sm:h-14 md:h-16 w-auto object-contain rounded-xl bg-white px-3 py-1.5 shadow-sm border border-slate-200"
              />
            </div>

            <div className="space-y-1">
              <p className="text-slate-800 font-semibold">Enterprise Cyber Risk Governance Platform</p>
              <p className="text-slate-500">Continuous Threat Exposure & Risk Management</p>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-center sm:text-left">
            <p>© 2026 RiskRadar Enterprise. All rights reserved.</p>
            <p className="text-slate-400 font-sans text-xs">ISO 27001 • SOC 2 Type II • NIST SP 800-63B Architecture</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
