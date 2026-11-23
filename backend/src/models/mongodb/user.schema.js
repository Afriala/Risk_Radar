import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'Analyst', 'Executive', 'Auditor'], default: 'Analyst' },
    department: { type: String, default: 'Security Operations' },
    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: true },
    mfaEnabled: { type: Boolean, default: true },
    apiKey: { type: String, default: null },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model('User', userSchema);

