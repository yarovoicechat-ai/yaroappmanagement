'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
  RefreshCw,
  Edit2,
  Trash2,
  Copy,
  Sparkles,
  Smartphone,
  UploadCloud,
  Check,
  X,
  Lock,
  Unlock,
  Shield,
  Zap,
  Gift,
  Trophy,
  Mic,
  Award,
  Users,
  Car,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient, getApiBaseUrl } from '@/lib/apiClient';
import { suggestAssetName } from '@/lib/aiAssetName';

export interface PrivilegeItem {
  key: string;
  title: string;
  description: string;
  icon: string;
  previewUrl?: string;
  animationUrl?: string;
  isEnabled: boolean;
  isVisible: boolean;
  implementationStatus: 'supported' | 'partially_supported' | 'coming_soon';
  value?: string | number;
  unlockLevel: number;
  sortOrder: number;
}

export interface SvipPlanItem {
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
  heroBadgePreviewUrl?: string;
  bgGradient?: string[];
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
    previewUrl?: string;
    enabled: boolean;
  };
  svipBubbleConfig?: {
    bubbleName: string;
    previewUrl?: string;
    animationUrl?: string;
    bgGradient: string[];
    textColor: string;
    borderColor: string;
    enabled: boolean;
  };
  entryAnimationUrl?: string;
  entryPreviewUrl?: string;
  avatarFrameUrl?: string;
  avatarFramePreviewUrl?: string;
  features?: Record<string, boolean>;
  privileges: PrivilegeItem[];
  status: 'active' | 'inactive' | 'draft';
  isActive: boolean;
  sortOrder: number;
}

const ALL_30_PRIVILEGES: Omit<PrivilegeItem, 'isEnabled' | 'isVisible'>[] = [
  { key: 'rank_the_top', title: 'Rank the Top', description: 'Pin profile to top of room lists', icon: 'trophy', value: 'Top #1 Priority', unlockLevel: 0, sortOrder: 1, implementationStatus: 'supported' },
  { key: 'colorful_nickname', title: 'Colorful Nickname', description: 'Dynamic gradient and animated colors', icon: 'palette', value: 'Multi-Color Gradient', unlockLevel: 0, sortOrder: 2, implementationStatus: 'supported' },
  { key: 'view_more_visitors', title: 'View More Visitors', description: 'Unlock full visitor history limits', icon: 'eye', value: 'Unlimited History', unlockLevel: 0, sortOrder: 3, implementationStatus: 'supported' },
  { key: 'special_room_entry', title: 'Special Room Entry', description: '3D sports car and arrival notice', icon: 'car-sport', value: '3D Luxury Vehicle', unlockLevel: 0, sortOrder: 4, implementationStatus: 'supported' },
  { key: 'unlimited_message', title: 'Unlimited Message', description: 'Zero message cooldown in rooms', icon: 'chatbubbles', value: 'Zero Cooldown', unlockLevel: 0, sortOrder: 5, implementationStatus: 'supported' },
  { key: 'unlock_more_room_mic', title: 'Unlock More Mic Seats', description: 'Expand rooms to 25 mic seats', icon: 'mic', value: '25 Mic Seats', unlockLevel: 1, sortOrder: 6, implementationStatus: 'supported' },
  { key: 'send_pictures_private_chat', title: 'Send Pictures in Chat', description: 'Send high-res photos in 1-on-1 chat', icon: 'images', value: 'HD Photos', unlockLevel: 1, sortOrder: 7, implementationStatus: 'supported' },
  { key: 'modify_profile_gender', title: 'Modify Gender', description: 'Flexible gender editing', icon: 'transgender', value: 'Flexible', unlockLevel: 1, sortOrder: 8, implementationStatus: 'supported' },
  { key: 'hide_last_online', title: 'Hide Last Online', description: 'Keep last-active timestamp private', icon: 'time', value: 'Stealth', unlockLevel: 2, sortOrder: 9, implementationStatus: 'supported' },
  { key: 'profile_vehicle', title: 'Profile Vehicle', description: 'Equip animated luxury vehicle', icon: 'airplane', value: 'Luxury Ride', unlockLevel: 2, sortOrder: 10, implementationStatus: 'supported' },
  { key: 'anti_tracking', title: 'Anti-Tracking', description: 'Prevent tracking visited rooms', icon: 'shield-checkmark', value: 'Ghost Visit', unlockLevel: 2, sortOrder: 11, implementationStatus: 'supported' },
  { key: 'send_pictures_chat_room', title: 'Send Pictures in Room', description: 'Post media into room feeds', icon: 'camera', value: 'Room Feeds', unlockLevel: 2, sortOrder: 12, implementationStatus: 'supported' },
  { key: 'anti_kick', title: 'Anti-Kick Protection', description: 'Full immunity against room kicks', icon: 'shield', value: 'Immunity', unlockLevel: 3, sortOrder: 13, implementationStatus: 'supported' },
  { key: 'gif_avatar', title: 'GIF Avatar', description: 'Upload animated GIF profile avatar', icon: 'film', value: 'Animated GIF', unlockLevel: 3, sortOrder: 14, implementationStatus: 'supported' },
  { key: 'level_experience_speed', title: 'EXP Speed Boost', icon: 'flash', description: 'Accelerated EXP multiplier on gifts', value: '+50% EXP', unlockLevel: 3, sortOrder: 15, implementationStatus: 'supported' },
  { key: 'svip_customized_gift', title: 'VIP Custom Gift', icon: 'gift', description: 'Exclusive 3D luxury gifts', value: '3D Gifts', unlockLevel: 3, sortOrder: 16, implementationStatus: 'supported' },
  { key: 'upgrade_app_wide_notification', title: 'App-wide Notice', icon: 'megaphone', description: 'Global arrival fanfare banner', value: 'Global Banner', unlockLevel: 4, sortOrder: 17, implementationStatus: 'supported' },
  { key: 'unique_3_digit_sid', title: 'Unique 3-digit SID', icon: 'key', description: 'Rare 3-digit vanity Special ID', value: '3-Digit SID', unlockLevel: 4, sortOrder: 18, implementationStatus: 'supported' },
  { key: 'anti_ban_from_chatting', title: 'Anti-Ban Chat', icon: 'volume-high', description: 'Platform chat mute immunity', value: 'Mute Immunity', unlockLevel: 4, sortOrder: 19, implementationStatus: 'supported' },
  { key: 'badge_svip_achievement', title: 'Prestige Medal', icon: 'medal', description: 'Winged prestige insignia on profile', value: 'Prestige Badge', unlockLevel: 4, sortOrder: 20, implementationStatus: 'supported' },
  { key: 'anonymous_ranking', title: 'Anonymous Ranking', icon: 'glasses', description: 'Mask username on public rankings', value: 'Incognito', unlockLevel: 5, sortOrder: 21, implementationStatus: 'supported' },
  { key: 'customized_start_up_page', title: 'Custom Startup Page', icon: 'sparkles', description: 'Noble customized startup welcome greeting', value: 'Noble Greeting', unlockLevel: 5, sortOrder: 22, implementationStatus: 'supported' },
  { key: 'exclusive_customer_service', title: 'VIP 1-on-1 Concierge', icon: 'headset', description: 'Dedicated WhatsApp relationship manager', value: '24/7 Concierge', unlockLevel: 5, sortOrder: 23, implementationStatus: 'supported' },
  { key: 'enter_full_room', title: 'Enter Full Room', icon: 'log-in', description: 'Bypass room occupancy capacity limits', value: 'Bypass Limit', unlockLevel: 6, sortOrder: 24, implementationStatus: 'supported' },
  { key: 'hide_wealth_and_charm_level', title: 'Hide Levels', icon: 'eye-off', description: 'Hide wealth & charm levels on profile', value: 'Incognito Levels', unlockLevel: 7, sortOrder: 25, implementationStatus: 'supported' },
  { key: 'prevent_being_recorded_in_room', title: 'Anti-Recording', icon: 'videocam-off', description: 'Protect voice streams from screen recording', value: 'Anti-Record', unlockLevel: 8, sortOrder: 26, implementationStatus: 'supported' },
  { key: 'ban_account', title: 'Ban Account Power', icon: 'ban', description: 'Restricted administrative sanction power', value: 'Admin Sanction', unlockLevel: 9, sortOrder: 27, implementationStatus: 'coming_soon' },
  { key: 'unique_2_digit_sid', title: 'Unique 2-digit SID', icon: 'diamond', description: 'Crown of crowns: 2-digit vanity Special ID', value: '2-Digit SID', unlockLevel: 9, sortOrder: 28, implementationStatus: 'supported' },
  { key: 'room_secret_lord', title: 'Room Secret Lord', icon: 'keypad', description: 'Master control over secret private rooms', value: 'Lord Authority', unlockLevel: 10, sortOrder: 29, implementationStatus: 'supported' },
  { key: 'unique_1_digit_sid', title: 'Unique 1-digit SID', icon: 'crown', description: 'Single-digit sovereign vanity SID', value: '1-Digit Sovereign SID', unlockLevel: 11, sortOrder: 30, implementationStatus: 'supported' },
];

export default function SvipPlansPage() {
  const [plans, setPlans] = useState<SvipPlanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
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
    rechargeThreshold: 100000,
    currency: 'DIAMONDS',
    status: 'active',
    isActive: true,
    sortOrder: 1,
    heroBadgeUrl: '',
    heroAnimationUrl: '',
    svipTagConfig: {
      text: 'SVIP 1',
      bgGradient: ['#F59E0B', '#D97706'],
      iconUrl: '',
      previewUrl: '',
      enabled: true,
    },
    svipBubbleConfig: {
      bubbleName: 'Knight Amber Glass',
      bgGradient: ['#3A1F04', '#78350F'],
      textColor: '#FFFFFF',
      borderColor: '#F59E0B',
      previewUrl: '',
      animationUrl: '',
      enabled: true,
    },
    privileges: [],
  });

  const [previewPlan, setPreviewPlan] = useState<SvipPlanItem | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<any>('/api/svip-plans/admin/all');
      if (res.data?.plans) {
        const filtered = res.data.plans.filter((p: SvipPlanItem) => p.level <= 5);
        setPlans(filtered);
        if (!previewPlan && filtered.length > 0) {
          setPreviewPlan(filtered[0]);
        } else if (previewPlan) {
          const match = filtered.find((p: SvipPlanItem) => p._id === previewPlan._id);
          if (match) setPreviewPlan(match);
        }
      }
    } catch (err: any) {
      toast.error('Failed to load VIP plans: ' + (err.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append('file', file);
    setUploadingField(fieldName);

    try {
      toast.loading('Uploading asset...');
      const res = await apiClient.uploadFile<any>('/api/upload/file', form);
      toast.dismiss();
      if (res.data?.url) {
        const suggestedName = fieldName === 'heroBadgeUrl'
          ? await suggestAssetName(file, 'SVIP level badge')
          : null;
        toast.success('Asset uploaded successfully!');
        if (fieldName.startsWith('tag.')) {
          const sub = fieldName.split('.')[1];
          setFormData((prev) => ({
            ...prev,
            svipTagConfig: { ...prev.svipTagConfig!, [sub]: res.data.url },
          }));
        } else if (fieldName.startsWith('bubble.')) {
          const sub = fieldName.split('.')[1];
          setFormData((prev) => ({
            ...prev,
            svipBubbleConfig: { ...prev.svipBubbleConfig!, [sub]: res.data.url },
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            [fieldName]: res.data.url,
            ...(fieldName === 'heroBadgeUrl' && !(prev.name || '').trim() && suggestedName ? { name: suggestedName } : {}),
          }));
        }
      }
    } catch (err: any) {
      toast.dismiss();
      toast.error('Upload failed: ' + (err.message || 'Error'));
    } finally {
      setUploadingField(null);
    }
  };

  const handleReseed = async () => {
    if (!confirm('Explicit Confirmation: This will reset all VIP tiers to match the 6 mobile app tiers (VIP+ to VIP 5) with exact pricing and privileges. Proceed?')) {
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.post<any>('/api/svip-plans/admin/reseed', { confirm: true });
      if (res.data?.success) {
        toast.success(res.data.message || 'Successfully reseeded VIP tiers matching the mobile app!');
        fetchPlans();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Reseed failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingPlanId(null);
    const nextLevel = plans.length > 0 ? Math.max(...plans.map((p) => p.level)) + 1 : 1;
    const initialPrivileges = ALL_30_PRIVILEGES.map((p, idx) => ({
      ...p,
      isEnabled: idx < nextLevel * 2 + 5,
      isVisible: true,
    }));

    setFormData({
      name: nextLevel === 0 ? 'VIP+' : `VIP ${nextLevel}`,
      planCode: nextLevel === 0 ? 'VIP_PLUS' : `SVIP_${nextLevel}`,
      slug: nextLevel === 0 ? 'vip-plus' : `svip-${nextLevel}`,
      level: nextLevel,
      description: `Nobility status tier ${nextLevel} granting exclusive privileges and luxury assets.`,
      price: Math.max(49000, nextLevel * 100000),
      originalPrice: Math.max(75000, nextLevel * 150000),
      discountPercent: 33,
      durationDays: 30,
      validityType: 'days',
      rechargeThreshold: nextLevel * 100000,
      currency: 'DIAMONDS',
      status: 'active',
      isActive: true,
      sortOrder: nextLevel,
      heroBadgeUrl: '',
      heroAnimationUrl: '',
      svipTagConfig: {
        text: nextLevel === 0 ? 'VIP+' : `SVIP ${nextLevel}`,
        bgGradient: ['#F59E0B', '#D97706'],
        iconUrl: '',
        previewUrl: '',
        enabled: true,
      },
      svipBubbleConfig: {
        bubbleName: `SVIP ${nextLevel} Glass Bubble`,
        bgGradient: ['#3A1F04', '#78350F'],
        textColor: '#FFFFFF',
        borderColor: '#F59E0B',
        previewUrl: '',
        animationUrl: '',
        enabled: true,
      },
      privileges: initialPrivileges,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: SvipPlanItem) => {
    setEditingPlanId(plan._id);
    const mergedPrivileges = ALL_30_PRIVILEGES.map((template) => {
      const existing = (plan.privileges || []).find((p) => p.key === template.key);
      if (existing) {
        return {
          ...template,
          ...existing,
          isEnabled: existing.isEnabled ?? true,
        };
      }
      return {
        ...template,
        isEnabled: false,
        isVisible: true,
      };
    });

    setFormData({
      ...plan,
      privileges: mergedPrivileges,
    });
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

  const handleTogglePrivilege = (index: number) => {
    if (!formData.privileges) return;
    const updated = [...formData.privileges];
    updated[index].isEnabled = !updated[index].isEnabled;
    setFormData({ ...formData, privileges: updated });
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadingField !== null) { toast.error('Wait for the asset upload to finish.'); return; }
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
          (p?.name || '').toLowerCase().includes(q) ||
          (p?.planCode || '').toLowerCase().includes(q) ||
          (p?.slug || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [plans, statusFilter, searchQuery]);

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="border-b border-white/10 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
              <Crown className="w-4 h-4" /> Nobility Plan Studio
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              VIP Tier Builder
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs font-mono">
                6 TIERS (VIP+ to VIP 5)
              </Badge>
            </h1>
            <p className="text-sm md:text-base text-slate-400 mt-2 max-w-3xl">
              Create, configure, and manage VIP+ (Level 0) through VIP 5 tiers strictly matching the YaroApp mobile application: pricing, duration, entry and avatar frame uploads, 29 exclusive privileges, and real-time mobile simulator.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPlans}
              disabled={loading}
              className="bg-slate-900/60 border-white/10 text-white hover:bg-slate-800 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReseed}
              disabled={loading}
              className="bg-amber-600/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-bold"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              1-Click Reseed (13 Tiers)
            </Button>
            <Button
              onClick={handleOpenCreate}
              className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold hover:brightness-110 shadow-lg shadow-amber-500/20 text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Create VIP Tier
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Plans Table + Right Live Mobile Simulator */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Plans Table (2 Cols on XL) */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="bg-slate-900/60 border-white/10 rounded-2xl">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div>
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  Configured Tiers ({filteredPlans.length})
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
                    <TableHead className="text-slate-400 text-xs">Entry & Frame</TableHead>
                    <TableHead className="text-slate-400 text-xs">Privileges</TableHead>
                    <TableHead className="text-slate-400 text-xs">Status</TableHead>
                    <TableHead className="text-right text-slate-400 text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-slate-500 text-sm">
                        No VIP plans found. Click &quot;1-Click Reseed&quot; or &quot;Create VIP Tier&quot;.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPlans.map((plan) => {
                      const isSelected = previewPlan?._id === plan._id;
                      const enabledPrivs = plan.privileges?.filter((p) => p.isEnabled)?.length || 0;
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
                                {plan.level === 0 ? 'VIP+' : plan.level}
                              </div>
                              <div>
                                <div className="font-bold text-sm text-white flex items-center gap-2">
                                  {plan.name}
                                  <span className="font-mono text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                                    {plan.planCode}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-400 truncate max-w-xs">
                                  {plan.description}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="text-xs font-mono font-bold text-amber-400">
                              {Number(plan.price || 0).toLocaleString()} 💎
                            </div>
                            {plan.originalPrice ? (
                              <div className="text-[10px] text-slate-500 line-through">
                                {Number(plan.originalPrice).toLocaleString()} 💎 ({plan.discountPercent || 33}% OFF)
                              </div>
                            ) : null}
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                {plan.entryAnimationUrl && plan.features?.enableEntryEffect !== false ? 'Entry ready' : 'Entry off'}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/30">
                                {plan.avatarFrameUrl && plan.features?.enableAvatarFrame !== false ? 'Frame ready' : 'Frame off'}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <span className="text-xs font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                              {enabledPrivs}/30 Perks
                            </span>
                          </TableCell>

                          <TableCell>
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggle(plan._id);
                              }}
                              className={`cursor-pointer px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                plan.isActive
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                  : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                              }`}
                            >
                              {plan.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleOpenEdit(plan)}
                                className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDuplicate(plan._id)}
                                className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(plan._id, plan.name)}
                                className="h-8 w-8 p-0 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
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

        {/* Right Column: Live Mobile Simulator */}
        <div>
          <Card className="bg-slate-900/60 border-white/10 rounded-3xl sticky top-6 shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-white/5 py-3 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-400" />
                Live Mobile VIP Simulator
              </CardTitle>
              {previewPlan && (
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">
                  {previewPlan.name}
                </Badge>
              )}
            </CardHeader>

            <CardContent className="p-4">
              <div className="rounded-3xl bg-[#0F0904] border-2 border-stone-800 p-4 shadow-2xl relative min-h-[580px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <span className="text-white text-xs font-bold">←</span>
                    <span className="text-amber-200 text-xs font-black tracking-wider uppercase">
                      VIP Membership
                    </span>
                    <span className="text-amber-400 text-xs font-bold">?</span>
                  </div>

                  {/* Horizontal Tier Selector Pills */}
                  <div className="flex gap-1.5 py-2.5 overflow-x-auto no-scrollbar">
                    {plans.map((p) => {
                      const isSel = previewPlan?._id === p._id;
                      return (
                        <div
                          key={p._id}
                          onClick={() => setPreviewPlan(p)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                            isSel
                              ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black shadow-md'
                              : 'bg-stone-900 text-stone-400 border border-stone-800'
                          }`}
                        >
                          {p.level === 0 ? 'VIP+' : `VIP ${p.level}`}
                        </div>
                      );
                    })}
                  </div>

                  {/* Hero Crest Section */}
                  <div className="rounded-2xl bg-gradient-to-b from-stone-900/80 to-stone-950 border border-amber-500/20 p-4 text-center relative my-2">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-amber-500/30 to-yellow-600/30 border border-amber-400/40 flex items-center justify-center font-black text-2xl text-amber-300 shadow-xl mb-1">
                      VIP
                    </div>
                    <h3 className="text-sm font-black text-amber-300">
                      {previewPlan?.name || 'VIP Tier'}
                    </h3>
                    <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">
                      {previewPlan?.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 my-3">
                    {([
                      { label: 'VIP Entry', url: previewPlan?.entryPreviewUrl, active: previewPlan?.features?.enableEntryEffect !== false },
                      { label: 'VIP Frame', url: previewPlan?.avatarFramePreviewUrl, active: previewPlan?.features?.enableAvatarFrame !== false },
                    ]).map(asset => <div key={asset.label} className="rounded-xl border border-white/10 p-2 text-center">
                      {asset.url && asset.active ? <img src={asset.url.startsWith('/') ? getApiBaseUrl() + asset.url : asset.url} alt={asset.label} className="h-24 w-full object-contain" /> : <p className="text-xs text-slate-500 py-6">Not configured</p>}
                      <span className="text-xs text-amber-300">{asset.label}</span>
                    </div>)}
                  </div>
                  {/* 30 Privileges Grid */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-black text-amber-300 uppercase tracking-wide">
                        Exclusive Privileges
                      </span>
                      <span className="text-[9px] text-stone-500 font-mono">
                        {previewPlan?.privileges?.filter((p) => p.isEnabled).length || 0}/30 Perks
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto pr-1">
                      {(previewPlan?.privileges || []).slice(0, 9).map((priv, idx) => (
                        <div
                          key={`priv_${idx}`}
                          className={`p-1.5 rounded-lg border flex flex-col items-center text-center ${
                            priv.isEnabled
                              ? 'bg-amber-500/10 border-amber-500/20 text-yellow-200'
                              : 'bg-stone-900/40 border-white/5 text-stone-600 opacity-60'
                          }`}
                        >
                          <span className="text-xs">{priv.isEnabled ? '✨' : '🔒'}</span>
                          <span className="text-[8px] font-medium truncate w-full mt-0.5">
                            {priv.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Purchase Bar Simulator */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black text-amber-400">
                      {Number(previewPlan?.price ?? 99000).toLocaleString()} 💎
                    </div>
                    <div className="text-[9px] text-stone-500">
                      Validity: {previewPlan?.durationDays || 30} Days
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="h-7 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black text-[10px] px-3 rounded-lg shadow-md"
                  >
                    Activate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Plan Builder Modal (Full Configurator) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
              <Crown className="w-5 h-5 text-amber-400" />
              {editingPlanId ? `Edit ${formData.name}` : 'Create New VIP Tier'}
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Configure tier level, pricing, renewal threshold, entry and avatar frame uploads, and toggle all 30 hexagonal exclusive privileges.
            </p>

            <form onSubmit={handleSaveForm} className="space-y-6">
              {/* Section 1: Basic Info */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider">
                  1. Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Tier Level (0 for VIP+, 1 to 5) *
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={5}
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: Math.min(5, Math.max(0, Number(e.target.value))) })}
                      className="bg-slate-800 border-white/10 text-xs"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Plan Name *
                    </label>
                    <Input
                      placeholder="e.g. VIP+ Lynx, VIP 1 Knight, VIP 5 Sovereign Supreme"
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
                      placeholder="e.g. VIP_PLUS, SVIP_1"
                      value={formData.planCode}
                      onChange={(e) => setFormData({ ...formData, planCode: e.target.value })}
                      className="bg-slate-800 border-white/10 text-xs font-mono"
                      required
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

              {/* Section 2: Pricing, Duration & Renewal Behavior */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider">
                  2. Pricing, Validity & Renewal Behavior
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                      Original Price (Strikethrough)
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

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Renewal Recharge Threshold (💎)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.rechargeThreshold}
                      onChange={(e) => setFormData({ ...formData, rechargeThreshold: Number(e.target.value) })}
                      className="bg-slate-800 border-white/10 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-xs font-black uppercase text-amber-400">3. VIP Entry & Avatar Frame</h3>
                <p className="text-xs text-slate-400">Save this tier to update its entry and frame in the app. Chat bubbles, badges and tags will be added later.</p>
                {([
                  { title: 'Room Entry', animation: 'entryAnimationUrl', preview: 'entryPreviewUrl', feature: 'enableEntryEffect' },
                  { title: 'Avatar Frame', animation: 'avatarFrameUrl', preview: 'avatarFramePreviewUrl', feature: 'enableAvatarFrame' },
                ] as const).map(asset => <div key={asset.animation} className="rounded-xl border border-white/10 p-4 space-y-3">
                  <label className="flex gap-2 text-sm font-semibold">
                    <input type="checkbox" checked={formData.features?.[asset.feature] !== false} onChange={event => setFormData(prev => ({ ...prev, features: { ...prev.features, [asset.feature]: event.target.checked } }))} />
                    {asset.title} enabled
                  </label>
                  {formData[asset.preview] && <img src={String(formData[asset.preview]).startsWith('/') ? getApiBaseUrl() + formData[asset.preview] : formData[asset.preview]} alt={asset.title + ' preview'} className="h-32 w-32 object-contain bg-slate-950 rounded-lg" />}
                  {([asset.preview, asset.animation] as const).map(field => <div key={field} className="space-y-1">
                    <label className="text-xs text-slate-300" htmlFor={field}>{field === asset.preview ? 'PNG preview' : 'SVGA animation'}</label>
                    <Input id={field} value={formData[field] || ''} onChange={event => setFormData(prev => ({ ...prev, [field]: event.target.value }))} placeholder="https://…" className="bg-slate-800 border-white/10 text-xs" />
                    <input aria-label={'Upload ' + asset.title + ' ' + (field === asset.preview ? 'PNG' : 'SVGA')} type="file" accept={field === asset.preview ? '.png' : '.svga'} disabled={uploadingField !== null} onChange={event => handleFileUpload(event, field)} className="text-xs w-full" />
                  </div>)}
                </div>)}
              </div>

              {/* Section 5: Privileges Configuration (30 Standard Perks) */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider">
                    5. Exclusive Privileges Configuration ({formData.privileges?.filter((p) => p.isEnabled).length || 0}/30 Enabled)
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.privileges) return;
                      const allEnabled = formData.privileges.every((p) => p.isEnabled);
                      setFormData({
                        ...formData,
                        privileges: formData.privileges.map((p) => ({ ...p, isEnabled: !allEnabled })),
                      });
                    }}
                    className="text-[10px] text-amber-400 hover:underline font-bold"
                  >
                    Toggle All
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2">
                  {(formData.privileges || []).map((priv, idx) => (
                    <div
                      key={priv.key}
                      onClick={() => handleTogglePrivilege(idx)}
                      className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-colors ${
                        priv.isEnabled
                          ? 'bg-amber-500/15 border-amber-500/40 text-white font-semibold'
                          : 'bg-slate-950/40 border-white/5 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{priv.isEnabled ? '✨' : '🔒'}</span>
                        <div>
                          <div className="text-xs font-bold leading-tight">{priv.title}</div>
                          <div className="text-[10px] text-slate-400">{priv.value || priv.description}</div>
                        </div>
                      </div>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                        priv.isEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {priv.isEnabled ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 6: Publication State */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider">
                  6. Publication State
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
                  disabled={loading || uploadingField !== null}
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
