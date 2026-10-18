'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
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
  Sparkles,
  CheckCircle2,
  XCircle,
  UserCheck,
  Shield,
  Zap,
  Gem,
  Check,
  X,
  User,
  Calendar,
  Layers,
  Sliders,
  History,
  FolderOpen,
  Eye,
  Smartphone,
  Copy,
  AlertTriangle,
  Clock,
  Palette,
  FileCheck,
  ArrowRight,
  UploadCloud,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

interface IdentityEntitlementItem {
  _id: string;
  userId: number;
  userObjectId?: any;
  type: string;
  config: any;
  status: 'active' | 'expired' | 'revoked';
  startsAt: string;
  expiresAt: string;
  grantedBy: {
    adminName: string;
    role: string;
  };
  grantSource: string;
  grantReason?: string;
  createdAt: string;
}

interface NameEffectItem {
  _id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  config: {
    colors: string[];
    gradientDirection: string;
    animationType: string;
    animationSpeed: number;
    glowColor: string;
    shadowColor: string;
    prefixBadge?: string;
  };
  previewBg: string;
  eligibleTiers: string[];
  priceDiamonds: number;
  isPurchasable: boolean;
  status: 'active' | 'inactive' | 'draft';
  validityDays: number;
  sortOrder: number;
}

interface AssetLibraryRecord {
  _id: string;
  name: string;
  slug: string;
  category: string;
  fileUrl: string;
  thumbnailUrl: string;
  fileType: string;
  fileSize: number;
  dimensions?: { width: number; height: number };
  durationMs: number;
  isLooping: boolean;
  transparentBg: boolean;
  status: string;
  tags: string[];
}

interface AuditLogRecord {
  _id: string;
  action: string;
  targetUserId: number;
  targetUserName?: string;
  entitlementType?: string;
  details: any;
  performedBy: {
    adminName: string;
    role: string;
  };
  timestamp: string;
}

export default function IdentityVipStudioPage() {
  const [activeTab, setActiveTab] = useState('official_id');
  const [loading, setLoading] = useState(false);

  // Data states
  const [officialIds, setOfficialIds] = useState<IdentityEntitlementItem[]>([]);
  const [nameEffects, setNameEffects] = useState<NameEffectItem[]>([]);
  const [assets, setAssets] = useState<AssetLibraryRecord[]>([]);
  const [entitlements, setEntitlements] = useState<IdentityEntitlementItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);

  // Search & Filters
  const [officialSearch, setOfficialSearch] = useState('');
  const [entitlementFilterType, setEntitlementFilterType] = useState('all');
  const [entitlementFilterStatus, setEntitlementFilterStatus] = useState('all');
  const [auditLogActionFilter, setAuditLogActionFilter] = useState('all');

  // Official ID Grant Modal State
  const [isOfficialModalOpen, setIsOfficialModalOpen] = useState(false);
  const [grantTargetUser, setGrantTargetUser] = useState('');
  const [grantDisplayId, setGrantDisplayId] = useState('Official');
  const [grantBadgeText, setGrantBadgeText] = useState('OFFICIAL');
  const [grantBadgeUrl, setGrantBadgeUrl] = useState('');
  const [grantBadgeAnimation, setGrantBadgeAnimation] = useState('gold_rotate');
  const [grantDurationDays, setGrantDurationDays] = useState(30);
  const [grantReason, setGrantReason] = useState('Verified Official Representative');
  const [isUploadingBadge, setIsUploadingBadge] = useState(false);

  // Name Effect Form State
  const [isEffectModalOpen, setIsEffectModalOpen] = useState(false);
  const [effectForm, setEffectForm] = useState<Partial<NameEffectItem>>({
    name: '',
    slug: '',
    description: '',
    config: {
      colors: ['#FFE259', '#FFA751', '#FFD700'],
      gradientDirection: 'horizontal',
      animationType: 'gradient_scroll',
      animationSpeed: 1.2,
      glowColor: '#F59E0B',
      shadowColor: 'rgba(245, 158, 11, 0.4)',
      prefixBadge: '👑',
    },
    previewBg: 'gold',
    eligibleTiers: ['all'],
    priceDiamonds: 5000,
    validityDays: 30,
    status: 'active',
  });

  // Asset Upload Modal State
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [assetForm, setAssetForm] = useState<Partial<AssetLibraryRecord>>({
    name: '',
    slug: '',
    category: 'profile_frame',
    fileType: 'svga',
    fileUrl: '',
    thumbnailUrl: '',
    isLooping: true,
    transparentBg: true,
  });

  // Preview Sandbox State
  const [previewName, setPreviewName] = useState('YaroLegend');
  const [previewUserId, setPreviewUserId] = useState('1000000002');
  const [previewDisplayId, setPreviewDisplayId] = useState('Official');
  const [previewIsOfficial, setPreviewIsOfficial] = useState(true);
  const [previewEffectSlug, setPreviewEffectSlug] = useState('imperial-gold-shimmer');
  const [previewVipLevel, setPreviewVipLevel] = useState('SVIP 9');

  // Load Initial Data
  const loadStudioData = async () => {
    setLoading(true);
    try {
      const [officialRes, effectsRes, assetsRes, entitleRes, logsRes] = await Promise.all([
        apiClient.get<any>('/api/identity/admin/official-ids').catch(() => ({ data: { entitlements: [] } })),
        apiClient.get<any>('/api/identity/admin/effects').catch(() => ({ data: { effects: [] } })),
        apiClient.get<any>('/api/identity/admin/assets').catch(() => ({ data: { assets: [] } })),
        apiClient.get<any>('/api/identity/admin/entitlements?limit=100').catch(() => ({ data: { entitlements: [] } })),
        apiClient.get<any>('/api/identity/admin/audit-logs?limit=50').catch(() => ({ data: { logs: [] } })),
      ]);

      const offList = officialRes.data?.entitlements || (Array.isArray(officialRes.data) ? officialRes.data : (officialRes as any)?.entitlements) || [];
      const effList = effectsRes.data?.effects || (Array.isArray(effectsRes.data) ? effectsRes.data : (effectsRes as any)?.effects) || [];
      const assList = assetsRes.data?.assets || (Array.isArray(assetsRes.data) ? assetsRes.data : (assetsRes as any)?.assets) || [];
      const entList = entitleRes.data?.entitlements || (Array.isArray(entitleRes.data) ? entitleRes.data : (entitleRes as any)?.entitlements) || [];
      const logList = logsRes.data?.logs || (Array.isArray(logsRes.data) ? logsRes.data : (logsRes as any)?.logs) || [];

      setOfficialIds(Array.isArray(offList) ? offList : []);
      setNameEffects(Array.isArray(effList) ? effList : []);
      setAssets(Array.isArray(assList) ? assList : []);
      setEntitlements(Array.isArray(entList) ? entList : []);
      setAuditLogs(Array.isArray(logList) ? logList : []);
    } catch (err: any) {
      toast.error('Failed to load identity studio records: ' + (err.message || 'Network error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudioData();
  }, []);

  /* =========================================================================
     OFFICIAL ID HANDLERS
  ========================================================================= */

  const handleUploadBadgeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setIsUploadingBadge(true);

    try {
      toast.loading('Uploading animated badge asset...');
      const res = await apiClient.post<any>('/api/uploads/file', formData);
      toast.dismiss();
      if (res.data?.url) {
        setGrantBadgeUrl(res.data.url);
        toast.success('Badge asset uploaded successfully!');
      }
    } catch (err: any) {
      toast.dismiss();
      toast.error('Badge upload failed: ' + (err.message || 'Error'));
    } finally {
      setIsUploadingBadge(false);
    }
  };

  const handleGrantOfficialId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantTargetUser) {
      toast.error('Please specify target user numeric ID or username');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/api/identity/admin/official-ids/grant', {
        userIdentifier: grantTargetUser.trim(),
        displayId: grantDisplayId.trim(),
        badgeText: grantBadgeText.trim(),
        badgeUrl: grantBadgeUrl.trim(),
        badgeAnimationType: grantBadgeAnimation,
        durationDays: Number(grantDurationDays),
        reason: grantReason.trim(),
      });
      toast.success(`Official ID "${grantDisplayId}" successfully granted!`);
      setIsOfficialModalOpen(false);
      setGrantTargetUser('');
      setGrantBadgeUrl('');
      loadStudioData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to grant official ID');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeOfficialId = async (numericUserId: number) => {
    if (!confirm(`Are you sure you want to revoke Official ID from User ${numericUserId}? The user will immediately revert to their permanent numeric ID.`)) {
      return;
    }
    setLoading(true);
    try {
      await apiClient.post(`/api/identity/admin/official-ids/${numericUserId}/revoke`, {
        reason: 'Revoked by admin via Identity Studio',
      });
      toast.success(`Official ID revoked! User immediately reverted to permanent ID ${numericUserId}`);
      loadStudioData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to revoke official ID');
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================================
     ENTITLEMENTS HANDLERS
  ========================================================================= */

  const handleRevokeEntitlement = async (id: string, userId: number, type: string) => {
    if (!confirm(`Revoke ${type} entitlement for User ${userId}?`)) return;
    try {
      await apiClient.post(`/api/identity/admin/entitlements/${id}/revoke`, {
        reason: 'Admin revoked via directory',
      });
      toast.success(`Entitlement revoked! User presentation reverted safely.`);
      loadStudioData();
    } catch (err: any) {
      toast.error(err.message || 'Revocation failed');
    }
  };

  const handleExtendEntitlement = async (id: string, days: number) => {
    try {
      await apiClient.post(`/api/identity/admin/entitlements/${id}/extend`, { days });
      toast.success(`Entitlement extended by +${days} days!`);
      loadStudioData();
    } catch (err: any) {
      toast.error(err.message || 'Extension failed');
    }
  };

  /* =========================================================================
     EFFECTS HANDLERS
  ========================================================================= */

  const handleSaveEffect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectForm.name || !effectForm.slug) {
      toast.error('Name and slug are required');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/api/identity/admin/effects', effectForm);
      toast.success('Animated Name Effect registered successfully!');
      setIsEffectModalOpen(false);
      loadStudioData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save effect');
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================================
     ASSET HANDLERS
  ========================================================================= */

  const handleSaveAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetForm.name || !assetForm.fileUrl) {
      toast.error('Asset name and file URL are required');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/api/identity/admin/assets', assetForm);
      toast.success('Asset added to Asset Library!');
      setIsAssetModalOpen(false);
      loadStudioData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to register asset');
    } finally {
      setLoading(false);
    }
  };

  // Filtered lists
  const filteredOfficialIds = useMemo(() => {
    if (!officialSearch) return officialIds;
    const q = officialSearch.toLowerCase();
    return officialIds.filter((item) => {
      const uId = String(item.userId);
      const disp = item.config?.displayId?.toLowerCase() || '';
      const name = item.userObjectId?.name?.toLowerCase() || '';
      return uId.includes(q) || disp.includes(q) || name.includes(q);
    });
  }, [officialIds, officialSearch]);

  const filteredEntitlements = useMemo(() => {
    return entitlements.filter((item) => {
      if (entitlementFilterType !== 'all' && item.type !== entitlementFilterType) return false;
      if (entitlementFilterStatus !== 'all' && item.status !== entitlementFilterStatus) return false;
      return true;
    });
  }, [entitlements, entitlementFilterType, entitlementFilterStatus]);

  const filteredAuditLogs = useMemo(() => {
    if (auditLogActionFilter === 'all') return auditLogs;
    return auditLogs.filter((log) => log.action === auditLogActionFilter);
  }, [auditLogs, auditLogActionFilter]);

  return (
    <div className="p-4 md:p-8 space-y-8 bg-slate-950 min-h-screen text-slate-100">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600/20 via-violet-600/20 to-sky-600/20 border border-white/10 p-6 md:p-8 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              Store & Economy — Identity Engine v2.0
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Identity & VIP Studio
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 font-mono text-xs">
                PRODUCTION-READY
              </Badge>
            </h1>
            <p className="text-sm md:text-base text-slate-400 mt-2 max-w-3xl">
              Complete User Identity Presentation Architecture: VIP/SVIP tier perks, animated display names, server-authoritative Official IDs with permanent numeric ID preservation, unique ID badges, and multi-format graphics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadStudioData}
              disabled={loading}
              className="bg-slate-900/60 border-white/10 text-white hover:bg-slate-800"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => setIsOfficialModalOpen(true)}
              className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold hover:brightness-110 shadow-lg shadow-amber-500/20"
            >
              <Crown className="w-4 h-4 mr-2" />
              Grant Official ID
            </Button>
          </div>
        </div>

        {/* Permanent Numeric ID Integrity Banner */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Permanent Numeric ID Preserved: <span className="font-mono text-white">Immutable</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-2 text-cyan-400 font-medium">
            <Clock className="w-4 h-4" />
            Server-Authoritative Expiry: <span className="font-mono text-white">Zero Clock Drift</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-2 text-amber-400 font-medium">
            <Shield className="w-4 h-4" />
            Automatic Fallback: <span className="font-mono text-white">Safe Revert on Expiry</span>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-900/80 border border-white/10 p-1.5 rounded-2xl flex flex-wrap gap-1 max-w-full overflow-x-auto">
          <TabsTrigger value="official_id" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 font-semibold rounded-xl text-xs px-4 py-2">
            <Crown className="w-3.5 h-3.5 mr-1.5" />
            1. Official ID Management
          </TabsTrigger>
          <TabsTrigger value="animated_names" className="data-[state=active]:bg-violet-500 data-[state=active]:text-white font-semibold rounded-xl text-xs px-4 py-2">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            2. Animated Names & Colors
          </TabsTrigger>
          <TabsTrigger value="unique_badges" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-slate-950 font-semibold rounded-xl text-xs px-4 py-2">
            <Gem className="w-3.5 h-3.5 mr-1.5" />
            3. Unique ID Badges
          </TabsTrigger>
          <TabsTrigger value="asset_library" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white font-semibold rounded-xl text-xs px-4 py-2">
            <FolderOpen className="w-3.5 h-3.5 mr-1.5" />
            4. Asset Library
          </TabsTrigger>
          <TabsTrigger value="user_entitlements" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-slate-950 font-semibold rounded-xl text-xs px-4 py-2">
            <UserCheck className="w-3.5 h-3.5 mr-1.5" />
            5. User Entitlements Master
          </TabsTrigger>
          <TabsTrigger value="preview_studio" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white font-semibold rounded-xl text-xs px-4 py-2">
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            6. Interactive Live Preview
          </TabsTrigger>
          <TabsTrigger value="audit_logs" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white font-semibold rounded-xl text-xs px-4 py-2">
            <History className="w-3.5 h-3.5 mr-1.5" />
            7. Audit History
          </TabsTrigger>
        </TabsList>

        {/* =========================================================================
            SECTION 1: OFFICIAL ID MANAGEMENT
        ========================================================================= */}
        <TabsContent value="official_id" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-900/60 border-white/10 rounded-2xl md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/5">
                <div>
                  <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-400" />
                    Active Official ID Entitlements
                  </CardTitle>
                  <p className="text-xs text-slate-400 mt-1">
                    Users granted official platform representation. When expired or revoked, users automatically revert to their permanent numeric ID.
                  </p>
                </div>
                <div className="w-64">
                  <Input
                    placeholder="Search by ID or Display ID..."
                    value={officialSearch}
                    onChange={(e) => setOfficialSearch(e.target.value)}
                    className="bg-slate-800/80 border-white/10 text-xs h-9"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-950/40">
                    <TableRow className="border-white/5">
                      <TableHead className="text-slate-400 text-xs">Permanent User ID</TableHead>
                      <TableHead className="text-slate-400 text-xs">Official Display ID</TableHead>
                      <TableHead className="text-slate-400 text-xs">Badge Presentation</TableHead>
                      <TableHead className="text-slate-400 text-xs">Validity / Expiry</TableHead>
                      <TableHead className="text-slate-400 text-xs">Status</TableHead>
                      <TableHead className="text-right text-slate-400 text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOfficialIds.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-slate-500 text-sm">
                          No official ID entitlements found matching your query.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOfficialIds.map((item) => {
                        const isExpired = new Date(item.expiresAt) <= new Date();
                        const isCurrentlyActive = item.status === 'active' && !isExpired;

                        return (
                          <TableRow key={item._id} className="border-white/5 hover:bg-white/[0.02]">
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-amber-400 border border-amber-500/30">
                                  {item.userObjectId?.name ? item.userObjectId.name[0] : '#'}
                                </div>
                                <div>
                                  <div className="font-mono text-sm font-bold text-white flex items-center gap-1.5">
                                    {item.userId}
                                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-sans">Permanent</span>
                                  </div>
                                  <div className="text-xs text-slate-400">
                                    {item.userObjectId?.name || item.userObjectId?.userName || 'User'}
                                  </div>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell>
                              <span className="font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg text-xs">
                                {item.config?.displayId || 'Official'}
                              </span>
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-sm shadow-amber-500/20">
                                  👑 {item.config?.badgeText || 'OFFICIAL'}
                                </span>
                                {item.config?.badgeAnimationType && (
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    ({item.config.badgeAnimationType})
                                  </span>
                                )}
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="text-xs">
                                <div className="text-slate-300 font-medium">
                                  {new Date(item.expiresAt).toLocaleDateString()}
                                </div>
                                <div className="text-[10px] text-slate-500">
                                  {isCurrentlyActive ? (
                                    <span className="text-emerald-400">Expires in {Math.ceil((new Date(item.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days</span>
                                  ) : (
                                    <span className="text-red-400">Expired</span>
                                  )}
                                </div>
                              </div>
                            </TableCell>

                            <TableCell>
                              {isCurrentlyActive ? (
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                                  ACTIVE
                                </Badge>
                              ) : item.status === 'revoked' ? (
                                <Badge className="bg-red-500/10 text-red-400 border-red-500/30 text-[10px]">
                                  REVOKED
                                </Badge>
                              ) : (
                                <Badge className="bg-slate-800 text-slate-400 border-white/10 text-[10px]">
                                  EXPIRED
                                </Badge>
                              )}
                            </TableCell>

                            <TableCell className="text-right">
                              {isCurrentlyActive && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleRevokeOfficialId(item.userId)}
                                  className="h-7 text-xs bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/30"
                                >
                                  Revoke & Revert
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Quick Grant Panel */}
            <Card className="bg-slate-900/60 border-white/10 rounded-2xl">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-amber-400" />
                  Grant Official Identity
                </CardTitle>
                <p className="text-xs text-slate-400">
                  Assign verified temporary official identity to an authorized user. Permanent numeric ID is untouched.
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleGrantOfficialId} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Target User (Numeric ID / Username)
                    </label>
                    <Input
                      placeholder="e.g. 1000000002"
                      value={grantTargetUser}
                      onChange={(e) => setGrantTargetUser(e.target.value)}
                      className="bg-slate-800/80 border-white/10 text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Official Display ID / Unique Vanity ID
                    </label>
                    <Input
                      placeholder="e.g. Official, 600002, VIP, Staff"
                      value={grantDisplayId}
                      onChange={(e) => setGrantDisplayId(e.target.value)}
                      className="bg-slate-800/80 border-white/10 text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Badge Text / Title
                    </label>
                    <Input
                      placeholder="e.g. OFFICIAL, VIP, STAFF"
                      value={grantBadgeText}
                      onChange={(e) => setGrantBadgeText(e.target.value)}
                      className="bg-slate-800/80 border-white/10 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Animated Badge Asset (Upload Icon / Animation)
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://... or upload below"
                        value={grantBadgeUrl}
                        onChange={(e) => setGrantBadgeUrl(e.target.value)}
                        className="bg-slate-800/80 border-white/10 text-xs"
                      />
                      <label className="cursor-pointer px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-lg text-xs font-semibold text-slate-200 flex items-center justify-center shrink-0">
                        <UploadCloud className="w-4 h-4 mr-1 text-amber-400" />
                        {isUploadingBadge ? 'Uploading...' : 'Upload'}
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,.svga,.gif,.webp,.json"
                          onChange={handleUploadBadgeFile}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Badge Animation Type
                    </label>
                    <select
                      value={grantBadgeAnimation}
                      onChange={(e) => setGrantBadgeAnimation(e.target.value)}
                      className="w-full bg-slate-800/80 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                    >
                      <option value="gold_rotate">Gold Shimmer & Rotate</option>
                      <option value="pulse">Radiant Pulse</option>
                      <option value="rainbow_glow">Rainbow Aura</option>
                      <option value="neon_flicker">Cyber Neon Glow</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-300">
                        Validity Duration (Days)
                      </label>
                      <span className="text-[10px] text-amber-400 font-mono">
                        Expires in {grantDurationDays} days
                      </span>
                    </div>

                    {/* Quick Duration Preset Pills */}
                    <div className="flex gap-1.5 mb-2">
                      {[7, 30, 90, 180, 365].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setGrantDurationDays(d)}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                            grantDurationDays === d
                              ? 'bg-amber-500 text-slate-950 font-black'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {d === 30 ? '1 Mo' : d === 90 ? '3 Mo' : d === 180 ? '6 Mo' : d === 365 ? '1 Yr' : `${d}d`}
                        </button>
                      ))}
                    </div>

                    <Input
                      type="number"
                      min={1}
                      max={730}
                      value={grantDurationDays}
                      onChange={(e) => setGrantDurationDays(Number(e.target.value))}
                      className="bg-slate-800/80 border-white/10 text-xs"
                      required
                    />
                  </div>

                  {/* Guaranteed ID Auto-Reversion Flow Explanatory Box */}
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-300">
                      <Shield className="w-3.5 h-3.5" />
                      Permanent ID Preservation Guarantee
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      Target user's permanent numeric ID (e.g. 1000000002) is NEVER deleted or overwritten. During the {grantDurationDays} days validity, vanity ID & badge will display everywhere and both IDs will be searchable. Once time expires, the user automatically and seamlessly reverts back to 1000000002.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Grant Reason / Internal Notes
                    </label>
                    <Input
                      placeholder="e.g. Platform Community Manager"
                      value={grantReason}
                      onChange={(e) => setGrantReason(e.target.value)}
                      className="bg-slate-800/80 border-white/10 text-xs"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold hover:brightness-110 shadow-lg shadow-amber-500/20 text-xs h-10 mt-2"
                  >
                    <Crown className="w-4 h-4 mr-1.5" />
                    Confirm Official Grant ({grantDurationDays} Days)
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* =========================================================================
            SECTION 2: ANIMATED NAMES & COLORS STUDIO
        ========================================================================= */}
        <TabsContent value="animated_names" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-400" />
                Animated Name Effects & Color Studio
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure animated gradient typography, neon glows, rainbow cycling, and particle shimmers for VIP and SVIP members.
              </p>
            </div>
            <Button
              onClick={() => setIsEffectModalOpen(true)}
              className="bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              New Name Effect
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {nameEffects.map((effect) => {
              const animType = (effect.config?.animationType || 'GRADIENT').toUpperCase();
              const primaryColor = effect.config?.colors?.[0] || '#FFE259';
              const glowColor = effect.config?.glowColor || 'rgba(245, 158, 11, 0.4)';
              const speed = effect.config?.animationSpeed ?? 1.0;
              const colorSeq = (effect.config?.colors || ['#FFE259']).join(' → ');
              const price = Number(effect.priceDiamonds || 0);
              const tiers = Array.isArray(effect.eligibleTiers) ? effect.eligibleTiers : ['ALL'];

              return (
                <Card key={effect._id} className="bg-slate-900/60 border-white/10 rounded-2xl overflow-hidden hover:border-violet-500/40 transition-all">
                  {/* Live Effect Preview Banner */}
                  <div
                    className="p-6 border-b border-white/5 flex flex-col items-center justify-center min-h-[140px] relative overflow-hidden"
                    style={{
                      backgroundColor: effect.previewBg === 'neon' ? '#080d1a' : effect.previewBg === 'royal' ? '#140c24' : '#181204',
                    }}
                  >
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <Badge className="bg-white/10 text-white border-none text-[10px]">
                        {animType}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <span className="text-lg font-black tracking-wide" style={{ color: primaryColor, textShadow: `0 0 12px ${glowColor}` }}>
                        {effect.config?.prefixBadge && `${effect.config.prefixBadge} `}
                        {effect.name}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-2 font-mono">
                        Speed: {speed}x | {colorSeq}
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Price:</span>
                      <span className="font-bold text-amber-400 flex items-center gap-1">
                        <Gem className="w-3.5 h-3.5" />
                        {price.toLocaleString()} Diamonds
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Eligible Tiers:</span>
                      <div className="flex gap-1 flex-wrap">
                        {tiers.map((tier) => (
                          <span key={tier} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                            {String(tier).toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Validity:</span>
                      <span className="text-slate-300 font-mono">{effect.validityDays || 30} Days</span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2">
                      {effect.description || 'Custom animated typography style.'}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* =========================================================================
            SECTION 3: UNIQUE ID BADGES
        ========================================================================= */}
        <TabsContent value="unique_badges" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Gem className="w-5 h-5 text-cyan-400" />
                Unique ID Badges & Visual Emblems
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Visual badges displayed directly adjacent to user IDs. The original numeric account ID remains completely untouched.
              </p>
            </div>
            <Link
              href="/store/unique-id-levels"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition shrink-0"
            >
              <Layers className="w-4 h-4" />
              Configure Unique ID Levels
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-900/60 border-white/10 rounded-2xl p-6 space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 font-bold text-xs shadow-lg shadow-cyan-500/10">
                  <Gem className="w-4 h-4 text-cyan-400 animate-pulse" />
                  VIP ID • 1000000002
                </div>
              </div>
              <h3 className="font-bold text-white text-sm">Diamond Tier Badge</h3>
              <p className="text-xs text-slate-400">
                Pulsing cyan border with radiant gemstone emblem. Reserved for top gifters and custom store purchasers.
              </p>
            </Card>

            <Card className="bg-slate-900/60 border-white/10 rounded-2xl p-6 space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 font-bold text-xs shadow-lg shadow-amber-500/10">
                  <Crown className="w-4 h-4 text-amber-400" />
                  GOLDEN ID • 1000000002
                </div>
              </div>
              <h3 className="font-bold text-white text-sm">Imperial Gold Badge</h3>
              <p className="text-xs text-slate-400">
                Rotating golden frame for SVIP 8 & SVIP 9 emperors. Shimmers continuously in room member lists.
              </p>
            </Card>

            <Card className="bg-slate-900/60 border-white/10 rounded-2xl p-6 space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-pink-500/40 bg-pink-500/10 text-pink-300 font-bold text-xs shadow-lg shadow-pink-500/10">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  SPECIAL ID • 1000000002
                </div>
              </div>
              <h3 className="font-bold text-white text-sm">Rainbow Aura Emblem</h3>
              <p className="text-xs text-slate-400">
                Full-spectrum cycling aura badge. Automatically expires on schedule without modifying user account balance.
              </p>
            </Card>
          </div>
        </TabsContent>

        {/* =========================================================================
            SECTION 4: ASSET LIBRARY
        ========================================================================= */}
        <TabsContent value="asset_library" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-pink-400" />
                Identity Asset Library (SVGA, Lottie, WebP, GIF, MP4)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Validated graphics repository with device compatibility checking and automated fallback support.
              </p>
            </div>
            <Button
              onClick={() => setIsAssetModalOpen(true)}
              className="bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Register New Asset
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {assets.length === 0 ? (
              <div className="col-span-4 text-center py-12 text-slate-500 text-sm">
                No assets registered yet. Click &quot;Register New Asset&quot; to add SVGA or WebP graphics.
              </div>
            ) : (
              assets.map((asset) => (
                <Card key={asset._id} className="bg-slate-900/60 border-white/10 rounded-2xl overflow-hidden">
                  <div className="h-32 bg-slate-950 flex items-center justify-center relative p-3">
                    <Badge className="absolute top-2 left-2 bg-slate-800 text-pink-300 border-none text-[10px] uppercase font-mono">
                      {asset.fileType}
                    </Badge>
                    <div className="w-16 h-16 rounded-full border border-pink-500/30 flex items-center justify-center bg-pink-500/10">
                      <Layers className="w-8 h-8 text-pink-400" />
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <div className="font-bold text-sm text-white truncate">{asset.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">{asset.category}</div>
                    <div className="text-[10px] text-slate-500 truncate">{asset.fileUrl}</div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* =========================================================================
            SECTION 5: USER ENTITLEMENTS MASTER DIRECTORY
        ========================================================================= */}
        <TabsContent value="user_entitlements" className="space-y-6">
          <Card className="bg-slate-900/60 border-white/10 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/5">
              <div>
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                  Master User Entitlements Directory
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">
                  Server-authoritative database of all active, expired, and revoked identity entitlements.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={entitlementFilterType}
                  onChange={(e) => setEntitlementFilterType(e.target.value)}
                  className="bg-slate-800/80 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                >
                  <option value="all">All Types</option>
                  <option value="official_id">Official ID</option>
                  <option value="animated_name">Animated Name</option>
                  <option value="unique_id_badge">Unique ID Badge</option>
                  <option value="profile_frame">Profile Frame</option>
                  <option value="vip_tier">VIP Tier</option>
                  <option value="svip_tier">SVIP Tier</option>
                </select>

                <select
                  value={entitlementFilterStatus}
                  onChange={(e) => setEntitlementFilterStatus(e.target.value)}
                  className="bg-slate-800/80 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="revoked">Revoked</option>
                </select>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-950/40">
                  <TableRow className="border-white/5">
                    <TableHead className="text-slate-400 text-xs">User</TableHead>
                    <TableHead className="text-slate-400 text-xs">Entitlement Type</TableHead>
                    <TableHead className="text-slate-400 text-xs">Effective Details</TableHead>
                    <TableHead className="text-slate-400 text-xs">Validity / Expiry</TableHead>
                    <TableHead className="text-slate-400 text-xs">Status</TableHead>
                    <TableHead className="text-right text-slate-400 text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntitlements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-slate-500 text-sm">
                        No entitlements found matching selected filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEntitlements.map((item) => {
                      const isExpired = new Date(item.expiresAt) <= new Date();
                      const isActive = item.status === 'active' && !isExpired;

                      return (
                        <TableRow key={item._id} className="border-white/5 hover:bg-white/[0.02]">
                          <TableCell>
                            <div className="font-mono text-sm font-bold text-white">
                              {item.userId}
                            </div>
                            <div className="text-xs text-slate-400">
                              {item.userObjectId?.name || 'User'}
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge className="bg-slate-800 text-slate-300 border-white/10 font-mono text-[10px] uppercase">
                              {item.type}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <div className="text-xs font-mono text-slate-300 max-w-xs truncate">
                              {item.config?.displayId ? `Display: ${item.config.displayId}` : item.config?.styleId ? `Style: ${item.config.styleId}` : JSON.stringify(item.config)}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="text-xs text-slate-300">
                              {new Date(item.expiresAt).toLocaleDateString()}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {isActive ? `${Math.ceil((new Date(item.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}d remaining` : 'Expired'}
                            </div>
                          </TableCell>

                          <TableCell>
                            {isActive ? (
                              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                                ACTIVE
                              </Badge>
                            ) : item.status === 'revoked' ? (
                              <Badge className="bg-red-500/10 text-red-400 border-red-500/30 text-[10px]">
                                REVOKED
                              </Badge>
                            ) : (
                              <Badge className="bg-slate-800 text-slate-400 border-white/10 text-[10px]">
                                EXPIRED
                              </Badge>
                            )}
                          </TableCell>

                          <TableCell className="text-right space-x-2">
                            {isActive && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleExtendEntitlement(item._id, 30)}
                                  className="h-7 text-xs bg-slate-800 border-white/10 text-slate-300 hover:text-white"
                                >
                                  +30d
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleRevokeEntitlement(item._id, item.userId, item.type)}
                                  className="h-7 text-xs bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/30"
                                >
                                  Revoke
                                </Button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* =========================================================================
            SECTION 6: INTERACTIVE LIVE PREVIEW STUDIO
        ========================================================================= */}
        <TabsContent value="preview_studio" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Control Panel */}
            <Card className="bg-slate-900/60 border-white/10 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                Live Presentation Parameters
              </h3>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Nickname</label>
                <Input
                  value={previewName}
                  onChange={(e) => setPreviewName(e.target.value)}
                  className="bg-slate-800 border-white/10 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Permanent Numeric ID</label>
                <Input
                  value={previewUserId}
                  onChange={(e) => setPreviewUserId(e.target.value)}
                  className="bg-slate-800 border-white/10 text-xs font-mono"
                />
              </div>

              <div className="pt-2 border-t border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Official ID Active?</span>
                  <Switch
                    checked={previewIsOfficial}
                    onCheckedChange={setPreviewIsOfficial}
                  />
                </div>

                {previewIsOfficial && (
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">Official Display ID</label>
                    <Input
                      value={previewDisplayId}
                      onChange={(e) => setPreviewDisplayId(e.target.value)}
                      className="bg-slate-800 border-white/10 text-xs font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-white/5">
                <label className="text-xs font-semibold text-slate-400 block mb-1">SVIP Tier</label>
                <select
                  value={previewVipLevel}
                  onChange={(e) => setPreviewVipLevel(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="None">None (Normal User)</option>
                  <option value="VIP 3">VIP 3 Knight</option>
                  <option value="VIP 7">VIP 7 Crown</option>
                  <option value="SVIP 1">SVIP 1 Prince</option>
                  <option value="SVIP 5">SVIP 5 Duke</option>
                  <option value="SVIP 9">SVIP 9 King of Kings</option>
                </select>
              </div>
            </Card>

            {/* Mobile Simulator: Profile Card & Room Seat */}
            <div className="md:col-span-2 space-y-6">
              {/* Profile Card Mockup */}
              <div className="rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    Profile Detail Preview
                  </span>
                </div>

                <div className="flex items-center gap-5">
                  {/* Avatar Frame Mockup */}
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-amber-400/50 flex items-center justify-center font-black text-2xl text-amber-300 shadow-xl shadow-amber-500/20">
                      {previewName ? previewName[0] : 'Y'}
                    </div>
                    {previewVipLevel !== 'None' && (
                      <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 text-[10px] font-black shadow-md">
                        {previewVipLevel}
                      </span>
                    )}
                  </div>

                  {/* Identity Header */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 drop-shadow">
                        {previewName}
                      </span>
                      {previewIsOfficial && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                          👑 OFFICIAL
                        </span>
                      )}
                    </div>

                    {/* Effective ID Presentation */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">ID:</span>
                      <span className="font-mono text-sm font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                        {previewIsOfficial ? previewDisplayId : previewUserId}
                      </span>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-400 hover:text-white">
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1">
                      <span>Level 82 Gifter</span>
                      <span>•</span>
                      <span>Room Admin</span>
                    </div>
                  </div>
                </div>

                {/* Live Room Seat & Chat Simulation */}
                <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Live Room Mic Seat */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col items-center justify-center text-center">
                    <div className="text-[10px] text-slate-500 font-mono mb-2">Live Room Mic Seat</div>
                    <div className="w-14 h-14 rounded-full bg-slate-800 border border-amber-500 flex items-center justify-center text-sm font-bold text-amber-300 relative">
                      {previewName ? previewName[0] : 'Y'}
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border border-slate-950 flex items-center justify-center text-[8px] text-white">
                        🎤
                      </div>
                    </div>
                    <div className="font-bold text-xs text-amber-300 mt-2 truncate max-w-[120px]">
                      {previewName}
                    </div>
                    <div className="text-[9px] font-mono text-slate-400">
                      ID: {previewIsOfficial ? previewDisplayId : previewUserId}
                    </div>
                  </div>

                  {/* In-Room Chat Bubble */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
                    <div className="text-[10px] text-slate-500 font-mono mb-1">Live Room Chat Bubble</div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-white/10">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                        {previewVipLevel !== 'None' && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded">
                            {previewVipLevel}
                          </span>
                        )}
                        <span>{previewName}:</span>
                      </div>
                      <p className="text-xs text-slate-200 mt-1">
                        Welcome to the official Yaro voice party! 🎉
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* =========================================================================
            SECTION 7: AUDIT HISTORY
        ========================================================================= */}
        <TabsContent value="audit_logs" className="space-y-6">
          <Card className="bg-slate-900/60 border-white/10 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/5">
              <div>
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-slate-400" />
                  Identity Audit Trail & History
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">
                  Immutable record of every identity grant, revocation, extension, and asset upload.
                </p>
              </div>

              <select
                value={auditLogActionFilter}
                onChange={(e) => setAuditLogActionFilter(e.target.value)}
                className="bg-slate-800/80 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
              >
                <option value="all">All Actions</option>
                <option value="grant_entitlement">Grant Entitlement</option>
                <option value="revoke_entitlement">Revoke Entitlement</option>
                <option value="extend_entitlement">Extend Entitlement</option>
                <option value="create_effect">Create Effect</option>
                <option value="upload_asset">Upload Asset</option>
              </select>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-950/40">
                  <TableRow className="border-white/5">
                    <TableHead className="text-slate-400 text-xs">Timestamp</TableHead>
                    <TableHead className="text-slate-400 text-xs">Action</TableHead>
                    <TableHead className="text-slate-400 text-xs">Target User</TableHead>
                    <TableHead className="text-slate-400 text-xs">Performed By</TableHead>
                    <TableHead className="text-slate-400 text-xs">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAuditLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-slate-500 text-sm">
                        No audit logs found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAuditLogs.map((log) => (
                      <TableRow key={log._id} className="border-white/5 hover:bg-white/[0.02]">
                        <TableCell className="font-mono text-xs text-slate-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>

                        <TableCell>
                          <Badge className="bg-slate-800 text-slate-300 border-white/10 font-mono text-[10px] uppercase">
                            {log.action.replace('_', ' ')}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <span className="font-mono font-bold text-white text-xs">
                            {log.targetUserId || '—'}
                          </span>
                        </TableCell>

                        <TableCell>
                          <div className="text-xs text-slate-300 font-medium">
                            {log.performedBy?.adminName || 'Admin'}
                          </div>
                          <div className="text-[10px] text-slate-500 uppercase">
                            {log.performedBy?.role || 'Staff'}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-xs font-mono text-slate-400 max-w-sm truncate">
                            {JSON.stringify(log.details)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Grant Official ID Modal */}
      {isOfficialModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsOfficialModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-amber-400" />
              Grant Official Identity
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Assign Official ID. Permanent numeric account ID is permanently preserved and automatically reappears on expiry.
            </p>
            <form onSubmit={handleGrantOfficialId} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Target User</label>
                <Input
                  placeholder="Numeric ID, username, or Mongo ID"
                  value={grantTargetUser}
                  onChange={(e) => setGrantTargetUser(e.target.value)}
                  className="bg-slate-800 border-white/10 text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Display ID</label>
                <Input
                  value={grantDisplayId}
                  onChange={(e) => setGrantDisplayId(e.target.value)}
                  className="bg-slate-800 border-white/10 text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Duration (Days)</label>
                <Input
                  type="number"
                  min={1}
                  value={grantDurationDays}
                  onChange={(e) => setGrantDurationDays(Number(e.target.value))}
                  className="bg-slate-800 border-white/10 text-xs"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOfficialModalOpen(false)}
                  className="flex-1 border-white/10 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                >
                  Grant Official ID
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Name Effect Modal */}
      {isEffectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEffectModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              New Animated Name Effect
            </h2>
            <form onSubmit={handleSaveEffect} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Effect Name</label>
                <Input
                  placeholder="e.g. Imperial Gold Shimmer"
                  value={effectForm.name}
                  onChange={(e) => setEffectForm({ ...effectForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })}
                  className="bg-slate-800 border-white/10 text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Slug</label>
                <Input
                  value={effectForm.slug}
                  onChange={(e) => setEffectForm({ ...effectForm, slug: e.target.value })}
                  className="bg-slate-800 border-white/10 text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Animation Type</label>
                <select
                  value={effectForm.config?.animationType}
                  onChange={(e) => setEffectForm({
                    ...effectForm,
                    config: { ...effectForm.config!, animationType: e.target.value }
                  })}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="gradient_scroll">Gradient Scroll</option>
                  <option value="neon">Neon Glow & Flicker</option>
                  <option value="rainbow">Full Rainbow Cycling</option>
                  <option value="shimmer">Sparkle & Shimmer</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Price (Diamonds)</label>
                <Input
                  type="number"
                  value={effectForm.priceDiamonds}
                  onChange={(e) => setEffectForm({ ...effectForm, priceDiamonds: Number(e.target.value) })}
                  className="bg-slate-800 border-white/10 text-xs"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEffectModalOpen(false)}
                  className="flex-1 border-white/10 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold"
                >
                  Save Effect
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Asset Library Upload Modal */}
      {isAssetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAssetModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
              <FolderOpen className="w-5 h-5 text-pink-400" />
              Register Asset
            </h2>
            <form onSubmit={handleSaveAsset} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Asset Name</label>
                <Input
                  placeholder="e.g. Royal Crown Frame"
                  value={assetForm.name}
                  onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                  className="bg-slate-800 border-white/10 text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">File Format</label>
                <select
                  value={assetForm.fileType}
                  onChange={(e) => setAssetForm({ ...assetForm, fileType: e.target.value })}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="svga">SVGA (Recommended for animations)</option>
                  <option value="webp">Animated WebP</option>
                  <option value="gif">GIF</option>
                  <option value="lottie">Lottie JSON</option>
                  <option value="mp4">MP4 Video</option>
                  <option value="png">Static PNG</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                <select
                  value={assetForm.category}
                  onChange={(e) => setAssetForm({ ...assetForm, category: e.target.value })}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="profile_frame">Profile Frame</option>
                  <option value="entrance_effect">Entrance Effect</option>
                  <option value="chat_bubble">Chat Bubble</option>
                  <option value="badge">Identity Badge</option>
                  <option value="special_id">Special ID Emblem</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">File URL</label>
                <Input
                  placeholder="https://..."
                  value={assetForm.fileUrl}
                  onChange={(e) => setAssetForm({ ...assetForm, fileUrl: e.target.value })}
                  className="bg-slate-800 border-white/10 text-xs"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAssetModalOpen(false)}
                  className="flex-1 border-white/10 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-bold"
                >
                  Register Asset
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
