// Security Audit Trail Store - Enterprise Event Auditing
// Persists system security actions (Logins, Approvals, Role Updates, Suspensions)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUDIT_FILE = path.join(__dirname, 'audit.data.json');

const seedAuditLogs = [
  {
    id: 'aud_seed_01',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    action: 'SYSTEM_BOOT',
    actor: 'RiskRadar Security Daemon',
    target: 'System Core',
    details: 'Cryptographic policy initialized with 10 salt rounds and NIST SP 800-63B idle timeout guard.',
    severity: 'INFO',
  },
  {
    id: 'aud_seed_02',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    action: 'POLICY_ENFORCEMENT',
    actor: 'Access Guard',
    target: 'Invite Gate',
    details: 'Enforced enterprise authorization code RR-ORG-2026 for organizational onboarding.',
    severity: 'INFO',
  },
  {
    id: 'aud_seed_03',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    action: 'RATE_LIMIT_ACTIVE',
    actor: 'Firewall Daemon',
    target: 'POST /api/auth/login',
    details: 'Sliding window rate limiter activated (max 10 attempts / 15 minutes per origin IP).',
    severity: 'SUCCESS',
  },
  {
    id: 'aud_seed_04',
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    action: 'AUTH_SUCCESS',
    actor: 'Mahabubur Rahman',
    target: 'admin@riskradar.io',
    details: 'Administrator logged in with verified 6-digit MFA challenge code.',
    severity: 'SUCCESS',
  },
];

const loadLogs = () => {
  if (!fs.existsSync(AUDIT_FILE)) {
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(seedAuditLogs, null, 2));
    return seedAuditLogs;
  }
  try {
    const data = fs.readFileSync(AUDIT_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return seedAuditLogs;
  }
};

const saveLogs = (logs) => {
  try {
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error('Failed to save audit logs:', err);
  }
};

export const AuditStore = {
  findAll: (limit = 50) => {
    const logs = loadLogs();
    // Return latest first
    return [...logs].reverse().slice(0, limit);
  },

  log: ({ action, actor = 'System', target = 'Platform', details = '', severity = 'INFO' }) => {
    const logs = loadLogs();
    const newEntry = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      action,
      actor,
      target,
      details,
      severity,
    };
    logs.push(newEntry);
    // Keep max 200 logs to prevent file bloat
    if (logs.length > 200) {
      logs.splice(0, logs.length - 200);
    }
    saveLogs(logs);
    return newEntry;
  },
};
