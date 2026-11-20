// Automated Risk Scoring Engine - Frontend Utility
// Module 3: Risk Scoring, Visualization & Reporting
// Functional Requirement 9: Dynamic calculation logic combining likelihood and impact matrix scores
// Contributor: Mahabubur Rahman (Sakib) (ID: 232-35-706)

/**
 * Calculates real-time risk score and returns UI severity color styling
 */
export function calculateRiskScore(likelihood = 3, impact = 3) {
  const l = Math.min(5, Math.max(1, Number(likelihood) || 1));
  const i = Math.min(5, Math.max(1, Number(impact) || 1));
  const score = l * i;

  let severity = 'Low';
  let color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  let badgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

  if (score >= 20) {
    severity = 'Critical';
    color = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    badgeClass = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
  } else if (score >= 12) {
    severity = 'High';
    color = 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    badgeClass = 'bg-orange-500/20 text-orange-300 border-orange-500/30';
  } else if (score >= 6) {
    severity = 'Medium';
    color = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    badgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
  }

  return {
    likelihood: l,
    impact: i,
    score,
    severity,
    color,
    badgeClass,
  };
}

export function formatScoreBadge(score) {
  const s = Number(score) || 0;
  if (s >= 20) return { label: `${s}/25 Critical`, bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
  if (s >= 12) return { label: `${s}/25 High`, bg: 'bg-orange-500/10 text-orange-400 border-orange-500/20' };
  if (s >= 6) return { label: `${s}/25 Medium`, bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
  return { label: `${s}/25 Low`, bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
}

