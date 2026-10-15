'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import {
  Crown,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Copy,
  Sparkles,
  CheckCircle2,
  XCircle,
  Gem,
  Layers,
  Sliders,
  Eye,
  AlertTriangle,
  Clock,
  ArrowRight,
  Shield,
  Zap,
  Flame,
  Check,
  X,
  Smartphone,
  ExternalLink,
  ChevronRight,
  Car,
  Mic,
  Gift,
  Trophy,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

interface PrivilegeItem {
  key: string;
  title: string;
  description: string;
  icon: string;
  animationUrl?: string;
  isEnabled: boolean;
  isVisible: boolean;
  implementationStatus: 'supported' | 'partially_supported' | 'coming_soon';
  value?: string | number;
  sortOrder: number;
}

interface SvipPlanItem {
  _id: string;
  name: string;
  planCode: string;
  slug: string;
  level: number;
  description: string;
  badge: string;
  icon: string;
  crown: string;
  heroBadgeUrl?: string;
  heroAnimationUrl?: string;
  bgGradient?: string[];
  bgImageUrl?: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  currency: string;
  durationDays: number;
  validityType: 'days' | 'months' | 'custom';
  rechargeThreshold?: number;
  svipTagConfig?: {
    text: string;
    bgGradient: string[];
    iconUrl?: string;
    enabled: boolean;
  };
  svipBubbleConfig?: {
    bubbleName: string;
    previewUrl?: string;
    bgGradient: string[];
    textColor: string;
    borderColor: string;
    enabled: boolean;
  };
  profileBadgeConfig?: {
    badgeName: string;
    iconUrl?: string;
    animationType?: string;
    enabled: boolean;
  };
  privileges: PrivilegeItem[];
  status: 'active' | 'inactive' | 'draft' | 'archived';
  isActive: boolean;
  sortOrder: number;
}

export default function SvipPlanManagementPage() {
  const [plans, setPlans] = useState<SvipPlanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Plan Edit / Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<SvipPlanItem>>({
    name: '',
    planCode: '',
    slug: '',
    level: 1,
    description: '',
    price: 99000,
    originalPrice: 150000,
    discountPercent: 34,
    durationDays: 30,
    validityType: 'days',
    currency: 'DIAMONDS',
    status: 'active',
    isActive: true,
    sortOrder: 1,
    heroBadgeUrl: '',
    svipTagConfig: {
      text: 'SVIP',
      bgGradient: ['#F59E0B', '#D97706'],
      enabled: true,
    },
    svipBubbleConfig: {
      bubbleName: 'Royal Glass Bubble',
      bgGradient: ['#3A1F04', '#78350F'],
      textColor: '#FFFFFF',
      borderColor: '#F59E0B',
      enabled: true,
    },
    privileges: [],
  });

  // Selected plan for live mobile preview
  const [previewPlan, setPreviewPlan] = useState<SvipPlanItem | null>(null);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<any>('/api/svip-plans/admin/all');
      if (res.data?.plans) {
        setPlans(res.data.plans);
        if (!previewPlan && res.data.plans.length > 0) {
          setPreviewPlan(res.data.plans[0]);
        }
      }
    } catch (err: any) {
      toast.error('Failed to load SVIP plans: ' + (err.message || 'Network error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleOpenCreate = () => {
    setEditingPlanId(null);
    const nextLevel = plans.length > 0 ? Math.max(...plans.map((p) => p.level)) + 1 : 1;
    setFormData({
      name: `SVIP ${nextLevel}`,
      planCode: `SVIP_${nextLevel}`,
      slug: `svip-${nextLevel}`,
      level: nextLevel,
      description: `Exclusive nobility status tier ${nextLevel} with enhanced rewards.`,
      price: nextLevel * 100000,
      originalPrice: nextLevel * 150000,
      discountPercent: 33,
      durationDays: 30,
      validityType: 'days',
      currency: 'DIAMONDS',
      status: 'active',
      isActive: true,
      sortOrder: nextLevel,
      heroBadgeUrl: '',
      svipTagConfig: {
        text: `SVIP ${nextLevel}`,
        bgGradient: ['#F59E0B', '#D97706'],
        enabled: true,
      },
      svipBubbleConfig: {
        bubbleName: `SVIP ${nextLevel} Bubble`,
        bgGradient: ['#3B0764', '#581C87'],
        textColor: '#FFFFFF',
        borderColor: '#C084FC',
        enabled: true,
      },
      privileges: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: SvipPlanItem) => {
    setEditingPlanId(plan._id);
    setFormData({ ...plan });
    setIsModalOpen(true);
  };

  const handleDuplicate = async (id: string) => {
    try {
      setLoading(true);
      await apiClient.post(`/api/svip-plans/admin/${id}/duplicate`);
      toast.success('Plan duplicated as Draft!');
      fetchPlans();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Duplication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await apiClient.patch(`/api/svip-plans/admin/${id}/toggle`);
      toast.success('Plan status updated!');
      fetchPlans();
    } catch (err: any) {
      toast.error(err.message || 'Toggle failed');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete or archive plan "${name}"?`)) return;
    try {
      await apiClient.delete(`/api/svip-plans/admin/${id}`);
      toast.success(`Plan "${name}" removed!`);
      fetchPlans();
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.level === undefined || formData.price === undefined) {
      toast.error('Plan name, level, and price are required');
      return;
    }
    setLoading(true);
    try {
      if (editingPlanId) {
        await apiClient.put(`/api/svip-plans/admin/${editingPlanId}`, formData);
        toast.success(`Plan "${formData.name}" updated successfully!`);
      } else {
        await apiClient.post('/api/svip-plans/admin/create', formData);
        toast.success(`New Plan "${formData.name}" published!`);
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = useMemo(() => {
    return plans.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.planCode.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [plans, statusFilter, searchQuery]);

  return (
    <div className="p-4 md:p-8 space-y-8 bg-slate-950 min-h-screen text-slate-100">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600/20 via-violet-600/20 to-pink-600/20 border border-white/10 p-6 md:p-8 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Store & Economy — Nobility Architecture
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              SVIP Plan Management
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs font-mono">
                TIER BUILDER
              </Badge>
            </h1>
            <p className="text-sm md:text-base text-slate-400 mt-2 max-w-3xl">
              Create, configure, and manage SVIP 1 through SVIP 9+ tiers: prices, duration, custom SVIP Tag & Bubble previews, dynamic privileges with implementation tracking, and real-time mobile simulator.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPlans}
              disabled={loading}
              className="bg-slate-900/60 border-white/10 text-white hover:bg-slate-800"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={handleOpenCreate}
              className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold hover:brightness-110 shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create SVIP Plan
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Plans Table + Right Live Mobile Simulator */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Plans Table & Controls (2 Cols on XL) */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="bg-slate-900/60 border-white/10 rounded-2xl">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div>
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  Configured SVIP Plans ({filteredPlans.length})
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">
                  Click any tier to preview its exact live mobile experience on the simulator.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-800/80 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>

                <div className="w-48">
                  <Input
                    placeholder="Search plans..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-800/80 border-white/10 text-xs h-9"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-950/40">
                  <TableRow className="border-white/5">
                    <TableHead className="text-slate-400 text-xs">Level & Name</TableHead>
                    <TableHead className="text-slate-400 text-xs">Pricing (💎)</TableHead>
                    <TableHead className="text-slate-400 text-xs">Tag & Bubble</TableHead>
                    <TableHead className="text-slate-400 text-xs">Privileges</TableHead>
                    <TableHead className="text-slate-400 text-xs">Status</TableHead>
                    <TableHead className="text-right text-slate-400 text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-slate-500 text-sm">
                        No SVIP plans found. Click &quot;Create SVIP Plan&quot; to seed your first tier.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPlans.map((plan) => {
                      const isSelected = previewPlan?._id === plan._id;
                      return (
                        <TableRow
                          key={plan._id}
                          onClick={() => setPreviewPlan(plan)}
                          className={`border-white/5 cursor-pointer transition-colors ${
                            isSelected ? 'bg-amber-500/10' : 'hover:bg-white/[0.02]'
                          }`}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-600/20 border border-amber-500/30 flex items-center justify-center font-black text-amber-300 text-sm">
                                {plan.level}
                              </div>
                              <div>
                                <div className="font-bold text-sm text-white flex items-center gap-2">
                                  {plan.name}
                                  <span className="font-mono text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                                    {plan.planCode || `SVIP_${plan.level}`}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-400 truncate max-w-xs">
                                  {plan.description || 'Nobility Tier'}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="text-xs font-mono font-bold text-amber-400">
                              {plan.price.toLocaleString()} 💎
                            </div>
                            {plan.originalPrice ? (
                              <div className="text-[10px] text-slate-500 line-through">
                                {plan.originalPrice.toLocaleString()} 💎 ({plan.discountPercent || 33}% OFF)
                              </div>
                            ) : null}
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                {plan.svipTagConfig?.text || 'SVIP'}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/30">
                                Bubble
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <span className="text-xs font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                              {plan.privileges?.length || 0} Perks
                            </span>
                          </TableCell>

                          <TableCell>
                            {plan.status === 'active' ? (
                              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                                ACTIVE
                              </Badge>
                            ) : plan.status === 'draft' ? (
                              <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]">
                                DRAFT
                              </Badge>
                            ) : (
                              <Badge className="bg-slate-800 text-slate-400 border-white/10 text-[10px]">
                                INACTIVE
                              </Badge>
                            )}
                          </TableCell>

                          <TableCell className="text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggle(plan._id)}
                              className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                              title="Toggle Active/Inactive"
                            >
                              <Switch checked={plan.isActive} />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDuplicate(plan._id)}
                              className="h-8 w-8 p-0 text-slate-400 hover:text-cyan-400"
                              title="Duplicate Plan"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(plan)}
                              className="h-8 w-8 p-0 text-slate-400 hover:text-amber-400"
                              title="Edit Plan"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(plan._id, plan.name)}
                              className="h-8 w-8 p-0 text-slate-400 hover:text-red-400"
                              title="Delete Plan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Mobile Screenshot Simulator */}
        <div>
          <Card className="bg-slate-900/60 border-white/10 rounded-3xl sticky top-6 shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-white/5 py-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-400" />
                Live Mobile SVIP Simulator
              </CardTitle>
              {previewPlan && (
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">
                  {previewPlan.name}
                </Badge>
              )}
            </CardHeader>

            <CardContent className="p-4">
              {/* Phone Frame Mockup */}
              <div className="rounded-3xl bg-gradient-to-b from-stone-950 via-stone-900 to-black border-2 border-stone-800 p-4 shadow-2xl relative min-h-[580px] flex flex-col justify-between">
                {/* Header with Title and Help */}
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <span className="text-white text-xs font-bold">←</span>
                    <span className="text-amber-200 text-sm font-black tracking-wider uppercase">
                      SVIP Nobility
                    </span>
                    <span className="text-amber-400 text-xs font-bold">?</span>
                  </div>

                  {/* Horizontal Tier Selector Pills */}
                  <div className="flex gap-1.5 py-3 overflow-x-auto no-scrollbar">
                    {plans.map((p) => {
                      const isSel = previewPlan?._id === p._id;
                      return (
                        <div
                          key={p._id}
                          onClick={() => setPreviewPlan(p)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                            isSel
                              ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20'
                              : 'bg-stone-900 text-stone-400 border border-stone-800'
                          }`}
                        >
                          SVIP {p.level}
                        </div>
                      );
                    })}
                  </div>

                  {/* Large Hero Badge / Animation Card */}
                  <div className="rounded-2xl bg-gradient-to-b from-stone-900/80 to-stone-950 border border-amber-500/20 p-5 text-center relative overflow-hidden my-2">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-500/30 to-yellow-600/30 border border-amber-400/40 flex items-center justify-center font-black text-3xl text-amber-300 shadow-xl shadow-amber-500/20 mb-2">
                      👑
                    </div>
                    <h3 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
                      {previewPlan?.name || 'SVIP Tier'}
                    </h3>
                    <p className="text-[10px] text-stone-400 mt-1 line-clamp-2">
                      {previewPlan?.description || 'Unlock exclusive nobility perks.'}
                    </p>
                  </div>

                  {/* SVIP Tag & SVIP Bubble Preview Row */}
                  <div className="grid grid-cols-2 gap-2 my-3">
                    <div className="p-2.5 rounded-xl bg-stone-900/90 border border-white/5 text-center">
                      <div className="text-[9px] text-stone-500 font-mono mb-1">SVIP Tag</div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950">
                        {previewPlan?.svipTagConfig?.text || 'SVIP'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-stone-900/90 border border-white/5 text-center">
                      <div className="text-[9px] text-stone-500 font-mono mb-1">SVIP Bubble</div>
                      <div className="p-1 rounded bg-violet-950/80 border border-violet-500/30 text-[9px] text-white truncate font-medium">
                        Chat Message ✨
                      </div>
                    </div>
                  </div>

                  {/* Exclusive Privileges Grid */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black text-amber-300 uppercase tracking-wide">
                        Exclusive Privileges
                      </span>
                      <span className="text-[9px] text-stone-500 font-mono">
                        {previewPlan?.privileges?.length || 0} Perks
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto pr-1">
                      {(previewPlan?.privileges || []).slice(0, 8).map((priv, idx) => (
                        <div
                          key={`priv_${idx}`}
                          className="p-1.5 rounded-lg bg-stone-900/70 border border-white/5 flex flex-col items-center text-center"
                        >
                          <span className="text-sm">✨</span>
                          <span className="text-[8px] text-stone-300 font-medium truncate w-full mt-1">
                            {priv.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Fixed Bottom Purchase Bar Simulator */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black text-amber-400">
                      {previewPlan?.price.toLocaleString() || '99,000'} 💎
                    </div>
                    <div className="text-[9px] text-stone-500">
                      Validity: {previewPlan?.durationDays || 30} Days
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="h-8 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black text-xs px-4 rounded-xl shadow-lg shadow-amber-500/20"
                  >
                    Activate Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Plan Builder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
              <Crown className="w-5 h-5 text-amber-400" />
              {editingPlanId ? 'Edit SVIP Plan' : 'Create New SVIP Plan'}
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Configure tier specifications, pricing, tag/bubble styling, and dynamic nobility privileges.
            </p>

            <form onSubmit={handleSaveForm} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider">
                  1. Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Plan Name *
                    </label>
                    <Input
                      placeholder="e.g. SVIP 1 Knight"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-slate-800 border-white/10 text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Plan Code *
                    </label>
                    <Input
                      placeholder="e.g. SVIP_1"
                      value={formData.planCode}
                      onChange={(e) => setFormData({ ...formData, planCode: e.target.value })}
                      className="bg-slate-800 border-white/10 text-xs font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Tier Level Number (1-9+) *
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={99}
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
                      className="bg-slate-800 border-white/10 text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Display Order
                    </label>
                    <Input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                      className="bg-slate-800 border-white/10 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Description
                  </label>
                  <Input
                    placeholder="Short summary of this nobility tier..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-slate-800 border-white/10 text-xs"
                  />
                </div>
              </div>

              {/* Pricing & Duration */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider">
                  2. Pricing & Validity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Price (Diamonds) *
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="bg-slate-800 border-white/10 text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Original Strikethrough Price
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                      className="bg-slate-800 border-white/10 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Duration (Days) *
                    </label>
                    <Input
                      type="number"
                      min={1}
                      value={formData.durationDays}
                      onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                      className="bg-slate-800 border-white/10 text-xs"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SVIP Tag & Bubble */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider">
                  3. SVIP Tag & Bubble Customization
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      SVIP Tag Text
                    </label>
                    <Input
                      placeholder="e.g. SVIP 1"
                      value={formData.svipTagConfig?.text}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          svipTagConfig: { ...formData.svipTagConfig!, text: e.target.value },
                        })
                      }
                      className="bg-slate-800 border-white/10 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      SVIP Bubble Name
                    </label>
                    <Input
                      placeholder="e.g. Royal Purple Glass"
                      value={formData.svipBubbleConfig?.bubbleName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          svipBubbleConfig: { ...formData.svipBubbleConfig!, bubbleName: e.target.value },
                        })
                      }
                      className="bg-slate-800 border-white/10 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider">
                  4. Publication State
                </h3>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-white">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status === 'active'}
                      onChange={() => setFormData({ ...formData, status: 'active', isActive: true })}
                    />
                    Active (Published to Mobile Client)
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={formData.status === 'draft'}
                      onChange={() => setFormData({ ...formData, status: 'draft', isActive: false })}
                    />
                    Draft (Admin Preview Only)
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={formData.status === 'inactive'}
                      onChange={() => setFormData({ ...formData, status: 'inactive', isActive: false })}
                    />
                    Inactive
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-6 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border-white/10 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold"
                >
                  {editingPlanId ? 'Save Changes' : 'Publish Plan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
