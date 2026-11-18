// Asset Inventory Controller
// Module 2: Enterprise IT Asset Management

import { AssetStore } from '../models/asset.store.js';
import { AuditStore } from '../models/audit.store.js';

const formatActor = (user) => {
  if (!user) return 'Administrator (Admin)';
  const name = user.name || 'Administrator';
  const role = user.role || 'Admin';
  return name.includes(`(${role})`) ? name : `${name} (${role})`;
};

export const listAssets = async (req, res) => {
  try {
    const { category, criticality, search } = req.query;
    const assets = AssetStore.findAll({ category, criticality, search });

    // Aggregate summary KPI counts live
    const totalAssets = AssetStore.findAll().length;
    const criticalTier5 = AssetStore.findAll().filter(
      (a) => (a.criticality || '').includes('Tier 5') || a.criticality === 'Critical'
    ).length;
    const cloudNodes = AssetStore.findAll().filter(
      (a) => a.category === 'Cloud' || a.type === 'SaaS / Cloud'
    ).length;
    const databaseAndApps = AssetStore.findAll().filter(
      (a) => a.category === 'Database' || a.category === 'Software' || a.category === 'App Server'
    ).length;

    return res.json({
      success: true,
      count: assets.length,
      kpis: {
        totalAssets,
        criticalTier5,
        cloudNodes,
        databaseAndApps,
      },
      assets,
    });
  } catch (error) {
    console.error('List assets error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve asset inventory.' });
  }
};

export const createAsset = async (req, res) => {
  try {
    const { name, location, category, criticality, sensitivity, owner, ip } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Asset name is required.' });
    }

    const newAsset = AssetStore.create({
      name,
      location,
      category,
      criticality,
      sensitivity,
      owner,
      ip,
    });

    AuditStore.log({
      action: 'ASSET_REGISTERED',
      actor: formatActor(req.user),
      target: `${newAsset.id}: ${newAsset.name}`,
      details: `Registered new IT asset under category '${newAsset.category}', criticality '${newAsset.criticality}'.`,
      severity: 'SUCCESS',
    });

    return res.status(201).json({
      success: true,
      message: `Asset '${newAsset.id}: ${newAsset.name}' registered successfully.`,
      asset: newAsset,
    });
  } catch (error) {
    console.error('Create asset error:', error);
    return res.status(500).json({ success: false, message: 'Failed to register asset.' });
  }
};

export const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = AssetStore.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Asset not found.' });
    }

    const updated = AssetStore.update(id, req.body);

    AuditStore.log({
      action: 'ASSET_UPDATED',
      actor: formatActor(req.user),
      target: `${id}: ${updated.name}`,
      details: `Asset details updated (Criticality: ${updated.criticality}, Sensitivity: ${updated.sensitivity}).`,
      severity: 'INFO',
    });

    return res.json({
      success: true,
      message: `Asset '${id}' updated successfully.`,
      asset: updated,
    });
  } catch (error) {
    console.error('Update asset error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update asset.' });
  }
};

export const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = AssetStore.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Asset not found.' });
    }

    AssetStore.delete(id);

    AuditStore.log({
      action: 'ASSET_DECOMMISSIONED',
      actor: formatActor(req.user),
      target: `${id}: ${existing.name}`,
      details: `Asset decommissioned and permanently removed from active inventory.`,
      severity: 'WARNING',
    });

    return res.json({
      success: true,
      message: `Asset '${id}' decommissioned successfully.`,
    });
  } catch (error) {
    console.error('Delete asset error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete asset.' });
  }
};

