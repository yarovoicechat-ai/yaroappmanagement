'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Hash, User, Sparkles, Clock, Calendar, CalendarPlus, CalendarMinus,
  ShieldAlert, Trash2, Edit3, Plus, Search, RefreshCw, CheckCircle2,
  XCircle, AlertCircle, Crown, Copy, Check, ExternalLink, ShieldCheck,
  Infinity as InfinityIcon, ChevronLeft, ChevronRight, MoreVertical,
  CheckCircle, ArrowUpRight, ArrowDownRight, Award
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

interface UniqueIdLevel {
  _id: string;
  name: string;
  status: string;
  config?: {
    levelNumber?: number;
    vipLevel?: number;
    badgeName?: string;
    badgeIconUrl?: string;
    animationType?: string;
  };
}

interface UserSummary {
  _id?: string;
  name?: string;
  userName?: string;
  image?: string;
  userId?: number;
  email?: string;
}

interface UniqueIdEntitlement {
  _id: string;
  userId: number;
  userObjectId?: UserSummary;
  type: string;
  config: {
    displayId: string;
    vipLevel?: number;
    badgeName?: string;
    badgeIconUrl?: string;
  };
  badgeEntitlement?: {
    config?: {
      badgeName?: string;
      badgeIconUrl?: string;
      animationType?: string;
      vipLevel?: number;
    };
  };
  startsAt: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'revoked';
  grantSource?: string;
  grantReason?: string;
  notes?: string;
  grantedBy?: {
    adminName?: string;
    role?: string;
  };
  createdAt?: string;
}

export default function UserUniqueIdsPage() {
  const [entitlements, setEntitlements] = useState<UniqueIdEntitlement[]>([]);
  const [levels, setLevels] = useState<UniqueIdLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'revoked'>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 25;

  // Counts for KPIs
  const [stats, setStats] = useState({ total: 0, active: 0, expired: 0, revoked: 0 });

  // Modals state
  const [isGrantOpen, setIsGrantOpen] = useState(false);
  const [isValidityOpen, setIsValidityOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<UniqueIdEntitlement | null>(null);

  // Validity Modal Form State
  const [validityMode, setValidityMode] = useState<'quick' | 'date' | 'permanent'>('quick');
  const [daysDelta, setDaysDelta] = useState<number>(30);
  const [customExpiresAt, setCustomExpiresAt] = useState<string>('');
  const [validityReason, setValidityReason] = useState<string>('');
  const [isSubmittingValidity, setIsSubmittingValidity] = useState(false);

  // Remove Modal State
  const [deletePermanently, setDeletePermanently] = useState(false);
  const [removeReason, setRemoveReason] = useState('');
  const [isSubmittingRemove, setIsSubmittingRemove] = useState(false);

  // Edit Modal State
  const [editDisplayId, setEditDisplayId] = useState('');
  const [editLevelId, setEditLevelId] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Grant Modal State
  const [userQuery, setUserQuery] = useState('');
  const [foundUser, setFoundUser] = useState<UserSummary | null>(null);
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const [grantDisplayId, setGrantDisplayId] = useState('');
  const [grantLevelId, setGrantLevelId] = useState('');
  const [grantDuration, setGrantDuration] = useState<number | 'permanent'>(30);
  const [grantReason, setGrantReason] = useState('Granted by administrator');
  const [grantNotes, setGrantNotes] = useState('');
  const [isSubmittingGrant, setIsSubmittingGrant] = useState(false);

  // Clipboard helper
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copyToClipboard = (text: string, id: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success(`Copied: ${text}`);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Load levels
  const loadLevels = useCallback(async () => {
    try {
      const res = await apiClient.get<any>('/api/identity/admin/unique-id-levels');
      if (res.data?.levels) {
        setLevels(res.data.levels);
        if (!grantLevelId && res.data.levels.length > 0) {
          setGrantLevelId(res.data.levels[0]._id);
        }
      }
    } catch {
      // ignore
    }
  }, [grantLevelId]);

  // Load data
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        status: statusFilter,
      });
      if (debouncedSearch) params.append('search', debouncedSearch);

      const res = await apiClient.get<any>(`/api/identity/admin/unique-ids?${params.toString()}`);
      if (res.data) {
        setEntitlements(res.data.entitlements || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }

      // Also get overall counts when on page 1 with no search filter
      if (!debouncedSearch && page === 1 && statusFilter === 'all') {
        const [activeRes, expiredRes, revokedRes] = await Promise.all([
          apiClient.get<any>('/api/identity/admin/unique-ids?status=active&limit=1'),
          apiClient.get<any>('/api/identity/admin/unique-ids?status=expired&limit=1'),
          apiClient.get<any>('/api/identity/admin/unique-ids?status=revoked&limit=1'),
        ]);
        setStats({
          total: res.data?.total || 0,
          active: activeRes.data?.total || 0,
          expired: expiredRes.data?.total || 0,
          revoked: revokedRes.data?.total || 0,
        });
      }
    } catch (error: any) {
      toast.error(error?.message || 'Could not load User Unique IDs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [debouncedSearch, page, statusFilter]);

  useEffect(() => {
    void loadLevels();
  }, [loadLevels]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Live User Lookup for Grant Modal
  useEffect(() => {
    if (!userQuery.trim()) {
      setFoundUser(null);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingUser(true);
      try {
        const res = await apiClient.get<any>(`/api/identity/search?q=${encodeURIComponent(userQuery.trim())}`);
        const userList = res.data?.users || [];
        if (userList.length > 0) {
          const u = userList[0];
          setFoundUser({
            _id: u._id,
            userId: u.userId,
            name: u.name,
            userName: u.userName,
            image: u.image || u.avatar,
            email: u.email,
          });
        } else {
          setFoundUser(null);
        }
      } catch {
        setFoundUser(null);
      } finally {
        setIsSearchingUser(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [userQuery]);

  // Open Validity Modal
  const openValidityModal = (item: UniqueIdEntitlement) => {
    setSelectedItem(item);
    setValidityMode('quick');
    setDaysDelta(30);
    const exp = new Date(item.expiresAt);
    if (!isNaN(exp.getTime())) {
      const pad = (n: number) => String(n).padStart(2, '0');
      const yyyy = exp.getFullYear();
      const mm = pad(exp.getMonth() + 1);
      const dd = pad(exp.getDate());
      const hh = pad(exp.getHours());
      const min = pad(exp.getMinutes());
      setCustomExpiresAt(`${yyyy}-${mm}-${dd}T${hh}:${min}`);
    } else {
      setCustomExpiresAt('');
    }
    setValidityReason('Admin validity adjustment');
    setIsValidityOpen(true);
  };

  // Submit Validity Change
  const handleSaveValidity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setIsSubmittingValidity(true);
    try {
      const payload: any = { reason: validityReason.trim() || 'Admin validity adjustment' };
      if (validityMode === 'permanent') {
        payload.isPermanent = true;
      } else if (validityMode === 'date') {
        if (!customExpiresAt) {
          toast.error('Please select an expiration date');
          setIsSubmittingValidity(false);
          return;
        }
        payload.newExpiresAt = new Date(customExpiresAt).toISOString();
      } else {
        if (!daysDelta || isNaN(daysDelta)) {
          toast.error('Please specify valid days to add or deduct');
          setIsSubmittingValidity(false);
          return;
        }
        payload.daysDelta = Number(daysDelta);
      }

      const res = await apiClient.post<any>(`/api/identity/admin/unique-ids/${selectedItem.userId}/validity`, payload);
      toast.success(res.message || 'Validity updated successfully!');
      setIsValidityOpen(false);
      void loadData(true);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to adjust validity');
    } finally {
      setIsSubmittingValidity(false);
    }
  };

  // Quick Delta One-Click Action
  const handleQuickDelta = async (item: UniqueIdEntitlement, delta: number) => {
    try {
      const label = delta > 0 ? `+${delta} days` : `${delta} days`;
      const res = await apiClient.post<any>(`/api/identity/admin/unique-ids/${item.userId}/validity`, {
        daysDelta: delta,
        reason: `Quick ${label} adjustment`,
      });
      toast.success(`ID ${item.config.displayId} adjusted by ${label}`);
      void loadData(true);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to adjust validity');
    }
  };

  // Open Remove Modal
  const openRemoveModal = (item: UniqueIdEntitlement) => {
    setSelectedItem(item);
    setDeletePermanently(false);
    setRemoveReason('Removed by administrator');
    setIsRemoveOpen(true);
  };

  // Submit Remove / Revoke
  const handleRemove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setIsSubmittingRemove(true);
    try {
      if (deletePermanently) {
        const queryParams = new URLSearchParams({
          deletePermanently: 'true',
          reason: removeReason.trim() || 'Deleted permanently by admin',
        });
        await apiClient.delete<any>(`/api/identity/admin/unique-ids/${selectedItem.userId}/remove?${queryParams.toString()}`);
        toast.success(`Unique ID ${selectedItem.config.displayId} permanently deleted`);
      } else {
        await apiClient.post<any>(`/api/identity/admin/unique-ids/${selectedItem.userId}/revoke`, {
          reason: removeReason.trim() || 'Revoked by admin',
        });
        toast.success(`Unique ID ${selectedItem.config.displayId} revoked successfully`);
      }

      setIsRemoveOpen(false);
      void loadData(true);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to remove Unique ID');
    } finally {
      setIsSubmittingRemove(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (item: UniqueIdEntitlement) => {
    setSelectedItem(item);
    setEditDisplayId(item.config?.displayId || '');
    setEditNotes(item.notes || '');
    const currentBadge = item.badgeEntitlement?.config?.badgeName;
    const match = levels.find((l) => l.name === currentBadge || l.config?.badgeName === currentBadge);
    setEditLevelId(match?._id || levels[0]?._id || '');
    setIsEditOpen(true);
  };

  // Submit Edit Details
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const cleanId = editDisplayId.trim().toUpperCase();
    if (!cleanId) {
      toast.error('Unique ID cannot be empty');
      return;
    }

    setIsSubmittingEdit(true);
    try {
      await apiClient.patch<any>(`/api/identity/admin/unique-ids/${selectedItem.userId}`, {
        displayId: cleanId,
        uniqueLevelId: editLevelId || undefined,
        notes: editNotes.trim(),
      });
      toast.success('Unique ID details updated successfully');
      setIsEditOpen(false);
      void loadData(true);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update details');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Submit Grant
  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundUser && !userQuery.trim()) {
      toast.error('Please specify a target user (User ID or Username)');
      return;
    }
    const cleanId = grantDisplayId.trim().toUpperCase();
    if (!cleanId) {
      toast.error('Enter a valid Unique ID (e.g. 777, VIP01)');
      return;
    }
    if (!grantLevelId) {
      toast.error('Please select a Unique ID level / badge');
      return;
    }

    setIsSubmittingGrant(true);
    try {
      const days = grantDuration === 'permanent' ? 36500 : Number(grantDuration);
      const res = await apiClient.post<any>('/api/identity/admin/unique-ids/grant', {
        userIdentifier: foundUser?.userId || userQuery.trim(),
        displayId: cleanId,
        uniqueLevelId: grantLevelId,
        durationDays: days,
        reason: grantReason.trim() || 'Admin Grant',
        notes: grantNotes.trim(),
      });

      toast.success(res.message || `Unique ID ${cleanId} granted successfully!`);
      setIsGrantOpen(false);
      // Reset form
      setUserQuery('');
      setFoundUser(null);
      setGrantDisplayId('');
      setGrantNotes('');
      void loadData(true);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to grant unique ID');
    } finally {
      setIsSubmittingGrant(false);
    }
  };

  // Helper: Format dates
  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return 'N/A';
      if (d.getFullYear() > 2090) return 'Permanent (Lifetime)';
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  // Helper: Days remaining badge
  const getRemainingTimeBadge = (expiresAt: string, status: string) => {
    if (status === 'revoked') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
          <XCircle className="w-3 h-3" /> Revoked
        </span>
      );
    }

    const exp = new Date(expiresAt);
    if (isNaN(exp.getTime())) return null;

    if (exp.getFullYear() > 2090) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
          <InfinityIcon className="w-3 h-3" /> Permanent
        </span>
      );
    }

    const now = new Date();
    const diffMs = exp.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0 || status === 'expired') {
      const ago = Math.abs(diffDays);
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
          <Clock className="w-3 h-3" /> {ago === 0 ? 'Expired today' : `Expired ${ago}d ago`}
        </span>
      );
    }

    if (diffDays <= 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
          <Clock className="w-3 h-3" /> {diffDays} {diffDays === 1 ? 'day' : 'days'} left
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        <CheckCircle2 className="w-3 h-3" /> {diffDays} days left
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400">
              <Hash className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                User Unique ID Studio
                <Badge variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-500/10 text-xs">
                  Identity Master
                </Badge>
              </h1>
              <p className="text-sm text-slate-400">
                Manage user assigned vanity IDs, increase or reduce validity duration, revoke, or assign VIP IDs.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadData(true)}
            disabled={refreshing}
            className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            onClick={() => setIsGrantOpen(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-lg shadow-amber-500/20 border-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Grant Unique ID to User
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-sm shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
              Total Assigned
              <Hash className="w-4 h-4 text-slate-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-white">{stats.total || total}</div>
            <p className="text-xs text-slate-500 mt-1">Vanity IDs across all users</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-sm shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-emerald-400 font-semibold flex items-center justify-between">
              Active IDs
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-emerald-400">{stats.active}</div>
            <p className="text-xs text-slate-500 mt-1">Currently live on user profiles</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-sm shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-amber-400 font-semibold flex items-center justify-between">
              Expired
              <Clock className="w-4 h-4 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-amber-400">{stats.expired}</div>
            <p className="text-xs text-slate-500 mt-1">Can be re-activated with +Days</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-sm shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-rose-400 font-semibold flex items-center justify-between">
              Revoked / Removed
              <ShieldAlert className="w-4 h-4 text-rose-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-rose-400">{stats.revoked}</div>
            <p className="text-xs text-slate-500 mt-1">Reverted to permanent numeric ID</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-slate-900/70 border-slate-800/80 backdrop-blur-md">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search by User ID, Name, Username or Unique ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-950/80 border-slate-700/80 text-white placeholder-slate-500 focus:border-amber-500/80 text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => { setStatusFilter('all'); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              All Unique IDs
            </button>
            <button
              onClick={() => { setStatusFilter('active'); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'active'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              Active Only
            </button>
            <button
              onClick={() => { setStatusFilter('expired'); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'expired'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              Expired
            </button>
            <button
              onClick={() => { setStatusFilter('revoked'); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'revoked'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              Revoked
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/70 border-b border-slate-800/80 text-xs uppercase tracking-wider text-slate-400 font-semibold">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Assigned Unique ID</th>
                <th className="py-3.5 px-4">Level & Badge</th>
                <th className="py-3.5 px-4">Validity & Expiration</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                    Loading User Unique IDs...
                  </td>
                </tr>
              ) : entitlements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                        <Hash className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-semibold text-white">No Unique IDs Found</h3>
                      <p className="text-xs text-slate-400">
                        {debouncedSearch
                          ? `No results match "${debouncedSearch}". Try a different search query.`
                          : 'No user unique IDs found in this category. Click below to grant one.'}
                      </p>
                      <Button
                        size="sm"
                        onClick={() => setIsGrantOpen(true)}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold"
                      >
                        <Plus className="w-4 h-4 mr-1.5" /> Grant New Unique ID
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                entitlements.map((item) => {
                  const userObj = item.userObjectId;
                  const displayId = item.config?.displayId || 'UNKNOWN';
                  const badgeInfo = item.badgeEntitlement?.config;

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* User Column */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {userObj?.image ? (
                            <img
                              src={userObj.image}
                              alt={userObj.name || String(item.userId)}
                              className="w-10 h-10 rounded-full object-cover border border-slate-700"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-800 flex items-center justify-center font-bold text-slate-300 border border-slate-700">
                              {(userObj?.name || String(item.userId)).charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              {userObj?.name || 'User'}
                              {userObj?.userName && (
                                <span className="text-xs text-slate-400 font-normal">
                                  @{userObj.userName}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-xs text-slate-400 font-mono">
                                Perm: #{item.userId}
                              </span>
                              <button
                                onClick={() => copyToClipboard(String(item.userId), `perm-${item._id}`)}
                                title="Copy permanent User ID"
                                className="text-slate-500 hover:text-slate-300 transition-colors"
                              >
                                {copiedId === `perm-${item._id}` ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Assigned Unique ID Column */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-600/20 border border-amber-500/40 text-amber-300 font-mono font-bold tracking-wider text-sm flex items-center gap-1.5 shadow-sm">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            {displayId}
                          </div>
                          <button
                            onClick={() => copyToClipboard(displayId, `id-${item._id}`)}
                            title="Copy Unique ID"
                            className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300"
                          >
                            {copiedId === `id-${item._id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Level & Badge */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {badgeInfo?.badgeIconUrl ? (
                            <img
                              src={badgeInfo.badgeIconUrl}
                              alt="badge"
                              className="w-7 h-7 object-contain drop-shadow"
                            />
                          ) : (
                            <Crown className="w-5 h-5 text-amber-400" />
                          )}
                          <div>
                            <div className="text-xs font-semibold text-slate-200">
                              {badgeInfo?.badgeName || 'VIP ID'}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Level {badgeInfo?.vipLevel || item.config?.vipLevel || 1}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Validity & Expiry Column */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div>{getRemainingTimeBadge(item.expiresAt, item.status)}</div>
                          <div className="text-xs text-slate-400 font-mono">
                            Exp: {formatDate(item.expiresAt)}
                          </div>
                          {item.grantReason && (
                            <div className="text-[11px] text-slate-500 truncate max-w-xs">
                              Reason: {item.grantReason}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="py-3 px-4">
                        {item.status === 'active' && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            Active
                          </span>
                        )}
                        {item.status === 'expired' && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                            <span className="w-2 h-2 rounded-full bg-zinc-500" />
                            Expired
                          </span>
                        )}
                        {item.status === 'revoked' && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            Revoked
                          </span>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Increase (+30d) button */}
                          <Button
                            size="sm"
                            variant="outline"
                            title="Quick add +30 days"
                            onClick={() => handleQuickDelta(item, 30)}
                            className="h-8 px-2.5 text-xs bg-slate-900/90 border-slate-700 hover:bg-emerald-950/40 hover:border-emerald-500/60 hover:text-emerald-300 text-slate-300"
                          >
                            <CalendarPlus className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                            +30d
                          </Button>

                          {/* Quick Decrease (-7d) button */}
                          <Button
                            size="sm"
                            variant="outline"
                            title="Quick deduct -7 days"
                            onClick={() => handleQuickDelta(item, -7)}
                            className="h-8 px-2 text-xs bg-slate-900/90 border-slate-700 hover:bg-amber-950/40 hover:border-amber-500/60 hover:text-amber-300 text-slate-300"
                          >
                            <CalendarMinus className="w-3.5 h-3.5 mr-1 text-amber-400" />
                            -7d
                          </Button>

                          {/* Full Validity Adjust Modal Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            title="Adjust validity (badha / ghata / set date)"
                            onClick={() => openValidityModal(item)}
                            className="h-8 px-2.5 text-xs bg-slate-900/90 border-slate-700 hover:bg-indigo-950/40 hover:border-indigo-500/60 hover:text-indigo-300 text-slate-300"
                          >
                            <Clock className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                            Validity
                          </Button>

                          {/* Edit Details Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            title="Edit Display ID & Badge"
                            onClick={() => openEditModal(item)}
                            className="h-8 w-8 p-0 border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>

                          {/* Remove / Revoke Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            title="Remove or Revoke Unique ID"
                            onClick={() => openRemoveModal(item)}
                            className="h-8 w-8 p-0 border-slate-700 bg-slate-900/90 hover:bg-rose-950/40 hover:border-rose-500/60 hover:text-rose-400 text-slate-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/50 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 px-2.5 text-xs border-slate-700 bg-slate-900 text-slate-300 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Prev
              </Button>
              <span className="font-semibold text-white px-2">
                Page {page} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 px-2.5 text-xs border-slate-700 bg-slate-900 text-slate-300 disabled:opacity-40"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* =========================================================================
          MODAL 1: ADJUST VALIDITY (BADHA / GHATA / SET DATE)
      ========================================================================= */}
      {isValidityOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Adjust ID Validity</h3>
                  <p className="text-xs text-slate-400">
                    Increase or decrease validity duration for ID #{selectedItem.config?.displayId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsValidityOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Target User & ID Card */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Target User</div>
                <div className="text-sm font-bold text-white">
                  {selectedItem.userObjectId?.name || `User #${selectedItem.userId}`}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  Permanent ID: #{selectedItem.userId}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Unique ID</div>
                <div className="text-base font-extrabold text-amber-400 font-mono">
                  {selectedItem.config?.displayId}
                </div>
                <div className="text-xs text-slate-400">
                  Exp: {formatDate(selectedItem.expiresAt)}
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveValidity} className="space-y-4">
              {/* Mode Switcher */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setValidityMode('quick')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                    validityMode === 'quick'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  +/- Days Delta
                </button>
                <button
                  type="button"
                  onClick={() => setValidityMode('date')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                    validityMode === 'date'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Specific Date
                </button>
                <button
                  type="button"
                  onClick={() => setValidityMode('permanent')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                    validityMode === 'permanent'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Permanent
                </button>
              </div>

              {/* MODE 1: DAYS DELTA (+ / -) */}
              {validityMode === 'quick' && (
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Choose Days to Add (+) or Deduct (-)
                  </label>
                  {/* Preset quick buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setDaysDelta(7)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                        daysDelta === 7
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-800/80 text-emerald-400 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      +7 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => setDaysDelta(30)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                        daysDelta === 30
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-800/80 text-emerald-400 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      +30 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => setDaysDelta(90)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                        daysDelta === 90
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-800/80 text-emerald-400 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      +90 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => setDaysDelta(365)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                        daysDelta === 365
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-800/80 text-emerald-400 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      +1 Year
                    </button>

                    <button
                      type="button"
                      onClick={() => setDaysDelta(-1)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                        daysDelta === -1
                          ? 'bg-rose-500 text-white border-rose-400'
                          : 'bg-slate-800/80 text-rose-400 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      -1 Day
                    </button>
                    <button
                      type="button"
                      onClick={() => setDaysDelta(-7)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                        daysDelta === -7
                          ? 'bg-rose-500 text-white border-rose-400'
                          : 'bg-slate-800/80 text-rose-400 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      -7 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => setDaysDelta(-30)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                        daysDelta === -30
                          ? 'bg-rose-500 text-white border-rose-400'
                          : 'bg-slate-800/80 text-rose-400 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      -30 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => setDaysDelta(-60)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                        daysDelta === -60
                          ? 'bg-rose-500 text-white border-rose-400'
                          : 'bg-slate-800/80 text-rose-400 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      -60 Days
                    </button>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Or Type Custom Days (Positive to add, Negative to deduct):
                    </label>
                    <Input
                      type="number"
                      value={daysDelta}
                      onChange={(e) => setDaysDelta(Number(e.target.value))}
                      placeholder="e.g. 15 or -5"
                      className="bg-slate-950 border-slate-700 text-white font-mono"
                    />
                  </div>
                </div>
              )}

              {/* MODE 2: SPECIFIC DATE */}
              {validityMode === 'date' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Choose Exact Expiration Date & Time:
                  </label>
                  <Input
                    type="datetime-local"
                    value={customExpiresAt}
                    onChange={(e) => setCustomExpiresAt(e.target.value)}
                    className="bg-slate-950 border-slate-700 text-white font-mono"
                  />
                  <p className="text-[11px] text-slate-400">
                    If selected date is in the future, the unique ID will immediately become active.
                  </p>
                </div>
              )}

              {/* MODE 3: PERMANENT */}
              {validityMode === 'permanent' && (
                <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2 text-center">
                  <InfinityIcon className="w-8 h-8 text-purple-400 mx-auto" />
                  <div className="text-sm font-bold text-purple-300">
                    Permanent / Lifetime Unique ID
                  </div>
                  <p className="text-xs text-slate-300">
                    This user's vanity ID will never expire. Expiration date will be set to year 2125+.
                  </p>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Reason for Adjustment:
                </label>
                <Input
                  type="text"
                  value={validityReason}
                  onChange={(e) => setValidityReason(e.target.value)}
                  placeholder="e.g. Compensation for downtime, Top gifter reward, etc."
                  className="bg-slate-950 border-slate-700 text-white text-sm"
                />
              </div>

              {/* Footer buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsValidityOpen(false)}
                  className="border-slate-700 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingValidity}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  {isSubmittingValidity ? 'Saving...' : 'Apply Validity'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: REMOVE / REVOKE UNIQUE ID
      ========================================================================= */}
      {isRemoveOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Remove Unique ID</h3>
                <p className="text-xs text-slate-400">
                  ID: <span className="text-amber-400 font-mono font-bold">{selectedItem.config?.displayId}</span> from user #{selectedItem.userId}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs text-rose-200 space-y-1">
              <p className="font-semibold">⚠️ Real-time Reversion Notice:</p>
              <p>
                Removing this vanity ID will immediately revert the user back to their permanent numeric user ID (<strong>#{selectedItem.userId}</strong>) across the app, voice rooms, and chat.
              </p>
            </div>

            <form onSubmit={handleRemove} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">Removal Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeletePermanently(false)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      !deletePermanently
                        ? 'bg-rose-950/40 border-rose-500/60 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Soft Revoke
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Sets status to revoked, retains audit logs
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletePermanently(true)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      deletePermanently
                        ? 'bg-rose-950/60 border-rose-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1.5 text-rose-400">
                      <Trash2 className="w-3.5 h-3.5" /> Hard Delete
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Completely deletes the entitlement record
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Reason for Removal:
                </label>
                <Input
                  type="text"
                  value={removeReason}
                  onChange={(e) => setRemoveReason(e.target.value)}
                  placeholder="e.g. Inappropriate ID, Admin policy violation, User requested"
                  className="bg-slate-950 border-slate-700 text-white text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRemoveOpen(false)}
                  className="border-slate-700 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingRemove}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                >
                  {isSubmittingRemove ? 'Removing...' : deletePermanently ? 'Delete Permanently' : 'Revoke Unique ID'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: EDIT UNIQUE ID DETAILS
      ========================================================================= */}
      {isEditOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Edit Unique ID</h3>
                  <p className="text-xs text-slate-400">
                    Update display ID string or assigned VIP level badge
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Unique Display ID:
                </label>
                <Input
                  type="text"
                  value={editDisplayId}
                  onChange={(e) => setEditDisplayId(e.target.value.toUpperCase())}
                  placeholder="e.g. 777, ROYAL, VIP01"
                  className="bg-slate-950 border-slate-700 text-amber-400 font-mono font-bold text-base"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  3–12 uppercase letters or numbers. Cannot collide with existing user IDs.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Select VIP Level / Badge:
                </label>
                <select
                  value={editLevelId}
                  onChange={(e) => setEditLevelId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm focus:border-amber-500"
                >
                  <option value="">Keep Existing Badge</option>
                  {levels.map((lvl) => (
                    <option key={lvl._id} value={lvl._id}>
                      {lvl.name} (Level {lvl.config?.levelNumber || lvl.config?.vipLevel || 1})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Admin Notes:
                </label>
                <Input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Internal notes regarding this ID"
                  className="bg-slate-950 border-slate-700 text-white text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  className="border-slate-700 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold"
                >
                  {isSubmittingEdit ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: GRANT UNIQUE ID TO ANY USER
      ========================================================================= */}
      {isGrantOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Grant Unique ID</h3>
                  <p className="text-xs text-slate-400">
                    Assign a custom vanity ID with animated VIP badge to any user
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsGrantOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGrant} className="space-y-4">
              {/* User Lookup */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  1. Find Target User (Numeric ID or Username):
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="text"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Enter user numeric ID (e.g. 1000000002) or username..."
                    className="pl-9 bg-slate-950 border-slate-700 text-white text-sm"
                  />
                  {isSearchingUser && (
                    <RefreshCw className="w-4 h-4 text-amber-500 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>

                {/* Found user card */}
                {foundUser && (
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-950/80 border border-emerald-500/40 flex items-center justify-between animate-in fade-in">
                    <div className="flex items-center gap-3">
                      {foundUser.image ? (
                        <img
                          src={foundUser.image}
                          alt="avatar"
                          className="w-10 h-10 rounded-full object-cover border border-emerald-500/40"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                          {(foundUser.name || 'U').charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-1.5">
                          {foundUser.name}
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="text-xs text-slate-400">
                          @{foundUser.userName || 'user'} • Perm ID: #{foundUser.userId}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-xs">
                      Confirmed
                    </Badge>
                  </div>
                )}
                {!foundUser && userQuery.trim().length > 2 && !isSearchingUser && (
                  <p className="text-xs text-amber-400 mt-1">
                    No matching user found. Check numeric ID or username.
                  </p>
                )}
              </div>

              {/* Unique ID Input */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  2. Unique ID String (Vanity ID):
                </label>
                <Input
                  type="text"
                  value={grantDisplayId}
                  onChange={(e) => setGrantDisplayId(e.target.value.toUpperCase())}
                  placeholder="e.g. 777, VIP88, KING"
                  className="bg-slate-950 border-slate-700 text-amber-400 font-mono font-bold text-lg"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  3–12 uppercase letters or numbers.
                </p>
              </div>

              {/* Select Level */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  3. Select Unique ID Level / VIP Badge:
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-950 rounded-xl border border-slate-800">
                  {levels.map((lvl) => {
                    const isSelected = grantLevelId === lvl._id;
                    return (
                      <button
                        key={lvl._id}
                        type="button"
                        onClick={() => setGrantLevelId(lvl._id)}
                        className={`p-2.5 rounded-lg border text-left flex items-center gap-2.5 transition-all ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500/60 text-white shadow-sm'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {lvl.config?.badgeIconUrl ? (
                          <img
                            src={lvl.config.badgeIconUrl}
                            alt="badge"
                            className="w-7 h-7 object-contain"
                          />
                        ) : (
                          <Crown className="w-5 h-5 text-amber-400" />
                        )}
                        <div className="truncate">
                          <div className="text-xs font-bold text-white truncate">
                            {lvl.name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Level {lvl.config?.levelNumber || lvl.config?.vipLevel || 1}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duration Presets */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  4. Validity Duration:
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { label: '30 Days', val: 30 },
                    { label: '90 Days', val: 90 },
                    { label: '180 Days', val: 180 },
                    { label: '1 Year', val: 365 },
                    { label: 'Permanent', val: 'permanent' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setGrantDuration(preset.val as any)}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                        grantDuration === preset.val
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Grant Reason:
                </label>
                <Input
                  type="text"
                  value={grantReason}
                  onChange={(e) => setGrantReason(e.target.value)}
                  placeholder="e.g. Special Contributor reward, Event winner, Staff grant"
                  className="bg-slate-950 border-slate-700 text-white text-sm"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Optional Admin Notes:
                </label>
                <Input
                  type="text"
                  value={grantNotes}
                  onChange={(e) => setGrantNotes(e.target.value)}
                  placeholder="Internal audit notes"
                  className="bg-slate-950 border-slate-700 text-white text-sm"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsGrantOpen(false)}
                  className="border-slate-700 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingGrant}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold"
                >
                  {isSubmittingGrant ? 'Granting...' : 'Confirm & Grant ID'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
