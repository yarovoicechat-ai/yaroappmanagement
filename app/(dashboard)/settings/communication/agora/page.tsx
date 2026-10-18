'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Radio,
  Plus,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
  BarChart3,
  Sliders,
  History,
  Copy,
  Check,
  Edit2,
  Trash2,
  Power,
  Zap,
  Info,
  Clock,
  Layers,
  PhoneCall,
  Video,
  Users,
} from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';

interface AgoraProjectItem {
  _id: string;
  name: string;
  appId: string;
  environment: 'production' | 'staging';
  status: 'active' | 'standby' | 'disabled';
  isActive: boolean;
  isEnabled: boolean;
  priority: number;
  monthlyUsageBudgetMinutes: number;
  switchingThresholdPercent: number;
  hardLimitMinutes: number;
  validationStatus: 'VALID' | 'INVALID' | 'UNTESTED';
  validationMessage?: string;
  lastValidatedAt?: string | null;
  notes?: string;
  currentMonthUsage?: {
    month: string;
    totalMinutes: number;
    voiceMinutes: number;
    videoMinutes: number;
    roomMinutes: number;
    usagePercent: number;
    remainingMinutes: number;
    isStale: boolean;
    lastSyncAt?: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

interface ActiveConfig {
  activeProjectId?: string | null;
  previousProjectId?: string | null;
  switchingMode: 'automatic' | 'manual';
  warningThresholdPercent: number;
  switchingThresholdPercent: number;
  criticalThresholdPercent: number;
  hardLimitPercent: number;
  cooldownMinutes: number;
  safetyBufferMinutes: number;
  safePolicyOnDataStale: 'stay_on_current' | 'switch_to_standby' | 'alert_only';
  lastSwitchedAt?: string | null;
  lastSwitchReason?: string;
  configVersion: number;
}

interface UsageOverview {
  month: string;
  totalSystemMinutes: number;
  totalVoiceMinutes: number;
  totalVideoMinutes: number;
  totalRoomMinutes: number;
  projectCount: number;
  activeProjectId?: string;
  switchingMode: string;
  projects: any[];
  lastSyncTimestamp: string;
}

export default function AgoraProjectManagerPage() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [projects, setProjects] = useState<AgoraProjectItem[]>([]);
  const [activeConfig, setActiveConfig] = useState<ActiveConfig | null>(null);
  const [usageOverview, setUsageOverview] = useState<UsageOverview | null>(null);
  const [switchHistory, setSwitchHistory] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'registry' | 'usage' | 'policy' | 'history'>('registry');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState<AgoraProjectItem | null>(null);
  const [showRollbackModal, setShowRollbackModal] = useState(false);
  const [rollbackReason, setRollbackReason] = useState('Manual rollback via Agora Project Manager');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    appId: '',
    appCertificate: '',
    environment: 'production' as 'production' | 'staging',
    priority: 10,
    monthlyUsageBudgetMinutes: 10000,
    switchingThresholdPercent: 85,
    hardLimitMinutes: 9900,
    notes: '',
  });

  // Policy Form State
  const [policyData, setPolicyData] = useState<Partial<ActiveConfig>>({});

  // Status & Feedback
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [copiedAppId, setCopiedAppId] = useState<string | null>(null);
  const [testingProjectId, setTestingProjectId] = useState<string | null>(null);

  const showAlert = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAppId(text);
    setTimeout(() => setCopiedAppId(null), 2000);
  };

  // Fetch initial data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [projRes, usageRes, historyRes] = await Promise.all([
        apiClient.get<any>(API_ENDPOINTS.AGORA.PROJECTS),
        apiClient.get<any>(API_ENDPOINTS.AGORA.USAGE),
        apiClient.get<any>(API_ENDPOINTS.AGORA.SWITCH_HISTORY),
      ]);

      if (projRes.success && projRes.data) {
        setProjects(projRes.data.projects || []);
        setActiveConfig(projRes.data.activeConfig || null);
        if (projRes.data.activeConfig) {
          setPolicyData(projRes.data.activeConfig);
        }
      }

      if (usageRes.success && usageRes.data) {
        setUsageOverview(usageRes.data);
      }

      if (historyRes.success && historyRes.data) {
        setSwitchHistory(historyRes.data.switches || []);
        setAuditLogs(historyRes.data.auditLogs || []);
      }
    } catch (err: any) {
      showAlert(err.message || 'Failed to load Agora configuration', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sync Usage
  const handleSyncUsage = async () => {
    setActionLoading(true);
    try {
      const res = await apiClient.post<any>(API_ENDPOINTS.AGORA.SYNC_USAGE, {});
      if (res.success) {
        showAlert('Usage statistics reconciled successfully with active call records.', 'success');
        fetchData();
      } else {
        showAlert(res.message || 'Failed to sync usage', 'error');
      }
    } catch (err: any) {
      showAlert(err.message || 'Sync failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Test Project Credentials
  const handleTestProject = async (projectId: string) => {
    setTestingProjectId(projectId);
    try {
      const res = await apiClient.post<any>(API_ENDPOINTS.AGORA.TEST(projectId), {});
      if (res.success) {
        showAlert(res.message || 'Agora token probe generated successfully!', 'success');
      } else {
        showAlert(res.message || 'Token generation test failed', 'error');
      }
      fetchData();
    } catch (err: any) {
      showAlert(err.message || 'Test execution error', 'error');
    } finally {
      setTestingProjectId(null);
    }
  };

  // Activate Project
  const handleActivateProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to activate this project as Primary? New calls will immediately route to it.')) return;
    setActionLoading(true);
    try {
      const res = await apiClient.post<any>(API_ENDPOINTS.AGORA.ACTIVATE(projectId), {
        reason: 'Manual activation from Agora Project Manager UI',
      });
      if (res.success) {
        showAlert('Agora project successfully activated as Primary!', 'success');
        fetchData();
      } else {
        showAlert(res.message || 'Failed to activate project', 'error');
      }
    } catch (err: any) {
      showAlert(err.message || 'Activation failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Project Enable/Disable
  const handleToggleEnable = async (projectId: string, currentEnabled: boolean) => {
    setActionLoading(true);
    try {
      const endpoint = currentEnabled
        ? API_ENDPOINTS.AGORA.DISABLE(projectId)
        : API_ENDPOINTS.AGORA.ENABLE(projectId);
      const res = await apiClient.post<any>(endpoint, {});
      if (res.success) {
        showAlert(`Project ${currentEnabled ? 'disabled' : 'enabled'} successfully.`, 'success');
        fetchData();
      } else {
        showAlert(res.message || 'Failed to toggle project status', 'error');
      }
    } catch (err: any) {
      showAlert(err.message || 'Toggle failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Rollback
  const handleRollback = async () => {
    setActionLoading(true);
    try {
      const res = await apiClient.post<any>(API_ENDPOINTS.AGORA.ROLLBACK, {
        reason: rollbackReason,
      });
      if (res.success) {
        showAlert('Successfully rolled back to previous valid Agora configuration!', 'success');
        setShowRollbackModal(false);
        fetchData();
      } else {
        showAlert(res.message || 'Rollback failed', 'error');
      }
    } catch (err: any) {
      showAlert(err.message || 'Rollback error', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Save New Project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await apiClient.post<any>(API_ENDPOINTS.AGORA.CREATE, formData);
      if (res.success) {
        showAlert('New Agora project created and verified successfully!', 'success');
        setShowAddModal(false);
        setFormData({
          name: '',
          appId: '',
          appCertificate: '',
          environment: 'production',
          priority: 10,
          monthlyUsageBudgetMinutes: 10000,
          switchingThresholdPercent: 85,
          hardLimitMinutes: 9900,
          notes: '',
        });
        fetchData();
      } else {
        showAlert(res.message || 'Failed to create project', 'error');
      }
    } catch (err: any) {
      showAlert(err.message || 'Project creation error', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Update Project
  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setActionLoading(true);
    try {
      const payload: any = {
        name: formData.name,
        environment: formData.environment,
        priority: Number(formData.priority),
        monthlyUsageBudgetMinutes: Number(formData.monthlyUsageBudgetMinutes),
        switchingThresholdPercent: Number(formData.switchingThresholdPercent),
        hardLimitMinutes: Number(formData.hardLimitMinutes),
        notes: formData.notes,
      };
      if (formData.appCertificate.trim()) {
        payload.appCertificate = formData.appCertificate.trim();
      }

      const res = await apiClient.put<any>(API_ENDPOINTS.AGORA.UPDATE(editingProject._id), payload);
      if (res.success) {
        showAlert('Agora project updated successfully!', 'success');
        setEditingProject(null);
        fetchData();
      } else {
        showAlert(res.message || 'Failed to update project', 'error');
      }
    } catch (err: any) {
      showAlert(err.message || 'Update failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Project
  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this Agora project? This cannot be undone.')) return;
    setActionLoading(true);
    try {
      const res = await apiClient.delete<any>(API_ENDPOINTS.AGORA.DELETE(projectId));
      if (res.success) {
        showAlert('Agora project deleted successfully.', 'success');
        fetchData();
      } else {
        showAlert(res.message || 'Failed to delete project', 'error');
      }
    } catch (err: any) {
      showAlert(err.message || 'Deletion error', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Save Policy
  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await apiClient.put<any>(API_ENDPOINTS.AGORA.SWITCH_POLICY, policyData);
      if (res.success) {
        showAlert('Agora automatic switching policy updated successfully!', 'success');
        fetchData();
      } else {
        showAlert(res.message || 'Failed to update policy', 'error');
      }
    } catch (err: any) {
      showAlert(err.message || 'Policy update error', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const activeProject = projects.find((p) => p.isActive);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/15 border border-cyan-500/30 rounded-xl text-cyan-400">
              <Radio className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Agora Project Manager & Failover
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Enterprise
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Multi-project RTC orchestration, AES-256 encrypted credential vault, live session telemetry, and zero-downtime failover.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 relative z-10">
          <button
            onClick={handleSyncUsage}
            disabled={actionLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
            Sync Usage
          </button>

          {activeConfig?.previousProjectId && (
            <button
              onClick={() => setShowRollbackModal(true)}
              disabled={actionLoading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Rollback
            </button>
          )}

          <button
            onClick={() => {
              setFormData({
                name: '',
                appId: '',
                appCertificate: '',
                environment: 'production',
                priority: projects.length + 1,
                monthlyUsageBudgetMinutes: 10000,
                switchingThresholdPercent: 85,
                hardLimitMinutes: 9900,
                notes: '',
              });
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 transition"
          >
            <Plus className="h-4 w-4" />
            Add Agora Project
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {alert && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border transition animate-fade-in ${
            alert.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : alert.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
          }`}
        >
          {alert.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 shrink-0" />
          ) : alert.type === 'error' ? (
            <XCircle className="h-5 w-5 shrink-0" />
          ) : (
            <Info className="h-5 w-5 shrink-0" />
          )}
          <p className="text-sm font-medium">{alert.message}</p>
        </div>
      )}

      {/* Executive Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Project */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Primary Project</span>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-lg font-bold text-white truncate">{activeProject?.name || 'No Active Project'}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded">
                {activeProject ? `${activeProject.appId.slice(0, 8)}...${activeProject.appId.slice(-4)}` : 'N/A'}
              </span>
              <button
                onClick={() => activeProject && copyToClipboard(activeProject.appId)}
                className="text-slate-500 hover:text-slate-300 transition"
                title="Copy App ID"
              >
                {copiedAppId === activeProject?.appId ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-400">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium capitalize">
                {activeProject?.environment || 'production'}
              </span>
              <span>Priority #{activeProject?.priority ?? 1}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Current Month Usage */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Month-to-Date Usage</span>
            <BarChart3 className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">
                {(activeProject?.currentMonthUsage?.totalMinutes ?? 0).toLocaleString()}
              </span>
              <span className="text-xs text-slate-400">
                / {(activeProject?.monthlyUsageBudgetMinutes ?? 10000).toLocaleString()} min
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-2.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  (activeProject?.currentMonthUsage?.usagePercent ?? 0) >= 95
                    ? 'bg-rose-500'
                    : (activeProject?.currentMonthUsage?.usagePercent ?? 0) >= 85
                    ? 'bg-amber-500'
                    : 'bg-cyan-500'
                }`}
                style={{ width: `${Math.min(100, activeProject?.currentMonthUsage?.usagePercent ?? 0)}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
              <span>{activeProject?.currentMonthUsage?.usagePercent ?? 0}% capacity used</span>
              <span className="text-emerald-400 font-medium">
                {(activeProject?.currentMonthUsage?.remainingMinutes ?? 10000).toLocaleString()} min left
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Failover Guardrails */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Failover Policy</span>
            <Sliders className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                  activeConfig?.switchingMode === 'automatic'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {activeConfig?.switchingMode || 'Automatic'} Mode
              </span>
              <span className="text-xs text-slate-400">v{activeConfig?.configVersion ?? 1}</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Switches at <strong className="text-white">{activeConfig?.switchingThresholdPercent ?? 85}%</strong> limit with a{' '}
              <strong className="text-white">{activeConfig?.cooldownMinutes ?? 30}m</strong> anti-loop cooldown.
            </p>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              <span>Buffer: {activeConfig?.safetyBufferMinutes ?? 500} min</span>
            </div>
          </div>
        </div>

        {/* Card 4: Health & Freshness */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Health & Telemetry</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <span
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold ${
                  activeProject?.validationStatus === 'VALID'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                }`}
              >
                {activeProject?.validationStatus === 'VALID' ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                {activeProject?.validationStatus || 'VALID'}
              </span>
              <span className="text-xs text-slate-400">HMAC-SHA256 Token 006/007</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <Activity className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <span>Total Standby Projects: <strong className="text-white">{projects.filter((p) => !p.isActive && p.isEnabled).length}</strong></span>
            </p>
            <div className="mt-2 text-[11px] text-slate-500">
              Last synced: {usageOverview?.lastSyncTimestamp ? new Date(usageOverview.lastSyncTimestamp).toLocaleTimeString() : 'Recently'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-800 flex gap-2">
        <button
          onClick={() => setActiveTab('registry')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
            activeTab === 'registry'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="h-4 w-4" />
          Projects Registry ({projects.length})
        </button>

        <button
          onClick={() => setActiveTab('usage')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
            activeTab === 'usage'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Usage Telemetry & Analytics
        </button>

        <button
          onClick={() => setActiveTab('policy')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
            activeTab === 'policy'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="h-4 w-4" />
          Switching Policy & Thresholds
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
            activeTab === 'history'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <History className="h-4 w-4" />
          Switch History & Audit Log
        </button>
      </div>

      {/* TAB 1: PROJECTS REGISTRY */}
      {activeTab === 'registry' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Priority & Project</th>
                    <th className="py-3.5 px-4">App ID</th>
                    <th className="py-3.5 px-4">Environment</th>
                    <th className="py-3.5 px-4">Role / Status</th>
                    <th className="py-3.5 px-4">Usage & Budget</th>
                    <th className="py-3.5 px-4">Validation</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {projects.map((proj) => {
                    const usage = proj.currentMonthUsage?.totalMinutes ?? 0;
                    const budget = proj.monthlyUsageBudgetMinutes || 10000;
                    const percent = proj.currentMonthUsage?.usagePercent ?? 0;

                    return (
                      <tr
                        key={proj._id}
                        className={`hover:bg-slate-800/40 transition ${
                          proj.isActive ? 'bg-cyan-500/5 border-l-4 border-l-cyan-400' : ''
                        }`}
                      >
                        {/* Priority & Name */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-slate-800 text-slate-300 font-mono text-xs font-bold">
                              #{proj.priority}
                            </span>
                            <div>
                              <div className="font-bold text-white flex items-center gap-2">
                                {proj.name}
                                {proj.isActive && (
                                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    PRIMARY ACTIVE
                                  </span>
                                )}
                              </div>
                              {proj.notes && <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{proj.notes}</p>}
                            </div>
                          </div>
                        </td>

                        {/* App ID */}
                        <td className="py-4 px-4 font-mono text-xs">
                          <div className="flex items-center gap-1.5 text-slate-300 bg-slate-950/80 border border-slate-800 px-2 py-1 rounded w-fit">
                            <span>{proj.appId.slice(0, 10)}...{proj.appId.slice(-6)}</span>
                            <button
                              onClick={() => copyToClipboard(proj.appId)}
                              className="text-slate-500 hover:text-slate-300 transition"
                            >
                              {copiedAppId === proj.appId ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </td>

                        {/* Environment */}
                        <td className="py-4 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                              proj.environment === 'production'
                                ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                                : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            {proj.environment}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                proj.isActive
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : proj.isEnabled
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {proj.isActive ? 'Active' : proj.isEnabled ? 'Standby' : 'Disabled'}
                            </span>
                          </div>
                        </td>

                        {/* Usage & Budget */}
                        <td className="py-4 px-4">
                          <div className="w-36">
                            <div className="flex justify-between text-xs text-slate-400 font-medium mb-1">
                              <span>{usage.toLocaleString()} min</span>
                              <span className={percent >= 85 ? 'text-amber-400 font-bold' : ''}>{percent}%</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  percent >= 95 ? 'bg-rose-500' : percent >= 85 ? 'bg-amber-500' : 'bg-cyan-500'
                                }`}
                                style={{ width: `${Math.min(100, percent)}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-500 mt-1 block">Cap: {budget.toLocaleString()}m</span>
                          </div>
                        </td>

                        {/* Validation Status */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5">
                            {proj.validationStatus === 'VALID' ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                            ) : proj.validationStatus === 'INVALID' ? (
                              <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                            )}
                            <span
                              className={`text-xs font-medium ${
                                proj.validationStatus === 'VALID'
                                  ? 'text-emerald-400'
                                  : proj.validationStatus === 'INVALID'
                                  ? 'text-rose-400'
                                  : 'text-amber-400'
                              }`}
                            >
                              {proj.validationStatus}
                            </span>
                          </div>
                          {proj.lastValidatedAt && (
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              {new Date(proj.lastValidatedAt).toLocaleDateString()}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Test Button */}
                            <button
                              onClick={() => handleTestProject(proj._id)}
                              disabled={testingProjectId === proj._id}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                              title="Test Credentials (Live Token Probe)"
                            >
                              <Zap className={`h-4 w-4 ${testingProjectId === proj._id ? 'animate-bounce text-yellow-400' : ''}`} />
                            </button>

                            {/* Activate Button (if not already active) */}
                            {!proj.isActive && proj.isEnabled && (
                              <button
                                onClick={() => handleActivateProject(proj._id)}
                                disabled={actionLoading}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition"
                                title="Promote to Primary Active Project"
                              >
                                Activate
                              </button>
                            )}

                            {/* Toggle Enable/Disable (cannot disable active) */}
                            {!proj.isActive && (
                              <button
                                onClick={() => handleToggleEnable(proj._id, proj.isEnabled)}
                                disabled={actionLoading}
                                className={`p-1.5 rounded-lg transition ${
                                  proj.isEnabled
                                    ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/25'
                                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/25'
                                }`}
                                title={proj.isEnabled ? 'Disable project' : 'Enable project'}
                              >
                                <Power className="h-4 w-4" />
                              </button>
                            )}

                            {/* Edit Button */}
                            <button
                              onClick={() => {
                                setEditingProject(proj);
                                setFormData({
                                  name: proj.name,
                                  appId: proj.appId,
                                  appCertificate: '',
                                  environment: proj.environment,
                                  priority: proj.priority,
                                  monthlyUsageBudgetMinutes: proj.monthlyUsageBudgetMinutes,
                                  switchingThresholdPercent: proj.switchingThresholdPercent,
                                  hardLimitMinutes: proj.hardLimitMinutes,
                                  notes: proj.notes || '',
                                });
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                              title="Edit Project"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>

                            {/* Delete Button (only if not active) */}
                            {!proj.isActive && (
                              <button
                                onClick={() => handleDeleteProject(proj._id)}
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                                title="Delete Project"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {projects.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        No Agora projects configured. Click "Add Agora Project" to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USAGE TELEMETRY & ANALYTICS */}
      {activeTab === 'usage' && (
        <div className="space-y-6">
          {/* Usage Definition Alert */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 flex items-start gap-3">
            <Info className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-white">Measurement Standard & Estimation Notice</p>
              <p className="text-slate-400">
                • <strong>Yaro App Call-Minutes:</strong> Sum of actual connected duration across 1-on-1 audio, video, and voice party rooms, rounded up per session according to carrier rules.
              </p>
              <p className="text-slate-400">
                • <strong>Free Allowance:</strong> Configured per project (typically 10,000 minutes/month for eligible Agora developers). Actual Agora invoice deductions depend on Agora account-level tier rules.
              </p>
              <p className="text-slate-400">
                • <strong>Reconciliation:</strong> Click "Sync Usage" to re-aggregate completed calls from database coin transaction ledgers.
              </p>
            </div>
          </div>

          {/* Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/15 border border-blue-500/30 rounded-xl text-blue-400">
                  <PhoneCall className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">1-on-1 Voice Calls</span>
                  <h4 className="text-xl font-bold text-white mt-0.5">
                    {(usageOverview?.totalVoiceMinutes ?? 0).toLocaleString()} <span className="text-xs text-slate-400 font-normal">minutes</span>
                  </h4>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-500/15 border border-purple-500/30 rounded-xl text-purple-400">
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">1-on-1 Video Calls</span>
                  <h4 className="text-xl font-bold text-white mt-0.5">
                    {(usageOverview?.totalVideoMinutes ?? 0).toLocaleString()} <span className="text-xs text-slate-400 font-normal">minutes</span>
                  </h4>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Voice Party Rooms</span>
                  <h4 className="text-xl font-bold text-white mt-0.5">
                    {(usageOverview?.totalRoomMinutes ?? 0).toLocaleString()} <span className="text-xs text-slate-400 font-normal">minutes</span>
                  </h4>
                </div>
              </div>
            </div>
          </div>

          {/* Per-Project Breakdown Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Current Month Usage per Project ({usageOverview?.month || 'Current'})
              </h3>
              <span className="text-xs text-slate-400">Reconciled in UTC</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-950/40">
                    <th className="py-3 px-4">Project</th>
                    <th className="py-3 px-4">Voice (Audio)</th>
                    <th className="py-3 px-4">Video (Cam)</th>
                    <th className="py-3 px-4">Rooms</th>
                    <th className="py-3 px-4">Total Minutes</th>
                    <th className="py-3 px-4">Remaining Allowance</th>
                    <th className="py-3 px-4">Capacity Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {usageOverview?.projects?.map((item: any) => (
                    <tr key={item.projectId} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          {item.projectName}
                          {item.isActive && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold">
                              PRIMARY
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono text-xs">{(item.voiceMinutes || 0).toLocaleString()} m</td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono text-xs">{(item.videoMinutes || 0).toLocaleString()} m</td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono text-xs">{(item.roomMinutes || 0).toLocaleString()} m</td>
                      <td className="py-3.5 px-4 font-bold text-white font-mono text-xs">{(item.totalMinutes || 0).toLocaleString()} m</td>
                      <td className="py-3.5 px-4 text-emerald-400 font-semibold font-mono text-xs">
                        {(item.remainingMinutes || 0).toLocaleString()} m
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold ${
                            item.usagePercent >= 95
                              ? 'bg-rose-500/20 text-rose-300'
                              : item.usagePercent >= 85
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {item.usagePercent}% used
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SWITCHING POLICY & THRESHOLDS */}
      {activeTab === 'policy' && (
        <form onSubmit={handleSavePolicy} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white">Automatic Project Failover & Switching Policy</h3>
            <p className="text-xs text-slate-400 mt-1">
              Configure how and when the backend switches live RTC session traffic between Agora projects when limits approach.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Switching Mode */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Failover Switching Mode
              </label>
              <select
                value={policyData.switchingMode || 'automatic'}
                onChange={(e) => setPolicyData({ ...policyData, switchingMode: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="automatic">Automatic Failover (Recommended)</option>
                <option value="manual">Manual Mode (Require Admin Approval)</option>
              </select>
              <p className="text-[11px] text-slate-500">
                Automatic mode immediately routes future call sessions to the highest-priority validated standby project when the threshold is hit.
              </p>
            </div>

            {/* Switching Threshold % */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Automatic Failover Threshold (%)
              </label>
              <input
                type="number"
                min="50"
                max="99"
                value={policyData.switchingThresholdPercent ?? 85}
                onChange={(e) => setPolicyData({ ...policyData, switchingThresholdPercent: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[11px] text-slate-500">
                Default: 85%. Triggers standby project selection before the project's hard cap is reached.
              </p>
            </div>

            {/* Warning Threshold % */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Early Warning Alert Threshold (%)
              </label>
              <input
                type="number"
                min="10"
                max="90"
                value={policyData.warningThresholdPercent ?? 70}
                onChange={(e) => setPolicyData({ ...policyData, warningThresholdPercent: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[11px] text-slate-500">
                Dispatches an administrative audit warning when capacity hits this percentage.
              </p>
            </div>

            {/* Cooldown Period (Minutes) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Anti-Loop Switch Cooldown (Minutes)
              </label>
              <input
                type="number"
                min="1"
                max="1440"
                value={policyData.cooldownMinutes ?? 30}
                onChange={(e) => setPolicyData({ ...policyData, cooldownMinutes: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[11px] text-slate-500">
                Prevents rapid ping-pong switching loops between projects within this time window.
              </p>
            </div>

            {/* Safety Buffer (Minutes) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Safety Buffer Before Hard Cap (Minutes)
              </label>
              <input
                type="number"
                min="0"
                max="5000"
                value={policyData.safetyBufferMinutes ?? 500}
                onChange={(e) => setPolicyData({ ...policyData, safetyBufferMinutes: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[11px] text-slate-500">
                Safety cushion to absorb existing long-running active calls after a switch occurs.
              </p>
            </div>

            {/* Policy when usage data is stale */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Action When Usage Data Stale or Offline
              </label>
              <select
                value={policyData.safePolicyOnDataStale || 'alert_only'}
                onChange={(e) => setPolicyData({ ...policyData, safePolicyOnDataStale: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="alert_only">Stay on Active Project & Alert Admin (Safest)</option>
                <option value="switch_to_standby">Fail Safe to Primary Standby</option>
              </select>
              <p className="text-[11px] text-slate-500">
                Avoids premature switching based solely on network sync latency.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={actionLoading}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition"
            >
              Save Policy Configuration
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: SWITCH HISTORY & AUDIT LOG */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Switch History */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950/60 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Project Switch & Failover Events ({switchHistory.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-950/40">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">From Project</th>
                    <th className="py-3 px-4">To Project</th>
                    <th className="py-3 px-4">Trigger Type</th>
                    <th className="py-3 px-4">Triggered By</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {switchHistory.map((item: any) => (
                    <tr key={item._id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 text-xs font-mono text-slate-400">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-semibold">{item.fromProjectName || 'None'}</td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">{item.toProjectName}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                          {item.triggerType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-300">{item.triggeredByName || 'System'}</td>
                      <td className="py-3 px-4 text-xs text-slate-400 max-w-xs truncate" title={item.reason}>
                        {item.reason}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold ${
                            item.status === 'SUCCESS' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {switchHistory.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        No failover switches have occurred yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Logs */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950/60 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Configuration Audit Trail ({auditLogs.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-950/40">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Details (Secrets Redacted)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {auditLogs.map((log: any) => (
                    <tr key={log._id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 text-xs font-mono text-slate-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-cyan-300 font-mono text-xs">{log.action}</td>
                      <td className="py-3 px-4 text-xs text-slate-300">
                        {log.actorName} <span className="text-slate-500">({log.actorRole})</span>
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-slate-400 max-w-md truncate">
                        {JSON.stringify(log.changes || {})}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PROJECT */}
      {(showAddModal || editingProject) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-1">
              {editingProject ? 'Edit Agora Project' : 'Add New Agora RTC Project'}
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Credentials are validated with a live token probe and saved with AES-256-GCM encryption.
            </p>

            <form onSubmit={editingProject ? handleUpdateProject : handleCreateProject} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Internal Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Primary Agora Global"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Agora App ID (32 Alphanumeric) *</label>
                <input
                  type="text"
                  required
                  disabled={!!editingProject}
                  maxLength={32}
                  placeholder="e.g. d23c897f9305450faa7809ffcf666e57"
                  value={formData.appId}
                  onChange={(e) => setFormData({ ...formData, appId: e.target.value.trim() })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-500 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Agora App Certificate {editingProject ? '(Leave blank to keep existing)' : '*'}
                </label>
                <input
                  type="password"
                  required={!editingProject}
                  autoComplete="new-password"
                  placeholder={editingProject ? '••••••••••••••••••••••••••••••••' : 'Enter 32-character certificate'}
                  value={formData.appCertificate}
                  onChange={(e) => setFormData({ ...formData, appCertificate: e.target.value.trim() })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Environment</label>
                  <select
                    value={formData.environment}
                    onChange={(e) => setFormData({ ...formData, environment: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Priority Rank (1=Highest)</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Monthly Budget (Minutes)</label>
                  <input
                    type="number"
                    min="100"
                    value={formData.monthlyUsageBudgetMinutes}
                    onChange={(e) => setFormData({ ...formData, monthlyUsageBudgetMinutes: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Switch Threshold (%)</label>
                  <input
                    type="number"
                    min="50"
                    max="99"
                    value={formData.switchingThresholdPercent}
                    onChange={(e) => setFormData({ ...formData, switchingThresholdPercent: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Internal Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Optional notes or account ownership details..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProject(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-cyan-500/20"
                >
                  {editingProject ? 'Save Changes' : 'Verify & Add Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ROLLBACK CONFIRMATION */}
      {showRollbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400 mb-3">
              <RotateCcw className="h-6 w-6" />
              <h3 className="text-lg font-bold text-white">Rollback Configuration</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will immediately promote the previously valid Agora configuration to Primary. Ongoing calls on the current project will conclude naturally while all future calls will route back to the previous project.
            </p>

            <div className="mt-4">
              <label className="text-xs font-semibold text-slate-400 block mb-1">Rollback Reason (Audit Log)</label>
              <input
                type="text"
                value={rollbackReason}
                onChange={(e) => setRollbackReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => setShowRollbackModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRollback}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-amber-500/20"
              >
                Confirm Rollback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
