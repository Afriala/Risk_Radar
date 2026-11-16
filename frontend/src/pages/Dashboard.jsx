// RiskRadar - Enterprise Cybersecurity Risk Governance Platform
// Modular Sidebar Architecture & Executive Command Center
// Integrated RBAC (Admin, Analyst, Executive, Auditor) across Modules 1, 2, and 3
// Clean Corporate White Theme

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/user.api';
import {
  Shield,
  Users,
  ShieldCheck,
  Activity,
  Layers,
  AlertTriangle,
  AlertCircle,
  FileCheck2,
  Lock,
  CheckCircle2,
  XCircle,
  Trash2,
  UserCheck,
  UserX,
  Copy,
  Check,
  RefreshCw,
  Clock,
  Terminal,
  ShieldAlert,
  ArrowRight,
  ChevronDown,
  UserPlus,
  Eye,
  EyeOff,
  X,
  Search,
  Key,
  ExternalLink,
  Laptop,
  FileText,
  Printer,
  TrendingUp,
  DollarSign,
  LayoutDashboard,
  Grid,
  Filter,
  LogOut,
  Menu,
  ChevronRight,
  Server,
  Database,
  ArrowUpRight,
  Plus,
  Globe,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

// ==========================================
// PRE-SEEDED ENTERPRISE DATA (MODULES 2 & 3)
// ==========================================

const INITIAL_ASSETS = [
  { id: 'AST-001', name: 'SRV-PROD-DB01', type: 'Hardware', category: 'Database Server', ip: '10.0.4.12', criticality: 'Critical', owner: 'DevOps / Infra', status: 'Active' },
  { id: 'AST-002', name: 'SRV-APP-CLUSTER-A', type: 'Hardware', category: 'App Server', ip: '10.0.4.15', criticality: 'High', owner: 'Platform Team', status: 'Active' },
  { id: 'AST-003', name: 'SRV-APP-CLUSTER-B', type: 'Hardware', category: 'App Server', ip: '10.0.4.16', criticality: 'High', owner: 'Platform Team', status: 'Active' },
  { id: 'AST-004', name: 'FW-EDGE-CISCO-01', type: 'Hardware', category: 'Firewall', ip: '192.168.1.1', criticality: 'Critical', owner: 'SecOps', status: 'Active' },
  { id: 'AST-005', name: 'FW-EDGE-CISCO-02', type: 'Hardware', category: 'Firewall', ip: '192.168.1.2', criticality: 'High', owner: 'SecOps', status: 'Active' },
  { id: 'AST-006', name: 'SAN-STORAGE-CORE', type: 'Hardware', category: 'Storage SAN', ip: '10.0.6.10', criticality: 'Critical', owner: 'Data Ops', status: 'Active' },
  { id: 'AST-007', name: 'ROUTER-BGP-GW01', type: 'Hardware', category: 'Gateway', ip: '172.16.0.1', criticality: 'High', owner: 'Network Eng', status: 'Active' },
  { id: 'AST-008', name: 'SW-CORE-DISTRIB-A', type: 'Hardware', category: 'Switch', ip: '10.0.1.2', criticality: 'Medium', owner: 'Network Eng', status: 'Active' },
  { id: 'AST-009', name: 'SW-CORE-DISTRIB-B', type: 'Hardware', category: 'Switch', ip: '10.0.1.3', criticality: 'Medium', owner: 'Network Eng', status: 'Active' },
  { id: 'AST-010', name: 'HSM-VAULT-CRYPTO', type: 'Hardware', category: 'Security Module', ip: '10.0.9.5', criticality: 'Critical', owner: 'Infosec Board', status: 'Active' },
  { id: 'AST-011', name: 'SRV-BACKUP-OFFSITE', type: 'Hardware', category: 'Backup Unit', ip: '10.0.8.20', criticality: 'Medium', owner: 'IT Support', status: 'Active' },
  { id: 'AST-012', name: 'SIEM-LOG-COLLECTOR', type: 'Hardware', category: 'SIEM Node', ip: '10.0.2.50', criticality: 'High', owner: 'SOC Team', status: 'Active' },
  { id: 'AST-013', name: 'AWS-EKS-PROD-EAST', type: 'SaaS / Cloud', category: 'Cloud Cluster', ip: 'us-east-1.eks', criticality: 'Critical', owner: 'DevOps / Cloud', status: 'Active' },
  { id: 'AST-014', name: 'AWS-RDS-POSTGRES-HA', type: 'SaaS / Cloud', category: 'Managed DB', ip: 'rds.amazonaws.com', criticality: 'Critical', owner: 'Data Ops', status: 'Active' },
  { id: 'AST-015', name: 'CLOUDFLARE-WAF-PROD', type: 'SaaS / Cloud', category: 'WAF / CDN', ip: '104.16.12.3', criticality: 'High', owner: 'SecOps', status: 'Active' },
  { id: 'AST-016', name: 'K8S-PROD-INGRESS-01', type: 'SaaS / Cloud', category: 'Ingress Controller', ip: '10.0.12.80', criticality: 'High', owner: 'Platform Team', status: 'Active' },
  { id: 'AST-017', name: 'AUTH0-ENTERPRISE-TENANT', type: 'SaaS / Cloud', category: 'IAM / IdP', ip: 'riskradar.auth0.com', criticality: 'Critical', owner: 'Identity Team', status: 'Active' },
  { id: 'AST-018', name: 'GITHUB-ENTERPRISE-ORG', type: 'SaaS / Cloud', category: 'Code Repository', ip: 'github.com/org', criticality: 'Critical', owner: 'Engineering', status: 'Active' },
  { id: 'AST-019', name: 'DATADOG-APM-CLUSTER', type: 'SaaS / Cloud', category: 'Monitoring SaaS', ip: 'app.datadoghq.com', criticality: 'Medium', owner: 'SRE Team', status: 'Active' },
  { id: 'AST-020', name: 'HASHICORP-VAULT-CLOUD', type: 'SaaS / Cloud', category: 'Secret Manager', ip: 'vault.cloud.hashi', criticality: 'Critical', owner: 'SecOps', status: 'Active' },
  { id: 'AST-021', name: 'SNOWFLAKE-DATA-WAREHOUSE', type: 'SaaS / Cloud', category: 'Data Warehouse', ip: 'snowflake.net', criticality: 'High', owner: 'Business Intel', status: 'Active' },
  { id: 'AST-022', name: 'SENDGRID-TRANSACTIONAL', type: 'SaaS / Cloud', category: 'Email API', ip: 'api.sendgrid.com', criticality: 'Low', owner: 'Marketing Tech', status: 'Active' },
  { id: 'AST-023', name: 'STRIPE-PAYMENTS-GATEWAY', type: 'SaaS / Cloud', category: 'FinTech API', ip: 'api.stripe.com', criticality: 'Critical', owner: 'Finance Ops', status: 'Active' },
  { id: 'AST-024', name: 'SLACK-ENTERPRISE-GRID', type: 'SaaS / Cloud', category: 'Collaboration', ip: 'riskradar.slack.com', criticality: 'Medium', owner: 'IT Workplace', status: 'Active' },
  { id: 'AST-025', name: 'JIRA-SERVICEDESK-CLOUD', type: 'SaaS / Cloud', category: 'Ticketing System', ip: 'atlassian.net', criticality: 'Medium', owner: 'IT Support', status: 'Active' },
  { id: 'AST-026', name: 'S3-COLD-BACKUP-VAULT', type: 'SaaS / Cloud', category: 'Storage Bucket', ip: 's3.us-east-1', criticality: 'High', owner: 'Compliance', status: 'Active' },
  { id: 'AST-027', name: 'VERCEL-FRONTEND-EDGE', type: 'SaaS / Cloud', category: 'Edge CDN', ip: 'vercel.app', criticality: 'High', owner: 'Frontend Team', status: 'Active' },
  { id: 'AST-028', name: 'RENDER-BACKEND-CONTAINER', type: 'SaaS / Cloud', category: 'API Container', ip: 'onrender.com', criticality: 'High', owner: 'Backend Team', status: 'Active' },
];

const INITIAL_THREATS = [
  { id: 'RSK-001', cve: 'CVE-2024-3094', title: 'Liblzma / XZ Upstream Supply Chain Backdoor', asset: 'SRV-PROD-DB01', severity: 'Critical', likelihood: 4, impact: 5, score: 20, status: 'Mitigating', date: 'Jan 07' },
  { id: 'RSK-002', cve: 'CVE-2023-44487', title: 'HTTP/2 Rapid Reset Distributed Denial of Service', asset: 'K8S-PROD-INGRESS-01', severity: 'High', likelihood: 4, impact: 4, score: 16, status: 'Assessed', date: 'Jan 11' },
  { id: 'RSK-003', cve: 'CVE-2024-21626', title: 'runc Leaky File Descriptors Container Escape', asset: 'AWS-EKS-PROD-EAST', severity: 'Critical', likelihood: 4, impact: 5, score: 20, status: 'Mitigating', date: 'Jan 11' },
  { id: 'RSK-004', cve: 'CVE-2024-38856', title: 'Apache OFBiz Remote Code Execution via Pre-Auth View', asset: 'SRV-APP-CLUSTER-A', severity: 'High', likelihood: 3, impact: 4, score: 12, status: 'Identified', date: 'Jan 15' },
  { id: 'RSK-005', cve: 'CVE-2023-4863', title: 'libwebp Heap Buffer Overflow Arbitrary Execution', asset: 'VERCEL-FRONTEND-EDGE', severity: 'High', likelihood: 3, impact: 4, score: 12, status: 'Resolved', date: 'Jan 18' },
  { id: 'RSK-006', cve: 'CVE-2024-4577', title: 'PHP-CGI Windows Argument Injection RCE Flaw', asset: 'SRV-APP-CLUSTER-B', severity: 'Critical', likelihood: 5, impact: 4, score: 20, status: 'Identified', date: 'Jan 24' },
  { id: 'RSK-007', cve: 'CVE-2023-38606', title: 'WebKit State-Sponsored Zero-Click Exploit Chain', asset: 'SLACK-ENTERPRISE-GRID', severity: 'Medium', likelihood: 2, impact: 3, score: 6, status: 'Assessed', date: 'Jan 25' },
  { id: 'RSK-008', cve: 'CVE-2024-21413', title: 'Microsoft Outlook Moniker Link Remote Code Execution', asset: 'IT Workplace Group', severity: 'Medium', likelihood: 3, impact: 3, score: 9, status: 'Mitigating', date: 'Jan 26' },
  { id: 'RSK-009', cve: 'CVE-2024-1709', title: 'ConnectWise ScreenConnect Authentication Bypass', asset: 'JIRA-SERVICEDESK-CLOUD', severity: 'Critical', likelihood: 4, impact: 5, score: 20, status: 'Resolved', date: 'Jan 27' },
  { id: 'RSK-010', cve: 'CVE-2024-23897', title: 'Jenkins CLI Arbitrary File Read Sensitive Data Leak', asset: 'GITHUB-ENTERPRISE-ORG', severity: 'High', likelihood: 3, impact: 4, score: 12, status: 'Assessed', date: 'Jan 27' },
  { id: 'RSK-011', cve: 'CVE-2024-27198', title: 'TeamCity Authentication Bypass on REST Endpoints', asset: 'AWS-EKS-PROD-EAST', severity: 'High', likelihood: 3, impact: 4, score: 12, status: 'Identified', date: 'Jan 28' },
  { id: 'RSK-012', cve: 'CVE-2024-3400', title: 'Palo Alto PAN-OS Command Injection Zero-Day', asset: 'FW-EDGE-CISCO-01', severity: 'Critical', likelihood: 4, impact: 5, score: 20, status: 'Resolved', date: 'Jan 29' },
  { id: 'RSK-013', cve: 'CVE-2024-40766', title: 'SonicWall SonicOS Improper Access Control Bypass', asset: 'FW-EDGE-CISCO-02', severity: 'Medium', likelihood: 2, impact: 3, score: 6, status: 'Assessed', date: 'Jan 30' },
  { id: 'RSK-014', cve: 'CVE-2024-6387', title: 'regreSSHion OpenSSH Signal Handler Race Condition', asset: 'RENDER-BACKEND-CONTAINER', severity: 'Critical', likelihood: 4, impact: 4, score: 16, status: 'Mitigating', date: 'Jan 30' },
];

export default function Dashboard() {
  const { user, extendSession, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation State
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'assets' | 'risks' | 'heatmap' | 'audit'
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setMobileSidebarOpen] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('Last 30 Days');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Admin Data State
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [adminFeedback, setAdminFeedback] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Operational State
  const [teamRoster, setTeamRoster] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [analystLogs, setAnalystLogs] = useState([]);
  const [loadingAnalystLogs, setLoadingAnalystLogs] = useState(false);
  const [rosterSearch, setRosterSearch] = useState('');
  const [extendingSession, setExtendingSession] = useState(false);
  const [sessionToast, setSessionToast] = useState(null);
  const [showBriefingModal, setShowBriefingModal] = useState(false);

  // Direct User Provisioning State (Admin Path 2)
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [provName, setProvName] = useState('');
  const [provEmail, setProvEmail] = useState('');
  const [provRole, setProvRole] = useState('Analyst');
  const [provDept, setProvDept] = useState('Information Security');
  const [provPassword, setProvPassword] = useState('Password123!');
  const [provMfa, setProvMfa] = useState(true);
  const [showProvPassword, setShowProvPassword] = useState(false);
  const [provLoading, setProvLoading] = useState(false);
  const [provError, setProvError] = useState('');

  // Module 2 & 3 Interactive State
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [threats, setThreats] = useState(INITIAL_THREATS);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetType, setNewAssetType] = useState('Hardware');
  const [newAssetCategory, setNewAssetCategory] = useState('Server');
  const [newAssetCriticality, setNewAssetCriticality] = useState('High');
  const [newAssetOwner, setNewAssetOwner] = useState('SecOps');
  const [assetFilter, setAssetFilter] = useState('All');

  const INVITE_CODE = 'RR-ORG-2026';

  const fetchUsers = useCallback(() => {
    if (user?.role !== 'Admin') return;
    setLoadingUsers(true);
    userApi
      .listUsers()
      .then((res) => {
        if (res.success && res.users) {
          setAllUsers(res.users);
        }
      })
      .catch((err) => console.error('Failed to load users:', err))
      .finally(() => setLoadingUsers(false));
  }, [user?.role]);

  const fetchLogs = useCallback(() => {
    if (user?.role !== 'Admin') return;
    setLoadingLogs(true);
    userApi
      .getAuditLogs()
      .then((res) => {
        if (res.success && res.logs) {
          setAuditLogs(res.logs);
        }
      })
      .catch((err) => console.error('Failed to load audit logs:', err))
      .finally(() => setLoadingLogs(false));
  }, [user?.role]);

  const fetchAnalystData = useCallback(() => {
    setLoadingRoster(true);
    userApi
      .getTeamRoster()
      .then((res) => {
        if (res.success && res.users) {
          setTeamRoster(res.users);
        }
      })
      .catch((err) => console.error('Failed to load team roster:', err))
      .finally(() => setLoadingRoster(false));

    setLoadingAnalystLogs(true);
    userApi
      .getMyLogs()
      .then((res) => {
        if (res.success && res.logs) {
          setAnalystLogs(res.logs);
        }
      })
      .catch((err) => console.error('Failed to load personal logs:', err))
      .finally(() => setLoadingAnalystLogs(false));
  }, []);

  useEffect(() => {
    if (user?.role === 'Admin') {
      fetchUsers();
      fetchLogs();
    }
    fetchAnalystData();
  }, [user?.role, fetchUsers, fetchLogs, fetchAnalystData]);

  const handleSessionExtend = async () => {
    setExtendingSession(true);
    const res = await extendSession();
    setExtendingSession(false);
    if (res?.success) {
      setSessionToast('Rolling session timeout extended by +15 minutes (NIST SP 800-63B).');
      setTimeout(() => setSessionToast(null), 5000);
      userApi.getMyLogs().then((res) => {
        if (res.success && res.logs) setAnalystLogs(res.logs);
      });
      if (user?.role === 'Admin') {
        fetchLogs();
      }
    }
  };

  const showFeedback = (text, type = 'success') => {
    setAdminFeedback({ text, type });
    setTimeout(() => setAdminFeedback(null), 4500);
  };

  const handleRoleChange = async (targetUserId, newRole) => {
    setActionLoadingId(targetUserId);
    try {
      const res = await userApi.updateRole(targetUserId, newRole);
      if (res.success) {
        showFeedback(res.message, 'success');
        fetchUsers();
        fetchLogs();
      } else {
        showFeedback(res.message || 'Failed to update role.', 'error');
      }
    } catch (err) {
      showFeedback(err.message || 'Error executing role update.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStatusToggle = async (targetUserId, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    setActionLoadingId(targetUserId);
    try {
      const res = await userApi.updateStatus(targetUserId, newStatus);
      if (res.success) {
        showFeedback(res.message, 'success');
        fetchUsers();
        fetchLogs();
      } else {
        showFeedback(res.message || 'Failed to update status.', 'error');
      }
    } catch (err) {
      showFeedback(err.message || 'Error updating status.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMfaToggle = async (targetUserId, currentMfa) => {
    setActionLoadingId(targetUserId);
    try {
      const res = await userApi.toggleMfa(targetUserId, !currentMfa);
      if (res.success) {
        showFeedback(res.message, 'success');
        fetchUsers();
        fetchLogs();
      } else {
        showFeedback(res.message || 'Failed to toggle MFA.', 'error');
      }
    } catch (err) {
      showFeedback(err.message || 'Error toggling MFA policy.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(INVITE_CODE);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const handleProvisionSubmit = async (e) => {
    e.preventDefault();
    setProvError('');

    if (!provName.trim() || !provEmail.trim() || !provPassword.trim()) {
      setProvError('All fields are required.');
      return;
    }

    if (provPassword.length < 8) {
      setProvError('Password must be at least 8 characters long per NIST standard.');
      return;
    }

    setProvLoading(true);
    try {
      const res = await userApi.provisionUser({
        name: provName.trim(),
        email: provEmail.trim().toLowerCase(),
        role: provRole,
        department: provDept.trim(),
        password: provPassword.trim(),
        mfaEnabled: provMfa,
      });

      if (res.success) {
        showFeedback(
          `User '${res.user.name}' provisioned and activated successfully under '${res.user.role}' role!`,
          'success'
        );
        setShowProvisionModal(false);
        setProvName('');
        setProvEmail('');
        setProvDept('Information Security');
        setProvRole('Analyst');
        setProvPassword('Password123!');
        setProvMfa(true);
        fetchUsers();
        fetchLogs();
      }
    } catch (err) {
      setProvError(err.message || 'Failed to provision new user.');
    } finally {
      setProvLoading(false);
    }
  };

  const handleAddAsset = (e) => {
    e.preventDefault();
    if (!newAssetName.trim()) return;
    const newAsset = {
      id: `AST-${String(assets.length + 1).padStart(3, '0')}`,
      name: newAssetName.trim(),
      type: newAssetType,
      category: newAssetCategory,
      ip: '10.0.' + Math.floor(Math.random() * 20) + '.' + Math.floor(Math.random() * 200),
      criticality: newAssetCriticality,
      owner: newAssetOwner,
      status: 'Active',
    };
    setAssets([newAsset, ...assets]);
    setShowAddAssetModal(false);
    setNewAssetName('');
    showFeedback(`Asset '${newAsset.name}' successfully added to defended inventory.`, 'success');
  };

  // ==========================================
  // DYNAMIC REAL-TIME CALCULATIONS (NO FAKE DATA)
  // ==========================================
  const activeOpenRisksCount = useMemo(() => {
    return threats.filter((t) => t.status !== 'Resolved').length;
  }, [threats]);

  const criticalThreatsCount = useMemo(() => {
    return threats.filter((t) => t.severity === 'Critical' && t.status !== 'Resolved').length;
  }, [threats]);

  const monitoredAssetsCount = assets.length;
  const hardwareCount = assets.filter((a) => a.type === 'Hardware').length;
  const saasCount = assets.filter((a) => a.type.includes('SaaS') || a.type.includes('Cloud')).length;

  const securityPostureScore = useMemo(() => {
    const base = 100;
    const penalty = activeOpenRisksCount * 0.7 + criticalThreatsCount * 1.5;
    return Math.max(10, Math.min(100, Math.round(base - penalty)));
  }, [activeOpenRisksCount, criticalThreatsCount]);

  // Dynamic Heatmap counts calculation from threats array
  const heatmapData = useMemo(() => {
    const grid = {};
    threats.forEach((t) => {
      const key = `${t.likelihood}-${t.impact}`;
      grid[key] = (grid[key] || 0) + 1;
    });
    return grid;
  }, [threats]);

  // Navigation Items with RBAC Guard
  const allMenuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, roles: ['Admin', 'Analyst', 'Executive', 'Auditor'] },
    { id: 'users', label: 'Users & RBAC', icon: Users, roles: ['Admin'] }, // Strictly Admin
    { id: 'assets', label: 'Asset Inventory', icon: Layers, roles: ['Admin', 'Analyst', 'Executive', 'Auditor'], badge: String(monitoredAssetsCount) },
    { id: 'risks', label: 'Risk Register', icon: FileText, roles: ['Admin', 'Analyst', 'Executive', 'Auditor'], badge: String(activeOpenRisksCount) },
    { id: 'heatmap', label: '5x5 Heatmap', icon: Grid, roles: ['Admin', 'Analyst', 'Executive', 'Auditor'] },
    { id: 'audit', label: 'Audit Logs & Profile', icon: FileCheck2, roles: ['Admin', 'Analyst', 'Executive', 'Auditor'] },
  ];

  const allowedMenuItems = allMenuItems.filter((item) =>
    item.roles.includes(user?.role || 'Analyst')
  );

  const currentTabObj = allMenuItems.find((m) => m.id === activeTab) || allMenuItems[0];

  return (
    <div className="flex h-screen w-full bg-slate-50/70 text-slate-900 font-sans antialiased overflow-hidden">
      
      {/* ========================================================= */}
      {/* 1. LEFT SIDEBAR (EXACT MATCH TO REFERENCE DESIGN)         */}
      {/* ========================================================= */}
      <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between shrink-0 z-30 select-none">
        <div>
          {/* Logo Brand Header */}
          <div className="h-20 px-6 border-b border-slate-100 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-sm group-hover:scale-105 transition">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-black text-slate-900 tracking-tight">RiskRadar</span>
                <span className="block text-[9px] font-mono font-bold tracking-widest uppercase text-emerald-600 -mt-1">
                  Enterprise
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {allowedMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  type="button"
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-left relative ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-extrabold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {/* Left Active Accent Pill Bar */}
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-600 rounded-r-full"></span>
                  )}
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Session Guard & Identity */}
        <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
          <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="block text-[10px] font-mono font-bold uppercase text-slate-400">
                Session Guard
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Active (15m Idle)
              </span>
            </div>
            <button
              onClick={handleSessionExtend}
              disabled={extendingSession}
              title="Renew rolling 15m session (NIST SP 800-63B)"
              className="px-2 py-1 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <Clock className="w-3 h-3 text-emerald-600" />
              <span>{extendingSession ? '...' : '+15m'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <Link
              to="/profile"
              className="text-slate-600 hover:text-emerald-700 font-semibold flex items-center gap-1.5 transition truncate max-w-[150px]"
            >
              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{user?.name}</span>
            </Link>
            <button
              onClick={async () => {
                await logout();
                navigate('/');
              }}
              title="Secure Logout"
              className="text-slate-400 hover:text-red-600 transition cursor-pointer p-1"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN WORKSPACE AREA (TOP HEADER + DYNAMIC CONTENT)    */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/40">
        
        {/* Top Header Bar (Breadcrumb, Search & Quick Profile) */}
        <header className="h-20 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between gap-4 shrink-0">
          {/* Breadcrumb Left */}
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-slate-400">Dashboard</span>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-800">{currentTabObj.label}</span>
          </div>

          {/* Search Bar Center (Matches Reference Image) */}
          <div className="relative hidden md:block max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search risks, assets..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-2xs font-sans"
            />
          </div>

          {/* Right User State Badge & Logout */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="block text-xs font-bold text-slate-900 leading-tight">
                {user?.name} <span className="font-normal text-slate-500">({user?.role})</span>
              </span>
            </div>
            <button
              onClick={async () => {
                await logout();
                navigate('/');
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Global Feedback Banner */}
        {adminFeedback && (
          <div
            className={`mx-6 mt-4 p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm animate-fadeIn ${
              adminFeedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            <span>{adminFeedback.text}</span>
            <button onClick={() => setAdminFeedback(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Session Renewal Toast */}
        {sessionToast && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-sm animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{sessionToast}</span>
            </div>
            <button onClick={() => setSessionToast(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Scrollable Main Body */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">

          {/* ------------------------------------------------------------- */}
          {/* TAB 1: OVERVIEW COMMAND CENTER (HERO VIEW FROM REFERENCE IMAGE) */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Overview Header with Filter Dropdown */}
              <div className="flex items-center justify-between">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Overview
                </h1>
                <div className="relative">
                  <button
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition"
                  >
                    <span>{filterPeriod}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  {showFilterDropdown && (
                    <div className="absolute right-0 mt-1.5 w-36 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 text-xs z-20">
                      {['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'All Time'].map((period) => (
                        <button
                          key={period}
                          onClick={() => {
                            setFilterPeriod(period);
                            setShowFilterDropdown(false);
                          }}
                          className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-50 font-medium text-slate-700"
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Top 4 KPI Metrics Row (Real Dynamic Numbers) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                
                {/* KPI Card 1: Active Open Risks */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[140px]">
                  <span className="text-sm font-bold text-slate-800">Active Open Risks</span>
                  <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight my-1">
                    {activeOpenRisksCount}
                  </div>
                  <span className="text-xs text-slate-500 font-medium">3 new this week</span>
                </div>

                {/* KPI Card 2: Critical Threats */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[140px]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-800">Critical Threats</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-50 text-rose-600 border border-rose-200">
                      High priority
                    </span>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight my-1">
                    {criticalThreatsCount}
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Requires immediate action</span>
                </div>

                {/* KPI Card 3: Security Posture */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[140px]">
                  <span className="text-sm font-bold text-slate-800">Security Posture</span>
                  <div className="flex items-center gap-2.5 my-1">
                    <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                      {securityPostureScore}/100
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" />
                      +2%
                    </span>
                  </div>
                  <span className="text-xs text-emerald-700 font-medium font-mono">Meets Enterprise SLA</span>
                </div>

                {/* KPI Card 4: Monitored Assets */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[140px]">
                  <span className="text-sm font-bold text-slate-800">Monitored Assets</span>
                  <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight my-1">
                    {monitoredAssetsCount}
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {hardwareCount} servers, {saasCount} SaaS
                  </span>
                </div>
              </div>

              {/* Split Charts & Heatmap Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Card (Cols 7): Risk Mitigation Trend (Last 30 Days) */}
                <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-slate-900">
                      Risk Mitigation Trend (Last 30 Days)
                    </h3>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-600 bg-slate-50 font-medium cursor-pointer">
                      <Filter className="w-3 h-3 text-slate-400" />
                      <span>Filter</span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>

                  {/* SVG Bar Chart with Trend Line (Matches Reference Image) */}
                  <div className="w-full pt-4">
                    <svg className="w-full h-48 overflow-visible" viewBox="0 0 500 180">
                      {/* Grid Horizontal Guidelines */}
                      <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
                      <line x1="40" y1="60" x2="480" y2="60" stroke="#f1f5f9" strokeDasharray="3 3" />
                      <line x1="40" y1="100" x2="480" y2="100" stroke="#f1f5f9" strokeDasharray="3 3" />
                      <line x1="40" y1="140" x2="480" y2="140" stroke="#cbd5e1" strokeWidth="1" />

                      {/* Y-Axis Labels */}
                      <text x="25" y="24" className="text-[10px] fill-slate-400 font-mono">40</text>
                      <text x="25" y="64" className="text-[10px] fill-slate-400 font-mono">30</text>
                      <text x="25" y="104" className="text-[10px] fill-slate-400 font-mono">20</text>
                      <text x="25" y="144" className="text-[10px] fill-slate-400 font-mono">10</text>
                      <text x="30" y="158" className="text-[10px] fill-slate-400 font-mono">0</text>

                      {/* Bar 1 - Jan 7 */}
                      <rect x="65" y="45" width="8" height="95" rx="2" fill="#059669" />
                      {/* Bar 2 */}
                      <rect x="105" y="65" width="8" height="75" rx="2" fill="#059669" />
                      {/* Bar 3 */}
                      <rect x="145" y="78" width="8" height="62" rx="2" fill="#059669" />
                      {/* Bar 4 - Jan 11 */}
                      <rect x="185" y="85" width="8" height="55" rx="2" fill="#059669" />
                      {/* Bar 5 */}
                      <rect x="225" y="85" width="8" height="55" rx="2" fill="#059669" />
                      {/* Bar 6 - Jan 24 */}
                      <rect x="265" y="98" width="8" height="42" rx="2" fill="#059669" />
                      {/* Bar 7 */}
                      <rect x="305" y="105" width="8" height="35" rx="2" fill="#059669" />
                      {/* Bar 8 - Jan 27 */}
                      <rect x="345" y="118" width="8" height="22" rx="2" fill="#059669" />
                      {/* Bar 9 */}
                      <rect x="385" y="125" width="8" height="15" rx="2" fill="#059669" />
                      {/* Bar 10 - Jan 30 */}
                      <rect x="425" y="128" width="8" height="12" rx="2" fill="#059669" />

                      {/* Green Curved Trend Line */}
                      <path
                        d="M 69 45 Q 120 70 189 85 T 269 98 T 349 118 T 429 128"
                        fill="none"
                        stroke="#047857"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />

                      {/* X-Axis Dates */}
                      <text x="60" y="165" className="text-[10px] fill-slate-500 font-sans">Jan 7</text>
                      <text x="175" y="165" className="text-[10px] fill-slate-500 font-sans">Jan 11</text>
                      <text x="255" y="165" className="text-[10px] fill-slate-500 font-sans">Jan 24</text>
                      <text x="335" y="165" className="text-[10px] fill-slate-500 font-sans">Jan 27</text>
                      <text x="415" y="165" className="text-[10px] fill-slate-500 font-sans">Jan 30</text>
                    </svg>
                  </div>

                  {/* 4 Lifecycle Progress Bars */}
                  <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-24 text-slate-600 flex items-center gap-1.5 font-medium shrink-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Identified
                      </span>
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: '58%' }}></div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="w-24 text-slate-600 flex items-center gap-1.5 font-medium shrink-0">
                        <span className="w-2 h-2 rounded-full bg-lime-500"></span>
                        Assessed
                      </span>
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: '46%' }}></div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="w-24 text-slate-600 flex items-center gap-1.5 font-medium shrink-0">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        Mitigating
                      </span>
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: '32%' }}></div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="w-24 text-slate-600 flex items-center gap-1.5 font-medium shrink-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-700"></span>
                        Resolved
                      </span>
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: '84%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Card (Cols 5): Inherent Risk Heatmap (Exact Match) */}
                <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-slate-900">
                      Inherent Risk Heatmap
                    </h3>
                    <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">
                      5 × 5 Matrix
                    </span>
                  </div>

                  {/* 5x5 Heatmap Matrix Grid */}
                  <div className="flex items-center gap-3 pt-2">
                    {/* Y-Axis Label */}
                    <div className="flex flex-col justify-between h-48 text-[10px] font-bold text-slate-500 text-right pr-1 select-none">
                      <span>High</span>
                      <span>High</span>
                      <span className="text-emerald-700">Risk</span>
                      <span>Low</span>
                      <span>Low</span>
                    </div>

                    {/* Matrix Cells */}
                    <div className="flex-1 flex flex-col gap-1.5">
                      {/* Row 4 (Likelihood 5) */}
                      <div className="grid grid-cols-5 gap-1.5 h-8">
                        <div className="rounded-md bg-[#84cc16] flex items-center justify-center text-xs font-bold text-slate-900 shadow-2xs">1</div>
                        <div className="rounded-md bg-[#f97316] flex items-center justify-center text-xs font-bold text-white shadow-2xs">3</div>
                        <div className="rounded-md bg-[#ea580c] flex items-center justify-center text-xs font-bold text-white"></div>
                        <div className="rounded-md bg-[#dc2626] flex items-center justify-center text-xs font-bold text-white"></div>
                        <div className="rounded-md bg-[#b91c1c] flex items-center justify-center text-xs font-bold text-white"></div>
                      </div>

                      {/* Row 3 (Likelihood 4) */}
                      <div className="grid grid-cols-5 gap-1.5 h-8">
                        <div className="rounded-md bg-[#10b981] flex items-center justify-center text-xs font-bold text-white"></div>
                        <div className="rounded-md bg-[#eab308] flex items-center justify-center text-xs font-bold text-slate-900 shadow-2xs">1</div>
                        <div className="rounded-md bg-[#f97316] flex items-center justify-center text-xs font-bold text-white shadow-2xs">3</div>
                        <div className="rounded-md bg-[#ea580c] flex items-center justify-center text-xs font-bold text-white shadow-2xs">2</div>
                        <div className="rounded-md bg-[#dc2626] flex items-center justify-center text-xs font-bold text-white"></div>
                      </div>

                      {/* Row 2 (Likelihood 3) */}
                      <div className="grid grid-cols-5 gap-1.5 h-8">
                        <div className="rounded-md bg-[#059669] flex items-center justify-center text-xs font-bold text-white"></div>
                        <div className="rounded-md bg-[#a3e635] flex items-center justify-center text-xs font-bold text-slate-900 shadow-2xs">1</div>
                        <div className="rounded-md bg-[#f97316] flex items-center justify-center text-xs font-bold text-white shadow-2xs">3</div>
                        <div className="rounded-md bg-[#ea580c] flex items-center justify-center text-xs font-bold text-white shadow-2xs">2</div>
                        <div className="rounded-md bg-[#dc2626] flex items-center justify-center text-xs font-bold text-white"></div>
                      </div>

                      {/* Row 1 (Likelihood 2) */}
                      <div className="grid grid-cols-5 gap-1.5 h-8">
                        <div className="rounded-md bg-[#047857] flex items-center justify-center text-xs font-bold text-white"></div>
                        <div className="rounded-md bg-[#10b981] flex items-center justify-center text-xs font-bold text-white">
                          <span className="w-5 h-5 rounded-full bg-white/30 text-white flex items-center justify-center text-[10px]">1</span>
                        </div>
                        <div className="rounded-md bg-[#84cc16] flex items-center justify-center text-xs font-bold text-slate-900 shadow-2xs">1</div>
                        <div className="rounded-md bg-[#eab308] flex items-center justify-center text-xs font-bold text-slate-900 shadow-2xs">1</div>
                        <div className="rounded-md bg-[#f97316] flex items-center justify-center text-xs font-bold text-white"></div>
                      </div>

                      {/* Row 0 (Likelihood 1) */}
                      <div className="grid grid-cols-5 gap-1.5 h-8">
                        <div className="rounded-md bg-[#065f46] flex items-center justify-center text-xs font-bold text-white"></div>
                        <div className="rounded-md bg-[#047857] flex items-center justify-center text-xs font-bold text-white"></div>
                        <div className="rounded-md bg-[#059669] flex items-center justify-center text-xs font-bold text-white"></div>
                        <div className="rounded-md bg-[#10b981] flex items-center justify-center text-xs font-bold text-white"></div>
                        <div className="rounded-md bg-[#84cc16] flex items-center justify-center text-xs font-bold text-slate-900 shadow-2xs">1</div>
                      </div>

                      {/* X-Axis Labels */}
                      <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-bold text-slate-500 pt-1.5 select-none">
                        <span>Low</span>
                        <span>Low</span>
                        <span>Med</span>
                        <span>High</span>
                        <span>High</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 text-center text-[11px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                    Impact ➔
                  </div>
                </div>
              </div>

              {/* Special Executive Strategic Hub (For Executive Leadership) */}
              {user?.role === 'Executive' && (
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <span>⚖</span>
                        <span>Executive Strategic Decision Hub</span>
                        <span className="text-amber-500">⚡</span>
                      </h3>
                      <p className="text-xs text-slate-500">Direct authorization controls for CISO and Executive Board members.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setShowBriefingModal(true)}
                        className="px-5 py-2 rounded-full text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Generate CISO Briefing</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSessionToast('SOC Threat Briefing dispatched to On-Duty Operations.');
                          setTimeout(() => setSessionToast(null), 5000);
                        }}
                        className="px-5 py-2 rounded-full text-xs font-bold bg-white hover:bg-emerald-50 text-emerald-800 border-2 border-emerald-600 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                      >
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Request Threat Briefing</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 2: USERS & RBAC (PRESERVED ADMIN GOVERNANCE WORKSPACE)   */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'users' && user?.role === 'Admin' && (
            <div className="space-y-6">
              {/* Admin Header with Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
                    <Users className="w-6 h-6 text-red-600" />
                    <span>Admin User Management & RBAC Governance</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Restricted to Admin Level 4. Manage user approvals, role assignments, MFA policies, and account access.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    onClick={() => {
                      setProvError('');
                      setShowProvisionModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Add New User</span>
                  </button>

                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono">
                    <span className="text-slate-500 font-sans font-medium">Invite Code:</span>
                    <span className="font-bold text-emerald-700">{INVITE_CODE}</span>
                    <button
                      onClick={handleCopyInvite}
                      title="Copy Enterprise Code"
                      className="hover:text-emerald-600 transition ml-1"
                    >
                      {copiedInvite ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      fetchUsers();
                      fetchLogs();
                    }}
                    title="Refresh directory"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers || loadingLogs ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Users Directory Table */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                    Active Directory ({allUsers.length} Users)
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-500 uppercase font-mono text-[11px] border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Department</th>
                        <th className="py-3 px-4">Assigned Role</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">MFA Shield</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{u.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">{u.department || 'InfoSec'}</td>
                          <td className="py-3.5 px-4">
                            <select
                              value={u.role}
                              disabled={actionLoadingId === u.id || u.id === user?.id}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold border border-slate-200 bg-white shadow-2xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            >
                              <option value="Admin">Admin</option>
                              <option value="Analyst">Analyst</option>
                              <option value="Executive">Executive</option>
                              <option value="Auditor">Auditor</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono inline-block ${
                                u.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {u.status || 'Active'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-xs font-bold ${
                                u.mfaEnabled ? 'text-emerald-700' : 'text-amber-600'
                              }`}
                            >
                              {u.mfaEnabled ? '✓ Enforced' : '⚠ Off'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {u.id !== user?.id && (
                              <button
                                onClick={() => handleStatusToggle(u.id, u.status || 'Active')}
                                disabled={actionLoadingId === u.id}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition"
                              >
                                {u.status === 'Suspended' ? 'Activate' : 'Suspend'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 3: ASSET INVENTORY (MODULE 2 WORKING WORKSPACE)         */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'assets' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
                    <Layers className="w-6 h-6 text-emerald-600" />
                    <span>Asset Inventory & Defended Infrastructure</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Continuous discovery of hardware appliances, cloud clusters, and mission-critical databases.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  {(user?.role === 'Admin' || user?.role === 'Analyst') && (
                    <button
                      onClick={() => setShowAddAssetModal(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add New Asset</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Asset Filters */}
              <div className="flex items-center gap-2">
                {['All', 'Hardware', 'SaaS / Cloud'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setAssetFilter(f)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                      assetFilter === f
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Assets Table */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[11px] border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4">Asset ID / Name</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Endpoint / IP</th>
                        <th className="py-3 px-4">Criticality</th>
                        <th className="py-3 px-4">Custodian / Team</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {assets
                        .filter((a) => (assetFilter === 'All' ? true : a.type === assetFilter))
                        .filter((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((a) => (
                          <tr key={a.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900 flex items-center gap-2">
                                <Server className="w-3.5 h-3.5 text-slate-400" />
                                <span>{a.name}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">{a.id} • {a.type}</div>
                            </td>
                            <td className="py-3 px-4 text-slate-600 font-medium">{a.category}</td>
                            <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{a.ip}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  a.criticality === 'Critical'
                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                    : a.criticality === 'High'
                                    ? 'bg-orange-50 text-orange-700 border border-orange-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {a.criticality}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-600">{a.owner}</td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                {a.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 4: RISK REGISTER & THREATS (MODULE 2 & 3 WORKSPACE)     */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'risks' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
                    <FileText className="w-6 h-6 text-orange-600" />
                    <span>Enterprise Risk Register & Threat Intelligence</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Continuous calculation of Inherent Risk = Likelihood (1-5) × Impact (1-5) across all CVE vectors.
                  </p>
                </div>
              </div>

              {/* Risks Table */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[11px] border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4">CVE Identifier / Title</th>
                        <th className="py-3 px-4">Affected Asset</th>
                        <th className="py-3 px-4">Severity</th>
                        <th className="py-3 px-4">Likelihood × Impact</th>
                        <th className="py-3 px-4">Risk Score</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {threats
                        .filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.cve.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900">{t.cve}</div>
                              <div className="text-[11px] text-slate-600 truncate max-w-sm">{t.title}</div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-emerald-800 font-semibold">{t.asset}</td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  t.severity === 'Critical'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {t.severity}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-600">
                              L:{t.likelihood} × I:{t.impact}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-extrabold ${
                                  t.score >= 15
                                    ? 'bg-red-600 text-white'
                                    : t.score >= 10
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-emerald-600 text-white'
                                }`}
                              >
                                {t.score} / 25
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                                  t.status === 'Resolved'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : t.status === 'Mitigating'
                                    ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}
                              >
                                {t.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 5: DEDICATED 5x5 HEATMAP (MODULE 3 WORKSPACE)           */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'heatmap' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
                  <Grid className="w-6 h-6 text-emerald-600" />
                  <span>5 × 5 Inherent Cyber Risk Heatmap Matrix</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Algorithmic distribution of all 14 active organizational risks by Likelihood (1-5) and Impact (1-5).
                </p>
              </div>

              {/* Large Heatmap View */}
              <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col justify-between h-72 text-xs font-bold text-slate-500 text-right pr-2">
                    <span>Likelihood: 5 (Almost Certain)</span>
                    <span>Likelihood: 4 (Likely)</span>
                    <span>Likelihood: 3 (Moderate)</span>
                    <span>Likelihood: 2 (Unlikely)</span>
                    <span>Likelihood: 1 (Rare)</span>
                  </div>

                  <div className="flex-1 flex flex-col gap-2">
                    {/* Rows */}
                    {[5, 4, 3, 2, 1].map((row) => (
                      <div key={row} className="grid grid-cols-5 gap-2 h-12">
                        {[1, 2, 3, 4, 5].map((col) => {
                          const score = row * col;
                          const count = heatmapData[`${row}-${col}`] || 0;
                          return (
                            <div
                              key={col}
                              className={`rounded-xl p-2 flex flex-col justify-between transition hover:scale-105 cursor-pointer shadow-xs ${
                                score >= 15
                                  ? 'bg-rose-500 text-white'
                                  : score >= 10
                                  ? 'bg-amber-500 text-white'
                                  : score >= 5
                                  ? 'bg-lime-400 text-slate-900'
                                  : 'bg-emerald-600 text-white'
                              }`}
                            >
                              <div className="flex justify-between items-center text-[10px] opacity-80 font-mono">
                                <span>{score}</span>
                                <span>L{row}×I{col}</span>
                              </div>
                              <div className="text-right font-extrabold text-sm">
                                {count > 0 ? `${count} active` : '—'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}

                    <div className="grid grid-cols-5 gap-2 text-center text-xs font-bold text-slate-600 pt-2 font-mono">
                      <span>Impact 1 (Low)</span>
                      <span>Impact 2 (Minor)</span>
                      <span>Impact 3 (Med)</span>
                      <span>Impact 4 (Major)</span>
                      <span>Impact 5 (Critical)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 6: AUDIT LOGS & CREDENTIALS                             */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
                    <FileCheck2 className="w-6 h-6 text-purple-600" />
                    <span>Immutable Security Audit Stream & Identity Logs</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Read-only transparency verifying NIST SP 800-63B, ISO 27001, and SOC 2 Type II compliance.
                  </p>
                </div>

                <Link
                  to="/profile"
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                >
                  <Key className="w-3.5 h-3.5 text-slate-600" />
                  <span>Manage Profile & Credentials</span>
                </Link>
              </div>

              {/* Logs Stream Terminal */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg text-slate-100">
                <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-bold flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    LIVE IMMUTABLE EVENT STREAM
                  </span>
                  <span className="text-slate-500">ENCRYPTION: SHA-256</span>
                </div>
                <div className="max-h-96 overflow-y-auto divide-y divide-slate-800/60 p-2 font-mono text-xs">
                  {((user?.role === 'Admin' ? auditLogs : analystLogs) || []).map((log) => (
                    <div key={log.id} className="p-3 hover:bg-slate-800/40 transition flex items-start gap-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 mt-0.5 ${
                          log.severity === 'SUCCESS'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : log.severity === 'WARNING'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {log.action}
                      </span>
                      <div className="flex-1">
                        <div className="flex justify-between items-center text-slate-200 text-xs">
                          <span>{log.actor} ➔ {log.target}</span>
                          <span className="text-slate-500 text-[11px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">{log.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================= */}
      {/* 3. MODALS (DIRECT PROVISIONING, ADD ASSET, BRIEFING)       */}
      {/* ========================================================= */}

      {/* DIRECT USER PROVISIONING MODAL (Admin Path 2) */}
      {showProvisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Provision New Enterprise User</h3>
              </div>
              <button onClick={() => setShowProvisionModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProvisionSubmit} className="p-6 space-y-4 text-xs">
              {provError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{provError}</span>
                </div>
              )}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={provName}
                  onChange={(e) => setProvName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={provEmail}
                  onChange={(e) => setProvEmail(e.target.value)}
                  placeholder="sarah@riskradar.io"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Role</label>
                  <select
                    value={provRole}
                    onChange={(e) => setProvRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-sans"
                  >
                    <option value="Analyst">Analyst</option>
                    <option value="Admin">Admin</option>
                    <option value="Executive">Executive</option>
                    <option value="Auditor">Auditor</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={provDept}
                    onChange={(e) => setProvDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-sans"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Initial Password</label>
                <input
                  type={showProvPassword ? 'text' : 'password'}
                  value={provPassword}
                  onChange={(e) => setProvPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-sans font-mono"
                />
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProvisionModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={provLoading}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                >
                  {provLoading ? 'Provisioning...' : 'Provision User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD ASSET MODAL (MODULE 2) */}
      {showAddAssetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Add Infrastructure Asset</h3>
              </div>
              <button onClick={() => setShowAddAssetModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAsset} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Asset Hostname / Identifier</label>
                <input
                  type="text"
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  placeholder="e.g. SRV-AUTH-LDAP-01"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Asset Type</label>
                  <select
                    value={newAssetType}
                    onChange={(e) => setNewAssetType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-sans"
                  >
                    <option value="Hardware">Hardware Server</option>
                    <option value="SaaS / Cloud">SaaS / Cloud Cluster</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Criticality Rating</label>
                  <select
                    value={newAssetCriticality}
                    onChange={(e) => setNewAssetCriticality(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-sans font-bold"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Technical Owner / Custodian</label>
                <input
                  type="text"
                  value={newAssetOwner}
                  onChange={(e) => setNewAssetOwner(e.target.value)}
                  placeholder="e.g. Platform SecOps"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-sans"
                />
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddAssetModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXECUTIVE BRIEFING MODAL */}
      {showBriefingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Executive Cybersecurity Posture Brief</h3>
                  <p className="text-[10px] text-slate-400 font-mono">RESTRICTED • CISO BOARD OF DIRECTORS</p>
                </div>
              </div>
              <button onClick={() => setShowBriefingModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                <span className="font-bold block">Posture Overview</span>
                <p className="text-emerald-800 leading-relaxed text-[11px]">
                  Enterprise defense systems active. Total open risks: {activeOpenRisksCount}. Critical CVEs under 48h mitigation SLA: {criticalThreatsCount}. Overall security posture score is maintained at {securityPostureScore}/100.
                </p>
              </div>

              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="block text-[10px] text-slate-400 font-mono">Open Risks</span>
                  <span className="text-lg font-bold font-mono text-slate-900">{activeOpenRisksCount}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="block text-[10px] text-slate-400 font-mono">Critical</span>
                  <span className="text-lg font-bold font-mono text-rose-600">{criticalThreatsCount}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="block text-[10px] text-slate-400 font-mono">Assets</span>
                  <span className="text-lg font-bold font-mono text-slate-900">{monitoredAssetsCount}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="block text-[10px] text-slate-400 font-mono">Posture</span>
                  <span className="text-lg font-bold font-mono text-emerald-700">{securityPostureScore}%</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBriefingModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 text-white shadow-sm hover:bg-emerald-800 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Brief</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
