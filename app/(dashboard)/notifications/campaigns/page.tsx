'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, 
  Send, 
  Search, 
  Plus, 
  Filter, 
  RefreshCw, 
  Smartphone, 
  MessageSquare, 
  Radio, 
  Users, 
  Crown, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Layers, 
  BarChart3,
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
import { campaignService, NotificationCampaign } from '@/lib/services/campaignService';
import { toast } from 'sonner';

export default function NotificationCampaignsPage() {
  const [campaigns, setCampaigns] = useState<NotificationCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('ALL');

  // Dispatch Confirmation
  const [pendingCampaign, setPendingCampaign] = useState<Partial<NotificationCampaign> | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // New Campaign Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState<Partial<NotificationCampaign>>({
    title: '',
    message: '',
    channel: 'PUSH_FCM',
    targeting: {
      country: ['ALL'],
      gender: 'ALL',
      minLevel: 1,
      vipOnly: false,
      roleSegment: 'ALL',
      activityStatus: 'ACTIVE_7D'
    },
    schedule: {
      type: 'IMMEDIATE'
    }
  });

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await campaignService.getCampaigns();
      setCampaigns(res.campaigns);
      setBackendConnected(res.backendConnected);
    } catch (err: any) {
      toast.error(err.message || 'Failed to sync notification campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || c.title.toLowerCase().includes(q) || c.message.toLowerCase().includes(q);
      const matchesChannel = channelFilter === 'ALL' || c.channel === channelFilter;
      return matchesSearch && matchesChannel;
    });
  }, [campaigns, searchQuery, channelFilter]);

  const handleLaunchCampaign = async (reason: string) => {
    if (!pendingCampaign) return;
    try {
      await campaignService.dispatchCampaign({ ...pendingCampaign });
      toast.success(`Campaign "${pendingCampaign.title}" launched successfully`);
      setIsModalOpen(false);
      setIsConfirmOpen(false);
      setPendingCampaign(null);
      fetchCampaigns();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Campaign Title & Message',
      render: (c: NotificationCampaign) => (
        <div className="flex flex-col">
          <span className="font-semibold text-white text-xs">{c.title}</span>
          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{c.message}</p>
        </div>
      )
    },
    {
      key: 'channel',
      header: 'Channel & Target',
      render: (c: NotificationCampaign) => (
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-1 font-mono text-[10px] text-cyan-400">
            {c.channel === 'PUSH_FCM' && <Smartphone className="h-3 w-3" />}
            {c.channel === 'IN_APP' && <MessageSquare className="h-3 w-3" />}
            {c.channel === 'SYSTEM_BROADCAST' && <Radio className="h-3 w-3" />}
            <span>{c.channel}</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Segment: <span className="text-violet-300">{c.targeting.roleSegment}</span>
            {c.targeting.vipOnly && <span className="text-amber-400 ml-1 font-bold">VIP</span>}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (c: NotificationCampaign) => (
        <StatusBadge
          status={c.status}
          variant={
            c.status === 'COMPLETED' ? 'success' :
            c.status === 'RUNNING' ? 'info' :
            c.status === 'SCHEDULED' ? 'warning' : 'default'
          }
        />
      )
    },
    {
      key: 'metrics',
      header: 'Delivery & Reach',
      render: (c: NotificationCampaign) => (
        <div className="flex flex-col text-[10px] font-mono">
          <div className="text-slate-300">Sent: <span className="text-white font-bold">{c.metrics?.sent?.toLocaleString() || 0}</span></div>
          <div className="text-slate-500">Delivered: {c.metrics?.delivered?.toLocaleString() || 0}</div>
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
              <Bell className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
              Notification & Campaign Center
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
            Orchestrate multi-channel Firebase Cloud Messaging (FCM), in-app inbox alerts, and real-time socket system broadcasts with targeted audience segmentation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsModalOpen(true)}
            size="sm"
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold h-9 shadow-lg shadow-cyan-500/20"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Compose Campaign
          </Button>

          <Button 
            onClick={fetchCampaigns} 
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
            <h4 className="font-bold text-amber-300">Backend API Integration Pending (`/api/admin/campaigns`)</h4>
            <p className="text-slate-400 mt-0.5">
              The campaign orchestration endpoint is not yet mounted on <code className="text-slate-300 font-mono">YaroServer</code>. Basic single push notifications are currently supported through <code className="text-cyan-400 font-mono">/messages/system</code>. This comprehensive campaign lifecycle state is registered in <code className="text-cyan-400 font-mono">YARO_BACKEND_GAP_REGISTER.md</code>.
            </p>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Campaigns"
          value={campaigns.length.toString()}
          icon={<Bell className="h-4 w-4" />}
          description="Historical broadcast campaigns"
        />
        <MetricCard
          title="FCM Push Delivered"
          value={campaigns.reduce((acc, c) => acc + (c.metrics?.delivered || 0), 0).toLocaleString()}
          icon={<Smartphone className="h-4 w-4" />}
          description="Confirmed device receipts"
        />
        <MetricCard
          title="Targeted Segments"
          value="VIP / Hosts / All"
          icon={<Users className="h-4 w-4" />}
          description="Audience cohorts"
        />
        <MetricCard
          title="Active Channels"
          value="Push, In-App, Socket"
          icon={<Radio className="h-4 w-4" />}
          description="Multi-channel transmission"
        />
      </div>

      {/* Campaign DataTable */}
      <Card className="border border-white/10 bg-slate-900/60 backdrop-blur-md overflow-hidden">
        <DataTable
          data={filteredCampaigns}
          columns={columns}
          loading={loading}
          emptyMessage={
            backendConnected
              ? "No notification campaigns found."
              : "Campaign management backend not mounted. Waiting for YaroServer endpoint deployment."
          }
        />
      </Card>

      {/* Compose Campaign Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl bg-slate-950 border border-white/15 text-slate-100 shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Send className="h-5 w-5 text-cyan-400" />
              Compose Notification Campaign
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Target active users, hosts, or VIPs with high-priority FCM push or system banners.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (!newCampaign.title || !newCampaign.message) {
              toast.error('Title and message are required');
              return;
            }
            setPendingCampaign(newCampaign);
            setIsConfirmOpen(true);
          }} className="space-y-4 my-2 text-xs">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Campaign Title</label>
              <input
                type="text"
                required
                value={newCampaign.title || ''}
                onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                placeholder="e.g. Exclusive Weekend Diamond Bonus!"
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Notification Message</label>
              <textarea
                rows={3}
                required
                value={newCampaign.message || ''}
                onChange={(e) => setNewCampaign({ ...newCampaign, message: e.target.value })}
                placeholder="Full notification payload message displayed on lock screen..."
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Delivery Channel</label>
                <select
                  value={newCampaign.channel}
                  onChange={(e) => setNewCampaign({ ...newCampaign, channel: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value="PUSH_FCM">Firebase Push Notification (FCM)</option>
                  <option value="IN_APP">In-App Notification Center</option>
                  <option value="SYSTEM_BROADCAST">Real-time System Broadcast</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Audience Cohort</label>
                <select
                  value={newCampaign.targeting?.roleSegment}
                  onChange={(e) => setNewCampaign({
                    ...newCampaign,
                    targeting: { ...newCampaign.targeting!, roleSegment: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value="ALL">All App Users</option>
                  <option value="HOSTS">Verified Hosts Only</option>
                  <option value="AGENCIES">Agency Managers</option>
                  <option value="SELLERS">Coin Sellers</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900/80 border border-white/5">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Activity Filter</label>
                <select
                  value={newCampaign.targeting?.activityStatus}
                  onChange={(e) => setNewCampaign({
                    ...newCampaign,
                    targeting: { ...newCampaign.targeting!, activityStatus: e.target.value as any }
                  })}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-white text-xs"
                >
                  <option value="ALL">All Users</option>
                  <option value="ACTIVE_7D">Active in Last 7 Days</option>
                  <option value="INACTIVE_30D">Dormant (Inactive &gt; 30 Days)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="vip_filter"
                  checked={newCampaign.targeting?.vipOnly}
                  onChange={(e) => setNewCampaign({
                    ...newCampaign,
                    targeting: { ...newCampaign.targeting!, vipOnly: e.target.checked }
                  })}
                  className="rounded border-white/10 bg-slate-950 text-cyan-500"
                />
                <label htmlFor="vip_filter" className="text-xs text-slate-300 cursor-pointer">
                  VIP Club Members Only
                </label>
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
                Review & Launch
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Guard */}
      <ConfirmDialog
        open={isConfirmOpen}
        title="Confirm Notification Broadcast"
        description={`Are you sure you want to broadcast "${pendingCampaign?.title}" via ${pendingCampaign?.channel}? This action will trigger push messages directly to targeted user mobile devices.`}
        confirmText="Dispatch Broadcast"
        variant="warning"
        requireReason={true}
        onConfirm={handleLaunchCampaign}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
