// Reporting & Analytics Controller
// Module 3: Executive KPI Dashboard, Heatmap Visualization & Report Export
// Contributor: Afri Alam Dipto (ID: 232-35-643)

import { AssetStore } from '../models/asset.store.js';
import { RiskStore } from '../models/risk.store.js';
import { AuditStore } from '../models/audit.store.js';

const formatActor = (user) => {
  if (!user) return 'System (Admin)';
  const name = user.name || 'User';
  const role = user.role || 'User';
  return name.includes(`(${role})`) ? name : `${name} (${role})`;
};

/**
 * Functional Requirement 8: Executive KPI Dashboard Metrics
 * Returns aggregated executive intelligence for organizational posture
 */
export const getExecutiveSummary = async (req, res) => {
  try {
    const allRisks = RiskStore.findAll();
    const allAssets = AssetStore.findAll();
    const allAudits = AuditStore.findAll();

    const activeRisks = allRisks.filter((r) => r.status !== 'Resolved');
    const resolvedRisks = allRisks.filter((r) => r.status === 'Resolved');
    const criticalThreats = allRisks.filter((r) => r.severity === 'Critical' && r.status !== 'Resolved');

    // 5x5 Heatmap Distribution Calculation (Likelihood 1-5 vs Impact 1-5)
    const heatmapGrid = {};
    for (let l = 1; l <= 5; l++) {
      for (let i = 1; i <= 5; i++) {
        heatmapGrid[`${l}x${i}`] = 0;
      }
    }
    allRisks.forEach((r) => {
      const key = `${r.likelihood}x${r.impact}`;
      if (heatmapGrid[key] !== undefined) {
        heatmapGrid[key]++;
      }
    });

    // Lifecycle Pipeline breakdown
    const stageBreakdown = {
      Identified: allRisks.filter((r) => r.status === 'Identified').length,
      Assessed: allRisks.filter((r) => r.status === 'Assessed').length,
      Mitigating: allRisks.filter((r) => r.status === 'Mitigating').length,
      Resolved: resolvedRisks.length,
    };

    // Severity breakdown
    const severityBreakdown = {
      Critical: allRisks.filter((r) => r.severity === 'Critical').length,
      High: allRisks.filter((r) => r.severity === 'High').length,
      Medium: allRisks.filter((r) => r.severity === 'Medium').length,
      Low: allRisks.filter((r) => r.severity === 'Low').length,
    };

    // Calculate Enterprise Security Posture Score (0 - 100)
    // Higher unresolved critical/high risks reduce the posture score
    const penalty = (criticalThreats.length * 8) + (allRisks.filter(r => r.severity === 'High' && r.status !== 'Resolved').length * 4);
    const postureScore = Math.max(35, Math.min(100, 100 - penalty));

    AuditStore.log({
      action: 'EXECUTIVE_REPORT_VIEWED',
      actor: formatActor(req.user),
      target: 'Executive Strategic Hub',
      details: `Generated executive KPI summary report (Posture Score: ${postureScore}%).`,
      severity: 'INFO',
    });

    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        postureScore,
        totalAssets: allAssets.length,
        criticalAssets: allAssets.filter(a => (a.criticality || '').includes('Tier 5') || a.criticality === 'Critical').length,
        totalRisks: allRisks.length,
        activeRisks: activeRisks.length,
        resolvedRisks: resolvedRisks.length,
        criticalThreats: criticalThreats.length,
        stageBreakdown,
        severityBreakdown,
        heatmapGrid,
      },
      recentComplianceLogs: allAudits.slice(0, 5),
    });
  } catch (error) {
    console.error('Executive summary error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate executive report.' });
  }
};

/**
 * Functional Requirement 10: Automated Compliance Report Export Data
 * Returns structured datasets for CSV/PDF generation
 */
export const getReportExportData = async (req, res) => {
  try {
    const { dataset = 'all' } = req.query;

    const risks = RiskStore.findAll();
    const assets = AssetStore.findAll();
    const audits = AuditStore.findAll();

    AuditStore.log({
      action: 'DATA_EXPORT_REQUESTED',
      actor: formatActor(req.user),
      target: `Export Dataset: ${dataset}`,
      details: 'Audit evidence and risk posture data requested for PDF/CSV report generation.',
      severity: 'SUCCESS',
    });

    return res.json({
      success: true,
      exportTimestamp: new Date().toISOString(),
      generator: formatActor(req.user),
      data: {
        risks: dataset === 'all' || dataset === 'risks' ? risks : undefined,
        assets: dataset === 'all' || dataset === 'assets' ? assets : undefined,
        auditLogs: dataset === 'all' || dataset === 'audits' ? audits.slice(0, 100) : undefined,
      },
    });
  } catch (error) {
    console.error('Report export error:', error);
    return res.status(500).json({ success: false, message: 'Failed to prepare export data.' });
  }
};

