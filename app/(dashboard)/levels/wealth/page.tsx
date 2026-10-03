'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

interface WealthLevelItem {
  _id: string;
  level: number;
  name: string;
  diamondsRequired: number;
  badge: string;
  badgeColor: string;
  perks: string[];
  rewardFrame?: string;
  rewardEntry?: string;
}

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
    badge,
    badgeColor,
    perks: [
      `Level ${lvl} Wealth Badge`,
      `Exclusive Chat Name Glow`,
      lvl >= 5 ? 'Custom Enter Room Audio' : 'Standard Broadcast',
    ],
    rewardFrame: lvl % 5 === 0 ? `Wealth Crown Frame Lv.${lvl}` : undefined,
  };
});

export default function WealthLevelsPage() {
  const [levels, setLevels] = useState<WealthLevelItem[]>(DEFAULT_WEALTH_LEVELS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Edit / Add Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WealthLevelItem | null>(null);
  const [formData, setFormData] = useState<WealthLevelItem>({
    _id: '',
    level: 1,
    name: '',
    diamondsRequired: 1000,
    badge: 'Bronze',
    badgeColor: '#CD7F32',
    perks: [],
  });

  const fetchWealthLevels = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/store/levels', { type: 'wealth' }).catch(() => null);
      if (res?.data?.wealthLevels && Array.isArray(res.data.wealthLevels) && res.data.wealthLevels.length > 0) {
        setLevels(
          res.data.wealthLevels.map((l: any) => ({
            _id: l._id || `wealth_${l.level}`,
            level: l.level,
            name: l.name || `Wealth Level ${l.level}`,
            diamondsRequired: l.coinsRequired || Math.round(Math.pow(l.level, 2) * 500),
            badge: l.badge || '💎',
            badgeColor: '#F59E0B',
            perks: [`Wealth Lv.${l.level} Badge`, 'Room Highlights'],
          }))
        );
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWealthLevels();
  }, []);

  const handleOpenEditModal = (item: WealthLevelItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    const nextLvl = levels.length > 0 ? Math.max(...levels.map(l => l.level)) + 1 : 1;
    setFormData({
      _id: `wealth_${nextLvl}`,
      level: nextLvl,
      name: `Wealth Level ${nextLvl}`,
      diamondsRequired: Math.round(Math.pow(nextLvl, 2.2) * 500),
      badge: 'Monarch',
      badgeColor: '#F59E0B',
      perks: [`Wealth Lv.${nextLvl} Badge`],
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      setLevels(prev => prev.map(l => (l.level === editingItem.level ? formData : l)));
      toast.success(`Wealth Level ${formData.level} updated successfully!`);
    } else {
      setLevels(prev => [...prev, formData].sort((a, b) => a.level - b.level));
      toast.success(`Wealth Level ${formData.level} created successfully!`);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (level: number) => {
    setLevels(prev => prev.filter(l => l.level !== level));
    toast.success(`Wealth Level ${level} deleted`);
  };

  const filteredLevels = levels.filter(l => {
    const q = searchQuery.toLowerCase().trim();
    return !q || l.name.toLowerCase().includes(q) || String(l.level).includes(q);
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-slate-900 border border-amber-500/20 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 p-3">
            <Diamond size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">Wealth Level Journey</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                GIFTER / SPENDER
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Configure gifting tiers, diamond consumption thresholds, and exclusive badges for high-wealth users.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchWealthLevels}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white transition"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition"
          >
            <Plus size={16} />
            Add Wealth Level
          </button>
        </div>
      </div>

      {/* Stats */}
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
          <span className="text-[10px] text-slate-500">For top Sovereign Gifter</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium">Reward Frames</span>
          <div className="text-2xl font-bold text-cyan-400 mt-1">
            {levels.filter(l => l.rewardFrame).length}
          </div>
          <span className="text-[10px] text-slate-500">Milestone unlockables</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium">Status in Mobile App</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">Active</div>
          <span className="text-[10px] text-slate-500">Connected to LevelJourney.js</span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="relative w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search level..."
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
                <th className="p-3.5">Title Name</th>
                <th className="p-3.5">Diamonds Required</th>
                <th className="p-3.5">Badge Title</th>
                <th className="p-3.5">Milestone Reward</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLevels.map(lvl => (
                <tr key={lvl._id} className="hover:bg-slate-800/30 transition">
                  <td className="p-3.5">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      {lvl.level}
                    </span>
                  </td>
                  <td className="p-3.5 font-semibold text-white">{lvl.name}</td>
                  <td className="p-3.5">
                    <span className="font-mono text-amber-400 font-bold">
                      {lvl.diamondsRequired.toLocaleString()} 💎
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-amber-300 border border-amber-500/20">
                      {lvl.badge}
                    </span>
                  </td>
                  <td className="p-3.5">
                    {lvl.rewardFrame ? (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] bg-rose-500/10 text-rose-300 border border-rose-500/30">
                        🎁 {lvl.rewardFrame}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleOpenEditModal(lvl)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 mr-1"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(lvl.level)}
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
          <div className="max-w-md w-full bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Diamond size={18} className="text-amber-400" />
              {editingItem ? `Edit Wealth Level ${formData.level}` : 'Create Wealth Level'}
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
                  <label className="block text-xs text-slate-300 mb-1">Badge Title</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={e => setFormData(prev => ({ ...prev, badge: e.target.value }))}
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

              <div>
                <label className="block text-xs text-slate-300 mb-1">Diamonds Required to Reach</label>
                <input
                  type="number"
                  required
                  value={formData.diamondsRequired}
                  onChange={e => setFormData(prev => ({ ...prev, diamondsRequired: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Milestone Reward Frame (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Royal Golden Crown"
                  value={formData.rewardFrame || ''}
                  onChange={e => setFormData(prev => ({ ...prev, rewardFrame: e.target.value }))}
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
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400"
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
