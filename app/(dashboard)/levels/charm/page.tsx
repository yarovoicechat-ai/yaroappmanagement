'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Search,
  Award,
  Heart,
  Clock,
  PhoneCall,
  Coins,
  Check,
  X,
  UploadCloud,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

interface CharmRewardItem {
  type: 'frame' | 'entry' | 'badge' | 'tag' | 'vehicle' | 'micWave' | 'theme';
  name: string;
  imageUrl?: string;
  animationUrl?: string;
  durationDays?: number;
}

interface CharmLevelItem {
  _id: string;
  level: number;
  name: string;
  minCalls: number;
  minMinutes: number;
  coinPerMinute: number;
  charmPointsRequired?: number;
  levelTag?: string;
  badge?: string;
  badgeIcon?: string;
  badgeAnimation?: string;
  rewards?: CharmRewardItem[];
  rewardText?: string;
}

const DEFAULT_CHARM_LEVELS: CharmLevelItem[] = Array.from({ length: 15 }, (_, i) => {
  const lvl = i + 1;
  return {
    _id: `charm_${lvl}`,
    level: lvl,
    name: `Charm Idol Lv.${lvl}`,
    minCalls: lvl * 5,
    minMinutes: lvl * 30,
    coinPerMinute: 20 + lvl * 5,
    charmPointsRequired: Math.round(Math.pow(lvl, 2) * 800),
    badge: lvl >= 10 ? '👑 Super Idol' : lvl >= 5 ? '🌟 Star Host' : '🌸 Rising Host',
    levelTag: lvl >= 10 ? '👑 Super Idol' : lvl >= 5 ? '🌟 Star Host' : '🌸 Rising Host',
    rewardText: lvl % 3 === 0 ? `Idol Voice Aura Lv.${lvl}` : undefined,
  };
});

export default function CharmLevelsPage() {
  const [levels, setLevels] = useState<CharmLevelItem[]>(DEFAULT_CHARM_LEVELS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingAsset, setUploadingAsset] = useState<string | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CharmLevelItem | null>(null);
  const [formData, setFormData] = useState<CharmLevelItem>({
    _id: '',
    level: 1,
    name: '',
    minCalls: 5,
    minMinutes: 30,
    coinPerMinute: 20,
    charmPointsRequired: 1000,
    badge: 'Rising Host',
    levelTag: 'Rising Host',
    badgeIcon: '',
    badgeAnimation: '',
    rewards: [],
  });

  const fetchCharmLevels = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/admin/levels').catch(() => null);
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setLevels(
          res.data.map((l: any) => ({
            _id: l._id,
            level: l.level,
            name: l.name || `Charm Host Lv.${l.level}`,
            minCalls: l.minCalls || 0,
            minMinutes: l.minMinutes || 0,
            coinPerMinute: l.coinPerMinute || 20,
            charmPointsRequired: (l.minMinutes || 0) * 60 + (l.minCalls || 0) * 10,
            badge: l.levelTag || (l.level >= 10 ? '👑 Super Idol' : '🌸 Rising Star'),
            levelTag: l.levelTag || '',
            badgeIcon: l.badgeIcon || '',
            badgeAnimation: l.badgeAnimation || '',
            rewards: l.rewards || [],
            rewardText: l.rewards?.[0]?.name,
          }))
        );
      }
    } catch (err: any) {
      console.error('Failed to fetch charm levels:', err);
      toast.error('Failed to load charm levels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharmLevels();
  }, []);

  const uploadAsset = async (targetField: 'badgeIcon' | 'badgeAnimation', file?: File) => {
    if (!file) return;
    try {
      setUploadingAsset(targetField);
      const body = new FormData();
      body.append('file', file);
      const response = await apiClient.uploadFile<{ url: string }>('/api/upload/file', body);
      const url = response.data?.url;
      if (!url) throw new Error('Upload URL missing');
      setFormData(prev => ({ ...prev, [targetField]: url }));
      toast.success(`${targetField === 'badgeIcon' ? 'Badge Icon' : 'Animation'} uploaded`);
    } catch (error: any) {
      toast.error(error.message || 'Asset upload failed');
    } finally {
      setUploadingAsset(null);
    }
  };

  const handleOpenEditModal = (item: CharmLevelItem) => {
    setEditingItem(item);
    setFormData({
      ...item,
      badge: item.levelTag || item.badge || '',
      levelTag: item.levelTag || item.badge || '',
      badgeIcon: item.badgeIcon || '',
      badgeAnimation: item.badgeAnimation || '',
      rewards: item.rewards ? [...item.rewards] : [],
    });
    setIsModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    const nextLvl = levels.length > 0 ? Math.max(...levels.map(l => l.level)) + 1 : 1;
    setFormData({
      _id: '',
      level: nextLvl,
      name: `Charm Idol Lv.${nextLvl}`,
      minCalls: nextLvl * 5,
      minMinutes: nextLvl * 30,
      coinPerMinute: 20 + nextLvl * 5,
      charmPointsRequired: Math.round(Math.pow(nextLvl, 2) * 800),
      badge: '🌸 Star Host',
      levelTag: '🌸 Star Host',
      badgeIcon: '',
      badgeAnimation: '',
      rewards: [],
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      level: Number(formData.level),
      name: formData.name.trim(),
      minCalls: Number(formData.minCalls) || 0,
      minMinutes: Number(formData.minMinutes) || 0,
      coinPerMinute: Number(formData.coinPerMinute) || 20,
      levelTag: (formData.levelTag || formData.badge || '').trim(),
      badgeIcon: formData.badgeIcon?.trim() || '',
      badgeAnimation: formData.badgeAnimation?.trim() || '',
      rewards: formData.rewards || [],
    };

    try {
      if (editingItem && editingItem._id && !editingItem._id.startsWith('charm_')) {
        const res = await apiClient.patch(`/api/admin/levels/${editingItem._id}`, payload);
        if (res.success) {
          toast.success(`Charm Level ${formData.level} updated!`);
          fetchCharmLevels();
        } else {
          toast.error(res.message || 'Failed to update level');
        }
      } else {
        const res = await apiClient.post('/api/admin/levels', payload);
        if (res.success) {
          toast.success(`Charm Level ${formData.level} created!`);
          fetchCharmLevels();
        } else {
          toast.error(res.message || 'Failed to create level');
        }
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save charm level');
    }
  };

  const handleDelete = async (item: CharmLevelItem) => {
    if (!confirm(`Are you sure you want to delete Charm Level ${item.level}?`)) return;
    try {
      if (item._id && !item._id.startsWith('charm_')) {
        const res = await apiClient.delete(`/api/admin/levels/${item._id}`);
        if (res.success) {
          toast.success(`Charm Level ${item.level} deleted`);
          fetchCharmLevels();
          return;
        }
      }
      setLevels(prev => prev.filter(l => l.level !== item.level));
      toast.success(`Charm Level ${item.level} removed`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete charm level');
    }
  };

  const filteredLevels = levels.filter(l => {
    const q = searchQuery.toLowerCase().trim();
    return !q || l.name.toLowerCase().includes(q) || String(l.level).includes(q);
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-pink-500/10 via-rose-500/5 to-slate-900 border border-pink-500/20 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 p-3">
            <Heart size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">Charm Level Journey</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                HOST / TALENT
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Configure host charm levels, live call minute requirements, and host payout rates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCharmLevels}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white transition"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-xs shadow-lg shadow-pink-500/20 transition"
          >
            <Plus size={16} />
            Add Charm Level
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium">Charm Tiers</span>
          <div className="text-2xl font-bold text-white mt-1">{levels.length}</div>
          <span className="text-[10px] text-slate-500">Lv. 1 to Lv. {levels[levels.length - 1]?.level || 0}</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium">Max Coin Rate</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            {levels[levels.length - 1]?.coinPerMinute || 0} / min
          </div>
          <span className="text-[10px] text-slate-500">Top talent earning rate</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium">Target Minutes</span>
          <div className="text-2xl font-bold text-pink-400 mt-1">
            {(levels[levels.length - 1]?.minMinutes || 0).toLocaleString()} m
          </div>
          <span className="text-[10px] text-slate-500">Peak broadcast requirement</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium">Status in Mobile App</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">Connected</div>
          <span className="text-[10px] text-slate-500">Syncs to host profile</span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="relative w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search charm level..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Level</th>
                <th className="p-3.5">Idol Title</th>
                <th className="p-3.5">Charm Points Required</th>
                <th className="p-3.5">Min Calls</th>
                <th className="p-3.5">Min Minutes</th>
                <th className="p-3.5">Coin/Min Rate</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLevels.map(lvl => (
                <tr key={lvl._id} className="hover:bg-slate-800/30 transition">
                  <td className="p-3.5">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30">
                      {lvl.level}
                    </span>
                  </td>
                  <td className="p-3.5 font-semibold text-white">{lvl.name}</td>
                  <td className="p-3.5 font-mono text-pink-400 font-bold">
                    {(lvl.charmPointsRequired || 0).toLocaleString()} 🌸
                  </td>
                  <td className="p-3.5 text-slate-300">{lvl.minCalls} calls</td>
                  <td className="p-3.5 text-slate-300">{lvl.minMinutes} mins</td>
                  <td className="p-3.5 font-mono text-amber-400 font-semibold">{lvl.coinPerMinute} coin/m</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleOpenEditModal(lvl)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 mr-1"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(lvl)}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-pink-500/30 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Heart size={18} className="text-pink-400" />
              {editingItem ? `Edit Charm Level ${formData.level}` : 'Create Charm Level'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Level #</label>
                  <input
                    type="number"
                    required
                    value={formData.level}
                    onChange={e => setFormData(prev => ({ ...prev, level: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Badge Title / Tag</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={e => setFormData(prev => ({ ...prev, badge: e.target.value, levelTag: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Display Title</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              {/* Badge Asset Uploads */}
              <div className="p-3 rounded-2xl border border-pink-500/30 bg-pink-500/5 space-y-3">
                <p className="text-xs font-bold text-pink-300">Charm Badge & Animation Assets</p>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Badge Icon (PNG/JPG/WebP)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Icon URL"
                      value={formData.badgeIcon || ''}
                      onChange={e => setFormData(prev => ({ ...prev, badgeIcon: e.target.value }))}
                      className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                    {formData.badgeIcon && (
                      <div className="w-8 h-8 rounded-lg border border-slate-700 bg-slate-950 overflow-hidden shrink-0 flex items-center justify-center">
                        <img src={formData.badgeIcon} alt="" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                  <label className="mt-1.5 flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-pink-500/40 p-1.5 text-[11px] text-pink-300 hover:bg-pink-500/10">
                    <UploadCloud size={13} /> {uploadingAsset === 'badgeIcon' ? 'Uploading...' : 'Upload Badge Icon'}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                      disabled={uploadingAsset !== null}
                      onChange={e => uploadAsset('badgeIcon', e.target.files?.[0])}
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Animation (.svga, .gif)</label>
                  <input
                    type="text"
                    placeholder="SVGA Animation URL"
                    value={formData.badgeAnimation || ''}
                    onChange={e => setFormData(prev => ({ ...prev, badgeAnimation: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                  <label className="mt-1.5 flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-pink-500/40 p-1.5 text-[11px] text-pink-300 hover:bg-pink-500/10">
                    <UploadCloud size={13} /> {uploadingAsset === 'badgeAnimation' ? 'Uploading...' : 'Upload SVGA File'}
                    <input
                      type="file"
                      accept=".svga,image/gif,image/webp"
                      className="hidden"
                      disabled={uploadingAsset !== null}
                      onChange={e => uploadAsset('badgeAnimation', e.target.files?.[0])}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Min Calls</label>
                  <input
                    type="number"
                    value={formData.minCalls}
                    onChange={e => setFormData(prev => ({ ...prev, minCalls: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Min Minutes</label>
                  <input
                    type="number"
                    value={formData.minMinutes}
                    onChange={e => setFormData(prev => ({ ...prev, minMinutes: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Coins Per Minute Rate</label>
                <input
                  type="number"
                  value={formData.coinPerMinute}
                  onChange={e => setFormData(prev => ({ ...prev, coinPerMinute: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-pink-500 text-white font-bold text-xs hover:bg-pink-600"
                >
                  Save Level
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
