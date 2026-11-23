// In-Memory & File-backed Risk Register Store
// Module 3: Threat Intelligence & Automated Risk Scoring Engine
// Contributor: Mahabubur Rahman (Sakib) (ID: 232-35-706)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { computeRiskScore } from '../services/riskScoring.service.js';
import { RiskModel } from './mongodb/risk.schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'risks.data.json');

const STAGES = ['Identified', 'Assessed', 'Mitigating', 'Resolved'];

const loadRisks = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read risks.data.json:', err);
  }
  return [];
};

const saveRisks = (risks) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(risks, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write risks.data.json:', err);
  }
};

let risksCache = loadRisks();

export const RiskStore = {
  findAll: (filter = {}) => {
    let result = [...risksCache];
    if (filter.status && filter.status !== 'All') {
      if (filter.status === 'Active') {
        result = result.filter((r) => r.status !== 'Resolved');
      } else {
        result = result.filter((r) => r.status === filter.status);
      }
    }
    if (filter.severity && filter.severity !== 'All') {
      result = result.filter((r) => r.severity === filter.severity);
    }
    if (filter.assetId) {
      result = result.filter((r) => r.assetId === filter.assetId);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.assetId.toLowerCase().includes(q) ||
          (r.assetName || '').toLowerCase().includes(q) ||
          (r.assignee || '').toLowerCase().includes(q)
      );
    }
    return result;
  },

  findById: (id) => {
    return risksCache.find((r) => r.id === id) || null;
  },

  create: (riskData) => {
    const scored = computeRiskScore({
      likelihood: riskData.likelihood,
      impact: riskData.impact,
      criticality: riskData.criticality,
    });
    const l = scored.likelihood;
    const i = scored.impact;
    const score = scored.score;
    const computedSeverity = scored.severity;

    const nextNum = risksCache.length > 0
      ? Math.max(...risksCache.map((r) => parseInt(r.id.replace('RSK-2026-', ''), 10) || 100)) + 1
      : 101;

    const newRisk = {
      id: riskData.id || `RSK-2026-${String(nextNum).padStart(4, '0')}`,
      cve: riskData.cve?.trim() || `CVE-2024-${Math.floor(1000 + Math.random() * 9000)}`,
      title: riskData.title.trim(),
      assetId: riskData.assetId || 'AST-101',
      assetName: riskData.assetName || 'AWS Production DB',
      severity: riskData.severity || computedSeverity,
      likelihood: l,
      impact: i,
      score,
      status: 'Identified',
      assignee: riskData.assignee || 'A. Rahman',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
      createdAt: new Date().toISOString(),
    };

    risksCache = [newRisk, ...risksCache];
    saveRisks(risksCache);
    RiskModel.findOneAndUpdate({ id: newRisk.id }, newRisk, { upsert: true }).catch(() => {});
    return newRisk;
  },

  advanceStage: (id) => {
    const index = risksCache.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const currentStage = risksCache[index].status;
    const currentIndex = STAGES.indexOf(currentStage);

    if (currentIndex < STAGES.length - 1) {
      const nextStage = STAGES[currentIndex + 1];
      risksCache[index] = {
        ...risksCache[index],
        status: nextStage,
        updatedAt: new Date().toISOString(),
      };
      saveRisks(risksCache);
      RiskModel.findOneAndUpdate({ id }, { status: nextStage, updatedAt: risksCache[index].updatedAt }).catch(() => {});
      return { risk: risksCache[index], previousStage: currentStage, newStage: nextStage };
    }

    return { risk: risksCache[index], previousStage: currentStage, newStage: currentStage };
  },

  update: (id, updates) => {
    const index = risksCache.findIndex((r) => r.id === id);
    if (index === -1) return null;

    if (updates.likelihood || updates.impact) {
      const scored = computeRiskScore({
        likelihood: updates.likelihood ?? risksCache[index].likelihood,
        impact: updates.impact ?? risksCache[index].impact,
      });
      updates.likelihood = scored.likelihood;
      updates.impact = scored.impact;
      updates.score = scored.score;
      updates.severity = scored.severity;
    }

    risksCache[index] = {
      ...risksCache[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveRisks(risksCache);
    RiskModel.findOneAndUpdate({ id }, risksCache[index], { upsert: true }).catch(() => {});
    return risksCache[index];
  },

  delete: (id) => {
    const existing = risksCache.find((r) => r.id === id);
    if (!existing) return false;
    risksCache = risksCache.filter((r) => r.id !== id);
    saveRisks(risksCache);
    RiskModel.deleteOne({ id }).catch(() => {});
    return true;
  },
};

