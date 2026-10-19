'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Diamond,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Search,
  Sparkles,
  Award,
  Crown,
  Check,
  X,
  Gift,
  UploadCloud,
  ChevronRight,
  Clock,
  Image as ImageIcon,
  Shield,
  Layers,
  Palette,
  Eye,
  FileCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

export interface RewardItemConfig {
  enabled: boolean;
  name: string;
  url?: string;
  animationUrl?: string;
  days: number; // 0 = permanent, or 7, 15, 30, etc.
  itemId?: string; // If selected from store/catalog
  itemSource: 'upload' | 'catalog';
  uniqueDisplayId?: string;
}

export interface WealthLevelItem {
  _id?: string;
  level: number;
  name: string;
  diamondsRequired: number;
  levelTag?: string; // Optional level tag
  levelBadge?: string; // Optional level badge icon/url
  badgeColor?: string;
  perks?: string[];

  // 9 Configurable Rewards
  frameReward?: RewardItemConfig;
  entryReward?: RewardItemConfig;
  badgeReward?: RewardItemConfig;
  tagReward?: RewardItemConfig;
  uniqueIdReward?: RewardItemConfig;
  tasselReward?: RewardItemConfig;
  profileBorderReward?: RewardItemConfig;
  customThemeReward?: RewardItemConfig;
  coverBannerReward?: RewardItemConfig;

  isActive?: boolean;
}

interface StoreCatalogItem {
  _id: string;
  name: string;
  category: string;
  imageUrl?: string;
  animationUrl?: string;
  price?: number;
  previewColor?: string;
}

const DEFAULT_REWARD: RewardItemConfig = {
  enabled: false,
  name: '',
  url: '',
  animationUrl: '',
  days: 30,
  itemSource: 'upload',
};

const DEFAULT_WEALTH_LEVELS: WealthLevelItem[] = Array.from({ length: 20 }, (_, i) => {
  const lvl = i + 1;
  const diamonds = Math.round(Math.pow(lvl, 2.2) * 500);
  let badge = '🥉 Bronze';
  let badgeColor = '#CD7F32';
  if (lvl >= 15) {
    badge = '👑 Supreme Monarch';
    badgeColor = '#F59E0B';
  } else if (lvl >= 10) {
    badge = '💎 Diamond Overlord';
    badgeColor = '#06B6D4';
  } else if (lvl >= 5) {
    badge = '🥈 Silver Baron';
    badgeColor = '#94A3B8';
  }

  return {
    _id: `wealth_${lvl}`,
    level: lvl,
    name: `Wealth Level ${lvl}`,
    diamondsRequired: diamonds,
    levelTag: lvl >= 10 ? `👑 VIP ${lvl}` : `Level ${lvl}`,
    levelBadge: badge,
    badgeColor,
    perks: [
      `Level ${lvl} Wealth Badge`,
      `Exclusive Chat Name Glow`,
      lvl >= 5 ? 'Custom Enter Room Audio' : 'Standard Broadcast',
    ],
    frameReward: {
      enabled: lvl % 5 === 0,
      name: `Wealth Crown Frame Lv.${lvl}`,
      days: 30,
      itemSource: 'upload',
      url: '',
    },
    entryReward: {
      enabled: lvl >= 10,
      name: `Royal Entry Effect Lv.${lvl}`,
      days: 30,
      itemSource: 'upload',
      url: '',
    },
    badgeReward: {
      enabled: true,
      name: `Wealth Lv.${lvl} Badge`,
      days: 0,
      itemSource: 'upload',
      url: '',
    },
    tagReward: {
      enabled: lvl >= 5,
      name: `Wealth Lv.${lvl} Tag`,
      days: 30,
      itemSource: 'upload',
      url: '',
    },
    uniqueIdReward: {
      enabled: lvl >= 20,
      name: `VIP Vanity ID Lv.${lvl}`,
      days: 30,
      itemSource: 'upload',
      uniqueDisplayId: '',
    },
    tasselReward: {
      enabled: lvl >= 15,
      name: `Golden Tassel Lv.${lvl}`,
      days: 30,
      itemSource: 'upload',
      url: '',
    },
    profileBorderReward: {
      enabled: lvl >= 10,
      name: `Profile Glow Border Lv.${lvl}`,
      days: 30,
      itemSource: 'upload',
      url: '',
    },
    customThemeReward: {
      enabled: lvl >= 25,
      name: `Monarch Room Theme Lv.${lvl}`,
      days: 30,
      itemSource: 'upload',
      url: '',
    },
    coverBannerReward: {
      enabled: lvl >= 15,
      name: `Profile Card Cover Banner Lv.${lvl}`,
      days: 30,
      itemSource: 'upload',
      url: '',
    },
  };
});

const REWARD_TYPES = [
  { key: 'frameReward', label: 'Frame (Avatar Border)', icon: Crown, storeCategory: 'Frames', placeholder: 'Dragon Gold Frame' },
  { key: 'entryReward', label: 'Room Entry Effect', icon: Sparkles, storeCategory: 'Entrance', placeholder: 'Golden Phoenix Entry' },
  { key: 'badgeReward', label: 'Wealth Badge', icon: Award, storeCategory: 'Badge', placeholder: 'Sovereign Gifter Badge' },
  { key: 'tagReward', label: 'Level Tag / Nickname Tag', icon: Shield, storeCategory: 'Tag', placeholder: 'Royal Tycoon Tag' },
  { key: 'uniqueIdReward', label: 'Unique / Vanity ID', icon: Diamond, storeCategory: 'Unique ID', placeholder: '888888' },
  { key: 'tasselReward', label: 'Seat Tassel / Pendant', icon: Layers, storeCategory: 'Tassel', placeholder: 'Jade Dragon Tassel' },
  { key: 'profileBorderReward', label: 'Profile Page Border', icon: Palette, storeCategory: 'Profile Border', placeholder: 'Glow Neon Border' },
  { key: 'customThemeReward', label: 'Custom Room Theme', icon: ImageIcon, storeCategory: 'Theme', placeholder: 'Cosmic Palace Theme' },
  { key: 'coverBannerReward', label: 'Profile Card Cover Banner', icon: FileCheck, storeCategory: 'Profile Card', placeholder: 'Grand Sovereign Banner' },
] as const;

export default function WealthLevelsPage() {
  const [levels, setLevels] = useState<WealthLevelItem[]>(DEFAULT_WEALTH_LEVELS);
  const [catalogItems, setCatalogItems] = useState<StoreCatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Edit / Add Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WealthLevelItem | null>(null);
  const [activeRewardTab, setActiveRewardTab] = useState<string>('frameReward');

  const [formData, setFormData] = useState<WealthLevelItem>({
    level: 1,
    name: 'Wealth Level 1',
    diamondsRequired: 1000,
    levelTag: '',
    levelBadge: '',
    badgeColor: '#F59E0B',
    perks: ['Wealth Lv.1 Badge'],
    frameReward: { ...DEFAULT_REWARD },
    entryReward: { ...DEFAULT_REWARD },
    badgeReward: { ...DEFAULT_REWARD },
    tagReward: { ...DEFAULT_REWARD },
    uniqueIdReward: { ...DEFAULT_REWARD },
    tasselReward: { ...DEFAULT_REWARD },
    profileBorderReward: { ...DEFAULT_REWARD },
    customThemeReward: { ...DEFAULT_REWARD },
    coverBannerReward: { ...DEFAULT_REWARD },
  });

  const fetchWealthLevels = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/levels/wealth').catch(() => null);
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setLevels(res.data);
      } else {
        // Fallback to store levels endpoint
        const storeRes = await apiClient.get('/api/store/levels', { type: 'wealth' }).catch(() => null);
        if (storeRes?.data?.wealthLevels && Array.isArray(storeRes.data.wealthLevels) && storeRes.data.wealthLevels.length > 0) {
          setLevels(
            storeRes.data.wealthLevels.map((l: any) => ({
              _id: l._id || `wealth_${l.level}`,
              level: l.level,
              name: l.name || `Wealth Level ${l.level}`,
              diamondsRequired: l.coinsRequired || Math.round(Math.pow(l.level, 2) * 500),
              levelTag: l.levelTag || `Level ${l.level}`,
              levelBadge: l.badge || '💎',
              badgeColor: '#F59E0B',
              perks: [`Wealth Lv.${l.level} Badge`],
              frameReward: { ...DEFAULT_REWARD },
              entryReward: { ...DEFAULT_REWARD },
              badgeReward: { ...DEFAULT_REWARD },
              tagReward: { ...DEFAULT_REWARD },
              uniqueIdReward: { ...DEFAULT_REWARD },
              tasselReward: { ...DEFAULT_REWARD },
              profileBorderReward: { ...DEFAULT_REWARD },
              customThemeReward: { ...DEFAULT_REWARD },
              coverBannerReward: { ...DEFAULT_REWARD },
            }))
          );
        }
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreCatalog = async () => {
    try {
      const res = await apiClient.get('/api/store/items').catch(() => null);
      const items = res?.data?.items || res?.data || [];
      if (Array.isArray(items)) {
        setCatalogItems(items);
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchWealthLevels();
    fetchStoreCatalog();
  }, []);

  const handleOpenEditModal = (item: WealthLevelItem) => {
    setEditingItem(item);
    setFormData({
      ...item,
      frameReward: item.frameReward ? { ...item.frameReward } : { ...DEFAULT_REWARD },
      entryReward: item.entryReward ? { ...item.entryReward } : { ...DEFAULT_REWARD },
      badgeReward: item.badgeReward ? { ...item.badgeReward } : { ...DEFAULT_REWARD },
      tagReward: item.tagReward ? { ...item.tagReward } : { ...DEFAULT_REWARD },
      uniqueIdReward: item.uniqueIdReward ? { ...item.uniqueIdReward } : { ...DEFAULT_REWARD },
      tasselReward: item.tasselReward ? { ...item.tasselReward } : { ...DEFAULT_REWARD },
      profileBorderReward: item.profileBorderReward ? { ...item.profileBorderReward } : { ...DEFAULT_REWARD },
      customThemeReward: item.customThemeReward ? { ...item.customThemeReward } : { ...DEFAULT_REWARD },
      coverBannerReward: item.coverBannerReward ? { ...item.coverBannerReward } : { ...DEFAULT_REWARD },
    });
    setIsModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    const nextLvl = levels.length > 0 ? Math.max(...levels.map(l => l.level)) + 1 : 1;
    setFormData({
      level: nextLvl,
      name: `Wealth Level ${nextLvl}`,
      diamondsRequired: Math.round(Math.pow(nextLvl, 2.2) * 500),
      levelTag: `VIP ${nextLvl}`,
      levelBadge: '💎',
      badgeColor: '#F59E0B',
      perks: [`Wealth Lv.${nextLvl} Badge`],
      frameReward: { ...DEFAULT_REWARD },
      entryReward: { ...DEFAULT_REWARD },
      badgeReward: { ...DEFAULT_REWARD },
      tagReward: { ...DEFAULT_REWARD },
      uniqueIdReward: { ...DEFAULT_REWARD },
      tasselReward: { ...DEFAULT_REWARD },
      profileBorderReward: { ...DEFAULT_REWARD },
      customThemeReward: { ...DEFAULT_REWARD },
      coverBannerReward: { ...DEFAULT_REWARD },
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, rewardKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingField(rewardKey);
      const uploadData = new FormData();
      uploadData.append('file', file);
      const res = await apiClient.uploadFile('/api/upload/file', uploadData);

      if (res?.success && (res.data?.url || (res as any)?.url)) {
        const uploadedUrl = res.data?.url || (res as any)?.url;
        toast.success('Asset uploaded successfully!');

        if (rewardKey === 'levelBadge') {
          setFormData(prev => ({ ...prev, levelBadge: uploadedUrl }));
        } else if (rewardKey === 'levelTag') {
          setFormData(prev => ({ ...prev, levelTag: uploadedUrl }));
        } else {
          setFormData(prev => ({
            ...prev,
            [rewardKey]: {
              ...(prev[rewardKey as keyof WealthLevelItem] as RewardItemConfig),
              url: uploadedUrl,
              itemSource: 'upload',
              enabled: true,
            },
          }));
        }
      } else {
        toast.error(res?.message || 'Failed to upload asset');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Upload error');
    } finally {
      setUploadingField(null);
    }
  };

  const handleSelectCatalogItem = (rewardKey: string, itemId: string) => {
    const selected = catalogItems.find(c => c._id === itemId);
    if (!selected) return;

    setFormData(prev => ({
      ...prev,
      [rewardKey]: {
        ...(prev[rewardKey as keyof WealthLevelItem] as RewardItemConfig),
        itemId: selected._id,
        name: selected.name,
        url: selected.imageUrl || '',
        animationUrl: selected.animationUrl || '',
        itemSource: 'catalog',
        enabled: true,
      },
    }));
  };

  const updateRewardField = (rewardKey: string, updates: Partial<RewardItemConfig>) => {
    setFormData(prev => ({
      ...prev,
      [rewardKey]: {
        ...((prev[rewardKey as keyof WealthLevelItem] as RewardItemConfig) || DEFAULT_REWARD),
        ...updates,
      },
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await apiClient.post('/api/levels/wealth', formData);
      if (res?.success) {
        toast.success(`Wealth Level ${formData.level} saved successfully!`);
        setIsModalOpen(false);
        fetchWealthLevels();
      } else {
        toast.error(res?.message || 'Failed to save wealth level');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Save error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (level: number) => {
    if (!confirm(`Are you sure you want to delete Wealth Level ${level}?`)) return;
    try {
      const res = await apiClient.delete(`/api/levels/wealth/${level}`);
      if (res?.success) {
        toast.success(`Wealth Level ${level} deleted`);
        fetchWealthLevels();
      } else {
        toast.error(res?.message || 'Failed to delete');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Delete error');
    }
  };

  const filteredLevels = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return levels.filter(l => !q || l.name?.toLowerCase().includes(q) || String(l.level).includes(q));
  }, [levels, searchQuery]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-slate-900 border border-amber-500/20 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/30 to-yellow-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 p-3 shadow-lg shadow-amber-500/10">
            <Diamond size={30} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">Wealth Level Journey</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                GIFTER / SPENDER TIERS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Configure diamond consumption thresholds, custom level badges/tags, and 9 exclusive rewards (Frame, Entry Effect, Badge, Tag, Unique ID, Tassel, Profile Border, Custom Theme, Cover Banner) with custom upload and expiry days.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchWealthLevels}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white transition"
            title="Refresh Levels"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition active:scale-95"
          >
            <Plus size={16} />
            Create Wealth Level
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium">Configured Levels</span>
          <div className="text-2xl font-bold text-white mt-1">{levels.length}</div>
          <span className="text-[10px] text-slate-500">Lv. 1 to Lv. {levels[levels.length - 1]?.level || 0}</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium">Max Spend Threshold</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            {(levels[levels.length - 1]?.diamondsRequired || 0).toLocaleString()} 💎
          </div>
          <span className="text-[10px] text-slate-500">Top Monarch Tier</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium">Auto-Expiry Enabled</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">Configurable Days</div>
          <span className="text-[10px] text-slate-500">Auto-removes upon expiry</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium">Asset Source</span>
          <div className="text-2xl font-bold text-cyan-400 mt-1">Custom / Store</div>
          <span className="text-[10px] text-slate-500">Upload or choose from My Items</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="relative w-80">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search level by name or number..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Level</th>
                <th className="p-3.5">Title Name</th>
                <th className="p-3.5">Diamonds Required</th>
                <th className="p-3.5">Badge & Tag</th>
                <th className="p-3.5">Configured Rewards (9 Items)</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLevels.map(lvl => {
                const activeRewards = REWARD_TYPES.filter(rt => {
                  const cfg = lvl[rt.key as keyof WealthLevelItem] as RewardItemConfig | undefined;
                  return cfg?.enabled;
                });

                return (
                  <tr key={lvl._id || `lvl_${lvl.level}`} className="hover:bg-slate-800/30 transition">
                    <td className="p-3.5">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                        {lvl.level}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-white">
                      <div>{lvl.name}</div>
                      {lvl.perks && lvl.perks.length > 0 && (
                        <div className="text-[10px] text-slate-500 mt-0.5">{lvl.perks[0]}</div>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="font-mono text-amber-400 font-bold text-xs">
                        {Number(lvl.diamondsRequired || 0).toLocaleString()} 💎
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-amber-300 border border-amber-500/20">
                          {lvl.levelBadge || '💎 Badge'}
                        </span>
                        {lvl.levelTag ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            Tag: {lvl.levelTag}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="p-3.5">
                      {activeRewards.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-md">
                          {activeRewards.map(rt => {
                            const cfg = lvl[rt.key as keyof WealthLevelItem] as RewardItemConfig;
                            return (
                              <span
                                key={rt.key}
                                className="px-2 py-0.5 rounded-lg text-[10px] bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1"
                                title={`${rt.label}: ${cfg.name || 'Unlocked'} (${cfg.days > 0 ? `${cfg.days} Days` : 'Permanent'})`}
                              >
                                <rt.icon size={10} className="text-amber-400" />
                                <span className="font-medium truncate max-w-[90px]">{cfg.name || rt.label}</span>
                                <span className="text-[9px] text-amber-400/80 bg-amber-500/10 px-1 rounded">
                                  {cfg.days > 0 ? `${cfg.days}d` : 'Perm'}
                                </span>
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-slate-600 text-[11px]">— Default Badge only —</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleOpenEditModal(lvl)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 mr-1.5 transition"
                        title="Edit Level"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(lvl.level)}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                        title="Delete Level"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-3xl w-full bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Diamond size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingItem ? `Edit Wealth Level ${formData.level}` : 'Create New Wealth Level'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Set diamond spend thresholds, custom tags/badges, and configure the 9 reward items with validity days.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6 mt-4">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Level Number *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.level}
                    onChange={e => setFormData(prev => ({ ...prev, level: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Title Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Wealth Level 1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Diamonds Required 💎 *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.diamondsRequired}
                    onChange={e => setFormData(prev => ({ ...prev, diamondsRequired: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Optional Level Tag & Level Badge Section (Requested by user) */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Level Tag & Level Badge (Optional Custom Display)
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Level Tag */}
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">
                      Level Tag (Text or Upload Image)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={formData.levelTag || ''}
                        onChange={e => setFormData(prev => ({ ...prev, levelTag: e.target.value }))}
                        placeholder="e.g. 👑 VIP 1 or https://..."
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                      <label className="cursor-pointer px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium flex items-center gap-1 border border-slate-700 transition">
                        <UploadCloud size={14} />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => handleFileUpload(e, 'levelTag')}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Level Badge */}
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">
                      Level Badge (Icon text or Badge Image)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={formData.levelBadge || ''}
                        onChange={e => setFormData(prev => ({ ...prev, levelBadge: e.target.value }))}
                        placeholder="e.g. 💎 or https://..."
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                      <label className="cursor-pointer px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium flex items-center gap-1 border border-slate-700 transition">
                        <UploadCloud size={14} />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => handleFileUpload(e, 'levelBadge')}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* 9 Reward Items Configuration Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Gift size={15} className="text-amber-400" />
                      Configure Level Rewards & Expiry Days (9 Reward Items)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Upload custom files or select from My Items. Each reward has configurable days before it expires and is removed automatically.
                    </p>
                  </div>
                </div>

                {/* Sub-tabs for the 9 reward items */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
                  {REWARD_TYPES.map(rt => {
                    const cfg = formData[rt.key as keyof WealthLevelItem] as RewardItemConfig | undefined;
                    const isSelected = activeRewardTab === rt.key;
                    const isEnabled = cfg?.enabled;

                    return (
                      <button
                        key={rt.key}
                        type="button"
                        onClick={() => setActiveRewardTab(rt.key)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                            : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        <rt.icon size={13} />
                        <span>{rt.label.split(' ')[0]}</span>
                        {isEnabled ? (
                          <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-slate-950' : 'bg-emerald-400'}`} />
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                {/* Active Reward Item Card Details */}
                {(() => {
                  const currentRewardDef = REWARD_TYPES.find(rt => rt.key === activeRewardTab) || REWARD_TYPES[0];
                  const cfg = (formData[currentRewardDef.key as keyof WealthLevelItem] as RewardItemConfig) || DEFAULT_REWARD;
                  const relevantCatalog = catalogItems.filter(
                    c => c.category?.toLowerCase() === currentRewardDef.storeCategory?.toLowerCase()
                  );

                  return (
                    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                      {/* Reward Enable Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                            <currentRewardDef.icon size={16} />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white">{currentRewardDef.label}</span>
                            <span className="text-[10px] text-slate-500 ml-2">
                              Category: {currentRewardDef.storeCategory}
                            </span>
                          </div>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <span className="text-xs text-slate-400">
                            {cfg.enabled ? 'Reward Active' : 'Disabled for this Level'}
                          </span>
                          <input
                            type="checkbox"
                            checked={Boolean(cfg.enabled)}
                            onChange={e => updateRewardField(currentRewardDef.key, { enabled: e.target.checked })}
                            className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-slate-900 border-slate-700"
                          />
                        </label>
                      </div>

                      {cfg.enabled ? (
                        <div className="space-y-4">
                          {/* Name input */}
                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">Reward Name *</label>
                            <input
                              type="text"
                              value={cfg.name || ''}
                              onChange={e => updateRewardField(currentRewardDef.key, { name: e.target.value })}
                              placeholder={`e.g. ${currentRewardDef.placeholder}`}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          {/* Source Selection: Upload vs Catalog */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Upload Option */}
                            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                                  <UploadCloud size={14} className="text-amber-400" />
                                  1. Upload Custom Asset (Khud se upload)
                                </span>
                                <input
                                  type="radio"
                                  name={`source_${currentRewardDef.key}`}
                                  checked={cfg.itemSource === 'upload'}
                                  onChange={() => updateRewardField(currentRewardDef.key, { itemSource: 'upload' })}
                                  className="text-amber-500"
                                />
                              </div>
                              <p className="text-[11px] text-slate-400">
                                Upload image, SVGA animation, or enter direct asset URL.
                              </p>

                              <div className="flex items-center gap-2 pt-1">
                                <input
                                  type="text"
                                  value={cfg.url || ''}
                                  onChange={e =>
                                    updateRewardField(currentRewardDef.key, {
                                      url: e.target.value,
                                      itemSource: 'upload',
                                    })
                                  }
                                  placeholder="https://... or upload file"
                                  className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none"
                                />
                                <label className="cursor-pointer px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition">
                                  <UploadCloud size={13} />
                                  <span>{uploadingField === currentRewardDef.key ? 'Uploading...' : 'Upload'}</span>
                                  <input
                                    type="file"
                                    accept="image/*,.svga,.webp,.gif,.png"
                                    className="hidden"
                                    disabled={uploadingField === currentRewardDef.key}
                                    onChange={e => handleFileUpload(e, currentRewardDef.key)}
                                  />
                                </label>
                              </div>

                              {cfg.url && (
                                <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-slate-950 border border-slate-800">
                                  <img src={cfg.url} alt="Preview" className="w-8 h-8 rounded object-contain bg-slate-900" />
                                  <span className="text-[10px] text-slate-400 truncate flex-1">{cfg.url}</span>
                                </div>
                              )}
                            </div>

                            {/* Catalog Selection Option */}
                            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                                  <Layers size={14} className="text-cyan-400" />
                                  2. Choose from My Items / Catalog
                                </span>
                                <input
                                  type="radio"
                                  name={`source_${currentRewardDef.key}`}
                                  checked={cfg.itemSource === 'catalog'}
                                  onChange={() => updateRewardField(currentRewardDef.key, { itemSource: 'catalog' })}
                                  className="text-amber-500"
                                />
                              </div>
                              <p className="text-[11px] text-slate-400">
                                Link directly from existing store catalog items of category "{currentRewardDef.storeCategory}".
                              </p>

                              <select
                                value={cfg.itemId || ''}
                                onChange={e => handleSelectCatalogItem(currentRewardDef.key, e.target.value)}
                                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none"
                              >
                                <option value="">-- Select Store Item ({relevantCatalog.length} available) --</option>
                                {relevantCatalog.map(ci => (
                                  <option key={ci._id} value={ci._id}>
                                    {ci.name} ({ci.price ? `${ci.price} 💎` : 'Catalog'})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Validity in Days (Requested: "days rahenge uske bad vo theme hat jayegi") */}
                          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                                <Clock size={14} className="text-amber-400" />
                                Validity Duration in Days (Expiry Rule)
                              </label>
                              <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                {cfg.days > 0 ? `Active for ${cfg.days} Days` : 'Permanent (No Expiry)'}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-400">
                              Specify how many days this reward remains active in the user's inventory. After this period, the item automatically expires and is unequipped.
                            </p>

                            <div className="flex items-center gap-2 pt-1 flex-wrap">
                              {[
                                { label: '7 Days', val: 7 },
                                { label: '15 Days', val: 15 },
                                { label: '30 Days', val: 30 },
                                { label: '90 Days', val: 90 },
                                { label: 'Permanent', val: 0 },
                              ].map(preset => (
                                <button
                                  key={preset.val}
                                  type="button"
                                  onClick={() => updateRewardField(currentRewardDef.key, { days: preset.val })}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                                    cfg.days === preset.val
                                      ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                                  }`}
                                >
                                  {preset.label}
                                </button>
                              ))}

                              <div className="flex items-center gap-1.5 ml-auto">
                                <span className="text-xs text-slate-400">Custom Days:</span>
                                <input
                                  type="number"
                                  min={0}
                                  value={cfg.days}
                                  onChange={e =>
                                    updateRewardField(currentRewardDef.key, { days: Math.max(0, Number(e.target.value)) })
                                  }
                                  className="w-20 px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white text-center font-mono focus:outline-none focus:border-amber-500"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-slate-500 text-xs">
                          This reward is currently disabled for Wealth Level {formData.level}.
                          <button
                            type="button"
                            onClick={() => updateRewardField(currentRewardDef.key, { enabled: true })}
                            className="block mx-auto mt-2 text-amber-400 hover:underline font-semibold"
                          >
                            + Enable {currentRewardDef.label}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                  {editingItem ? 'Save Wealth Level' : 'Create Wealth Level'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
