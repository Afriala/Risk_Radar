// Automated Report Export Engine & Heatmap Utilities
// Module 3: Risk Scoring, Visualization & Reporting (Feature 8 & 10)
// Contributor: Afri Alam Dipto (ID: 232-35-643)

/**
 * Cleanly escapes CSV fields containing commas, double quotes, or newlines.
 */
function escapeCsvCell(value) {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Functional Requirement 10: Automated CSV Report Export for Risks
 */
export function exportRisksToCSV(risks = [], filename = `RiskRadar_Risk_Register_${new Date().toISOString().slice(0, 10)}.csv`) {
  if (!risks.length) return false;

  const headers = [
    'Risk ID',
    'CVE Identifier',
    'Title',
    'Asset ID',
    'Asset Name',
    'Severity',
    'Likelihood (1-5)',
    'Impact (1-5)',
    'Risk Score',
    'Status',
    'Assignee',
    'Logged Date',
  ];

  const rows = risks.map((r) => [
    r.id,
    r.cve || 'N/A',
    r.title,
    r.assetId || 'N/A',
    r.assetName || 'N/A',
    r.severity,
    r.likelihood,
    r.impact,
    r.score,
    r.status,
    r.assignee || 'Unassigned',
    r.date || new Date().toISOString().slice(0, 10),
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.map(escapeCsvCell).join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}

/**
 * Functional Requirement 10: Automated CSV Report Export for Audit Trail
 */
export function exportAuditTrailToCSV(auditLogs = [], filename = `RiskRadar_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`) {
  if (!auditLogs.length) return false;

  const headers = ['Audit ID', 'Timestamp', 'Action Event', 'Actor', 'Target Entity', 'Details', 'Severity'];

  const rows = auditLogs.map((log) => [
    log.id,
    log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A',
    log.action,
    log.actor,
    log.target || 'N/A',
    log.details || 'N/A',
    log.severity || 'INFO',
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.map(escapeCsvCell).join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}

/**
 * Functional Requirement 10: Heatmap Coordinate Distribution Matrix
 * Maps threats onto a 5x5 Grid (Likelihood: 1-5 vs Impact: 1-5)
 */
export function calculateHeatmapDistribution(risks = []) {
  const matrix = {};
  for (let l = 1; l <= 5; l++) {
    matrix[l] = {};
    for (let i = 1; i <= 5; i++) {
      matrix[l][i] = [];
    }
  }

  risks.forEach((risk) => {
    const l = Math.min(5, Math.max(1, Number(risk.likelihood) || 1));
    const i = Math.min(5, Math.max(1, Number(risk.impact) || 1));
    if (matrix[l] && matrix[l][i]) {
      matrix[l][i].push(risk);
    }
  });

  return matrix;
}

/**
 * Functional Requirement 8: Automated Clean Executive Briefing PDF Print
 */
export function printExecutivePDFReport() {
  window.print();
  return true;
}

