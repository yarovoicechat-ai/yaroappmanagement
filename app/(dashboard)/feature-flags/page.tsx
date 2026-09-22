'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sliders, 
  Search, 
  Plus, 
  AlertTriangle, 
  ShieldAlert, 
  RefreshCw, 
  Layers, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  Globe, 
  Smartphone,
  ExternalLink,
  Flame,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { DataTable } from '@/components/enterprise/DataTable';
import { MetricCard } from '@/components/enterprise/MetricCard';
import { StatusBadge } from '@/components/enterprise/StatusBadge';
import { ConfirmDialog } from '@/components/enterprise/ConfirmDialog';
import { featureFlagService, FeatureFlag } from '@/lib/services/featureFlagService';
import { toast } from 'sonner';

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('ALL');

  // Kill Switch state
  const [killSwitchFlag, setKillSwitchFlag] = useState<FeatureFlag | null>(null);
  const [isKillSwitchOpen, setIsKillSwitchOpen] = useState(false);

  // Edit / Create Modal state
  const [editingFlag, setEditingFlag] = useState<Partial<FeatureFlag> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchFlags = async () => {
    try {
      setLoading(true);
      const res = await featureFlagService.getFeatureFlags();
      setFlags(res.flags);
      setBackendConnected(res.backendConnected);
    } catch (err: any) {
      toast.error(err.message || 'Failed to sync feature flags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const filteredFlags = useMemo(() => {
    return flags.filter(flag => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || 
        flag.name.toLowerCase().includes(q) || 
        flag.flagKey.toLowerCase().includes(q) ||
        flag.description?.toLowerCase().includes(q);

      const matchesPlatform = platformFilter === 'ALL' || flag.platform === platformFilter;
      return matchesSearch && matchesPlatform;
    });
  }, [flags, searchQuery, platformFilter]);

  const handleOpenKillSwitch = (flag: FeatureFlag) => {
    setKillSwitchFlag(flag);
    setIsKillSwitchOpen(true);
  };

  const handleConfirmKillSwitch = async (reason: string) => {
    if (!killSwitchFlag) return;
    try {
      await featureFlagService.triggerKillSwitch(killSwitchFlag.flagKey, reason);
      toast.success(`Kill switch executed for ${killSwitchFlag.flagKey}`);
      fetchFlags();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSaveFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFlag?.flagKey || !editingFlag?.name) {
      toast.error('Flag Key and Name are mandatory');
      return;
    }

    try {
      await featureFlagService.updateFeatureFlag(editingFlag);
      toast.success(`Flag ${editingFlag.flagKey} saved`);
      setIsModalOpen(false);
      fetchFlags();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Feature & Flag Key',
      sortable: true,
      render: (flag: FeatureFlag) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-white text-xs">{flag.name}</span>
            {flag.isKillSwitchActive && (
              <Badge variant="outline" className="border-rose-500/40 bg-rose-500/10 text-rose-400 text-[9px] uppercase font-mono px-1">
                KILLED
              </Badge>
            )}
          </div>
          <code className="text-[11px] font-mono text-cyan-400 mt-0.5">{flag.flagKey}</code>
          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{flag.description}</p>
        </div>
      )
    },
    {
      key: 'platform',
      header: 'Platform & Targeting',
      render: (flag: FeatureFlag) => (
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-1 text-slate-300">
            <Smartphone className="h-3 w-3 text-slate-400" />
            <span className="font-mono text-[10px]">{flag.platform}</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Segment: <span className="text-violet-300">{flag.userSegment}</span>
          </div>
        </div>
      )
    },
    {
      key: 'rollout',
      header: 'Rollout %',
      sortable: true,
      render: (flag: FeatureFlag) => (
        <div className="flex flex-col gap-1 w-28">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-400">Audience</span>
            <span className="font-mono font-bold text-cyan-400">{flag.rolloutPercentage}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${flag.rolloutPercentage === 100 ? 'bg-emerald-400' : 'bg-cyan-400'}`} 
              style={{ width: `${flag.rolloutPercentage}%` }}
            />
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (flag: FeatureFlag) => (
        <StatusBadge
          status={flag.isKillSwitchActive ? 'KILLED' : flag.enabled ? 'ACTIVE' : 'INACTIVE'}
          variant={flag.isKillSwitchActive ? 'danger' : flag.enabled ? 'success' : 'default'}
        />
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (flag: FeatureFlag) => (
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditingFlag(flag);
              setIsModalOpen(true);
            }}
            className="h-7 text-xs border-white/10 hover:border-white/20"
          >
            Configure
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOpenKillSwitch(flag)}
            className="h-7 text-xs border-rose-500/20 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/40"
          >
            <Flame className="h-3 w-3 mr-1" /> Kill
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Sliders className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
              Feature Flag & Remote Config Engine
            </h1>
            <Badge variant="outline" className={`text-[10px] uppercase font-mono tracking-wider ${
              backendConnected 
                ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' 
                : 'border-amber-500/30 text-amber-400 bg-amber-500/10'
            }`}>
              {backendConnected ? 'Backend Connected' : 'Backend Integration Required'}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Granular runtime feature rollout switches, progressive 0-100% canary deployments, user segmentation targeting, and emergency production kill switches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setEditingFlag({
                flagKey: 'flag_new_feature',
                name: 'New Feature Rollout',
                description: 'Gradual canary deployment for mobile clients',
                enabled: true,
                platform: 'ALL',
                country: ['*'],
                language: ['*'],
                userSegment: 'ALL',
                rolloutPercentage: 10,
                isKillSwitchActive: false
              });
              setIsModalOpen(true);
            }}
            size="sm"
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold h-9 shadow-lg shadow-cyan-500/20"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Create Feature Flag
          </Button>

          <Button 
            onClick={fetchFlags} 
            variant="outline" 
            size="sm" 
            className="border-white/10 hover:border-white/20 h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            Sync
          </Button>
        </div>
      </div>

      {/* Backend Status Notice */}
      {!backendConnected && (
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-md flex items-start gap-3">
          <Info className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-amber-300">Backend API Integration Pending (`/api/admin/feature-flags`)</h4>
            <p className="text-slate-400 mt-0.5">
              The Mongoose model <code className="text-amber-300 font-mono">FeatureFlag</code> exists in <code className="text-slate-300 font-mono">YaroServer/src/models/featureFlag.model.ts</code>. Express routes and controllers are pending deployment. This state is registered in <code className="text-cyan-400 font-mono">YARO_BACKEND_GAP_REGISTER.md</code>.
            </p>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Active Feature Flags"
          value={flags.filter(f => f.enabled && !f.isKillSwitchActive).length.toString()}
          icon={<Zap className="h-4 w-4" />}
          description="Live in production app"
        />
        <MetricCard
          title="Partial Canary (0-99%)"
          value={flags.filter(f => f.rolloutPercentage > 0 && f.rolloutPercentage < 100).length.toString()}
          icon={<Sliders className="h-4 w-4" />}
          description="Gradual rollout active"
        />
        <MetricCard
          title="Emergency Kill Switches"
          value={flags.filter(f => f.isKillSwitchActive).length.toString()}
          icon={<Flame className="h-4 w-4" />}
          variant={flags.some(f => f.isKillSwitchActive) ? 'danger' : 'default'}
          description="Circuits currently cut"
        />
        <MetricCard
          title="Targeted Platforms"
          value="Android / iOS"
          icon={<Smartphone className="h-4 w-4" />}
          description="Multi-platform remote config"
        />
      </div>

      {/* Filters Bar */}
      <Card className="border border-white/10 bg-slate-900/60 backdrop-blur-md">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search feature flags by name, key, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950/70 border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                aria-label="Filter by Platform"
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="text-xs bg-slate-950/70 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500/50"
              >
                <option value="ALL">All Platforms</option>
                <option value="ANDROID">Android</option>
                <option value="IOS">iOS</option>
                <option value="WEB">Web</option>
              </select>

              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-rose-400 hover:text-rose-300 h-8"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Flag DataTable */}
      <Card className="border border-white/10 bg-slate-900/60 backdrop-blur-md overflow-hidden">
        <DataTable
          data={filteredFlags}
          columns={columns}
          loading={loading}
          emptyMessage={
            backendConnected
              ? "No feature flags configured."
              : "Backend feature flag service not yet mounted on server. Waiting for YaroServer endpoint deployment."
          }
        />
      </Card>

      {/* Create / Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl bg-slate-950 border border-white/15 text-slate-100 shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="h-5 w-5 text-cyan-400" />
              {editingFlag?.id ? 'Configure Feature Flag' : 'Create New Feature Flag'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Set flag parameters, platform constraints, and rollout percentage.
            </DialogDescription>
          </DialogHeader>

          {editingFlag && (
            <form onSubmit={handleSaveFlag} className="space-y-4 my-2 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Flag Key (Unique ID)</label>
                  <input
                    type="text"
                    required
                    value={editingFlag.flagKey || ''}
                    onChange={(e) => setEditingFlag({ ...editingFlag, flagKey: e.target.value })}
                    placeholder="e.g. voice_club_spatial_audio"
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Feature Name</label>
                  <input
                    type="text"
                    required
                    value={editingFlag.name || ''}
                    onChange={(e) => setEditingFlag({ ...editingFlag, name: e.target.value })}
                    placeholder="e.g. Spatial Audio in Voice Clubs"
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Description</label>
                <textarea
                  rows={2}
                  value={editingFlag.description || ''}
                  onChange={(e) => setEditingFlag({ ...editingFlag, description: e.target.value })}
                  placeholder="Operational purpose and release criteria..."
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Platform</label>
                  <select
                    value={editingFlag.platform || 'ALL'}
                    onChange={(e) => setEditingFlag({ ...editingFlag, platform: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ALL">All Platforms</option>
                    <option value="ANDROID">Android</option>
                    <option value="IOS">iOS</option>
                    <option value="WEB">Web</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Target Segment</label>
                  <select
                    value={editingFlag.userSegment || 'ALL'}
                    onChange={(e) => setEditingFlag({ ...editingFlag, userSegment: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ALL">All Users</option>
                    <option value="NEW_USERS">New Registrations</option>
                    <option value="VIP_ONLY">VIP Members Only</option>
                    <option value="HOSTS_ONLY">Verified Hosts Only</option>
                    <option value="HIGH_VALUE">High-Value Rechargers</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Initial State</label>
                  <select
                    value={editingFlag.enabled ? 'true' : 'false'}
                    onChange={(e) => setEditingFlag({ ...editingFlag, enabled: e.target.value === 'true' })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="true">Enabled (Active)</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
              </div>

              {/* Rollout slider */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300">Canary Rollout Percentage</span>
                  <span className="font-mono font-bold text-cyan-400">{editingFlag.rolloutPercentage || 0}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={editingFlag.rolloutPercentage || 0}
                  onChange={(e) => setEditingFlag({ ...editingFlag, rolloutPercentage: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>0% (Internal Only)</span>
                  <span>50%</span>
                  <span>100% (Full Production)</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="border-white/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                >
                  Save Configuration
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Emergency Kill Switch Confirm Dialog */}
      <ConfirmDialog
        open={isKillSwitchOpen}
        title={`Trigger Emergency Kill Switch: ${killSwitchFlag?.flagKey}`}
        description="This will immediately cut client execution of this feature in production across all active apps worldwide. Requires justification for the immutable audit log."
        confirmText="Trigger Kill Switch"
        variant="danger"
        requireReason={true}
        onConfirm={handleConfirmKillSwitch}
        onCancel={() => {
          setIsKillSwitchOpen(false);
          setKillSwitchFlag(null);
        }}
      />
    </div>
  );
}
