// Risk Register Controller
// Module 3: Threat Intelligence & Lifecycle Workflow

import { RiskStore } from '../models/risk.store.js';
import { AuditStore } from '../models/audit.store.js';

const formatActor = (user) => {
  if (!user) return 'Administrator (Admin)';
  const name = user.name || 'Administrator';
  const role = user.role || 'Admin';
  return name.includes(`(${role})`) ? name : `${name} (${role})`;
};

export const listRisks = async (req, res) => {
  try {
    const { status, severity, assetId, search } = req.query;
    const risks = RiskStore.findAll({ status, severity, assetId, search });

    const all = RiskStore.findAll();
    const stageCounts = {
      identified: all.filter((r) => r.status === 'Identified').length,
      assessed: all.filter((r) => r.status === 'Assessed').length,
      mitigating: all.filter((r) => r.status === 'Mitigating').length,
      resolved: all.filter((r) => r.status === 'Resolved').length,
    };

    return res.json({
      success: true,
      count: risks.length,
      stageCounts,
      activeOpenRisks: stageCounts.identified + stageCounts.assessed + stageCounts.mitigating,
      criticalCount: all.filter((r) => r.severity === 'Critical' && r.status !== 'Resolved').length,
      risks,
    });
  } catch (error) {
    console.error('List risks error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve risk register.' });
  }
};

export const createRisk = async (req, res) => {
  try {
    const { title, cve, assetId, assetName, likelihood, impact, assignee } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Risk title is required.' });
    }

    const newRisk = RiskStore.create({
      title,
      cve,
      assetId,
      assetName,
      likelihood,
      impact,
      assignee,
    });

    AuditStore.log({
      action: 'RISK_LOGGED',
      actor: formatActor(req.user),
      target: `${newRisk.id}: ${newRisk.title}`,
      details: `Threat logged into Kanban pipeline (Score: ${newRisk.score}/25, Severity: ${newRisk.severity}) on asset '${newRisk.assetId}'.`,
      severity: newRisk.severity === 'Critical' ? 'WARNING' : 'INFO',
    });

    return res.status(201).json({
      success: true,
      message: `Risk '${newRisk.id}' registered successfully.`,
      risk: newRisk,
    });
  } catch (error) {
    console.error('Create risk error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create risk.' });
  }
};

export const advanceRiskStage = async (req, res) => {
  try {
    const { id } = req.params;
    const result = RiskStore.advanceStage(id);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Risk not found.' });
    }

    const { risk, previousStage, newStage } = result;

    AuditStore.log({
      action: 'RISK_LIFECYCLE_ADVANCED',
      actor: formatActor(req.user),
      target: `${risk.id}: ${risk.title}`,
      details: `Lifecycle state transitioned from '${previousStage}' to '${newStage}'.`,
      severity: newStage === 'Resolved' ? 'SUCCESS' : 'INFO',
    });

    return res.json({
      success: true,
      message: `Risk '${risk.id}' advanced to '${newStage}'.`,
      risk,
    });
  } catch (error) {
    console.error('Advance risk stage error:', error);
    return res.status(500).json({ success: false, message: 'Failed to advance risk stage.' });
  }
};

export const updateRisk = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = RiskStore.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Risk not found.' });
    }

    const updated = RiskStore.update(id, req.body);

    AuditStore.log({
      action: 'RISK_UPDATED',
      actor: formatActor(req.user),
      target: `${id}: ${updated.title}`,
      details: `Risk assessment score updated to ${updated.score}/25 (${updated.severity}).`,
      severity: 'INFO',
    });

    return res.json({
      success: true,
      message: `Risk '${id}' updated successfully.`,
      risk: updated,
    });
  } catch (error) {
    console.error('Update risk error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update risk.' });
  }
};

export const deleteRisk = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = RiskStore.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Risk not found.' });
    }

    RiskStore.delete(id);

    AuditStore.log({
      action: 'RISK_PURGED',
      actor: formatActor(req.user),
      target: `${id}: ${existing.title}`,
      details: `Threat purged permanently from active risk register.`,
      severity: 'WARNING',
    });

    return res.json({
      success: true,
      message: `Risk '${id}' purged successfully.`,
    });
  } catch (error) {
    console.error('Delete risk error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete risk.' });
  }
};

