import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    location: { type: String, default: 'Cloud' },
    category: { type: String, required: true },
    criticality: { type: String, required: true },
    sensitivity: { type: String, default: 'Internal' },
    owner: { type: String, default: 'SecOps Team' },
    ip: { type: String, default: 'N/A' },
  },
  { timestamps: true }
);

export const AssetModel = mongoose.models.Asset || mongoose.model('Asset', assetSchema);

