// In-Memory & File-backed Asset Store
// Module 2: Enterprise Asset Inventory Management

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AssetModel } from './mongodb/asset.schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'assets.data.json');

const loadAssets = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read assets.data.json:', err);
  }
  return [];
};

const saveAssets = (assets) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(assets, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write assets.data.json:', err);
  }
};

let assetsCache = loadAssets();

export const AssetStore = {
  findAll: (filter = {}) => {
    let result = [...assetsCache];
    if (filter.category && filter.category !== 'All') {
      result = result.filter((a) => a.category === filter.category);
    }
    if (filter.criticality) {
      result = result.filter((a) => a.criticality === filter.criticality);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q) ||
          (a.location || '').toLowerCase().includes(q) ||
          (a.owner || '').toLowerCase().includes(q)
      );
    }
    return result;
  },

  findById: (id) => {
    return assetsCache.find((a) => a.id === id) || null;
  },

  create: (assetData) => {
    const nextNum = assetsCache.length > 0
      ? Math.max(...assetsCache.map((a) => parseInt(a.id.replace('AST-', ''), 10) || 100)) + 1
      : 101;
    const newAsset = {
      id: assetData.id || `AST-${nextNum}`,
      name: assetData.name.trim(),
      location: assetData.location?.trim() || 'US-East-1',
      category: assetData.category || 'Cloud',
      criticality: assetData.criticality || 'Tier 4 High',
      sensitivity: assetData.sensitivity || 'Confidential',
      owner: assetData.owner?.trim() || 'Admin',
      ip: assetData.ip?.trim() || `10.0.${Math.floor(Math.random() * 20)}.${Math.floor(Math.random() * 200)}`,
      createdAt: new Date().toISOString(),
    };
    assetsCache = [newAsset, ...assetsCache];
    saveAssets(assetsCache);
    AssetModel.findOneAndUpdate({ id: newAsset.id }, newAsset, { upsert: true }).catch(() => {});
    return newAsset;
  },

  update: (id, updates) => {
    const index = assetsCache.findIndex((a) => a.id === id);
    if (index === -1) return null;

    assetsCache[index] = {
      ...assetsCache[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveAssets(assetsCache);
    AssetModel.findOneAndUpdate({ id }, assetsCache[index], { upsert: true }).catch(() => {});
    return assetsCache[index];
  },

  delete: (id) => {
    const existing = assetsCache.find((a) => a.id === id);
    if (!existing) return false;
    assetsCache = assetsCache.filter((a) => a.id !== id);
    saveAssets(assetsCache);
    AssetModel.deleteOne({ id }).catch(() => {});
    return true;
  },
};

