import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    timestamp: { type: Date, default: Date.now },
    action: { type: String, required: true, index: true },
    actor: { type: String, required: true },
    target: { type: String, default: 'System' },
    details: { type: String, default: '' },
    severity: { type: String, enum: ['INFO', 'SUCCESS', 'WARNING', 'CRITICAL'], default: 'INFO' },
  },
  { timestamps: true }
);

export const AuditModel = mongoose.models.AuditLog || mongoose.model('AuditLog', auditSchema);

