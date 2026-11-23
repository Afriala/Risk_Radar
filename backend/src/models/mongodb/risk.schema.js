import mongoose from 'mongoose';

const riskSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    cve: { type: String, default: 'CVE-2024-0000' },
    title: { type: String, required: true },
    assetId: { type: String, default: 'AST-101' },
    assetName: { type: String, default: 'Enterprise Asset' },
    severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
    likelihood: { type: Number, min: 1, max: 5, default: 3 },
    impact: { type: Number, min: 1, max: 5, default: 3 },
    score: { type: Number, min: 1, max: 25, default: 9 },
    status: {
      type: String,
      enum: ['Identified', 'Assessed', 'Mitigating', 'Resolved'],
      default: 'Identified',
      index: true,
    },
    assignee: { type: String, default: 'Afri Alam' },
    date: { type: String, default: 'Nov 20' },
  },
  { timestamps: true }
);

export const RiskModel = mongoose.models.Risk || mongoose.model('Risk', riskSchema);

