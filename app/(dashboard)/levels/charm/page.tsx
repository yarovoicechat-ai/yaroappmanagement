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
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

interface CharmLevelItem {
  _id: string;
  level: number;
  name: string;
  minCalls: number;
  minMinutes: number;
  coinPerMinute: number;
  charmPointsRequired: number;
  badge: string;
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
    rewardText: lvl % 3 === 0 ? `Idol Voice Aura Lv.${lvl}` : undefined,
  };
});

export default function CharmLevelsPage() {
  const [levels, setLevels] = useState<CharmLevelItem[]>(DEFAULT_CHARM_LEVELS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
  });

  const fetchCharmLevels = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/admin/host-levels').catch(() => null);
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setLevels(
          res.data.map((l: any) => ({
            _id: l._id || `charm_${l.level}`,
            level: l.level,
            name: l.name || `Charm Host Lv.${l.level}`,
            minCalls: l.minCalls || 0,
            minMinutes: l.minMinutes || 0,
            coinPerMinute: l.coinPerMinute || 20,
            charmPointsRequired: (l.minMinutes || 0) * 60 + (l.minCalls || 0) * 10,
            badge: l.level >= 10 ? '👑 Super Idol' : '🌸 Rising Star',
            rewardText: l.rewards?.[0]?.name,
          }))
        );
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharmLevels();
  }, []);

  const handleOpenEditModal = (item: CharmLevelItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    const nextLvl = levels.length > 0 ? Math.max(...levels.map(l => l.level)) + 1 : 1;
    setFormData({
      _id: `charm_${nextLvl}`,
      level: nextLvl,
      name: `Charm Idol Lv.${nextLvl}`,
      minCalls: nextLvl * 5,
      minMinutes: nextLvl * 30,
      coinPerMinute: 20 + nextLvl * 5,
      charmPointsRequired: Math.round(Math.pow(nextLvl, 2) * 800),
      badge: '🌸 Star Host',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      setLevels(prev => prev.map(l => (l.level === editingItem.level ? formData : l)));
      toast.success(`Charm Level ${formData.level} updated!`);
    } else {
      setLevels(prev => [...prev, formData].sort((a, b) => a.level - b.level));
      toast.success(`Charm Level ${formData.level} added!`);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (level: number) => {
    setLevels(prev => prev.filter(l => l.level !== level));
    toast.success(`Charm Level ${level} deleted`);
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
                    {lvl.charmPointsRequired.toLocaleString()} 🌸
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
          <div className="max-w-md w-full bg-slate-900 border border-pink-500/30 rounded-3xl p-6 shadow-2xl">
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
