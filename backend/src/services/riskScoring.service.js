// Automated Risk Scoring Engine
// Module 3: Risk Scoring, Visualization & Reporting
// Functional Requirement 9: Dynamic calculation logic combining likelihood and impact matrix scores
// Contributor: Mahabubur Rahman (Sakib) (ID: 232-35-706)

/**
 * Computes calibrated risk score based on:
 * Score = Likelihood (1-5) * Impact (1-5)
 * Returns normalized score (1-25) and standardized severity classification
 */
export function computeRiskScore({ likelihood = 3, impact = 3, criticality = '' }) {
  const l = Math.min(5, Math.max(1, Number(likelihood) || 1));
  const i = Math.min(5, Math.max(1, Number(impact) || 1));
  const baseScore = l * i;

  // Severity Tier Mapping based on 5x5 Matrix (Max: 25)
  let severity = 'Low';
  if (baseScore >= 20) {
    severity = 'Critical';
  } else if (baseScore >= 12) {
    severity = 'High';
  } else if (baseScore >= 6) {
    severity = 'Medium';
  } else {
    severity = 'Low';
  }

  return {
    likelihood: l,
    impact: i,
    score: baseScore,
    severity,
    maxScore: 25,
  };
}

/**
 * Returns severity tier for any arbitrary score
 */
export function getSeverityCategory(score) {
  const num = Number(score) || 0;
  if (num >= 20) return 'Critical';
  if (num >= 12) return 'High';
  if (num >= 6) return 'Medium';
  return 'Low';
}

