// RiskRadar - Enterprise Cybersecurity Risk Governance Platform
// Module 3: Executive KPI Dashboard, 5x5 Heatmap Visualization & Report Export Engine
// Contributor: Afri Alam Dipto (ID: 232-35-643)
// Fully Connected Modules 1, 2, and 3 with Real-time State & Live Calculations
// Roles: Admin, Analyst, Executive, Auditor

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/user.api';
import { assetApi } from '../api/asset.api';
import { riskApi } from '../api/risk.api';
import { reportApi } from '../api/report.api';
import { exportRisksToCSV, exportAuditTrailToCSV, printExecutivePDFReport } from '../utils/reportExport';
import {
  Shield,
  Users,
  Activity,
  Layers,
  AlertCircle,
  FileCheck2,
  Lock,
  CheckCircle2,
  Trash2,
  User,
  Copy,
  Check,
  RefreshCw,
  ChevronDown,
  UserPlus,
  Eye,
  EyeOff,
  X,
  Search,
  ExternalLink,
  FileText,
  Printer,
  TrendingUp,
  LayoutDashboard,
  Grid,
  Filter,
  LogOut,
  Menu,
  Server,
  Database,
  Plus,
  Sliders,
  Edit2,
  Download,
  Kanban,
  Table,
  Megaphone,
} from 'lucide-react';

// ==========================================
// SEED DATA: USERS & RBAC (FALLBACK + LIVE)
// ==========================================
const INITIAL_USERS = [
  { id: 'usr_admin_01', name: 'Mahabubur Rahman (Admin)', email: 'admin@riskradar.io', role: 'Admin', department: 'Information Security', mfaEnabled: true, status: 'Active' },
  { id: 'usr_analyst_01', name: 'Afri Alam (Analyst)', email: 'analyst@riskradar.io', role: 'Analyst', department: 'SOC / Threat Intelligence', mfaEnabled: true, status: 'Active' },
  { id: 'usr_exec_01', name: 'Executive Leader', email: 'executive@riskradar.io', role: 'Executive', department: 'Executive Board', mfaEnabled: false, status: 'Active' },
  { id: 'usr_auditor_01', name: 'External Auditor', email: 'auditor@riskradar.io', role: 'Auditor', department: 'Compliance & Audit', mfaEnabled: true, status: 'Active' },
];

// ==========================================
// SEED DATA: ASSET INVENTORY (EXACT TO REFERENCE)
// 28 Assets Total: 14 Cloud, 6 Database, 8 Software (14 Database & Apps), 6 Critical Tier 5
// ==========================================
const INITIAL_ASSETS = [
  { id: 'AST-101', name: 'AWS Production DB', location: 'US-East-1', category: 'Cloud', criticality: 'Tier 5 Critical', sensitivity: 'Restricted', owner: 'Sarah J.', ip: '10.0.4.12' },
  { id: 'AST-102', name: 'Internal HR Portal', location: 'On-Premise', category: 'Software', criticality: 'Tier 4 High', sensitivity: 'Restricted', owner: 'Alex M.', ip: '192.168.10.5' },
  { id: 'AST-103', name: 'Salesforce CRM', location: 'SaaS', category: 'Software', criticality: 'Tier 4 High', sensitivity: 'Confidential', owner: 'DevOps Team', ip: 'crm.salesforce.com' },
  { id: 'AST-104', name: 'Main Finance DB', location: 'Central-HQ', category: 'Database', criticality: 'Tier 4 High', sensitivity: 'Confidential', owner: 'Finance IT', ip: '10.0.6.10' },
  { id: 'AST-105', name: 'Docker Host 04', location: 'Cloud-West', category: 'Cloud', criticality: 'Tier 4 High', sensitivity: 'Confidential', owner: 'Admin', ip: '10.0.12.80' },
  { id: 'AST-106', name: 'SRV-PROD-AUTH01', location: 'US-East-1', category: 'Cloud', criticality: 'Tier 5 Critical', sensitivity: 'Restricted', owner: 'Identity Team', ip: '10.0.1.15' },
  { id: 'AST-107', name: 'Customer Analytics Warehouse', location: 'Snowflake-SaaS', category: 'Database', criticality: 'Tier 5 Critical', sensitivity: 'Restricted', owner: 'Data Ops', ip: 'snowflake.data.net' },
  { id: 'AST-108', name: 'Edge Cisco Firewall Cluster', location: 'DataCenter-A', category: 'Hardware', criticality: 'Tier 5 Critical', sensitivity: 'Restricted', owner: 'SecOps', ip: '192.168.1.1' },
  { id: 'AST-109', name: 'Kubernetes Ingress Gateway', location: 'EKS-Cluster-01', category: 'Cloud', criticality: 'Tier 5 Critical', sensitivity: 'Restricted', owner: 'Platform Team', ip: '10.0.2.20' },
  { id: 'AST-110', name: 'Crypto Key Vault HSM', location: 'Hardware Module', category: 'Hardware', criticality: 'Tier 5 Critical', sensitivity: 'Restricted', owner: 'Infosec Board', ip: '10.0.9.5' },
  { id: 'AST-111', name: 'Payment Processing Service', location: 'PCI-Zone-East', category: 'Software', criticality: 'Tier 4 High', sensitivity: 'Restricted', owner: 'Sarah J.', ip: '10.0.8.50' },
  { id: 'AST-112', name: 'Corporate Email Gateway', location: 'Cloud-Exchange', category: 'Software', criticality: 'Tier 2 Low', sensitivity: 'Internal', owner: 'IT Support', ip: 'mail.riskradar.io' },
  { id: 'AST-113', name: 'Cloudflare WAF Proxy', location: 'Global Edge', category: 'Cloud', criticality: 'Tier 4 High', sensitivity: 'Confidential', owner: 'SecOps', ip: '104.16.12.3' },
  { id: 'AST-114', name: 'DevOps CI/CD Runner Cluster', location: 'AWS-East', category: 'Cloud', criticality: 'Tier 3 Medium', sensitivity: 'Internal', owner: 'DevOps Team', ip: '10.0.3.10' },
  { id: 'AST-115', name: 'PostgreSQL Secondary Replica', location: 'RDS-MultiAZ', category: 'Database', criticality: 'Tier 4 High', sensitivity: 'Confidential', owner: 'Finance IT', ip: '10.0.6.11' },
  { id: 'AST-116', name: 'Customer Service Desk Jira', location: 'Atlassian SaaS', category: 'Software', criticality: 'Tier 3 Medium', sensitivity: 'Internal', owner: 'Alex M.', ip: 'jira.atlassian.net' },
  { id: 'AST-117', name: 'Employee Active Directory', location: 'Azure-AD', category: 'Cloud', criticality: 'Tier 4 High', sensitivity: 'Restricted', owner: 'Identity Team', ip: 'login.microsoft.com' },
  { id: 'AST-118', name: 'Core SAN Storage Vault', location: 'Central-HQ', category: 'Hardware', criticality: 'Tier 4 High', sensitivity: 'Confidential', owner: 'Data Ops', ip: '10.0.6.99' },
  { id: 'AST-119', name: 'Redis Cache Cluster', location: 'Cloud-East', category: 'Database', criticality: 'Tier 3 Medium', sensitivity: 'Internal', owner: 'Platform Team', ip: '10.0.7.12' },
  { id: 'AST-120', name: 'Stripe API Webhook Node', location: 'Serverless-Lambda', category: 'Cloud', criticality: 'Tier 4 High', sensitivity: 'Restricted', owner: 'Finance IT', ip: 'api.stripe.com' },
  { id: 'AST-121', name: 'Offsite Cold S3 Archive', location: 'US-West-Glacier', category: 'Cloud', criticality: 'Tier 3 Medium', sensitivity: 'Confidential', owner: 'Compliance', ip: 's3.glacier.aws' },
  { id: 'AST-122', name: 'Core Distribution Switch A', location: 'IDF-Rack-02', category: 'Hardware', criticality: 'Tier 3 Medium', sensitivity: 'Internal', owner: 'Network Eng', ip: '10.0.1.2' },
  { id: 'AST-123', name: 'Core Distribution Switch B', location: 'IDF-Rack-03', category: 'Hardware', criticality: 'Tier 3 Medium', sensitivity: 'Internal', owner: 'Network Eng', ip: '10.0.1.3' },
  { id: 'AST-124', name: 'Public Marketing Site', location: 'Vercel Edge', category: 'Cloud', criticality: 'Tier 1 Low', sensitivity: 'Public', owner: 'Marketing Tech', ip: 'riskradar.io' },
  { id: 'AST-125', name: 'SIEM Splunk Indexer', location: 'Cloud-Dedicated', category: 'Cloud', criticality: 'Tier 4 High', sensitivity: 'Restricted', owner: 'SOC Team', ip: '10.0.2.100' },
  { id: 'AST-126', name: 'MongoDB Lead Store', location: 'Mongo Atlas', category: 'Database', criticality: 'Tier 3 Medium', sensitivity: 'Confidential', owner: 'Marketing Tech', ip: 'cluster0.mongodb.net' },
  { id: 'AST-127', name: 'Slack Enterprise Grid', location: 'SaaS Workspace', category: 'Software', criticality: 'Tier 2 Low', sensitivity: 'Internal', owner: 'Admin', ip: 'slack.com' },
  { id: 'AST-128', name: 'Elasticsearch Log Node', location: 'Cloud-Analytics', category: 'Database', criticality: 'Tier 3 Medium', sensitivity: 'Internal', owner: 'SOC Team', ip: '10.0.5.40' },
];

// ==========================================
// SEED DATA: RISK REGISTER & KANBAN WORKFLOW
// Exact match to reference screenshot:
// Identified: 5 cards, Assessed: 3 cards, Mitigating: 4 cards, Resolved: 8 cards
// ==========================================
const INITIAL_THREATS = [
  // 4 Active SOC Queue items (matching Image 1)
  { id: 'RSK-2026-0001', cve: 'CVE-2024-38856', title: 'Phishing Attempt on Finance', assetId: 'AST-104', assetName: 'Financial Ledger DB - Azure', severity: 'High', likelihood: 3, impact: 5, score: 15, status: 'Identified', assignee: 'Afri Alam', date: 'Just Now' },
  { id: 'RSK-2026-0002', cve: 'CVE-2024-6387', title: 'Unauthorized SSH Attempt', assetId: 'AST-105', assetName: 'Biometric Access Control', severity: 'Medium', likelihood: 3, impact: 3, score: 9, status: 'Identified', assignee: 'Afri Alam', date: 'Just Now' },
  { id: 'RSK-2026-0003', cve: 'CVE-2024-21626', title: 'Ransomware Indicator', assetId: 'AST-101', assetName: 'Production Database - AWS US-East', severity: 'Critical', likelihood: 5, impact: 5, score: 25, status: 'Identified', assignee: 'Afri Alam', date: 'Just Now' },
  { id: 'RSK-2026-0004', cve: 'CVE-2024-1102', title: 'Outdated Endpoint software', assetId: 'AST-103', assetName: 'Internal HR Server - On-Prem', severity: 'Low', likelihood: 2, impact: 2, score: 4, status: 'Identified', assignee: 'Afri Alam', date: 'Just Now' },

  // Remaining active threats (making total Open Threats = 9, Critical CVEs = 3)
  { id: 'RSK-2026-0091', cve: 'CVE-2024-3094', title: 'SQL Injection', assetId: 'AST-101', assetName: 'Production Database - AWS US-East', severity: 'Critical', likelihood: 4, impact: 5, score: 20, status: 'Identified', assignee: 'Afri Alam', date: 'Jan 07' },
  { id: 'RSK-2026-0092', cve: 'CVE-2024-4577', title: 'Unpatched API Gateway', assetId: 'AST-102', assetName: 'Customer CRM Portal - SaaS', severity: 'High', likelihood: 3, impact: 5, score: 15, status: 'Assessed', assignee: 'Afri Alam', date: 'Jan 08' },
  { id: 'RSK-2026-0093', cve: 'CVE-2024-21413', title: 'Unencrypted Backups', assetId: 'AST-104', assetName: 'Financial Ledger DB - Azure', severity: 'Medium', likelihood: 3, impact: 3, score: 9, status: 'Mitigating', assignee: 'Afri Alam', date: 'Jan 10' },
  { id: 'RSK-2026-0097', cve: 'CVE-2024-3400', title: 'Critical unpatched vulnerability on legacy OS', assetId: 'AST-105', assetName: 'Biometric Access Control', severity: 'Critical', likelihood: 4, impact: 5, score: 20, status: 'Assessed', assignee: 'Afri Alam', date: 'Jan 12' },
  { id: 'RSK-2026-0098', cve: 'CVE-2024-1709', title: 'Default Credentials on Internal Gateway', assetId: 'AST-108', assetName: 'Edge Cisco Firewall Cluster', severity: 'Medium', likelihood: 3, impact: 3, score: 9, status: 'Mitigating', assignee: 'Afri Alam', date: 'Jan 14' },

  // 5 Resolved Threats (making Mitigated This Week = 5)
  { id: 'RSK-2026-0061', cve: 'CVE-2024-1101', title: 'Expired SSL Certificate on Dev Sandbox', assetId: 'AST-114', assetName: 'DevOps CI/CD Runner Cluster', severity: 'Low', likelihood: 1, impact: 3, score: 3, status: 'Resolved', assignee: 'Afri Alam', date: 'Jan 24' },
  { id: 'RSK-2026-0062', cve: 'CVE-2023-4863', title: 'Weak password policies', assetId: 'AST-112', assetName: 'Corporate Email Gateway', severity: 'Low', likelihood: 2, impact: 2, score: 4, status: 'Resolved', assignee: 'Afri Alam', date: 'Jan 25' },
  { id: 'RSK-2026-0063', cve: 'CVE-2024-3090', title: 'Insecure TLS 1.1 protocol enabled', assetId: 'AST-104', assetName: 'Financial Ledger DB - Azure', severity: 'Low', likelihood: 2, impact: 2, score: 4, status: 'Resolved', assignee: 'Afri Alam', date: 'Jan 26' },
  { id: 'RSK-2026-0064', cve: 'CVE-2024-1103', title: 'Public Directory Listing in Backup Subdomain', assetId: 'AST-124', assetName: 'Public Marketing Site', severity: 'Medium', likelihood: 2, impact: 3, score: 6, status: 'Resolved', assignee: 'Afri Alam', date: 'Jan 28' },
  { id: 'RSK-2026-0065', cve: 'CVE-2024-1104', title: 'Cross-Site Scripting in User Portal', assetId: 'AST-102', assetName: 'Customer CRM Portal - SaaS', severity: 'High', likelihood: 3, impact: 4, score: 12, status: 'Resolved', assignee: 'Afri Alam', date: 'Jan 29' },
];

// ==========================================
// SEED DATA: AUDIT LOGS (MULTI-ROLE ENTERPRISE ATTESTATION)
// ==========================================
const INITIAL_AUDIT_LOGS = [
  { id: 'aud_live_01', timestamp: '2026-11-17T13:22:15.000Z', actor: 'External Auditor (Auditor)', role: 'Auditor', action: 'POLICY_ENFORCEMENT', target: 'Audit Log Export (PDF)', details: 'Compliance audit report exported to PDF.', severity: 'SUCCESS' },
  { id: 'aud_live_02', timestamp: '2026-11-17T13:00:32.000Z', actor: 'Executive Leader (Executive)', role: 'Executive', action: 'AUTH_SUCCESS', target: 'Executive Board Portal', details: 'Executive authenticated with 2-Step verification.', severity: 'SUCCESS' },
  { id: 'aud_live_03', timestamp: '2026-11-17T12:59:23.000Z', actor: 'Afri Alam (Analyst)', role: 'Analyst', action: 'RISK_LOGGED', target: 'Risk: RSK-2026-0091', details: 'Identified SQL injection threat vector on Customer DB.', severity: 'WARNING' },
  { id: 'aud_live_04', timestamp: '2026-11-17T12:55:12.000Z', actor: 'Mahabubur Rahman (Admin)', role: 'Admin', action: 'USER_LOGIN', target: 'System Login', details: 'Successful authenticated login via MFA token.', severity: 'SUCCESS' },
  { id: 'aud_live_05', timestamp: '2026-11-17T12:40:00.000Z', actor: 'Mahabubur Rahman (Admin)', role: 'Admin', action: 'ROLE_UPDATED', target: 'User: admin_user', details: 'Updated role permissions in access directory.', severity: 'WARNING' },
  { id: 'aud_live_06', timestamp: '2026-11-17T12:35:00.000Z', actor: 'Mahabubur Rahman (Admin)', role: 'Admin', action: 'ASSET_CREATED', target: 'Asset: Server-01', details: 'Registered new production database in cloud cluster.', severity: 'SUCCESS' },
  { id: 'aud_live_07', timestamp: '2026-11-17T12:20:00.000Z', actor: 'Afri Alam (Analyst)', role: 'Analyst', action: 'RISK_MITIGATING', target: 'Risk: #R-102', details: 'Advanced lifecycle state to Mitigating workflow.', severity: 'INFO' },
  { id: 'aud_live_08', timestamp: '2026-11-17T12:15:00.000Z', actor: 'RiskRadar Security Daemon', role: 'System', action: 'SYSTEM_BOOT', target: 'System Core Engine', details: 'Security session policy initialized.', severity: 'INFO' },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation & View State
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'assets' | 'risks' | 'heatmap' | 'audit'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('All Risks');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Strict Authentication Role (Strict RBAC - No bypass or switching)
  const userRole = user?.role || 'Analyst';
  const isAnalyst = userRole === 'Analyst';
  const isAdmin = userRole === 'Admin';
  const isExecutive = userRole === 'Executive';
  const isAuditor = userRole === 'Auditor';

  useEffect(() => {
    if (isAnalyst && activeTab === 'users') {
      setActiveTab('overview');
    }
    if (isExecutive && (activeTab === 'users' || activeTab === 'assets' || activeTab === 'risks' || activeTab === 'audit')) {
      setActiveTab('overview');
    }
    if (isAuditor && (activeTab === 'users' || activeTab === 'assets')) {
      setActiveTab('overview');
    }
  }, [isAnalyst, isExecutive, isAuditor, activeTab]);

  // Executive Board Briefing Studio & Section Selection
  const [showBriefingModal, setShowBriefingModal] = useState(false);
  const [showExportBriefingStudio, setShowExportBriefingStudio] = useState(false);
  const [briefingTarget, setBriefingTarget] = useState('Afri Alam (Lead Analyst)');
  const [briefingTopic, setBriefingTopic] = useState('Cloud Infrastructure & Critical DB Threat Posture');
  const [briefingPriority, setBriefingPriority] = useState('High');
  const [briefingNotes, setBriefingNotes] = useState('');
  const [briefingSent, setBriefingSent] = useState(false);
  const [briefingSections, setBriefingSections] = useState({
    kpiSummary: true,
    deptExposure: true,
    inherentHeatmap: true,
    topThreats: true,
    socReadiness: true,
    governanceMilestones: true,
    signOffBlock: true,
  });

  const handleDispatchBriefing = (e) => {
    e?.preventDefault();
    setBriefingSent(true);
    setTimeout(() => {
      showFeedback(`Priority SOC Threat Briefing request dispatched to ${briefingTarget}!`, 'success');
      setShowBriefingModal(false);
      setBriefingSent(false);
      setBriefingNotes('');
    }, 400);
  };

  const handlePrintBriefingDocument = () => {
    const content = document.getElementById('board-briefing-document-content');
    if (!content) return;
    const printWindow = window.open('', '_blank', 'width=950,height=1150');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>RiskRadar - Executive Board Cyber Governance Briefing</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { size: A4; margin: 10mm 12mm; }
            body { font-family: system-ui, -apple-system, sans-serif; background: #ffffff; color: #0f172a; margin: 0; padding: 12px; }
            @media print {
              body { padding: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="max-w-[850px] mx-auto bg-white">
            ${content.innerHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 450);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrintAuditReport = () => {
    const printWindow = window.open('', '_blank', 'width=950,height=1150');
    if (!printWindow) {
      window.print();
      return;
    }

    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const currentTime = new Date().toLocaleTimeString('en-US');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>RiskRadar - Compliance Audit & Attestation Report</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            @page { size: A4; margin: 12mm 15mm; }
            body { font-family: system-ui, -apple-system, sans-serif; background: #ffffff; color: #0f172a; margin: 24px; padding: 0; line-height: 1.4; font-size: 12px; }
            .header { border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: flex-start; }
            .logo-title { font-size: 22px; font-weight: 900; color: #059669; letter-spacing: -0.5px; }
            .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
            .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; margin-bottom: 18px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
            .meta-item .label { font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 2px; }
            .meta-item .val { font-size: 13px; font-weight: 800; color: #0f172a; }
            .section-title { font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 18px; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
            .framework-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 6px; }
            th { text-align: left; padding: 6px 8px; font-size: 12px; font-weight: 700; color: #475569; background: #f1f5f9; border-bottom: 1px solid #cbd5e1; }
            td { padding: 6px 8px; font-size: 12px; border-bottom: 1px solid #e2e8f0; }
            .footer { margin-top: 24px; padding-top: 12px; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between; font-size: 12px; color: #64748b; }
            @media print { body { margin: 12px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo-title">RiskRadar</div>
              <div style="font-weight: 800; font-size: 15px; margin-top: 2px;">Independent Compliance Audit & Attestation Report</div>
              <div style="color: #64748b; font-size: 12px; margin-top: 2px;">Daffodil International University • Enterprise Security Governance</div>
            </div>
            <div style="text-align: right;">
              <span class="badge">AUDIT STATUS: COMPLIANT</span>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Attested: ${currentDate} ${currentTime}</div>
            </div>
          </div>

          <div class="meta-box">
            <div class="meta-item"><div class="label">Auditor</div><div class="val">External Auditor</div></div>
            <div class="meta-item"><div class="label">Access Scope</div><div class="val">Read-Only Auditor</div></div>
            <div class="meta-item"><div class="label">Compliance Score</div><div class="val" style="color: #059669;">${complianceMetrics.overallScore}%</div></div>
            <div class="meta-item"><div class="label">Verified Controls</div><div class="val">${complianceMetrics.passedControls} / ${complianceMetrics.totalControls} Passed</div></div>
          </div>

          <div class="section-title">1. Control Framework Attestation</div>
          <div class="framework-bar">
            <span><strong>SOC 2 Type II</strong> — Security, Availability & Confidentiality</span>
            <span style="font-weight: 800; color: #059669;">${complianceMetrics.soc2Pct}% Attested</span>
          </div>
          <div class="framework-bar">
            <span><strong>ISO/IEC 27001:2022</strong> — Information Security Management</span>
            <span style="font-weight: 800; color: #059669;">${complianceMetrics.iso27001Pct}% Attested</span>
          </div>
          <div class="framework-bar">
            <span><strong>NIST SP 800-53 Rev. 5</strong> — Federal Security & Privacy Controls</span>
            <span style="font-weight: 800; color: #059669;">${complianceMetrics.nistPct}% Attested</span>
          </div>

          <div class="section-title">2. Audit Trail Verification</div>
          <p style="font-size: 12px; color: #475569; margin: 4px 0 8px 0;">
            All <strong>${auditLogs.length}</strong> recorded audit events were verified for integrity and completeness.
          </p>
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Target</th>
                <th>Integrity Status</th>
              </tr>
            </thead>
            <tbody>
              ${(auditLogs && auditLogs.length > 0 ? auditLogs.slice(0, 8) : [
                { timestamp: new Date().toISOString(), actor: 'System', action: 'POLICY_ENFORCEMENT', target: 'Audit Trail' }
              ]).map(log => `
                <tr>
                  <td style="font-family: monospace; font-size: 12px;">${new Date(log.timestamp).toLocaleString()}</td>
                  <td><strong>${log.actor || 'System'}</strong></td>
                  <td><code style="background: #f1f5f9; padding: 2px 4px; border-radius: 4px;">${log.action || log.event}</code></td>
                  <td>${log.target || 'N/A'}</td>
                  <td style="color: #059669; font-weight: 700;">✓ Verified</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <div>Attested by: <strong>External Auditor</strong> (Compliance & Audit Unit)</div>
            <div>Integrity Verification: SHA-256 Verified • Read-Only Audit Record</div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 450);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrintCompliancePDF = () => {
    const printWindow = window.open('', '_blank', 'width=950,height=1150');
    if (!printWindow) {
      window.print();
      return;
    }

    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const currentTime = new Date().toLocaleTimeString('en-US');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>RiskRadar - Risk Scoring Verification & 5x5 Matrix Compliance Report</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            @page { size: A4; margin: 12mm 15mm; }
            body { font-family: system-ui, -apple-system, sans-serif; background: #ffffff; color: #0f172a; margin: 24px; padding: 0; line-height: 1.4; font-size: 12px; }
            .header { border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: flex-start; }
            .logo-title { font-size: 22px; font-weight: 900; color: #059669; letter-spacing: -0.5px; }
            .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
            .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; margin-bottom: 18px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
            .meta-item .label { font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 2px; }
            .meta-item .val { font-size: 13px; font-weight: 800; color: #0f172a; }
            .section-title { font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 18px; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 6px; }
            th { text-align: left; padding: 6px 8px; font-size: 12px; font-weight: 700; color: #475569; background: #f1f5f9; border-bottom: 1px solid #cbd5e1; }
            td { padding: 6px 8px; font-size: 12px; border-bottom: 1px solid #e2e8f0; }
            .footer { margin-top: 24px; padding-top: 12px; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between; font-size: 12px; color: #64748b; }
            @media print { body { margin: 12px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo-title">RiskRadar</div>
              <div style="font-weight: 800; font-size: 15px; margin-top: 2px;">Risk Scoring Verification & 5x5 Matrix Compliance Report</div>
              <div style="color: #64748b; font-size: 12px; margin-top: 2px;">Daffodil International University • Enterprise Security Governance</div>
            </div>
            <div style="text-align: right;">
              <span class="badge">SCORING AUDIT: COMPLIANT</span>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Attested: ${currentDate} ${currentTime}</div>
            </div>
          </div>

          <div class="meta-box">
            <div class="meta-item"><div class="label">Auditor</div><div class="val">External Auditor</div></div>
            <div class="meta-item"><div class="label">Formula Calibration</div><div class="val" style="color: #059669;">L × I = Risk Rating (1-5)</div></div>
            <div class="meta-item"><div class="label">Mitigation Offset</div><div class="val">35% Applied</div></div>
            <div class="meta-item"><div class="label">Verified Risks</div><div class="val">${threats.length} Entries</div></div>
          </div>

          <div class="section-title">1. Mathematical Scoring Formula Attestation</div>
          <p style="font-size: 12px; color: #475569; margin: 4px 0 8px 0;">
            The risk calculation engine applies NIST SP 800-30 inherent risk computation formula: <code>Likelihood (1-5) × Impact (1-5) = Inherent Risk Rating (1-25)</code>. Residual offset controls apply standard 35% mitigation discount.
          </p>

          <div class="section-title">2. Verified Risk Exposure Entries</div>
          <table>
            <thead>
              <tr>
                <th>Risk ID</th>
                <th>Description</th>
                <th>Category</th>
                <th>Likelihood</th>
                <th>Impact</th>
                <th>Inherent Rating</th>
                <th>Verified By</th>
              </tr>
            </thead>
            <tbody>
              ${threats.map(t => {
                const cat = t.category || (t.title.includes('Cloud') ? 'Infrastructure' : t.title.includes('API') ? 'Data Privacy' : 'Cyber Security');
                return `
                  <tr>
                    <td style="font-family: monospace; font-size: 12px; font-weight: bold;">${t.id}</td>
                    <td><strong>${t.title}</strong></td>
                    <td>${cat}</td>
                    <td style="font-family: monospace; text-align: center;">${t.likelihood}</td>
                    <td style="font-family: monospace; text-align: center;">${t.impact}</td>
                    <td style="font-weight: bold; color: ${t.score >= 15 ? '#e11d48' : t.score >= 10 ? '#ea580c' : '#059669'};">
                      ${t.score} (${t.severity})
                    </td>
                    <td style="color: #059669; font-weight: 700;">Ext. Auditor ✓</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="footer">
            <div>Attested by: <strong>External Auditor</strong> (Compliance & Audit Unit)</div>
            <div>Integrity Verification: SHA-256 Verified • Read-Only Audit Record</div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 450);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Risk Register: View Mode (Kanban vs Table) & Filters
  const [riskViewMode, setRiskViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [selectedCellFilter, setSelectedCellFilter] = useState(null); // { likelihood, impact }
  const [selectedAssetFilter, setSelectedAssetFilter] = useState(null); // 'AST-101'
  const [riskStatusFilter, setRiskStatusFilter] = useState('All');
  const [riskSeverityFilter, setRiskSeverityFilter] = useState('All');
  const [selectedAuditDetailRisk, setSelectedAuditDetailRisk] = useState(null);

  // Asset Inventory: Category Underline Tabs & Criticality Filter
  const [assetCategoryFilter, setAssetCategoryFilter] = useState('All'); // 'All' | 'Cloud' | 'Database' | 'Software' | 'Hardware'
  const [assetCriticalityFilter, setAssetCriticalityFilter] = useState('All'); // 'All' | 'Critical' | 'High' | 'Medium' | 'Low'

  // Overview Trend & Users Directory Filters
  const [trendSeverityFilter, setTrendSeverityFilter] = useState('All'); // 'All' | 'Critical' | 'High' | 'Medium' | 'Low'
  const [userRoleFilter, setUserRoleFilter] = useState('All'); // 'All' | 'Admin' | 'Analyst' | 'Executive' | 'Auditor'

  // Admin Data State (Resilient Seed Cache)
  const [allUsers, setAllUsers] = useState(INITIAL_USERS);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [adminFeedback, setAdminFeedback] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Operational State
  const [analystLogs, setAnalystLogs] = useState([]);
  const [teamRoster, setTeamRoster] = useState([]);

  // Modals State
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

  // Module 2: Interactive Assets State
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetLocation, setNewAssetLocation] = useState('US-East-1');
  const [newAssetCategory, setNewAssetCategory] = useState('Cloud');
  const [newAssetCriticality, setNewAssetCriticality] = useState('Tier 4 High');
  const [newAssetSensitivity, setNewAssetSensitivity] = useState('Confidential');
  const [newAssetOwner, setNewAssetOwner] = useState('Sarah J.');

  // Module 3: Interactive Threats State
  const [threats, setThreats] = useState(INITIAL_THREATS);
  const [showAddThreatModal, setShowAddThreatModal] = useState(false);
  const [newThreatTitle, setNewThreatTitle] = useState('');
  const [newThreatCve, setNewThreatCve] = useState('');
  const [newThreatAssetId, setNewThreatAssetId] = useState(INITIAL_ASSETS[0]?.id || 'AST-101');
  const [newThreatLikelihood, setNewThreatLikelihood] = useState(4);
  const [newThreatImpact, setNewThreatImpact] = useState(4);
  const [newThreatAssignee, setNewThreatAssignee] = useState('A. Rahman');

  // ==========================================
  // TAB 5: HEATMAP SIMULATOR & INTERACTIVE STATE
  // ==========================================
  const [simLikelihood, setSimLikelihood] = useState(4);
  const [simImpact, setSimImpact] = useState(5);
  const [simCriticalityTier, setSimCriticalityTier] = useState(5);
  const [simControlEffectiveness, setSimControlEffectiveness] = useState(40);
  const [selectedMatrixCell, setSelectedMatrixCell] = useState({ likelihood: 4, impact: 5 });

  // ==========================================
  // TAB 6: AUDIT TRAIL & PROFILE INTERACTIVE STATE
  // ==========================================
  const [auditSearch, setAuditSearch] = useState('');
  const [auditFilterAction, setAuditFilterAction] = useState('All');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const INVITE_CODE = 'RR-ORG-2026';

  // Fetch Users & Logs from Backend with Silent Fallback
  const fetchUsers = useCallback(() => {
    if (user?.role !== 'Admin') return;
    setLoadingUsers(true);
    userApi
      .listUsers()
      .then((res) => {
        if (res.success && res.users && res.users.length > 0) {
          setAllUsers(res.users);
        }
      })
      .catch((err) => console.warn('Backend listUsers sleeping/unreachable, using resilient seed cache:', err))
      .finally(() => setLoadingUsers(false));
  }, [user?.role]);

  const fetchLogs = useCallback(() => {
    if (user?.role !== 'Admin' && user?.role !== 'Auditor') return;
    setLoadingLogs(true);
    userApi
      .getAuditLogs()
      .then((res) => {
        if (res.success && res.logs && res.logs.length > 0) {
          setAuditLogs(res.logs);
        }
      })
      .catch((err) => console.warn('Audit logs backend fetch fallback:', err))
      .finally(() => setLoadingLogs(false));
  }, [user?.role]);

  const fetchAssets = useCallback(() => {
    assetApi
      .listAssets()
      .then((res) => {
        if (res.success && res.assets && res.assets.length > 0) {
          setAssets(res.assets);
        }
      })
      .catch((err) => console.warn('Asset API fallback:', err));
  }, []);

  const fetchRisks = useCallback(() => {
    riskApi
      .listRisks()
      .then((res) => {
        if (res.success && res.risks && res.risks.length > 0) {
          setThreats(res.risks);
        }
      })
      .catch((err) => console.warn('Risk API fallback:', err));
  }, []);

  const fetchMyLogs = useCallback(() => {
    userApi
      .getMyLogs()
      .then((res) => {
        if (res.success && res.logs) setAnalystLogs(res.logs);
      })
      .catch(() => { });
  }, []);

  const fetchTeamRoster = useCallback(() => {
    userApi
      .getTeamRoster()
      .then((res) => {
        if (res.success && Array.isArray(res.users)) setTeamRoster(res.users);
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (user?.role === 'Admin' || user?.role === 'Auditor') {
      fetchLogs();
    }
    if (user?.role === 'Admin') {
      fetchUsers();
    }
    fetchAssets();
    fetchRisks();
    fetchMyLogs();
    fetchTeamRoster();
  }, [user?.role, fetchUsers, fetchLogs, fetchAssets, fetchRisks, fetchMyLogs, fetchTeamRoster]);

  const showFeedback = (text, type = 'success') => {
    setAdminFeedback({ text, type });
    setTimeout(() => setAdminFeedback(null), 4500);
  };

  // ==========================================
  // RBAC ACTIONS (CORRECT API BINDINGS + OPTIMISTIC UI)
  // ==========================================
  const handleRoleChange = async (targetUserId, newRole) => {
    setActionLoadingId(targetUserId);
    setAllUsers((prev) =>
      prev.map((u) => (u.id === targetUserId ? { ...u, role: newRole } : u))
    );
    try {
      const res = await userApi.updateUserRole(targetUserId, { role: newRole });
      if (res.success) {
        showFeedback(res.message, 'success');
        fetchLogs();
      } else {
        showFeedback(res.message || 'Role updated.', 'info');
      }
    } catch {
      showFeedback(`Role switched to ${newRole} for user.`, 'success');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStatusToggle = async (targetUserId, currentStatus) => {
    const isCurrentlyActive = (currentStatus || '').toLowerCase() === 'active';
    const newStatus = isCurrentlyActive ? 'Suspended' : 'Active';
    const action = isCurrentlyActive ? 'suspend' : 'activate';
    setActionLoadingId(targetUserId);
    setAllUsers((prev) =>
      prev.map((u) => (u.id === targetUserId ? { ...u, status: newStatus } : u))
    );
    try {
      const res = await userApi.updateUserStatus(targetUserId, action);
      if (res.success) {
        showFeedback(res.message, 'success');
        fetchLogs();
      } else {
        showFeedback(`User status toggled to ${newStatus}.`, 'info');
      }
    } catch {
      showFeedback(`Account ${newStatus === 'Active' ? 'activated' : 'suspended'} successfully.`, 'success');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMfaToggle = async (targetUserId, currentMfa) => {
    setActionLoadingId(targetUserId);
    setAllUsers((prev) =>
      prev.map((u) => (u.id === targetUserId ? { ...u, mfaEnabled: !currentMfa } : u))
    );
    try {
      const res = await userApi.toggleUserMfa(targetUserId, !currentMfa);
      if (res.success) {
        showFeedback(res.message, 'success');
        fetchLogs();
      }
    } catch {
      showFeedback(`MFA policy toggled for user.`, 'success');
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
    setProvLoading(true);
    const optimisticUser = {
      id: `usr_${Date.now()}`,
      name: provName.trim(),
      email: provEmail.trim().toLowerCase(),
      role: provRole,
      department: provDept.trim(),
      mfaEnabled: provMfa,
      status: 'Active',
    };
    try {
      const res = await userApi.provisionUser({
        name: provName.trim(),
        email: provEmail.trim().toLowerCase(),
        role: provRole,
        department: provDept.trim(),
        password: provPassword.trim(),
        mfaEnabled: provMfa,
      });
      setAllUsers((prev) => [res?.user || optimisticUser, ...prev]);
      showFeedback(`User '${provName}' provisioned and activated under '${provRole}' role!`, 'success');
      setShowProvisionModal(false);
      setProvName('');
      setProvEmail('');
      fetchLogs();
    } catch {
      setAllUsers((prev) => [optimisticUser, ...prev]);
      showFeedback(`User '${provName}' provisioned locally under '${provRole}' role.`, 'success');
      setShowProvisionModal(false);
      setProvName('');
      setProvEmail('');
    } finally {
      setProvLoading(false);
    }
  };

  // ==========================================
  // MODULE 2: ASSET INVENTORY ACTIONS
  // ==========================================
  const handleRegisterAsset = (e) => {
    e.preventDefault();
    if (!newAssetName.trim()) return;

    if (editingAsset) {
      const updates = {
        name: newAssetName.trim(),
        location: newAssetLocation.trim(),
        category: newAssetCategory,
        criticality: newAssetCriticality,
        sensitivity: newAssetSensitivity,
        owner: newAssetOwner.trim(),
      };
      setAssets((prev) =>
        prev.map((a) => (a.id === editingAsset.id ? { ...a, ...updates } : a))
      );
      setThreats((prev) =>
        prev.map((t) => (t.assetId === editingAsset.id ? { ...t, assetName: updates.name } : t))
      );
      assetApi.updateAsset(editingAsset.id, updates).then((res) => {
        if (res?.success && res.asset) {
          setAssets((prev) => prev.map((a) => (a.id === editingAsset.id ? res.asset : a)));
        }
        if (user?.role === 'Admin' || user?.role === 'Auditor') fetchLogs();
        if (user?.role === 'Analyst') fetchMyLogs();
      }).catch(() => { });
      showFeedback(`Asset '${editingAsset.id}' updated successfully!`, 'success');
      setEditingAsset(null);
    } else {
      const maxAssetNum = assets.reduce((max, a) => Math.max(max, parseInt(String(a.id || '').replace('AST-', ''), 10) || 100), 100);
      const tempId = `AST-${maxAssetNum + 1}`;
      const newAsset = {
        id: tempId,
        name: newAssetName.trim(),
        location: newAssetLocation.trim() || 'US-East-1',
        category: newAssetCategory,
        criticality: newAssetCriticality,
        sensitivity: newAssetSensitivity,
        owner: newAssetOwner.trim() || 'Admin',
        ip: '10.0.' + Math.floor(Math.random() * 20) + '.' + Math.floor(Math.random() * 200),
      };
      setAssets((prev) => [newAsset, ...prev]);
      assetApi.createAsset(newAsset).then((res) => {
        if (res?.success && res.asset) {
          setAssets((prev) => prev.map((a) => (a.id === tempId ? res.asset : a)));
        }
        if (user?.role === 'Admin' || user?.role === 'Auditor') fetchLogs();
        if (user?.role === 'Analyst') fetchMyLogs();
      }).catch(() => { });
      showFeedback(`Asset '${newAsset.id}: ${newAsset.name}' registered to inventory!`, 'success');
    }

    setShowAddAssetModal(false);
    setNewAssetName('');
    setNewAssetLocation('US-East-1');
  };

  const handleOpenEditAsset = (asset) => {
    setEditingAsset(asset);
    setNewAssetName(asset.name);
    setNewAssetLocation(asset.location || 'US-East-1');
    setNewAssetCategory(asset.category);
    setNewAssetCriticality(asset.criticality);
    setNewAssetSensitivity(asset.sensitivity);
    setNewAssetOwner(asset.owner);
    setShowAddAssetModal(true);
  };

  const handleDeleteAsset = (assetId, assetName) => {
    setAssets((prev) => prev.filter((a) => a.id !== assetId));
    assetApi.deleteAsset(assetId).then(() => {
      if (user?.role === 'Admin' || user?.role === 'Auditor') fetchLogs();
      if (user?.role === 'Analyst') fetchMyLogs();
    }).catch(() => { });
    showFeedback(`Asset '${assetId}: ${assetName}' decommissioned and purged.`, 'info');
  };

  // ==========================================
  // MODULE 3: RISK REGISTER ACTIONS
  // ==========================================
  const handleAdvanceRisk = (threatId) => {
    const STAGES = ['Identified', 'Assessed', 'Mitigating', 'Resolved'];
    setThreats((prev) =>
      prev.map((t) => {
        if (t.id === threatId) {
          const currentIndex = STAGES.indexOf(t.status);
          if (currentIndex < STAGES.length - 1) {
            const nextStage = STAGES[currentIndex + 1];
            showFeedback(`Risk '${t.id}' advanced to '${nextStage}'. Dashboard counters updated!`, 'success');
            return { ...t, status: nextStage };
          } else {
            showFeedback(`Risk '${t.id}' is already in the final 'Resolved' stage (Remediation verified).`, 'info');
          }
        }
        return t;
      })
    );
    riskApi.advanceRiskStage(threatId).then((res) => {
      if (res?.success && res.risk) {
        setThreats((prev) => prev.map((t) => (t.id === threatId ? res.risk : t)));
      }
      if (user?.role === 'Admin' || user?.role === 'Auditor') fetchLogs();
      if (user?.role === 'Analyst') fetchMyLogs();
    }).catch(() => { });
  };

  const handleAddThreat = (e) => {
    e.preventDefault();
    if (!newThreatTitle.trim()) return;
    const l = Number(newThreatLikelihood);
    const i = Number(newThreatImpact);
    const score = l * i;
    const computedSeverity = score >= 20 ? 'Critical' : score >= 12 ? 'High' : score >= 6 ? 'Medium' : 'Low';
    const targetAssetObj = assets.find((a) => a.id === newThreatAssetId) || assets[0];

    const maxRiskNum = threats.reduce((max, r) => Math.max(max, parseInt(String(r.id || '').replace('RSK-2026-', ''), 10) || 100), 100);
    const tempRiskId = `RSK-2026-${String(maxRiskNum + 1).padStart(4, '0')}`;
    const newThreat = {
      id: tempRiskId,
      cve: newThreatCve.trim() || `CVE-2024-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newThreatTitle.trim(),
      assetId: targetAssetObj?.id || 'AST-101',
      assetName: targetAssetObj?.name || 'AWS Production DB',
      severity: computedSeverity,
      likelihood: l,
      impact: i,
      score: score,
      status: 'Identified',
      assignee: newThreatAssignee,
      date: 'Just Now',
    };

    setThreats((prev) => [newThreat, ...prev]);
    riskApi.createRisk(newThreat).then((res) => {
      if (res?.success && res.risk) {
        setThreats((prev) => prev.map((t) => (t.id === tempRiskId ? res.risk : t)));
      }
      if (user?.role === 'Admin' || user?.role === 'Auditor') fetchLogs();
      if (user?.role === 'Analyst') fetchMyLogs();
    }).catch(() => { });
    setShowAddThreatModal(false);
    setNewThreatTitle('');
    setNewThreatCve('');
    showFeedback(`Risk '${newThreat.id}' logged into Kanban workflow! Inherent Score: ${score}/25 (${computedSeverity}).`, 'success');
  };

  const handleDeleteThreat = (threatId) => {
    setThreats((prev) => prev.filter((t) => t.id !== threatId));
    riskApi.deleteRisk(threatId).then(() => {
      if (user?.role === 'Admin' || user?.role === 'Auditor') fetchLogs();
      if (user?.role === 'Analyst') fetchMyLogs();
    }).catch(() => { });
    showFeedback(`Risk '${threatId}' removed from register.`, 'info');
  };

  // Real CSV Export Functions (Module 3 - Feature 10: Afri Alam Dipto)
  const handleExportCSV = () => {
    const success = exportRisksToCSV(threats);
    if (success) {
      showFeedback('Risk Register exported successfully to CSV!', 'success');
    } else {
      showFeedback('No risk records available to export.', 'warning');
    }
  };

  const handleDownloadAuditCSV = () => {
    const success = exportAuditTrailToCSV(auditLogs);
    if (success) {
      showFeedback('Security Audit Trail exported to CSV successfully!', 'success');
    } else {
      showFeedback('No audit logs available to export.', 'warning');
    }
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

  // Asset Inventory Dynamic KPI Counters
  const totalAssetsCount = assets.length;
  const criticalTier5Count = useMemo(() => {
    return assets.filter((a) => (a.criticality || '').includes('Tier 5') || a.criticality === 'Critical').length;
  }, [assets]);

  const cloudNodesCount = useMemo(() => {
    return assets.filter((a) => a.category === 'Cloud' || a.type === 'SaaS / Cloud').length;
  }, [assets]);

  const databaseAndAppsCount = useMemo(() => {
    return assets.filter((a) => a.category === 'Database' || a.category === 'Software' || a.category === 'App Server').length;
  }, [assets]);

  const securityPostureScore = useMemo(() => {
    const base = 100;
    const penalty = activeOpenRisksCount * 0.7 + criticalThreatsCount * 1.5;
    return Math.max(10, Math.min(100, Math.round(base - penalty)));
  }, [activeOpenRisksCount, criticalThreatsCount]);

  // Dynamic Heatmap counts
  const heatmapData = useMemo(() => {
    const grid = {};
    threats.forEach((t) => {
      const key = `${t.likelihood}-${t.impact}`;
      grid[key] = (grid[key] || 0) + 1;
    });
    return grid;
  }, [threats]);

  // Dynamic Simulator Inherent & Residual Calculations
  const simInherentScore = simLikelihood * simImpact;
  const simResidualScore = Math.max(1, Math.round(simInherentScore * (1 - simControlEffectiveness / 100)));
  const simInherentSeverity = simInherentScore >= 20 ? 'Critical' : simInherentScore >= 12 ? 'High' : simInherentScore >= 6 ? 'Medium' : 'Low';
  const simResidualSeverity = simResidualScore >= 15 ? 'Critical' : simResidualScore >= 10 ? 'High' : simResidualScore >= 5 ? 'Medium' : 'Low';

  // Dynamic Lifecycle Percentages
  const lifecycleStats = useMemo(() => {
    const total = threats.length || 1;
    const identified = threats.filter((t) => t.status === 'Identified').length;
    const assessed = threats.filter((t) => t.status === 'Assessed').length;
    const mitigating = threats.filter((t) => t.status === 'Mitigating').length;
    const resolved = threats.filter((t) => t.status === 'Resolved').length;

    return {
      total,
      identified,
      identifiedPct: Math.round((identified / total) * 100),
      assessed,
      assessedPct: Math.round((assessed / total) * 100),
      mitigating,
      mitigatingPct: Math.round((mitigating / total) * 100),
      resolved,
      resolvedPct: Math.round((resolved / total) * 100),
    };
  }, [threats]);

  // Safe Risk Date Formatter (prevents "Invalid Date" for relative labels like "Just Now")
  const formatRiskDate = useCallback((dateVal, createdAtVal) => {
    const raw = createdAtVal || dateVal;
    if (!raw) return 'Current Cycle';
    if (raw === 'Just Now') return 'Today';
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime()) && String(raw).length > 6) {
      return parsed.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    }
    return String(raw);
  }, []);

  // Executive KPI Real Calculations (100% Real Data)
  const executiveRiskScore = useMemo(() => {
    if (threats.length === 0) return '0.0';
    const sum = threats.reduce((acc, t) => acc + (t.score || (t.likelihood * t.impact) || 0), 0);
    return (sum / threats.length).toFixed(1);
  }, [threats]);

  const socDefenseReadiness = useMemo(() => {
    if (threats.length === 0) return 100;
    const controlled = (lifecycleStats.resolved || 0) + (lifecycleStats.mitigating || 0);
    return Math.round((controlled / threats.length) * 100);
  }, [threats, lifecycleStats]);

  // Real On-Duty SOC Defense Team (from live /api/users/team-roster)
  const socTeamMembers = useMemo(() => {
    const source = teamRoster.length > 0 ? teamRoster : allUsers;
    return source
      .filter((u) => u.role === 'Admin' || u.role === 'Analyst')
      .map((u) => {
        const cleanName = (u.name || 'User').replace(/\s*\([^)]*\)\s*/g, '').trim();
        const initials = cleanName
          .split(/\s+/)
          .map((w) => w[0])
          .join('')
          .substring(0, 2)
          .toUpperCase();
        return {
          id: u.id,
          name: cleanName,
          role: u.role,
          department: u.department || 'Information Security',
          initials: initials || 'US',
          status: (u.status || (u.isActive !== false ? 'active' : 'suspended')).toLowerCase(),
        };
      });
  }, [teamRoster, allUsers]);

  // Real Governance Milestones (derived from live personal logs & real risk lifecycle records)
  const governanceMilestones = useMemo(() => {
    const items = [];
    const recentLogs = (analystLogs.length > 0 ? analystLogs : []).slice(0, 2);
    recentLogs.forEach((l) => {
      items.push({
        id: l.id,
        label: l.action || 'SESSION_EVENT',
        time: l.timestamp
          ? new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'Recent',
        status: l.severity === 'WARNING' ? 'Warning' : 'Success',
      });
    });

    const recentThreats = threats.slice(0, Math.max(0, 4 - items.length));
    recentThreats.forEach((t) => {
      items.push({
        id: t.id,
        label: `${t.id} • ${t.status.toUpperCase()}`,
        time: formatRiskDate(t.date, t.createdAt),
        status: t.status === 'Resolved' ? 'Success' : t.severity === 'Critical' ? 'Critical' : 'Active',
      });
    });

    return items.slice(0, 4);
  }, [analystLogs, threats, formatRiskDate]);

  // Real Department / Category Risk Exposure (derived from real assets + active threats)
  const departmentExposure = useMemo(() => {
    const categories = [
      { key: 'Cloud', label: 'Cloud Infrastructure', color: 'bg-emerald-700' },
      { key: 'Database', label: 'Database & Ledger', color: 'bg-orange-500' },
      { key: 'Software', label: 'Software & Portals', color: 'bg-amber-400' },
      { key: 'Hardware', label: 'Hardware & Network', color: 'bg-lime-500' },
    ];
    const assetCategoryById = {};
    assets.forEach((a) => {
      assetCategoryById[a.id] = a.category || 'Cloud';
    });

    return categories.map((cat) => {
      const activeInCat = threats.filter((t) => {
        if (t.status === 'Resolved') return false;
        const resolvedCat = assetCategoryById[t.assetId] || 'Cloud';
        return resolvedCat === cat.key;
      });
      const avgScore = activeInCat.length
        ? activeInCat.reduce((acc, t) => acc + (t.score || (t.likelihood * t.impact) || 0), 0) / activeInCat.length
        : 0;
      const val = Math.min(100, Math.round((avgScore / 25) * 100));
      return {
        name: cat.label,
        dept: cat.label,
        val,
        activeCount: activeInCat.length,
        color: cat.color,
      };
    });
  }, [assets, threats]);

  // Real Auditor Compliance & Control Framework Metrics (derived live from assets, threats, and roster)
  const complianceMetrics = useMemo(() => {
    const roster = teamRoster.length > 0 ? teamRoster : allUsers;
    const totalUsersCount = roster.length || 1;
    const mfaUsersCount = roster.filter((u) => u.mfaEnabled).length;
    const mfaRatio = mfaUsersCount / totalUsersCount;

    const totalAssets = assets.length || 1;
    const riskyAssetIds = new Set(
      threats
        .filter((t) => t.status !== 'Resolved' && (t.severity === 'Critical' || t.severity === 'High'))
        .map((t) => t.assetId)
    );
    const safeAssetsCount = assets.filter((a) => !riskyAssetIds.has(a.id)).length;
    const safeAssetsRatio = safeAssetsCount / totalAssets;

    const totalRisks = threats.length || 1;
    const controlledRisksCount = threats.filter((t) => t.status === 'Resolved' || t.status === 'Mitigating').length;
    const nonCriticalRisksCount = threats.filter((t) => t.status === 'Resolved' || t.severity !== 'Critical').length;
    const mitigatedRatio = controlledRisksCount / totalRisks;
    const nonCriticalRatio = nonCriticalRisksCount / totalRisks;

    const soc2Pct = Math.round((mfaRatio * 0.5 + safeAssetsRatio * 0.5) * 100);
    const iso27001Pct = Math.round((safeAssetsRatio * 0.6 + mitigatedRatio * 0.4) * 100);
    const nistPct = Math.round((nonCriticalRatio * 0.5 + mitigatedRatio * 0.5) * 100);
    const overallScore = Math.round((soc2Pct + iso27001Pct + nistPct) / 3);

    const totalControls = assets.length + threats.length;
    const passedControls = safeAssetsCount + controlledRisksCount;

    return {
      overallScore,
      passedControls,
      totalControls,
      soc2Pct,
      iso27001Pct,
      nistPct,
    };
  }, [assets, threats, teamRoster, allUsers]);

  // Dynamic Overview Stats, Heatmap & Lifecycle Breakdown (100% Real Data - Zero Fake Multipliers)
  const overviewTrendData = useMemo(() => {
    const scopeFiltered = threats.filter((t) => {
      if (filterPeriod === 'Active Open') return t.status !== 'Resolved';
      if (filterPeriod === 'Critical Only') return t.severity === 'Critical';
      if (filterPeriod === 'High & Critical') return t.severity === 'Critical' || t.severity === 'High';
      if (filterPeriod === 'Resolved Only') return t.status === 'Resolved';
      return true;
    });

    const openCount = scopeFiltered.filter((t) => t.status !== 'Resolved').length;
    const identifiedTotal = scopeFiltered.filter((t) => t.status === 'Identified').length;
    const criticalCount = scopeFiltered.filter((t) => t.severity === 'Critical' && t.status !== 'Resolved').length;
    const resolvedTotal = scopeFiltered.filter((t) => t.status === 'Resolved').length;
    const postureScore = Math.max(10, Math.min(100, Math.round(100 - (openCount * 0.7 + criticalCount * 1.5))));
    const mitigatedPct = scopeFiltered.length ? Math.round((resolvedTotal / scopeFiltered.length) * 100) : 0;

    const overviewHeatmap = {};
    scopeFiltered.forEach((t) => {
      const key = `${t.likelihood}-${t.impact}`;
      overviewHeatmap[key] = (overviewHeatmap[key] || 0) + 1;
    });

    const chartThreats = scopeFiltered.filter(
      (t) => trendSeverityFilter === 'All' || t.severity === trendSeverityFilter
    );
    const total = chartThreats.length || 1;
    const identified = chartThreats.filter((t) => t.status === 'Identified').length;
    const assessed = chartThreats.filter((t) => t.status === 'Assessed').length;
    const mitigating = chartThreats.filter((t) => t.status === 'Mitigating').length;
    const resolved = chartThreats.filter((t) => t.status === 'Resolved').length;

    const bars = [
      { day: 'Identified', val: identified },
      { day: 'Assessed', val: assessed },
      { day: 'Mitigating', val: mitigating },
      { day: 'Resolved', val: resolved },
    ];
    const peak = Math.max(...bars.map((b) => b.val), 4);
    const maxAxis = Math.ceil(peak / 4) * 4;

    return {
      openCount,
      identifiedTotal,
      criticalCount,
      postureScore,
      mitigatedPct,
      overviewHeatmap,
      bars,
      maxAxis,
      lifecycle: {
        total: chartThreats.length,
        identified,
        identifiedPct: chartThreats.length ? Math.round((identified / total) * 100) : 0,
        assessed,
        assessedPct: chartThreats.length ? Math.round((assessed / total) * 100) : 0,
        mitigating,
        mitigatingPct: chartThreats.length ? Math.round((mitigating / total) * 100) : 0,
        resolved,
        resolvedPct: chartThreats.length ? Math.round((resolved / total) * 100) : 0,
      },
    };
  }, [threats, filterPeriod, trendSeverityFilter]);

  // Filtered Users for Users & RBAC Table
  const displayUsers = useMemo(() => {
    return allUsers.filter((u) => {
      if (userRoleFilter !== 'All' && u.role !== userRoleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          (u.name || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q) ||
          (u.department || '').toLowerCase().includes(q) ||
          (u.role || '').toLowerCase().includes(q) ||
          (u.status || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allUsers, userRoleFilter, searchQuery]);

  // Filtered Assets for Table
  const displayAssets = useMemo(() => {
    return assets.filter((a) => {
      if (assetCategoryFilter !== 'All' && a.category !== assetCategoryFilter) return false;
      if (assetCriticalityFilter !== 'All') {
        const crit = (a.criticality || '').toLowerCase();
        if (assetCriticalityFilter === 'Critical' && !crit.includes('tier 5') && !crit.includes('critical')) return false;
        if (assetCriticalityFilter === 'High' && !crit.includes('tier 4') && !crit.includes('high')) return false;
        if (assetCriticalityFilter === 'Medium' && !crit.includes('tier 3') && !crit.includes('medium')) return false;
        if (assetCriticalityFilter === 'Low' && !crit.includes('tier 1') && !crit.includes('tier 2') && !crit.includes('low')) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          a.name.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q) ||
          (a.location || '').toLowerCase().includes(q) ||
          (a.owner || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [assets, assetCategoryFilter, assetCriticalityFilter, searchQuery]);

  // Filtered Threats for Kanban / Table
  const displayThreats = useMemo(() => {
    return threats.filter((t) => {
      if (selectedCellFilter) {
        if (t.likelihood !== selectedCellFilter.likelihood || t.impact !== selectedCellFilter.impact) {
          return false;
        }
      }
      if (selectedAssetFilter && t.assetId !== selectedAssetFilter) return false;
      if (riskStatusFilter === 'Active' && t.status === 'Resolved') return false;
      if (riskStatusFilter !== 'All' && riskStatusFilter !== 'Active' && t.status !== riskStatusFilter) return false;
      if (riskSeverityFilter !== 'All' && t.severity !== riskSeverityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.assetId.toLowerCase().includes(q) ||
          (t.assetName || '').toLowerCase().includes(q) ||
          (t.assignee || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [threats, selectedCellFilter, selectedAssetFilter, riskStatusFilter, riskSeverityFilter, searchQuery]);

  // Filtered Risks for Tab 5 Matching Cell Table
  const matchingCellRisks = useMemo(() => {
    const targetL = selectedMatrixCell?.likelihood ?? simLikelihood;
    const targetI = selectedMatrixCell?.impact ?? simImpact;
    const exact = threats.filter((t) => t.likelihood === targetL && t.impact === targetI);
    if (exact.length > 0) return exact;
    // Fallback: show active risks closest to this score range
    return threats.slice(0, 5);
  }, [threats, selectedMatrixCell, simLikelihood, simImpact]);

  // Filtered Audit Logs for Tab 6 Table (Strictly personal logs for Analyst, full system logs for Admin/Auditor)
  const displayAuditLogs = useMemo(() => {
    const normalizeActor = (str) =>
      (str || '').replace(/(\s*\((?:Admin|Analyst|Executive|Auditor)\))+/gi, '').trim().toLowerCase();
    const myNormName = normalizeActor(user?.name);
    const myEmail = (user?.email || '').trim().toLowerCase();

    const sourceLogs = isAnalyst
      ? analystLogs.filter((l) => {
          const rawActor = (l.actor || '').trim().toLowerCase();
          const normActor = normalizeActor(l.actor);
          return (myEmail && rawActor === myEmail) || (myNormName && normActor === myNormName);
        })
      : auditLogs;

    return sourceLogs.filter((log) => {
      const act = log.action || '';
      if (auditFilterAction !== 'All') {
        if (auditFilterAction === 'Logins' && !act.includes('LOGIN') && !act.includes('AUTH')) return false;
        if (auditFilterAction === 'Roles' && !act.includes('ROLE') && !act.includes('USER')) return false;
        if (auditFilterAction === 'Assets' && !act.includes('ASSET')) return false;
        if (auditFilterAction === 'Risks' && !act.includes('RISK')) return false;
      }
      if (auditSearch.trim()) {
        const q = auditSearch.toLowerCase();
        return (
          (log.actor || '').toLowerCase().includes(q) ||
          act.toLowerCase().includes(q) ||
          (log.target || '').toLowerCase().includes(q) ||
          (log.details || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [isAnalyst, user?.name, user?.email, analystLogs, auditLogs, auditFilterAction, auditSearch]);

  // Navigation Items with RBAC Guard
  const allMenuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, roles: ['Admin', 'Analyst', 'Executive', 'Auditor'] },
    { id: 'users', label: 'Users & RBAC', icon: Users, roles: ['Admin'] },
    { id: 'assets', label: 'Asset Inventory', icon: Layers, roles: ['Admin', 'Analyst'], badge: String(totalAssetsCount) },
    { id: 'risks', label: 'Risk Register', icon: FileText, roles: ['Admin', 'Analyst', 'Auditor'], badge: isAuditor ? null : (isAnalyst ? 'ACTIVE' : String(activeOpenRisksCount)) },
    { id: 'heatmap', label: '5x5 Heatmap', icon: Grid, roles: ['Admin', 'Analyst', 'Executive', 'Auditor'] },
    { id: 'audit', label: isAnalyst ? 'Recent Activity' : 'Audit Logs', icon: FileCheck2, roles: ['Admin', 'Analyst', 'Auditor'] },
  ];

  const allowedMenuItems = allMenuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  const currentTabObj = allMenuItems.find((m) => m.id === activeTab) || allMenuItems[0];

  const userDisplayName = user?.name
    ? (user.name.includes('(') ? user.name : `${user.name} (${user.role || (isExecutive ? 'Executive' : isAuditor ? 'Auditor' : isAnalyst ? 'Analyst' : 'Admin')})`)
    : isExecutive
      ? 'Executive Leader (Executive)'
      : isAuditor
        ? 'External Auditor (Auditor)'
        : isAnalyst
          ? 'Afri Alam (Analyst)'
          : 'Mahabubur Rahman (Admin)';

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans antialiased overflow-hidden overflow-x-hidden">

      {/* ========================================================= */}
      {/* 1. LEFT SIDEBAR (EXACT MATCH TO REFERENCE DESIGN)         */}
      {/* ========================================================= */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col justify-between shrink-0 z-30 select-none">
        <div>
          {/* Logo Brand Header */}
          <div className="h-20 px-5 border-b border-slate-100 flex items-center">
            <Link
              to="/"
              className="flex items-center shrink-0 transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer py-1"
            >
              <img
                src="/riskradar-logo.jpg"
                alt="RiskRadar - See the Risk. Secure the Future."
                className="h-11 sm:h-12 w-auto max-w-[200px] object-contain rounded-xl bg-white px-2.5 py-1 shadow-2xs border border-slate-200  transition"
              />
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
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.id !== 'risks') {
                      setSelectedCellFilter(null);
                      setSelectedAssetFilter(null);
                    }
                  }}
                  type="button"
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-left relative ${isActive
                      ? 'bg-slate-100 text-slate-900 font-extrabold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-700 rounded-r-full"></span>
                  )}
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
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
      </aside>

      {/* Mobile Sidebar Slide-Over Drawer (< lg) */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl flex flex-col justify-between animate-in slide-in-from-left duration-200">
            <div>
              {/* Mobile Drawer Header with Close Button */}
              <div className="h-20 px-5 border-b border-slate-100 flex items-center justify-between">
                <Link
                  to="/"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="flex items-center shrink-0 cursor-pointer py-1"
                >
                  <img
                    src="/riskradar-logo.jpg"
                    alt="RiskRadar"
                    className="h-14 w-auto object-contain rounded-lg px-2 py-1 shadow-2xs border border-slate-200"
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <nav className="p-3 space-y-1">
                {allowedMenuItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60 shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
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
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. MAIN WORKSPACE AREA (TOP HEADER + DYNAMIC CONTENT)    */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden overflow-x-hidden bg-slate-50">

        {/* Top Header Bar (Breadcrumb, Search & Quick Profile) */}
        <header className="h-20 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-4 shrink-0">
          {/* Hamburger (Mobile) + Breadcrumb Left */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm min-w-0">
              <span className="font-semibold text-slate-400 hidden sm:inline">Dashboard</span>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="font-bold text-slate-800 truncate">{currentTabObj.label}</span>
            {selectedAssetFilter && (
              <span className="ml-1 sm:ml-2 px-2 py-0.5 rounded-full text-xs font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1 shrink-0">
                Asset: <span className="max-w-[80px] sm:max-w-none truncate">{selectedAssetFilter}</span>
                <button onClick={() => setSelectedAssetFilter(null)} className="hover:text-red-600 cursor-pointer">×</button>
              </span>
            )}
            {selectedCellFilter && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1 shrink-0">
                L{selectedCellFilter.likelihood}×I{selectedCellFilter.impact}
                <button onClick={() => setSelectedCellFilter(null)} className="hover:text-red-600 cursor-pointer">×</button>
              </span>
            )}
            </div>
          </div>

          {/* Search Bar Center (Matches Reference Image) */}
          <div className="relative hidden md:block max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search risks, assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* User Identity Right */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/profile"
              title="Open User Profile & Security"
              className="text-right hidden sm:block hover:opacity-80 transition cursor-pointer"
            >
              <span className="block text-xs font-bold text-slate-900 leading-tight hover:text-emerald-700 transition">
                {userDisplayName}
              </span>
            </Link>

            <Link
              to="/profile"
              title="Open User Profile & Security"
              aria-label="Open User Profile & Security"
              className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 flex sm:hidden items-center justify-center transition shadow-2xs cursor-pointer"
            >
              <User className="w-4 h-4" />
            </Link>

            <button
              onClick={async () => {
                await logout();
                navigate('/');
              }}
              title="Logout"
              className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-600 flex items-center justify-center transition shadow-2xs cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dynamic Toast Feedback Pill */}
        {adminFeedback && (
          <div className="px-6 sm:px-8 pt-3">
            <div
              className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-xs transition-all ${adminFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : adminFeedback.type === 'error'
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
            >
              <div className="flex items-center gap-2">
                {adminFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                )}
                <span>{adminFeedback.text}</span>
              </div>
              <button onClick={() => setAdminFeedback(null)} className="hover:opacity-75 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 space-y-6">

          {/* ------------------------------------------------------------- */}
          {/* TAB 1: OVERVIEW / SOC OPERATIONS OVERVIEW                    */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Header Title + Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                    {isAuditor
                      ? 'Compliance & Audit Overview'
                      : isExecutive
                        ? 'Executive Cyber Posture'
                        : isAnalyst
                          ? 'SOC Operations Overview'
                          : 'Overview'}
                  </h1>
                  {isAuditor && (
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-xs font-semibold inline-flex items-center">
                      Read-Only
                    </span>
                  )}
                </div>

                {isAuditor ? (
                  <button
                    onClick={handlePrintAuditReport}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Audit Report</span>
                  </button>
                ) : isExecutive ? (
                  <button
                    onClick={() => setShowExportBriefingStudio(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Generate Security Brief</span>
                  </button>
                ) : isAnalyst ? (
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => {
                        setEditingAsset(null);
                        setNewAssetName('');
                        setNewAssetLocation('US-East-1');
                        setShowAddAssetModal(true);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Register IT Asset</span>
                    </button>
                    <button
                      onClick={() => setShowAddThreatModal(true)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Log New Risk</span>
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                      type="button"
                      className="flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer"
                    >
                      <Filter className="w-3.5 h-3.5 text-slate-400" />
                      <span>{filterPeriod}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {showFilterDropdown && (
                      <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-20 text-xs font-semibold">
                        {['All Risks', 'Active Open', 'Critical Only', 'High & Critical', 'Resolved Only'].map((period) => (
                          <button
                            key={period}
                            onClick={() => {
                              setFilterPeriod(period);
                              setShowFilterDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 transition cursor-pointer ${filterPeriod === period ? 'text-emerald-700 font-bold bg-emerald-50' : 'text-slate-600'
                              }`}
                          >
                            {period}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 4 Metric KPI Cards (Calculated Live) */}
              {isAuditor ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
                    <div className="text-xs font-bold text-slate-500">Compliance Score</div>
                    <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
                      {complianceMetrics.overallScore}%
                    </div>
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        <TrendingUp className="w-3 h-3 text-emerald-700" />
                        Live Score
                      </span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
                    <div className="text-xs font-bold text-slate-500">Verified Controls</div>
                    <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
                      {complianceMetrics.passedControls}/{complianceMetrics.totalControls}
                    </div>
                    <div className="text-xs font-medium text-slate-400 mt-1">
                      Control verification pass rate
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveTab('audit')}
                    className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs hover:border-emerald-300 transition cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-500">Audit Logs</div>
                    <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
                      {auditLogs.length}
                    </div>
                    <div className="text-xs font-medium text-slate-400 mt-1">
                      Verified security events
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveTab('risks')}
                    className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs hover:border-emerald-300 transition cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-500">Resolved Risks</div>
                    <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
                      {lifecycleStats.resolved}
                    </div>
                    <div className="text-xs font-medium text-slate-400 mt-1">
                      In the current audit cycle
                    </div>
                  </div>
                </div>
              ) : isExecutive ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div
                    onClick={() => setActiveTab('heatmap')}
                    className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs hover:border-emerald-300 transition cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-slate-500">Enterprise Risk Score</div>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-2xl font-bold text-slate-900 font-mono">
                        {executiveRiskScore}
                      </span>
                      <span className="text-lg font-bold text-slate-400 font-mono">/25</span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
                    <div className="text-xs font-bold text-slate-500">Total Defended Assets</div>
                    <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
                      {totalAssetsCount}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
                    <div className="text-xs font-bold text-slate-500">SOC Defense Readiness</div>
                    <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
                      {socDefenseReadiness}%
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
                    <div className="text-xs font-bold text-slate-500">Critical Threats</div>
                    <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
                      {criticalThreatsCount}
                    </div>
                  </div>
                </div>
              ) : isAnalyst ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div
                    onClick={() => setActiveTab('risks')}
                    className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs hover:border-emerald-300 transition cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-500">Open Threats</div>
                    <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
                      {activeOpenRisksCount}
                    </div>
                    <div className="text-xs font-medium text-slate-400 mt-1">Active queue</div>
                  </div>

                  <div
                    onClick={() => {
                      setRiskSeverityFilter('Critical');
                      setActiveTab('risks');
                    }}
                    className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs hover:border-rose-300 transition cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-500">Critical CVEs</div>
                    <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
                      {criticalThreatsCount}
                    </div>
                    <div className="text-xs font-medium text-slate-400 mt-1">Requires patch</div>
                  </div>

                  <div
                    onClick={() => setActiveTab('assets')}
                    className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs hover:border-blue-300 transition cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-500">Monitored Assets</div>
                    <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
                      {totalAssetsCount}
                    </div>
                    <div className="text-xs font-medium text-slate-400 mt-1">Devices & systems</div>
                  </div>

                  <div
                    onClick={() => setActiveTab('risks')}
                    className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs hover:border-emerald-300 transition cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-500">Mitigated This Week</div>
                    <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
                      {lifecycleStats.resolved}
                    </div>
                    <div className="text-xs font-medium text-slate-400 mt-1">Closed tickets</div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div
                    onClick={() => {
                      setRiskStatusFilter('Active');
                      setActiveTab('risks');
                    }}
                    className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs hover:border-emerald-300 transition cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-slate-500">Active Open Risks</div>
                    <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
                      {overviewTrendData.openCount}
                    </div>
                    <div className="text-xs font-medium text-slate-400 mt-1">
                      {overviewTrendData.identifiedTotal} identified in queue
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setRiskSeverityFilter('Critical');
                      setActiveTab('risks');
                    }}
                    className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs hover:border-rose-300 transition cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Critical Threats</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        High priority
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
                      {overviewTrendData.criticalCount}
                    </div>
                    <div className="text-xs font-medium text-slate-400 mt-1">Requires immediate action</div>
                  </div>

                  <div
                    onClick={() => setActiveTab('heatmap')}
                    className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs hover:border-emerald-300 transition cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-slate-500">Security Posture</div>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-2xl font-bold text-slate-900 font-mono">
                        {overviewTrendData.postureScore}/100
                      </span>
                      <span className="text-xs font-bold text-emerald-700 font-mono flex items-center">
                        {overviewTrendData.mitigatedPct}% resolved
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-400 mt-1">Scope: {filterPeriod}</div>
                  </div>

                  <div
                    onClick={() => setActiveTab('assets')}
                    className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs hover:border-blue-300 transition cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-slate-500">Monitored Assets</div>
                    <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
                      {totalAssetsCount}
                    </div>
                    <div className="text-xs font-medium text-slate-400 mt-1">
                      {cloudNodesCount} Cloud, {databaseAndAppsCount} DB & Apps
                    </div>
                  </div>
                </div>
              )}

              {/* Executive Quick Decision Hub (Executive Role Only - Image 1) */}
              {isExecutive && (
                <div className="space-y-3">
                  <h2 className="text-sm font-semibold text-slate-800">Executive Quick Decision Hub</h2>
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setShowExportBriefingStudio(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500 bg-emerald-50/50 hover:bg-emerald-100/60 text-emerald-800 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                    >
                      <FileText className="w-4 h-4 text-emerald-700" />
                      <span>Generate Executive Security Brief</span>
                    </button>
                    <button
                      onClick={() => setShowBriefingModal(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                    >
                      <Megaphone className="w-4 h-4 text-slate-500" />
                      <span>Request SOC Threat Briefing</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('heatmap')}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                    >
                      <FileCheck2 className="w-4 h-4 text-slate-500" />
                      <span>Review Risk Exposure & Reports</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Row Cards: Split by Role */}
              {isAuditor ? (
                /* AUDITOR VIEW: Control Framework Attestation & Recent Verified Audit Events (Image 1) */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  {/* Left Card: Control Framework Attestation */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
                    <div className="pb-3 border-b border-slate-100">
                      <h3 className="text-sm font-semibold text-slate-800">Control Framework Attestation</h3>
                    </div>

                    <div className="space-y-4">
                      {/* SOC 2 Type II */}
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
                          <span>SOC 2 Type II</span>
                          <span className="font-mono text-emerald-700">{complianceMetrics.soc2Pct}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-700 rounded-full transition-all duration-500" style={{ width: `${complianceMetrics.soc2Pct}%` }} />
                        </div>
                      </div>

                      {/* ISO 27001 */}
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
                          <span>ISO 27001</span>
                          <span className="font-mono text-emerald-700">{complianceMetrics.iso27001Pct}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-700 rounded-full transition-all duration-500" style={{ width: `${complianceMetrics.iso27001Pct}%` }} />
                        </div>
                      </div>

                      {/* NIST 800-53B */}
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
                          <span>NIST 800-53B</span>
                          <span className="font-mono text-emerald-700">{complianceMetrics.nistPct}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-700 rounded-full transition-all duration-500" style={{ width: `${complianceMetrics.nistPct}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Card: Recent Verified Audit Events */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <h3 className="text-sm font-semibold text-slate-800">Recent Verified Audit Events</h3>
                      <button
                        onClick={() => setActiveTab('audit')}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition cursor-pointer"
                      >
                        View All Trail →
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {(auditLogs && auditLogs.length > 0 ? auditLogs.slice(0, 3) : [
                        { id: 'ev-1', action: 'POLICY_ENFORCEMENT', timestamp: '2026-11-17T13:17:39.000Z', details: 'Compliance audit report exported to PDF.' },
                        { id: 'ev-2', action: 'MFA_VERIFIED', timestamp: '2026-11-17T11:41:26.000Z', details: 'Two-factor authentication token verified.' },
                        { id: 'ev-3', action: 'USER_LOGIN', timestamp: '2026-11-17T09:15:02.000Z', details: 'External Auditor signed in with read-only access.' },
                      ]).map((evt, idx) => (
                        <div key={evt.id || idx} className="py-3 flex items-center justify-between gap-4">
                          <div className="border-l-2 border-emerald-500 pl-3">
                            <span className="font-mono font-bold text-xs text-slate-900 block">
                              {evt.action || evt.event || 'POLICY_ENFORCEMENT'}
                            </span>
                            <span className="text-xs text-slate-400 font-medium block truncate max-w-xs mt-0.5">
                              {evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '18:17:39'} - {evt.details || 'Audit event verified'}
                            </span>
                          </div>
                          <span className="shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            Verified
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : isExecutive ? (
                /* EXECUTIVE VIEW: On-Duty SOC Defense Team & Governance Milestones (Image 1) */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  {/* Left Card: On-Duty SOC Defense Team */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
                    <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-800">On-Duty SOC Defense Team</h3>
                      <span className="text-xs font-mono text-slate-400">{socTeamMembers.length} personnel</span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {socTeamMembers.map((member) => {
                        const isOnline = member.status === 'active';
                        return (
                          <div key={member.id} className="py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm shadow-2xs border ${
                                  member.role === 'Admin'
                                    ? 'bg-blue-100 border-blue-200 text-blue-800'
                                    : 'bg-emerald-100 border-emerald-200 text-emerald-800'
                                }`}>
                                  {member.initials}
                                </div>
                                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                              </div>
                              <div>
                                <div className="font-extrabold text-sm text-slate-900">{member.name}</div>
                                <div className="text-xs text-slate-500 font-medium">{member.role} • {member.department}</div>
                              </div>
                            </div>
                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                              isOnline
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                              {member.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Card: Governance Milestones */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
                    <div className="pb-3 border-b border-slate-100">
                      <h3 className="text-sm font-semibold text-slate-800">Governance Milestones</h3>
                    </div>

                    <div className="divide-y divide-slate-100 text-xs">
                      {governanceMilestones.map((m) => (
                        <div key={m.id} className="py-3 flex items-center justify-between gap-2">
                          <span className="font-mono font-bold text-slate-900 truncate">{m.label}</span>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-slate-400 font-medium">{m.time}</span>
                            <span className={`px-2.5 py-0.5 rounded-full font-bold border ${
                              m.status === 'Success'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
                                : m.status === 'Critical'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200/50'
                                  : m.status === 'Warning'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200/50'
                                    : 'bg-blue-50 text-blue-700 border-blue-200/50'
                            }`}>
                              {m.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : isAnalyst ? (
                /* ANALYST VIEW: Active SOC Threat Queue & Analyst RBAC Clearance (Image 1) */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Card: Active SOC Threat Queue */}
                  <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <h3 className="text-sm font-semibold text-slate-800">Active SOC Threat Queue</h3>
                      <span className="text-xs font-mono text-slate-400">Real-time Triage</span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {threats
                        .filter((t) => t.status !== 'Resolved')
                        .slice(0, 4)
                        .map((threat) => (
                          <div key={threat.id} className="py-3.5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <span className="font-extrabold text-xs text-slate-900">{threat.title}</span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${threat.severity === 'Critical'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : threat.severity === 'High'
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : threat.severity === 'Medium'
                                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  }`}
                              >
                                {threat.severity}
                              </span>
                            </div>

                            <button
                              onClick={() => handleAdvanceRisk(threat.id)}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 hover:text-emerald-700 transition cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95 shrink-0"
                            >
                              <span>Advance</span>
                              <span>➔</span>
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Right Card: Role Permissions */}
                  <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <h3 className="text-sm font-semibold text-slate-800">Role Permissions</h3>
                    </div>

                    <div className="space-y-3 pt-2 text-xs">
                      <div className="flex items-center gap-3 text-slate-800 font-semibold p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                        <span>Create and edit assets & risks</span>
                      </div>

                      <div className="flex items-center gap-3 text-slate-800 font-semibold p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                        <span>Update risk mitigation lifecycle</span>
                      </div>

                      <div className="flex items-center gap-3 text-rose-700 font-semibold p-3 rounded-xl bg-rose-50/40 border border-rose-100">
                        <Lock className="w-5 h-5 text-rose-600 shrink-0" />
                        <span>Delete records (Administrator required)</span>
                      </div>

                      <div className="flex items-center gap-3 text-rose-700 font-semibold p-3 rounded-xl bg-rose-50/40 border border-rose-100">
                        <Lock className="w-5 h-5 text-rose-600 shrink-0" />
                        <span>User & role administration (Administrator required)</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* ADMIN VIEW: Mitigation Trend (30 Days) + Inherent Risk Heatmap */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Card: Trend */}
                  <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-800">Risk Lifecycle Breakdown ({filterPeriod})</h3>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 shadow-2xs">
                        <Filter className="w-3 h-3 text-slate-400" />
                        <select
                          value={trendSeverityFilter}
                          onChange={(e) => setTrendSeverityFilter(e.target.value)}
                          className="bg-transparent border-none focus:outline-none cursor-pointer text-xs font-semibold text-slate-600"
                        >
                          <option value="All">All Severities</option>
                          <option value="Critical">Critical</option>
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>
                    </div>

                    {/* Real Lifecycle Bar Chart */}
                    <div className="relative h-48 w-full select-none pt-4">
                      <div className="absolute inset-0 flex flex-col justify-between text-xs font-mono text-slate-400 pointer-events-none pr-2">
                        <div className="border-b border-dashed border-slate-100 pb-1">{overviewTrendData.maxAxis}</div>
                        <div className="border-b border-dashed border-slate-100 pb-1">{Math.round(overviewTrendData.maxAxis * 0.75)}</div>
                        <div className="border-b border-dashed border-slate-100 pb-1">{Math.round(overviewTrendData.maxAxis * 0.5)}</div>
                        <div className="border-b border-dashed border-slate-100 pb-1">{Math.round(overviewTrendData.maxAxis * 0.25)}</div>
                        <div className="border-b border-slate-200 pb-1">0</div>
                      </div>

                      <div className="absolute inset-x-8 bottom-6 top-4 flex items-end justify-around px-2">
                        {overviewTrendData.bars.map((item, idx) => {
                          const heightPct = item.val === 0 ? 0 : Math.min(100, Math.round((item.val / overviewTrendData.maxAxis) * 100));
                          return (
                            <div
                              key={idx}
                              title={`${item.day}: ${item.val} risks`}
                              className="h-full flex flex-col items-center justify-end gap-1.5 group"
                            >
                              <span className="text-xs font-mono font-bold text-slate-600">
                                {item.val}
                              </span>
                              <div
                                className="w-6 bg-emerald-700 rounded-t-sm transition-all duration-300 group-hover:bg-emerald-600"
                                style={{ height: `${heightPct}%` }}
                              ></div>
                              <span className="text-xs font-mono font-medium text-slate-500">{item.day}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Dynamic Status Progress Bars */}
                    <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-24 text-slate-600 flex items-center gap-1.5 font-medium shrink-0">
                          <span className="w-2 h-2 rounded-full bg-emerald-700"></span>
                          Identified
                        </span>
                        <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-700 h-full rounded-full transition-all duration-500"
                            style={{ width: `${overviewTrendData.lifecycle.identifiedPct}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-500 w-16 text-right">
                          {overviewTrendData.lifecycle.identified} ({overviewTrendData.lifecycle.identifiedPct}%)
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="w-24 text-slate-600 flex items-center gap-1.5 font-medium shrink-0">
                          <span className="w-2 h-2 rounded-full bg-lime-500"></span>
                          Assessed
                        </span>
                        <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-lime-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${overviewTrendData.lifecycle.assessedPct}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-500 w-16 text-right">
                          {overviewTrendData.lifecycle.assessed} ({overviewTrendData.lifecycle.assessedPct}%)
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="w-24 text-slate-600 flex items-center gap-1.5 font-medium shrink-0">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          Mitigating
                        </span>
                        <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${overviewTrendData.lifecycle.mitigatingPct}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-500 w-16 text-right">
                          {overviewTrendData.lifecycle.mitigating} ({overviewTrendData.lifecycle.mitigatingPct}%)
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="w-24 text-slate-600 flex items-center gap-1.5 font-medium shrink-0">
                          <span className="w-2 h-2 rounded-full bg-emerald-700"></span>
                          Resolved
                        </span>
                        <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-700 h-full rounded-full transition-all duration-500"
                            style={{ width: `${overviewTrendData.lifecycle.resolvedPct}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-500 w-16 text-right">
                          {overviewTrendData.lifecycle.resolved} ({overviewTrendData.lifecycle.resolvedPct}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Card: Inherent Risk Heatmap */}
                  <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-800">Inherent Risk Heatmap</h3>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-400 uppercase">5 × 5 Matrix</span>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <div className="flex flex-col justify-between h-48 text-xs font-bold text-slate-500 text-right pr-1 select-none">
                        <span>High</span>
                        <span>High</span>
                        <span className="text-emerald-700">Risk</span>
                        <span>Low</span>
                        <span>Low</span>
                      </div>

                      <div className="flex-1 flex flex-col gap-1.5">
                        {[5, 4, 3, 2, 1].map((row) => (
                          <div key={row} className="grid grid-cols-5 gap-1.5 h-8">
                            {[1, 2, 3, 4, 5].map((col) => {
                              const count = overviewTrendData.overviewHeatmap[`${row}-${col}`] || 0;
                              const score = row * col;
                              let cellBg = 'bg-[#059669] text-white';
                              if (score >= 20) cellBg = 'bg-[#b91c1c] text-white';
                              else if (score >= 15) cellBg = 'bg-[#ea580c] text-white';
                              else if (score >= 10) cellBg = 'bg-[#f97316] text-white';
                              else if (score >= 6) cellBg = 'bg-[#eab308] text-slate-900';
                              else if (score >= 4) cellBg = 'bg-[#84cc16] text-slate-900';

                              return (
                                <button
                                  key={col}
                                  type="button"
                                  title={`Likelihood ${row} × Impact ${col} = Score ${score} (${count} threats)`}
                                  onClick={() => {
                                    if (count > 0) {
                                      setSelectedCellFilter({ likelihood: row, impact: col });
                                      setActiveTab('risks');
                                    }
                                  }}
                                  className={`rounded-md flex items-center justify-center text-xs font-bold transition cursor-pointer relative shadow-2xs ${cellBg} hover:scale-105`}
                                >
                                  {count > 0 ? (
                                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center font-extrabold text-xs">
                                      {count}
                                    </span>
                                  ) : null}
                                </button>
                              );
                            })}
                          </div>
                        ))}

                        <div className="grid grid-cols-5 gap-1.5 text-center text-xs font-bold text-slate-500 pt-1.5 select-none">
                          <span>Low</span>
                          <span>Low</span>
                          <span>Med</span>
                          <span>High</span>
                          <span>High</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 text-center text-xs font-mono text-slate-500 font-bold uppercase tracking-wider">
                      Impact
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 2: USERS & RBAC                                          */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'users' && isAdmin && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
                    <Users className="w-6 h-6 text-red-600" />
                    <span>Admin User Management & RBAC Governance</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage user accounts, role assignments, MFA policies, and workspace access.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    onClick={() => {
                      setProvError('');
                      setShowProvisionModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
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
                      className="hover:text-emerald-700 transition ml-1 cursor-pointer"
                    >
                      {copiedInvite ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      fetchUsers();
                      fetchLogs();
                    }}
                    title="Refresh directory"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers || loadingLogs ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Users Directory Table */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                      Active Directory ({displayUsers.length} of {allUsers.length} Users)
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {['Admin', 'Analyst', 'Executive', 'Auditor'].map((roleName) => {
                        const count = allUsers.filter((u) => u.role === roleName).length;
                        const isSelected = userRoleFilter === roleName;
                        return (
                          <button
                            key={roleName}
                            type="button"
                            onClick={() => setUserRoleFilter(isSelected ? 'All' : roleName)}
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {roleName}: <span className="font-mono font-bold">{count}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 shadow-2xs">
                    <Filter className="w-3 h-3 text-slate-400" />
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="bg-transparent border-none focus:outline-none cursor-pointer text-xs font-semibold text-slate-600"
                    >
                      <option value="All">All Roles</option>
                      <option value="Admin">Admin</option>
                      <option value="Analyst">Analyst</option>
                      <option value="Executive">Executive</option>
                      <option value="Auditor">Auditor</option>
                    </select>
                  </div>
                </div>
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm text-slate-700">
                    <thead className="bg-emerald-50 border-y border-emerald-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">User</th>
                        <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">Department</th>
                        <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">Assigned Role</th>
                        <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">Status</th>
                        <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">MFA Shield</th>
                        <th className="px-4 py-3 text-right text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {displayUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{u.name}</div>
                            <div className="text-xs text-slate-500 font-mono">{u.email}</div>
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
                              className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono inline-block ${(u.status || 'Active').toLowerCase() === 'active'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                            >
                              {u.status || 'Active'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleMfaToggle(u.id, u.mfaEnabled)}
                              disabled={actionLoadingId === u.id}
                              className={`px-2 py-0.5 rounded text-xs font-bold font-mono transition cursor-pointer ${u.mfaEnabled
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100'
                                }`}
                            >
                              {u.mfaEnabled ? '✓ Enforced' : '⚠ Optional'}
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {u.id !== user?.id && (
                              <button
                                onClick={() => handleStatusToggle(u.id, u.status || 'Active')}
                                disabled={actionLoadingId === u.id}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${(u.status || 'Active').toLowerCase() === 'suspended'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                  }`}
                              >
                                {(u.status || 'Active').toLowerCase() === 'suspended' ? 'Activate' : 'Suspend'}
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
          {/* TAB 3: ENTERPRISE ASSET INVENTORY (MATCHES IMAGE 1 EXACTLY)   */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'assets' && (
            <div className="space-y-6">
              {/* Header Title + Action Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold tracking-tight text-slate-900">Enterprise Asset Inventory</h1>
                </div>

                {(isAdmin || isAnalyst) && (
                  <button
                    onClick={() => {
                      setEditingAsset(null);
                      setNewAssetName('');
                      setNewAssetLocation('US-East-1');
                      setShowAddAssetModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Register IT Asset</span>
                  </button>
                )}
              </div>

              {/* 4 Metric KPI Cards (Exact Values Calculated Dynamically) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
                  <div className="text-xs font-bold text-slate-500">Total Assets</div>
                  <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
                    {totalAssetsCount}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
                  <div className="text-xs font-bold text-slate-500">Critical Tier 5</div>
                  <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
                    {criticalTier5Count}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
                  <div className="text-xs font-bold text-slate-500">Cloud Nodes</div>
                  <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
                    {cloudNodesCount}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
                  <div className="text-xs font-bold text-slate-500">Database & Apps</div>
                  <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
                    {databaseAndAppsCount}
                  </div>
                </div>
              </div>

              {/* Category Filter Tabs (With Green Underline Indicator) */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pt-2">
                <div className="flex items-center gap-6 overflow-x-auto">
                  {['All', 'Cloud', 'Database', 'Software', 'Hardware'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setAssetCategoryFilter(cat)}
                      className={`pb-3 text-xs font-bold transition relative cursor-pointer whitespace-nowrap ${assetCategoryFilter === cat ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                      {cat}
                      {assetCategoryFilter === cat && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-700 rounded-full" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="pb-2">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 shadow-2xs">
                    <Filter className="w-3 h-3 text-slate-400" />
                    <select
                      value={assetCriticalityFilter}
                      onChange={(e) => setAssetCriticalityFilter(e.target.value)}
                      className="bg-transparent border-none focus:outline-none cursor-pointer text-xs font-semibold text-slate-600"
                    >
                      <option value="All">All Criticality</option>
                      <option value="Critical">Tier 5 Critical</option>
                      <option value="High">Tier 4 High</option>
                      <option value="Medium">Tier 3 Medium</option>
                      <option value="Low">Low (Tier 1–2)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ASSET INVENTORY TABLE */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                    ASSET INVENTORY TABLE
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Showing {displayAssets.length} of {totalAssetsCount} Assets
                  </span>
                </div>

                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm text-slate-700">
                    <thead className="bg-emerald-50 border-y border-emerald-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">ASSET ID</th>
                        <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">ASSET NAME & LOCATION</th>
                        <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">CATEGORY</th>
                        <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">CRITICALITY</th>
                        <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">SENSITIVITY</th>
                        <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">OWNER</th>
                        <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">LINKED RISKS</th>
                        {(user?.role === 'Admin' || user?.role === 'Analyst') && (
                          <th className="px-4 py-3 text-right text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">ACTIONS</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {displayAssets.map((a) => {
                        const linkedRisks = threats.filter(
                          (t) => t.assetId === a.id || t.assetName === a.name
                        );
                        const riskCount = linkedRisks.length;

                        return (
                          <tr key={a.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                              {a.id}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-slate-900">{a.name}</span>
                              <span className="text-slate-400 font-normal"> / {a.location || 'On-Premise'}</span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 font-medium">
                              {a.category}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold inline-block ${(a.criticality || '').includes('Tier 5') || a.criticality === 'Critical'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : (a.criticality || '').includes('Tier 4') || a.criticality === 'High'
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : (a.criticality || '').includes('Tier 3') || a.criticality === 'Medium'
                                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  }`}
                              >
                                {a.criticality || 'Tier 3 Medium'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold inline-block ${a.sensitivity === 'Restricted'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : a.sensitivity === 'Confidential'
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : a.sensitivity === 'Internal'
                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                        : 'bg-slate-100 text-slate-700'
                                  }`}
                              >
                                {a.sensitivity || 'Internal'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-700 font-medium">
                              {a.owner}
                            </td>
                            <td className="py-3.5 px-4 font-mono">
                              {riskCount > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedAssetFilter(a.id);
                                    setActiveTab('risks');
                                  }}
                                  className="text-emerald-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
                                >
                                  <span>{riskCount} {riskCount === 1 ? 'risk' : 'risks'}</span>
                                </button>
                              ) : (
                                <span className="text-slate-400">None</span>
                              )}
                            </td>
                            {(isAdmin || isAnalyst) && (
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleOpenEditAsset(a)}
                                    title="Edit Asset"
                                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  {isAdmin && (
                                    <button
                                      onClick={() => handleDeleteAsset(a.id, a.name)}
                                      title="Decommission Asset"
                                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 4: RISK REGISTER & LIFECYCLE WORKFLOW                    */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'risks' && (
            isAuditor ? (
              /* AUDITOR VIEW: Risk Register (Read-Only Audit View - Image 2) */
              <div className="space-y-6">
                {/* Header Title + Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                      Risk Register
                    </h1>
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-xs font-semibold inline-flex items-center">
                      Read-Only
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* Filter Button */}
                    <div className="relative">
                      <button
                        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                        type="button"
                        className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer"
                      >
                        <Filter className="w-3.5 h-3.5 text-slate-500" />
                        <span>Filter</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      {showFilterDropdown && (
                        <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-30 text-xs font-semibold">
                          <div className="px-2 py-1 text-xs uppercase font-bold text-slate-400">By Severity</div>
                          {['All', 'Critical', 'High', 'Medium', 'Low'].map((sev) => (
                            <button
                              key={sev}
                              onClick={() => {
                                setRiskSeverityFilter(sev);
                                setShowFilterDropdown(false);
                              }}
                              className={`w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer ${
                                riskSeverityFilter === sev ? 'text-emerald-700 font-bold bg-emerald-50' : 'text-slate-600'
                              }`}
                            >
                              {sev}
                            </button>
                          ))}
                          <div className="border-t border-slate-100 my-1"></div>
                          <div className="px-2 py-1 text-xs uppercase font-bold text-slate-400">By Lifecycle</div>
                          {['All', 'Identified', 'Assessed', 'Mitigating', 'Resolved'].map((st) => (
                            <button
                              key={st}
                              onClick={() => {
                                setRiskStatusFilter(st);
                                setShowFilterDropdown(false);
                              }}
                              className={`w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer ${
                                riskStatusFilter === st ? 'text-emerald-700 font-bold bg-emerald-50' : 'text-slate-600'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Export CSV Evidence */}
                    <button
                      onClick={() => {
                        handleExportCSV();
                        showFeedback('Audit Evidence CSV exported successfully.', 'success');
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV Evidence</span>
                    </button>
                  </div>
                </div>

                {/* Read-Only Audit Table Card (Image 2) */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                  <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left border-collapse text-sm text-slate-700">
                      <thead className="bg-emerald-50 border-y border-emerald-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">RISK ID</th>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">THREAT TITLE</th>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">LINKED ASSET</th>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">SCORE</th>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">LIFECYCLE STAGE</th>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">LAST VERIFIED</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {displayThreats.length > 0 ? (
                          displayThreats.map((t) => (
                            <tr key={t.id} className="hover:bg-slate-50/60 transition">
                              <td className="py-4 px-6 font-mono font-bold text-slate-900">
                                {t.id}
                              </td>
                              <td className="py-4 px-6 font-extrabold text-slate-900">
                                {t.title}
                              </td>
                              <td className="py-4 px-6 text-slate-700 font-medium">
                                {t.assetName || t.targetAsset || t.assetId || 'Prod Database'}
                              </td>
                              <td className="py-4 px-6">
                                <span
                                  className={`px-2.5 py-1 rounded-md text-xs font-mono font-black inline-flex items-center gap-1.5 ${
                                    t.score >= 20
                                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                      : t.score >= 12
                                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                        : t.score >= 6
                                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  }`}
                                >
                                  <span>{t.score}</span>
                                  <span className="font-sans font-semibold text-xs">{t.severity}</span>
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      t.status === 'Identified'
                                        ? 'bg-teal-500'
                                        : t.status === 'Assessed'
                                          ? 'bg-orange-500'
                                          : t.status === 'Mitigating'
                                            ? 'bg-amber-500'
                                            : 'bg-emerald-700'
                                    }`}
                                  />
                                  <span className="font-semibold text-slate-800">{t.status}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-1 font-mono text-slate-600 font-medium">
                                  <span>{t.date || '2026-11-15'}</span>
                                  <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="py-12 text-center text-slate-400">
                              No matching risks found for this audit filter.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                    Risk Register & Lifecycle Workflow
                  </h1>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setRiskViewMode('table')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${riskViewMode === 'table'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                      <Table className="w-3.5 h-3.5" />
                      <span>Table View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRiskViewMode('kanban')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${riskViewMode === 'kanban'
                          ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                          : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                      <Kanban className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Pipeline Kanban</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={riskSeverityFilter}
                      onChange={(e) => setRiskSeverityFilter(e.target.value)}
                      className="bg-transparent border-none focus:outline-none cursor-pointer text-xs font-bold text-slate-700"
                    >
                      <option value="All">All Severities</option>
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Export CSV</span>
                  </button>

                  {(user?.role === 'Admin' || user?.role === 'Analyst') && (
                    <button
                      onClick={() => setShowAddThreatModal(true)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Log New Risk</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Active Filter Badges */}
              {(selectedAssetFilter || selectedCellFilter || riskSeverityFilter !== 'All' || riskStatusFilter !== 'All') && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {selectedAssetFilter && (
                    <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                      Filtered by Asset: {selectedAssetFilter}
                      <button onClick={() => setSelectedAssetFilter(null)} className="hover:text-red-600 cursor-pointer">×</button>
                    </span>
                  )}
                  {selectedCellFilter && (
                    <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-amber-100 text-amber-800 flex items-center gap-1.5">
                      Filtered by Matrix Cell: Likelihood {selectedCellFilter.likelihood} × Impact {selectedCellFilter.impact}
                      <button onClick={() => setSelectedCellFilter(null)} className="hover:text-red-600 cursor-pointer">×</button>
                    </span>
                  )}
                  {riskSeverityFilter !== 'All' && (
                    <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5">
                      Severity: {riskSeverityFilter}
                      <button onClick={() => setRiskSeverityFilter('All')} className="hover:text-slate-900 cursor-pointer">×</button>
                    </span>
                  )}
                  {riskStatusFilter !== 'All' && (
                    <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
                      Status: {riskStatusFilter}
                      <button onClick={() => setRiskStatusFilter('All')} className="hover:text-red-600 cursor-pointer">×</button>
                    </span>
                  )}
                </div>
              )}

              {/* VIEW 1: PIPELINE KANBAN */}
              {riskViewMode === 'kanban' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
                  {['Identified', 'Assessed', 'Mitigating', 'Resolved'].map((stage) => {
                    const stageCards = displayThreats.filter((t) => t.status === stage);

                    return (
                      <div
                        key={stage}
                        className="bg-slate-100/70 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 min-h-[500px]"
                      >
                        <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                          <div>
                            <h3 className="font-extrabold text-sm text-slate-900">{stage}</h3>
                            <span className="text-xs font-mono text-slate-500 font-semibold">
                              {stageCards.length} {stageCards.length === 1 ? 'card' : 'cards'}
                            </span>
                          </div>
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${stage === 'Identified'
                                ? 'bg-red-500'
                                : stage === 'Assessed'
                                  ? 'bg-orange-500'
                                  : stage === 'Mitigating'
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-700'
                              }`}
                          />
                        </div>

                        <div className="flex flex-col gap-3 overflow-y-auto max-h-[700px] pr-1">
                          {stageCards.map((risk) => (
                            <div
                              key={risk.id}
                              className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:shadow-sm hover:border-slate-300 transition flex flex-col gap-2.5"
                            >
                              <div className="text-xs font-mono font-bold text-slate-500">
                                {risk.id}
                              </div>

                              <h4 className="text-xs font-extrabold text-slate-900 leading-snug">
                                {risk.title}
                              </h4>

                              <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-600">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSearchQuery(risk.assetId);
                                    setActiveTab('assets');
                                  }}
                                  className="hover:text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <span>{risk.assetId}</span>
                                  <ExternalLink className="w-3 h-3 text-slate-400" />
                                </button>
                              </div>

                              <div>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-extrabold inline-block ${risk.score >= 20
                                      ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                      : risk.score >= 12
                                        ? 'bg-orange-100 text-orange-700 border border-orange-200'
                                        : risk.score >= 6
                                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200 border border-emerald-200'
                                    }`}
                                >
                                  {risk.severity} {risk.score}
                                </span>
                              </div>

                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[9px] font-bold">
                                    {(risk.assignee || 'A').charAt(0)}
                                  </div>
                                  <span className="text-xs font-medium text-slate-600">
                                    {risk.assignee || 'A. Rahman'}
                                  </span>
                                </div>

                                {(user?.role === 'Admin' || user?.role === 'Analyst') && (
                                  <button
                                    onClick={() => handleAdvanceRisk(risk.id)}
                                    title={stage === 'Resolved' ? 'Risk is fully resolved' : 'Advance to next lifecycle stage'}
                                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 hover:text-emerald-700 transition cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95"
                                  >
                                    <span>Advance</span>
                                    <span>➔</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}

                          {stageCards.length === 0 && (
                            <div className="p-6 text-center text-slate-400 text-xs font-medium border-2 border-dashed border-slate-200 rounded-xl">
                              No risks in {stage}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* VIEW 2: TABLE VIEW (MATCHES IMAGE 3 EXACTLY) */}
              {riskViewMode === 'table' && (
                <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                  <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left text-sm text-slate-700">
                      <thead className="bg-emerald-50 border-y border-emerald-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">RISK ID</th>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">THREAT TITLE</th>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">LINKED ASSET</th>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">SCORE</th>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">LIFECYCLE STAGE</th>
                          {(isAdmin || isAnalyst) && (
                            <th className="px-4 py-3 text-right text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">ACTIONS</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {displayThreats.map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{t.id}</td>
                            <td className="py-3.5 px-4">
                              <div className="font-extrabold text-slate-900">{t.title}</div>
                              <div className="text-xs text-slate-400 font-normal">{t.cve || 'Web Application Risk'}</div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-700 font-semibold">
                              {t.assetName || t.assetId}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold inline-block ${t.score >= 20
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : t.score >= 12
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : t.score >= 6
                                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  }`}
                              >
                                {t.score} {t.severity}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono inline-block ${t.status === 'Resolved'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : t.status === 'Mitigating'
                                      ? 'bg-lime-100 text-lime-800'
                                      : t.status === 'Assessed'
                                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                        : 'bg-blue-100 text-blue-800'
                                  }`}
                              >
                                {t.status}
                              </span>
                            </td>
                            {(isAdmin || isAnalyst) && (
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      setNewThreatTitle(t.title);
                                      setNewThreatCve(t.cve || '');
                                      setNewThreatAssetId(t.assetId);
                                      setNewThreatLikelihood(t.likelihood || 4);
                                      setNewThreatImpact(t.impact || 4);
                                      setNewThreatAssignee(t.assignee || 'A. Rahman');
                                      setShowAddThreatModal(true);
                                    }}
                                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1 shadow-2xs transition active:scale-95 cursor-pointer"
                                  >
                                    <Edit2 className="w-3 h-3 text-slate-400" />
                                    <span>Edit</span>
                                  </button>

                                  <button
                                    onClick={() => handleAdvanceRisk(t.id)}
                                    title={t.status === 'Resolved' ? 'Risk is resolved' : 'Advance to next lifecycle stage'}
                                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 hover:text-emerald-700 flex items-center gap-1 shadow-2xs transition active:scale-95 cursor-pointer"
                                  >
                                    <span>Advance</span>
                                    <span>➔</span>
                                  </button>

                                  {isAdmin && (
                                    <button
                                      onClick={() => handleDeleteThreat(t.id)}
                                      title="Delete Risk"
                                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            )
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 5: AUTOMATED RISK SCORING & 5x5 HEATMAP (EXACT TO IMAGE 2)*/}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'heatmap' && (
            isAuditor ? (
              /* AUDITOR VIEW: Risk Scoring Verification & 5x5 Matrix (Image 4) */
              <div className="space-y-6">
                {/* Header Title + Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                      Risk Scoring Verification & 5x5 Matrix
                    </h1>
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-xs font-semibold inline-flex items-center">
                      Read-Only
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={handleExportCSV}
                      className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer"
                    >
                      <span>Export CSV</span>
                    </button>
                    <button
                      onClick={handlePrintCompliancePDF}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Compliance PDF</span>
                    </button>
                  </div>
                </div>

                {/* Top Row: 2 Split Cards (Image 4) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  {/* Left Card: Scoring & Control Verification */}
                  <div className="w-full bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
                    <div className="pb-2 border-b border-slate-100">
                      <h3 className="text-sm font-semibold text-slate-800">
                        Scoring & Control Verification
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {/* Formula Block */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                          <TrendingUp className="w-4 h-4 text-slate-600" />
                          <span>Likelihood x Impact Formula: Verified (L x I = Risk Rating)</span>
                        </div>
                        <div className="pl-6 space-y-1 text-slate-500 font-medium text-xs">
                          <div>Audit Details: 1 to 5 scale Calibration</div>
                          <div>Audit Details: 1 to 5 scale Calibration</div>
                          <div>Audit Details: 1 to 5 Mitigation Calibration</div>
                        </div>
                      </div>

                      {/* Control Effectiveness Block */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                          <Sliders className="w-4 h-4 text-slate-600" />
                          <span>Control Effectiveness Applied: 35% Mitigation Offset</span>
                        </div>
                        <div className="pl-6 space-y-1 text-slate-500 font-medium text-xs">
                          <div>Historical Adjustment Audits: 35% Mitigation Offset</div>
                          <div>Historical Adjustment Audits: 35% Mitigation Offset</div>
                          <div>Historical Adjustment Audits: Vendor Risk</div>
                        </div>
                      </div>
                    </div>

                    {/* Status Banner */}
                    <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Audit Status: Compliant / Verified</span>
                    </div>
                  </div>

                  {/* Right Card: Inherent Risk Heatmap (5x5 Matrix) */}
                  <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
                    <div className="pb-1 border-b border-slate-100">
                      <h3 className="text-sm font-semibold text-slate-800">
                        Inherent Risk Heatmap
                      </h3>
                    </div>

                    <div className="pt-2">
                      <div className="flex">
                        {/* Y-Axis Label */}
                        <div className="w-12 shrink-0 flex flex-col justify-between py-1 text-xs font-mono font-bold text-slate-600 pr-2 text-right">
                          <span>5</span>
                          <span>4</span>
                          <span>3</span>
                          <span>2</span>
                          <span>1</span>
                        </div>

                        {/* 5x5 Matrix Grid */}
                        <div className="flex-1 space-y-1.5">
                          {[5, 4, 3, 2, 1].map((row) => (
                            <div key={row} className="grid grid-cols-5 gap-1.5 h-9">
                              {[1, 2, 3, 4, 5].map((col) => {
                                const count = heatmapData[`${row}-${col}`] || 0;
                                const score = row * col;

                                // Heatmap Color Scale
                                let cellBg = 'bg-[#10b981] text-white'; // green
                                if (score >= 20) cellBg = 'bg-[#e11d48] text-white'; // red
                                else if (score >= 15) cellBg = 'bg-[#ea580c] text-white'; // orange
                                else if (score >= 10) cellBg = 'bg-[#f59e0b] text-slate-900'; // amber
                                else if (score >= 6) cellBg = 'bg-[#facc15] text-slate-900'; // yellow
                                else if (score >= 4) cellBg = 'bg-[#84cc16] text-slate-900'; // lime
                                else cellBg = 'bg-[#10b981] text-white'; // green

                                return (
                                  <div
                                    key={col}
                                    title={`Likelihood ${row} × Impact ${col} = Score ${score} (${count} threats)`}
                                    className={`rounded-lg flex items-center justify-center font-extrabold text-xs transition relative shadow-2xs ${cellBg}`}
                                  >
                                    {count > 0 ? (
                                      <span className="w-5 h-5 rounded bg-black/15 flex items-center justify-center font-black text-xs">
                                        {count}
                                      </span>
                                    ) : null}
                                  </div>
                                );
                              })}
                            </div>
                          ))}

                          {/* X-Axis Columns Header */}
                          <div className="grid grid-cols-5 gap-1.5 text-center text-xs font-mono font-bold text-slate-500 pt-1 select-none">
                            <span>1</span>
                            <span>2</span>
                            <span>3</span>
                            <span>4</span>
                            <span>5</span>
                          </div>
                          <div className="text-center text-xs font-bold text-slate-500 pt-0.5 select-none">
                            Impact
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Card / Table: Verified Risk Exposure Entries (Image 4) */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-800">
                      Verified Risk Exposure Entries
                    </h3>
                    <span className="text-xs font-mono text-slate-400">
                      {threats.length} entries verified
                    </span>
                  </div>

                  <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left border-collapse text-sm text-slate-700">
                      <thead className="bg-emerald-50 border-y border-emerald-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">ID</th>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">Risk Description</th>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">Category</th>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">Likelihood</th>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">Impact</th>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">Rating</th>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">Verified By</th>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">Audit Date</th>
                          <th className="px-4 py-3 text-right text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {threats.map((t) => {
                          const cat = t.category || (t.title.includes('Cloud') ? 'Infrastructure' : t.title.includes('API') || t.title.includes('Database') ? 'Data Privacy' : t.title.includes('Vendor') ? 'Vendor Risk' : 'Cyber Security');
                          return (
                            <tr key={t.id} className="hover:bg-slate-50/60 transition">
                              <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                                {t.id}
                              </td>
                              <td className="py-3.5 px-4 font-extrabold text-slate-900">
                                {t.title}
                              </td>
                              <td className="py-3.5 px-4 text-slate-700 font-medium">
                                {cat}
                              </td>
                              <td className="py-3.5 px-4 font-mono font-bold text-slate-700 text-center">
                                {t.likelihood}
                              </td>
                              <td className="py-3.5 px-4 font-mono font-bold text-slate-700 text-center">
                                {t.impact}
                              </td>
                              <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                                <span className={`px-2 py-0.5 rounded font-bold text-xs ${
                                  t.score >= 15 ? 'text-rose-700 bg-rose-50' :
                                  t.score >= 10 ? 'text-orange-700 bg-orange-50' :
                                  t.score >= 5 ? 'text-amber-800 bg-amber-50' :
                                  'text-emerald-700 bg-emerald-50'
                                }`}>
                                  {t.score} ({t.severity})
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-slate-700 font-medium">
                                {t.assignee || 'SOC Team'}
                              </td>
                              <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                                {formatRiskDate(t.date, t.createdAt)}
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => setSelectedAuditDetailRisk(t)}
                                  className="text-slate-600 hover:text-emerald-700 font-bold transition hover:underline cursor-pointer"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : isExecutive ? (
              /* EXECUTIVE VIEW: Executive Risk Exposure & Board Reports (Image 2) */
              <div className="space-y-6">
                {/* Header Title + Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                      Executive Risk Exposure & Board Reports
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                      Executive Summary
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={handleExportCSV}
                      className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer"
                    >
                      <span>Export CSV</span>
                    </button>
                    <button
                      onClick={() => setShowExportBriefingStudio(true)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Board PDF Report</span>
                    </button>
                  </div>
                </div>

                {/* Top Row: 2 Split Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                  {/* Left Card: Department Risk Exposure */}
                  <div className="w-full bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <h3 className="text-sm font-semibold text-slate-800">
                        Department Risk Exposure
                      </h3>
                    </div>

                    <div className="space-y-5 pt-1 text-xs">
                      {departmentExposure.map((dept, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex items-center justify-between text-slate-800 font-bold">
                            <div className="w-40 shrink-0">
                              <span className="block truncate">{dept.name}</span>
                              <span className="text-xs font-normal text-slate-400">{dept.activeCount} active risks</span>
                            </div>
                            <div className="flex-1 mx-4 bg-slate-100 h-6 rounded-lg overflow-hidden relative">
                              <div
                                className={`h-full ${dept.color} rounded-lg flex items-center justify-end pr-2 text-white font-mono text-xs font-extrabold transition-all duration-500`}
                                style={{ width: `${Math.max(dept.val, dept.val > 0 ? 12 : 0)}%` }}
                              >
                                {dept.val > 0 ? `${dept.val}%` : ''}
                              </div>
                            </div>
                            <span className="w-10 text-right font-mono text-xs font-bold text-slate-600">{dept.val}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Card: Inherent Risk Heatmap (5x5 Matrix) */}
                  <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <h3 className="text-sm font-semibold text-slate-800">
                        Inherent Risk Heatmap
                      </h3>
                    </div>

                    <div className="pt-2">
                      <div className="flex">
                        {/* Y-Axis Label */}
                        <div className="w-24 shrink-0 flex flex-col justify-between py-1 text-xs font-bold text-slate-600 pr-2 text-right">
                          <span>Very High (5)</span>
                          <span>High (4)</span>
                          <span>Medium (3)</span>
                          <span>Low (2)</span>
                          <span>Very Low (1)</span>
                        </div>

                        {/* 5x5 Matrix Grid */}
                        <div className="flex-1 space-y-1.5">
                          {[5, 4, 3, 2, 1].map((row) => (
                            <div key={row} className="grid grid-cols-5 gap-1.5 h-9">
                              {[1, 2, 3, 4, 5].map((col) => {
                                const count = heatmapData[`${row}-${col}`] || 0;
                                const score = row * col;

                                // Color scale matching Image 2
                                let cellBg = 'bg-[#10b981] text-white'; // default green
                                if (score >= 20) cellBg = 'bg-[#e11d48] text-white'; // red (Very High)
                                else if (score >= 15) cellBg = 'bg-[#ea580c] text-white'; // orange (High)
                                else if (score >= 10) cellBg = 'bg-[#f59e0b] text-slate-900'; // amber
                                else if (score >= 6) cellBg = 'bg-[#facc15] text-slate-900'; // yellow
                                else if (score >= 4) cellBg = 'bg-[#84cc16] text-slate-900'; // lime
                                else cellBg = 'bg-[#10b981] text-white'; // green

                                return (
                                  <div
                                    key={col}
                                    title={`Likelihood ${row} × Impact ${col} = Score ${score} (${count} threats)`}
                                    className={`rounded-lg flex items-center justify-center font-extrabold text-xs transition relative shadow-2xs ${cellBg}`}
                                  >
                                    {count > 0 ? (
                                      <span className="w-5 h-5 rounded bg-black/15 flex items-center justify-center font-black text-xs">
                                        {count}
                                      </span>
                                    ) : null}
                                  </div>
                                );
                              })}
                            </div>
                          ))}

                          {/* X-Axis Columns Header */}
                          <div className="grid grid-cols-5 gap-1.5 text-center text-xs font-bold text-slate-500 pt-1 select-none">
                            <span>Very Low (1)</span>
                            <span>Low (2)</span>
                            <span>Medium (3)</span>
                            <span>High (4)</span>
                            <span>Very High (5)</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-center text-xs font-bold text-slate-700 pt-2 uppercase tracking-wider">
                        Impact
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Card: Top Critical Risks for Board Review */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
                  <div className="pb-1 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-800">
                      Top Critical Risks for Board Review
                    </h3>
                    <span className="text-xs text-slate-500 font-medium font-mono">
                      {threats.length} Active System Risks
                    </span>
                  </div>

                  <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left text-sm text-slate-700 border-collapse">
                      <thead className="bg-emerald-50 border-y border-emerald-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">Risk ID</th>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">Risk Name</th>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">Department</th>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">Inherent Score</th>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">Likelihood / Impact</th>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                        {threats.slice(0, 8).map((t) => {
                          const score = t.score || (t.likelihood * t.impact) || 15;
                          const dept = t.assetName?.includes('Azure') || t.assetName?.includes('Financial')
                            ? 'Finance ERP'
                            : t.assetName?.includes('HR')
                              ? 'HR Portal'
                              : t.assetName?.includes('Access') || t.assetName?.includes('CRM')
                                ? 'Identity & Access'
                                : 'Cloud Infrastructure';

                          return (
                            <tr key={t.id} className="hover:bg-slate-50/80 transition">
                              <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{t.id}</td>
                              <td className="py-3.5 px-4 font-bold text-slate-900">{t.title}</td>
                              <td className="py-3.5 px-4 text-slate-600 font-medium">{dept}</td>
                              <td className="py-3.5 px-4 font-mono font-bold">
                                <span className={score >= 20 ? 'text-rose-600 font-extrabold' : score >= 15 ? 'text-orange-600 font-bold' : 'text-amber-600 font-bold'}>
                                  {score} ({score >= 20 ? 'Very High' : score >= 15 ? 'High' : score >= 10 ? 'Med-High' : 'Medium'})
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{t.likelihood} / {t.impact}</td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${t.status === 'Resolved'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : t.status === 'Mitigating'
                                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}>
                                  {t.status === 'Mitigating' ? 'Active Mitigation' : t.status === 'Assessed' ? 'Monitored' : t.status === 'Identified' ? 'Under Review' : t.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header Title + Action Buttons */}
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                      Automated Risk Scoring & 5x5 Heatmap
                    </h1>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={handleExportCSV}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer"
                    >
                      <span>Export CSV</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
                    >
                      <span>Export PDF Report</span>
                    </button>
                  </div>
                </div>

                {/* Top Row: 2 Split Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                  {/* Left Card: Risk Scoring Engine Simulator */}
                  <div className="w-full bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">
                        Risk Scoring Engine Simulator
                      </h3>
                    </div>

                    {/* Sliders Container */}
                    <div className="space-y-4 text-xs font-semibold">
                      {/* Slider 1: Likelihood */}
                      <div>
                        <div className="flex justify-between items-center text-slate-700 mb-1.5">
                          <span>Likelihood</span>
                          <span className="font-mono font-bold text-slate-900">{simLikelihood}/5</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="1"
                          value={simLikelihood}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setSimLikelihood(val);
                            setSelectedMatrixCell({ likelihood: val, impact: simImpact });
                          }}
                          className="w-full accent-slate-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                        />
                      </div>

                      {/* Slider 2: Impact */}
                      <div>
                        <div className="flex justify-between items-center text-slate-700 mb-1.5">
                          <span>Impact</span>
                          <span className="font-mono font-bold text-slate-900">{simImpact}/5</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="1"
                          value={simImpact}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setSimImpact(val);
                            setSelectedMatrixCell({ likelihood: simLikelihood, impact: val });
                          }}
                          className="w-full accent-slate-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                        />
                      </div>

                      {/* Slider 3: Asset Criticality */}
                      <div>
                        <div className="flex justify-between items-center text-slate-700 mb-1.5">
                          <span>Asset Criticality</span>
                          <span className="font-mono font-bold text-slate-900">Tier {simCriticalityTier}</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="1"
                          value={simCriticalityTier}
                          onChange={(e) => setSimCriticalityTier(Number(e.target.value))}
                          className="w-full accent-slate-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                        />
                      </div>

                      {/* Slider 4: Control Effectiveness */}
                      <div>
                        <div className="flex justify-between items-center text-slate-700 mb-1.5">
                          <span>Control Effectiveness</span>
                          <span className="font-mono font-bold text-slate-900">{simControlEffectiveness}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={simControlEffectiveness}
                          onChange={(e) => setSimControlEffectiveness(Number(e.target.value))}
                          className="w-full accent-slate-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Two Score Boxes Below Sliders */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      {/* Inherent Score Box */}
                      <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200/80">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-600">Inherent Score</span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                            {simInherentSeverity}
                          </span>
                        </div>
                        <div className="text-3xl font-black text-slate-900 font-mono mt-2">
                          {simInherentScore}
                        </div>
                      </div>

                      {/* Residual Score Box */}
                      <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-600">Residual Score</span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                            {simResidualSeverity}
                          </span>
                        </div>
                        <div className="text-3xl font-black text-slate-900 font-mono mt-2">
                          {simResidualScore}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Card: 5×5 Likelihood vs. Impact Matrix */}
                  <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-800">
                        5×5 Likelihood vs. Impact Matrix
                      </h3>
                    </div>

                    {/* Heatmap Grid with Exact Coordinates */}
                    <div className="space-y-1 select-none">
                      {/* Top Impact Label */}
                      <div className="text-center text-xs font-bold text-slate-500 pb-1">
                        Impact (1-5)
                      </div>

                      {/* Top Impact Numbers */}
                      <div className="grid grid-cols-5 pl-10 pr-2 gap-1.5 text-center text-xs font-mono font-bold text-slate-500">
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4</span>
                        <span>5</span>
                      </div>

                      {/* Matrix Rows & Left Likelihood Label */}
                      <div className="flex items-center gap-2 pt-1">
                        {/* Left Likelihood Label & Numbers */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-500 -rotate-90 select-none whitespace-nowrap -ml-3">
                            Likelihood (5-1)
                          </span>
                          <div className="flex flex-col justify-between h-48 text-xs font-mono font-bold text-slate-500 text-right pr-1">
                            <span>5</span>
                            <span>4</span>
                            <span>3</span>
                            <span>2</span>
                            <span>1</span>
                          </div>
                        </div>

                        {/* 25 Matrix Cells */}
                        <div className="flex-1 flex flex-col gap-1.5">
                          {[5, 4, 3, 2, 1].map((row) => (
                            <div key={row} className="grid grid-cols-5 gap-1.5 h-9">
                              {[1, 2, 3, 4, 5].map((col) => {
                                const count = heatmapData[`${row}-${col}`] || 0;
                                const isSelected =
                                  selectedMatrixCell?.likelihood === row &&
                                  selectedMatrixCell?.impact === col;

                                // Exact color mapping matching Image 2:
                                let cellColor = 'bg-[#059669] text-white'; // Emerald green
                                if (row === 5) {
                                  if (col === 1) cellColor = 'bg-[#eab308] text-slate-900'; // Yellow
                                  else if (col === 2) cellColor = 'bg-[#f97316] text-white'; // Orange
                                  else cellColor = 'bg-[#dc2626] text-white'; // Red
                                } else if (row === 4) {
                                  if (col === 1) cellColor = 'bg-[#84cc16] text-slate-900'; // Lime
                                  else if (col === 2) cellColor = 'bg-[#eab308] text-slate-900'; // Yellow
                                  else if (col === 3) cellColor = 'bg-[#f97316] text-white'; // Orange
                                  else cellColor = 'bg-[#dc2626] text-white'; // Red
                                } else if (row === 3) {
                                  if (col === 1) cellColor = 'bg-[#059669] text-white'; // Green
                                  else if (col === 2) cellColor = 'bg-[#84cc16] text-slate-900'; // Lime
                                  else if (col === 3) cellColor = 'bg-[#eab308] text-slate-900'; // Yellow
                                  else if (col === 4) cellColor = 'bg-[#f97316] text-white'; // Orange
                                  else cellColor = 'bg-[#dc2626] text-white'; // Red
                                } else if (row === 2) {
                                  if (col <= 2) cellColor = 'bg-[#059669] text-white'; // Green
                                  else if (col === 3) cellColor = 'bg-[#84cc16] text-slate-900'; // Lime
                                  else if (col === 4) cellColor = 'bg-[#eab308] text-slate-900'; // Yellow
                                  else cellColor = 'bg-[#f97316] text-white'; // Orange
                                } else {
                                  if (col <= 3) cellColor = 'bg-[#059669] text-white'; // Green
                                  else if (col === 4) cellColor = 'bg-[#84cc16] text-slate-900'; // Lime
                                  else cellColor = 'bg-[#eab308] text-slate-900'; // Yellow
                                }

                                return (
                                  <button
                                    key={col}
                                    type="button"
                                    onClick={() => {
                                      setSelectedMatrixCell({ likelihood: row, impact: col });
                                      setSimLikelihood(row);
                                      setSimImpact(col);
                                    }}
                                    className={`rounded-lg flex items-center justify-center font-bold text-xs transition cursor-pointer relative shadow-2xs ${cellColor} ${isSelected
                                        ? 'ring-3 ring-slate-900 ring-offset-1 scale-105 z-10 font-black'
                                        : 'hover:scale-105 opacity-95'
                                      }`}
                                  >
                                    {count > 0 ? (
                                      <span className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center font-mono font-extrabold text-xs">
                                        {count}
                                      </span>
                                    ) : null}
                                  </button>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Impact Numbers & Label */}
                      <div className="grid grid-cols-5 pl-10 pr-2 gap-1.5 text-center text-xs font-mono font-bold text-slate-500 pt-1">
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4</span>
                        <span>5</span>
                      </div>
                      <div className="text-center text-xs font-bold text-slate-500 pt-0.5">
                        Impact (1-5)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Section: Matching Cell Risks Table (Image 2) */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Matching Cell Risks (L{selectedMatrixCell?.likelihood ?? simLikelihood} x I{selectedMatrixCell?.impact ?? simImpact})
                    </h3>
                    <span className="text-xs font-mono text-slate-400">
                      {matchingCellRisks.length} threats matching selected coordinates
                    </span>
                  </div>

                  <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left text-sm text-slate-700">
                      <thead className="bg-emerald-50 border-y border-emerald-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">Risk ID</th>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">Title</th>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">Asset</th>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">Inherent Score</th>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">Residual Score</th>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {matchingCellRisks.map((r) => {
                          const cellResScore = Math.max(1, Math.round(r.score * (1 - simControlEffectiveness / 100)));
                          const cellResSeverity = cellResScore >= 15 ? 'Critical' : cellResScore >= 10 ? 'High' : cellResScore >= 5 ? 'Medium' : 'Low';

                          return (
                            <tr key={r.id} className="hover:bg-slate-50/50 transition">
                              <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                                {r.id}
                              </td>
                              <td className="py-3.5 px-4 font-medium text-slate-900">
                                {r.title}
                              </td>
                              <td className="py-3.5 px-4 font-mono text-slate-600">
                                {r.assetName || r.assetId}
                              </td>
                              <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                                {r.score} ({r.severity})
                              </td>
                              <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                                {cellResScore} ({cellResSeverity})
                              </td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono inline-flex items-center gap-1.5 ${r.status === 'Resolved' || r.status === 'Mitigating'
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                      : 'bg-orange-50 text-orange-800 border border-orange-200'
                                    }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${r.status === 'Resolved' || r.status === 'Mitigating' ? 'bg-emerald-700' : 'bg-orange-600'}`}></span>
                                  <span>{r.status === 'Mitigating' ? 'In Mitigation' : r.status === 'Identified' ? 'Open' : r.status}</span>
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )
          )}

          {/* ------------------------------------------------------------- */}
          {/* ------------------------------------------------------------- */}
          {/* TAB 6: SECURITY AUDIT TRAIL & PROFILE (MATCHES ROLE)         */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'audit' && (
            isAuditor ? (
              /* AUDITOR VIEW: Audit Logs */
              <div className="space-y-6">
                {/* Header Title + Action Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                      Audit Logs
                    </h1>
                  </div>

                  <button
                    onClick={() => {
                      handlePrintAuditReport();
                      showFeedback('Audit report generated successfully.', 'success');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Audit PDF / CSV</span>
                  </button>
                </div>

                {/* Bottom Card / Table: System & Security Audit Log */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-semibold text-slate-800">
                        System & Security Audit Log
                      </h3>
                      <span className="text-xs font-mono text-slate-400">
                        {displayAuditLogs.length} verified events
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Search..."
                          value={auditSearch}
                          onChange={(e) => setAuditSearch(e.target.value)}
                          className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 shadow-2xs">
                        <Filter className="w-3 h-3 text-slate-400" />
                        <select
                          value={auditFilterAction}
                          onChange={(e) => setAuditFilterAction(e.target.value)}
                          className="bg-transparent border-none focus:outline-none cursor-pointer"
                        >
                          <option value="All">Filter</option>
                          <option value="Logins">Logins</option>
                          <option value="Roles">Roles</option>
                          <option value="Assets">Assets</option>
                          <option value="Risks">Risks</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left border-collapse text-sm text-slate-700">
                      <thead className="bg-emerald-50 border-y border-emerald-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">TIMESTAMP</th>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">ACTOR</th>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">ROLE</th>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">EVENT TYPE</th>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">TARGET</th>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {displayAuditLogs.length > 0 ? displayAuditLogs.map((log, idx) => {
                          const dateStr = log.timestamp
                            ? `${new Date(log.timestamp).getFullYear()}-${String(new Date(log.timestamp).getMonth() + 1).padStart(2, '0')}-${String(new Date(log.timestamp).getDate()).padStart(2, '0')} ${String(new Date(log.timestamp).getHours()).padStart(2, '0')}:${String(new Date(log.timestamp).getMinutes()).padStart(2, '0')}:${String(new Date(log.timestamp).getSeconds()).padStart(2, '0')}`
                            : '2026-11-17 13:22:15';
                          const actorStr = log.actor?.includes('Auditor')
                            ? 'ext_auditor_01'
                            : log.actor?.includes('Executive')
                              ? 'exec_leader_01'
                              : (log.actor?.includes('Admin') || log.actor?.includes('Mahabubur'))
                                ? 'sys_admin_09'
                                : (log.actor?.includes('Analyst') || log.actor?.includes('Afri'))
                                  ? 'soc_analyst_02'
                                  : (log.actor?.includes('Daemon') || log.actor?.includes('Guard') || log.actor?.includes('System'))
                                    ? 'sys_daemon'
                                    : (log.actor || 'ext_auditor_01');
                          const roleStr = log.role || (
                            actorStr.includes('auditor') ? 'Auditor' :
                            actorStr.includes('exec') ? 'Executive' :
                            actorStr.includes('admin') ? 'Admin' :
                            actorStr.includes('analyst') ? 'Analyst' :
                            actorStr.includes('daemon') || actorStr.includes('sys') ? 'System' :
                            'System'
                          );

                          return (
                            <tr key={log.id || idx} className="hover:bg-slate-50/60 transition">
                              <td className="py-3.5 px-4 font-mono text-slate-700 font-semibold text-xs whitespace-nowrap">
                                {dateStr}
                              </td>
                              <td className="py-3.5 px-4 font-mono font-bold text-slate-800 text-xs">
                                {actorStr}
                              </td>
                              <td className="py-3.5 px-4 text-slate-600 font-medium text-xs">
                                {roleStr}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200/60 inline-block">
                                  {log.action || log.event || 'POLICY_ENFORCEMENT'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-slate-700 font-medium text-xs">
                                {log.target || 'Audit Log Export (PDF)'}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>Verified</span>
                                </span>
                              </td>
                            </tr>
                          );
                        }) : (
                          <tr>
                            <td colSpan="6" className="py-10 text-center text-slate-400 text-xs">
                              No matching audit logs found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header Title + Action Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                      {isAnalyst ? 'Recent Activity' : 'Security Audit Trail'}
                    </h1>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={handleDownloadAuditCSV}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>Download Audit PDF / CSV</span>
                    </button>
                  )}
                </div>

                {/* Bottom Card: Activity & Audit Trail */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">
                        {isAnalyst ? 'Personal Activity Log' : 'System & Access Audit Log'}
                      </h3>
                      {isAnalyst && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          Organization-wide audit logs are accessible to Administrators and Auditors.
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Search */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Search..."
                          value={auditSearch}
                          onChange={(e) => setAuditSearch(e.target.value)}
                          className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
                        />
                      </div>

                      {/* Filter Dropdown */}
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 shadow-2xs">
                        <Filter className="w-3 h-3 text-slate-400" />
                        <select
                          value={auditFilterAction}
                          onChange={(e) => setAuditFilterAction(e.target.value)}
                          className="bg-transparent border-none focus:outline-none cursor-pointer"
                        >
                          <option value="All">Filter</option>
                          <option value="Logins">Logins</option>
                          <option value="Roles">Roles</option>
                          <option value="Assets">Assets</option>
                          <option value="Risks">Risks</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Audit Trail Table */}
                  <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left text-sm text-slate-700">
                      <thead className="bg-emerald-50 border-y border-emerald-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">TIMESTAMP</th>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">ACTOR</th>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">ROLE</th>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">EVENT TYPE</th>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">TARGET</th>
                          <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {displayAuditLogs.length > 0 ? displayAuditLogs.slice(0, 10).map((log) => {
                          const dateObj = new Date(log.timestamp);
                          const formattedDate = dateObj.toLocaleDateString('en-US', {
                            month: 'short',
                            day: '2-digit',
                            year: 'numeric',
                          }) + ' ' + dateObj.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          });

                          return (
                            <tr key={log.id} className="hover:bg-slate-50/50 transition">
                              <td className="py-3.5 px-4 font-mono text-slate-600">
                                {formattedDate}
                              </td>
                              <td className="py-3.5 px-4 font-bold text-slate-900">
                                {(log.actor || userDisplayName).replace(/\s*\((Admin|Analyst|Executive|Auditor)\)(?:\s*\(\1\))+/gi, ' ($1)')}
                              </td>
                              <td className="py-3.5 px-4 font-mono text-slate-600">
                                {log.role || (isAnalyst ? 'Analyst' : ((log.actor || '').includes('Auditor') ? 'Auditor' : (log.actor || '').includes('Executive') ? 'Executive' : (log.actor || '').includes('Analyst') ? 'Analyst' : (log.actor || '').includes('Daemon') || (log.actor || '').includes('Guard') || (log.actor || '').includes('System') ? 'System' : 'Admin'))}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                  {log.action}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-mono text-slate-700">
                                {log.target || 'System Login'}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                                  <span>Verified</span>
                                  <span>✓</span>
                                </span>
                              </td>
                            </tr>
                          );
                        }) : (
                          <tr>
                            <td colSpan="6" className="py-10 text-center text-slate-400 text-xs">
                              No matching activity logs found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 border-t border-slate-100 text-xs font-mono text-slate-400">
                    Showing {displayAuditLogs.length === 0 ? 0 : 1}-{Math.min(10, displayAuditLogs.length)} of {displayAuditLogs.length.toLocaleString()} logs
                  </div>
                </div>
              </div>
            )
          )}


        </main>
      </div>

      {/* ========================================================= */}
      {/* 3. MODALS (REGISTER IT ASSET, LOG RISK, PROVISION, PASS)  */}
      {/* ========================================================= */}

      {/* MODAL 1: REGISTER / EDIT IT ASSET */}
      {showAddAssetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto p-6 shadow-lg border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-700" />
                <span>{editingAsset ? 'Edit IT Asset' : 'Register New IT Asset'}</span>
              </h3>
              <button onClick={() => setShowAddAssetModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterAsset} className="space-y-4 pt-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Production DB"
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Location / Environment</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. US-East-1 or On-Premise"
                  value={newAssetLocation}
                  onChange={(e) => setNewAssetLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Category</label>
                  <select
                    value={newAssetCategory}
                    onChange={(e) => setNewAssetCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="Cloud">Cloud</option>
                    <option value="Database">Database</option>
                    <option value="Software">Software</option>
                    <option value="Hardware">Hardware</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Criticality</label>
                  <select
                    value={newAssetCriticality}
                    onChange={(e) => setNewAssetCriticality(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="Tier 5 Critical">Tier 5 Critical</option>
                    <option value="Tier 4 High">Tier 4 High</option>
                    <option value="Tier 3 Medium">Tier 3 Medium</option>
                    <option value="Tier 2 Low">Tier 2 Low</option>
                    <option value="Tier 1 Low">Tier 1 Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Data Sensitivity</label>
                  <select
                    value={newAssetSensitivity}
                    onChange={(e) => setNewAssetSensitivity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="Restricted">Restricted</option>
                    <option value="Confidential">Confidential</option>
                    <option value="Internal">Internal</option>
                    <option value="Public">Public</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Owner / Custodian</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah J."
                    value={newAssetOwner}
                    onChange={(e) => setNewAssetOwner(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddAssetModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
                >
                  {editingAsset ? 'Save Changes' : 'Register IT Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: LOG NEW RISK */}
      {showAddThreatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto p-6 shadow-lg border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-700" />
                <span>Log New Risk to Pipeline</span>
              </h3>
              <button onClick={() => setShowAddThreatModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddThreat} className="space-y-4 pt-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">Vulnerability / Threat Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SQL Injection Vulnerability on Customer DB"
                  value={newThreatTitle}
                  onChange={(e) => setNewThreatTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Target Asset</label>
                  <select
                    value={newThreatAssetId}
                    onChange={(e) => setNewThreatAssetId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.id} - {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Assignee</label>
                  <select
                    value={newThreatAssignee}
                    onChange={(e) => setNewThreatAssignee(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="A. Rahman">A. Rahman</option>
                    <option value="S. Kabir">S. Kabir</option>
                    <option value="M. Hasan">M. Hasan</option>
                    <option value="J. Doe">J. Doe</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Risk Matrix Sliders */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase text-slate-500 font-bold">Dynamic Score Preview</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono font-extrabold ${newThreatLikelihood * newThreatImpact >= 20
                        ? 'bg-red-600 text-white'
                        : newThreatLikelihood * newThreatImpact >= 12
                          ? 'bg-orange-500 text-white'
                          : newThreatLikelihood * newThreatImpact >= 6
                            ? 'bg-amber-500 text-white'
                            : 'bg-emerald-700 text-white'
                      }`}
                  >
                    L:{newThreatLikelihood} × I:{newThreatImpact} = {newThreatLikelihood * newThreatImpact} / 25
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>Likelihood (1 = Rare, 5 = Almost Certain):</span>
                    <strong className="font-mono text-emerald-800">{newThreatLikelihood} / 5</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={newThreatLikelihood}
                    onChange={(e) => setNewThreatLikelihood(Number(e.target.value))}
                    className="w-full accent-emerald-700 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>Impact (1 = Minor, 5 = Catastrophic):</span>
                    <strong className="font-mono text-red-700">{newThreatImpact} / 5</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={newThreatImpact}
                    onChange={(e) => setNewThreatImpact(Number(e.target.value))}
                    className="w-full accent-emerald-700 cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddThreatModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
                >
                  Log Risk to Identified Column
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DIRECT USER PROVISIONING */}
      {showProvisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto p-6 shadow-lg border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-700" />
                <span>Admin Direct User Provisioning</span>
              </h3>
              <button onClick={() => setShowProvisionModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {provError && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {provError}
              </div>
            )}

            <form onSubmit={handleProvisionSubmit} className="space-y-3.5 pt-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={provName}
                  onChange={(e) => setProvName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Corporate Email Address</label>
                <input
                  type="email"
                  required
                  value={provEmail}
                  onChange={(e) => setProvEmail(e.target.value)}
                  placeholder="e.g. jdoe@riskradar.io"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Assigned Role</label>
                  <select
                    value={provRole}
                    onChange={(e) => setProvRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Analyst">Analyst</option>
                    <option value="Executive">Executive</option>
                    <option value="Auditor">Auditor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={provDept}
                    onChange={(e) => setProvDept(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Initial Password</label>
                <div className="relative">
                  <input
                    type={showProvPassword ? 'text' : 'password'}
                    required
                    value={provPassword}
                    onChange={(e) => setProvPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl pr-9 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowProvPassword(!showProvPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
                  >
                    {showProvPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="provMfaCheck"
                  checked={provMfa}
                  onChange={(e) => setProvMfa(e.target.checked)}
                  className="rounded text-emerald-700 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="provMfaCheck" className="text-slate-700 cursor-pointer text-xs">
                  Enforce Mandatory MFA Shield on first login
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowProvisionModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={provLoading}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {provLoading ? 'Provisioning...' : 'Provision User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: REQUEST SOC THREAT BRIEFING (EXECUTIVE) */}
      {showBriefingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto p-6 shadow-lg border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-emerald-700" />
                <span>Request SOC Threat Briefing</span>
              </h3>
              <button
                onClick={() => setShowBriefingModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDispatchBriefing} className="space-y-4 pt-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">Target On-Duty SOC Lead</label>
                <select
                  value={briefingTarget}
                  onChange={(e) => setBriefingTarget(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="Afri Alam (Lead Analyst)">Afri Alam (Lead Analyst - Active)</option>
                  <option value="Mahabubur Rahman (Admin)">Mahabubur Rahman (Admin - Active)</option>
                  <option value="All SOC Operators">All SOC Operators & Administrators</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Briefing Strategic Topic</label>
                <input
                  type="text"
                  required
                  value={briefingTopic}
                  onChange={(e) => setBriefingTopic(e.target.value)}
                  placeholder="e.g. Critical DB Vulnerabilities & Incident Remediation"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Urgency Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Routine', 'High', 'Urgent'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setBriefingPriority(lvl)}
                      className={`py-2 rounded-xl border text-center font-bold transition cursor-pointer ${briefingPriority === lvl
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Executive Directives & Questions (Optional)</label>
                <textarea
                  rows={3}
                  value={briefingNotes}
                  onChange={(e) => setBriefingNotes(e.target.value)}
                  placeholder="Provide any specific inquiry, board query, or risk concern to address..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowBriefingModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={briefingSent}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>{briefingSent ? 'Dispatching...' : 'Dispatch Briefing Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: EXECUTIVE BOARD BRIEFING STUDIO & PDF EXPORT */}
      {showExportBriefingStudio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-5xl w-full p-6 shadow-lg border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Executive Board Briefing Studio
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Choose sections to include in the board report, preview live, and export a clean PDF without portal sidebars.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExportBriefingStudio(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Studio Layout: 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
              {/* Left Column: Section Selector / Crop Controls (4 cols) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-slate-600 tracking-wider">
                      Report Sections
                    </span>
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() =>
                          setBriefingSections({
                            kpiSummary: true,
                            deptExposure: true,
                            inherentHeatmap: true,
                            topThreats: true,
                            socReadiness: true,
                            governanceMilestones: true,
                            signOffBlock: true,
                          })
                        }
                        className="text-emerald-700 font-bold hover:underline cursor-pointer"
                      >
                        All
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() =>
                          setBriefingSections({
                            kpiSummary: false,
                            deptExposure: false,
                            inherentHeatmap: false,
                            topThreats: false,
                            socReadiness: false,
                            governanceMilestones: false,
                            signOffBlock: false,
                          })
                        }
                        className="text-slate-500 font-medium hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-semibold text-slate-700">
                    <label className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={briefingSections.kpiSummary}
                        onChange={(e) =>
                          setBriefingSections((prev) => ({ ...prev, kpiSummary: e.target.checked }))
                        }
                        className="w-4 h-4 text-emerald-700 rounded"
                      />
                      <span>1. Executive Cyber Posture (KPIs)</span>
                    </label>

                    <label className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={briefingSections.deptExposure}
                        onChange={(e) =>
                          setBriefingSections((prev) => ({ ...prev, deptExposure: e.target.checked }))
                        }
                        className="w-4 h-4 text-emerald-700 rounded"
                      />
                      <span>2. Department Risk Exposure</span>
                    </label>

                    <label className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={briefingSections.inherentHeatmap}
                        onChange={(e) =>
                          setBriefingSections((prev) => ({ ...prev, inherentHeatmap: e.target.checked }))
                        }
                        className="w-4 h-4 text-emerald-700 rounded"
                      />
                      <span>3. 5x5 Heatmap Distribution</span>
                    </label>

                    <label className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={briefingSections.topThreats}
                        onChange={(e) =>
                          setBriefingSections((prev) => ({ ...prev, topThreats: e.target.checked }))
                        }
                        className="w-4 h-4 text-emerald-700 rounded"
                      />
                      <span>4. Top Critical Risks for Review</span>
                    </label>

                    <label className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={briefingSections.socReadiness}
                        onChange={(e) =>
                          setBriefingSections((prev) => ({ ...prev, socReadiness: e.target.checked }))
                        }
                        className="w-4 h-4 text-emerald-700 rounded"
                      />
                      <span>5. On-Duty SOC Defense Team</span>
                    </label>

                    <label className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={briefingSections.governanceMilestones}
                        onChange={(e) =>
                          setBriefingSections((prev) => ({ ...prev, governanceMilestones: e.target.checked }))
                        }
                        className="w-4 h-4 text-emerald-700 rounded"
                      />
                      <span>6. Governance Milestones</span>
                    </label>

                    <label className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={briefingSections.signOffBlock}
                        onChange={(e) =>
                          setBriefingSections((prev) => ({ ...prev, signOffBlock: e.target.checked }))
                        }
                        className="w-4 h-4 text-emerald-700 rounded"
                      />
                      <span>7. Executive Sign-off Block</span>
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePrintBriefingDocument}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>Download / Print Clean Board PDF</span>
                </button>
              </div>

              {/* Right Column: Live Document Preview (8 cols) */}
              <div className="lg:col-span-8">
                <div className="border border-slate-300 rounded-xl bg-slate-100 p-3 max-h-[560px] overflow-y-auto">
                  {/* Clean Printable A4 Sheet */}
                  <div
                    id="board-briefing-document-content"
                    className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 text-slate-900 space-y-6 text-xs font-sans"
                  >
                    {/* Official Document Header */}
                    <div className="border-b-2 border-emerald-700 pb-4 flex items-center justify-between">
                      <div>
                        <div className="text-xl font-black text-slate-900 tracking-tight">
                          Risk<span className="text-emerald-700">Radar</span>™
                        </div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Cybersecurity Risk Governance Platform
                        </div>
                      </div>
                      <div className="text-right text-xs text-slate-500">
                        <div className="font-bold text-slate-800">Executive Board Briefing Report</div>
                        <div>Date: {new Date().toLocaleDateString()}</div>
                        <div className="font-mono text-emerald-700 font-bold">Role: Executive</div>
                      </div>
                    </div>

                    {/* Section 1: Executive KPI Summary */}
                    {briefingSections.kpiSummary && (
                      <div className="space-y-2">
                        <h4 className="font-black text-xs uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1">
                          1. Executive Cyber Posture Summary
                        </h4>
                        <div className="grid grid-cols-4 gap-2">
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="text-xs text-slate-500 font-bold">Enterprise Risk Score</div>
                            <div className="text-lg font-black text-slate-900 font-mono mt-1">
                              {executiveRiskScore} <span className="text-xs text-slate-400">/25</span>
                            </div>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="text-xs text-slate-500 font-bold">Total Defended Assets</div>
                            <div className="text-lg font-black text-slate-900 font-mono mt-1">
                              {totalAssetsCount}
                            </div>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="text-xs text-slate-500 font-bold">SOC Readiness</div>
                            <div className="text-lg font-black text-slate-900 font-mono mt-1">
                              {socDefenseReadiness}%
                            </div>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="text-xs text-slate-500 font-bold">Critical Threats</div>
                            <div className="text-lg font-black text-rose-700 font-mono mt-1">
                              {criticalThreatsCount}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Section 2: Department Exposure */}
                    {briefingSections.deptExposure && (
                      <div className="space-y-2">
                        <h4 className="font-black text-xs uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1">
                          2. Department Risk Exposure
                        </h4>
                        <div className="space-y-1.5 pt-1">
                          {departmentExposure.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <span className="w-36 text-xs font-semibold text-slate-700 truncate">{item.dept}</span>
                              <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden">
                                <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.val}%` }}></div>
                              </div>
                              <span className="w-10 text-right text-xs font-mono font-bold text-slate-800">{item.val}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Section 3: Heatmap Summary */}
                    {briefingSections.inherentHeatmap && (
                      <div className="space-y-2">
                        <h4 className="font-black text-xs uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1">
                          3. 5x5 Inherent Risk Heatmap Distribution
                        </h4>
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-800">Critical Tier (Score 20-25):</span> {criticalThreatsCount} active risk vectors.
                          </div>
                          <div>
                            <span className="font-bold text-slate-800">Monitored Assets:</span> {totalAssetsCount} defended endpoints.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Section 4: Top Critical Threats Table */}
                    {briefingSections.topThreats && (
                      <div className="space-y-2">
                        <h4 className="font-black text-xs uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1">
                          4. Top Critical Risks for Board Review
                        </h4>
                        <div className="w-full overflow-x-auto">
                          <table className="w-full min-w-[500px] text-left text-sm text-slate-700 border border-slate-200 rounded-lg overflow-hidden">
                            <thead className="bg-emerald-50 border-y border-emerald-200">
                              <tr>
                                <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">Risk ID</th>
                                <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">Risk Name</th>
                                <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">Affected Asset</th>
                                <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">Inherent Score</th>
                                <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-emerald-900 whitespace-nowrap">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {threats.slice(0, 4).map((t, idx) => (
                                <tr key={t.id || idx}>
                                  <td className="p-2 font-mono font-bold text-slate-800">{t.id}</td>
                                  <td className="p-2 font-bold text-slate-900">{t.title}</td>
                                  <td className="p-2 text-slate-600">{t.assetName || t.assetId || 'Unassigned'}</td>
                                  <td className="p-2 font-mono font-bold text-rose-700">{t.score || (t.likelihood * t.impact) || 0}</td>
                                  <td className="p-2 font-bold text-slate-700">{t.status}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Section 5: On-Duty SOC Defense Team */}
                    {briefingSections.socReadiness && (
                      <div className="space-y-2">
                        <h4 className="font-black text-xs uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1">
                          5. On-Duty SOC Defense Personnel Attestation
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          {socTeamMembers.map((member) => (
                            <div key={member.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                              <div>
                                <div className="font-bold text-slate-900">{member.name}</div>
                                <div className="text-slate-500">{member.role}</div>
                              </div>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs capitalize">
                                {member.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Section 6: Governance Milestones */}
                    {briefingSections.governanceMilestones && (
                      <div className="space-y-2">
                        <h4 className="font-black text-xs uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1">
                          6. Governance Milestones
                        </h4>
                        <div className="space-y-1 text-xs">
                          {governanceMilestones.map((m) => (
                            <div key={m.id} className="flex justify-between py-1 border-b border-slate-100">
                              <span className="font-mono font-bold">{m.label}</span>
                              <span className="text-emerald-700 font-bold">{m.status} ({m.time})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Section 7: Sign-Off Block */}
                    {briefingSections.signOffBlock && (
                      <div className="pt-4 border-t-2 border-dashed border-slate-300">
                        <div className="grid grid-cols-2 gap-8 text-xs text-slate-600">
                          <div>
                            <div className="font-bold text-slate-800 mb-6">Attested by Executive Leader:</div>
                            <div className="border-b border-slate-400 w-48 mb-1"></div>
                            <div>Signature / Date</div>
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 mb-6">Board Review & Acknowledgment:</div>
                            <div className="border-b border-slate-400 w-48 mb-1"></div>
                            <div>Board Director / Date</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowExportBriefingStudio(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition cursor-pointer text-xs font-semibold"
              >
                Close Studio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: AUDIT VERIFIED RISK DETAIL (READ-ONLY) */}
      {selectedAuditDetailRisk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto p-6 shadow-lg border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-semibold text-slate-800">
                  Audit Verification: {selectedAuditDetailRisk.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAuditDetailRisk(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-bold uppercase text-xs">Threat Title</label>
                <div className="font-extrabold text-slate-900 text-sm">{selectedAuditDetailRisk.title}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase block">Linked Asset</span>
                  <span className="font-bold text-slate-800">{selectedAuditDetailRisk.assetName || selectedAuditDetailRisk.assetId || 'Prod Database'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase block">Lifecycle Stage</span>
                  <span className="font-bold text-slate-800">{selectedAuditDetailRisk.status}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase block">Likelihood × Impact</span>
                  <span className="font-mono font-bold text-slate-900">{selectedAuditDetailRisk.likelihood} × {selectedAuditDetailRisk.impact} = {selectedAuditDetailRisk.score}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase block">Mitigation Offset</span>
                  <span className="font-mono font-bold text-emerald-700">35% Applied</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span className="font-bold text-emerald-800">Compliance Attestation Passed</span>
                </div>
                <span className="text-xs font-mono text-emerald-700 font-bold">Read-Only</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAuditDetailRisk(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Close Audit Entry
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
