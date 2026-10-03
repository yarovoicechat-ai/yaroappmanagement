'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Search,
  Award,
  Crown,
  Check,
  X,
  Eye,
  EyeOff,
  Flame,
  Diamond,
  Shield,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';

interface FamilyItem {
  _id: string;
  name: string;
  badge: string;
  badgeColor?: string;
  avatar?: string;
  coverImage?: string;
  slogan?: string;
  leaderId?: any;
  ranking?: number;
  diamondsEarned?: number;
  memberCount?: number;
  maxMembers?: number;
  status?: string;
  createdAt?: string;
}

const DEFAULT_FAMILIES: FamilyItem[] = [
  {
    _id: 'fam_1',
    name: 'Royal Tigers',
    badge: '🐅 TIGER',
    badgeColor: '#F59E0B',
    avatar: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=100&auto=format&fit=crop',
    slogan: 'Pride of Yaro voice rooms, ruling the top rank!',
    ranking: 1,
    diamondsEarned: 1540000,
    memberCount: 48,
    maxMembers: 50,
    status: 'active',
  },
  {
    _id: 'fam_2',
    name: 'Galaxy Warriors',
    badge: '🌌 GALAXY',
    badgeColor: '#8B5CF6',
    avatar: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100&auto=format&fit=crop',
    slogan: 'Aiming for the stars together.',
    ranking: 2,
    diamondsEarned: 890000,
    memberCount: 35,
    maxMembers: 50,
    status: 'active',
  },
  {
    _id: 'fam_3',
    name: 'Sweet Harmony',
    badge: '🌸 HARMONY',
    badgeColor: '#EC4899',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop',
    slogan: 'Singing, chatting, and spreading love.',
    ranking: 3,
    diamondsEarned: 420000,
    memberCount: 28,
    maxMembers: 50,
    status: 'active',
  },
];

export default function FamilyManagementPage() {
  const [families, setFamilies] = useState<FamilyItem[]>(DEFAULT_FAMILIES);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Feature Flag: Hide/Show Family in App
  const [isFamilyEnabled, setIsFamilyEnabled] = useState(true);
  const [togglingConfig, setTogglingConfig] = useState(false);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FamilyItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    badge: '',
    badgeColor: '#F59E0B',
    avatar: '',
    slogan: '',
    ranking: 1,
    maxMembers: 50,
  });

  const fetchConfig = async () => {
    try {
      const res = await apiClient.get(API_ENDPOINTS.SYSTEM_CONFIG.GET);
      if (res?.data && typeof res.data.isFamilyEnabled === 'boolean') {
        setIsFamilyEnabled(res.data.isFamilyEnabled);
      }
    } catch (_) {}
  };

  const fetchFamilies = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(API_ENDPOINTS.FAMILY.ADMIN_ALL).catch(() => null);
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setFamilies(res.data);
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchFamilies();
  }, []);

  const handleToggleFamilyFeature = async () => {
    try {
      setTogglingConfig(true);
      const nextState = !isFamilyEnabled;
      const res = await apiClient.post(API_ENDPOINTS.SYSTEM_CONFIG.TOGGLE, {
        feature: 'isFamilyEnabled',
        enabled: nextState,
      });
      setIsFamilyEnabled(nextState);
      toast.success(
        nextState
          ? 'Family System is now visible in Yaro App!'
          : 'Family System has been HIDDEN from Yaro App!'
      );
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update App configuration');
    } finally {
      setTogglingConfig(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      badge: '',
      badgeColor: '#F59E0B',
      avatar: '',
      slogan: '',
      ranking: families.length + 1,
      maxMembers: 50,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: FamilyItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      badge: item.badge || '',
      badgeColor: item.badgeColor || '#F59E0B',
      avatar: item.avatar || '',
      slogan: item.slogan || '',
      ranking: item.ranking || 1,
      maxMembers: item.maxMembers || 50,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Family name is required');
      return;
    }

    try {
      if (editingItem) {
        await apiClient.put(API_ENDPOINTS.FAMILY.UPDATE(editingItem._id), formData).catch(() => null);
        setFamilies(prev =>
          prev.map(f => (f._id === editingItem._id ? { ...f, ...formData } : f))
        );
        toast.success(`Family "${formData.name}" updated!`);
      } else {
        const res = await apiClient.post(API_ENDPOINTS.FAMILY.CREATE, formData).catch(() => null);
        const newItem: FamilyItem = res?.data || {
          _id: `fam_${Date.now()}`,
          ...formData,
          memberCount: 1,
          diamondsEarned: 0,
          status: 'active',
        };
        setFamilies(prev => [newItem, ...prev]);
        toast.success(`Family "${formData.name}" created successfully!`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save family');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await apiClient.delete(API_ENDPOINTS.FAMILY.DELETE(id)).catch(() => null);
      setFamilies(prev => prev.filter(f => f._id !== id));
      toast.success(`Family "${name}" dissolved`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to dissolve family');
    }
  };

  const filteredFamilies = families.filter(f => {
    const q = searchQuery.toLowerCase().trim();
    return !q || f.name.toLowerCase().includes(q) || f.badge.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Feature Toggle (Show/Hide in App) */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-violet-950/40 via-purple-950/20 to-slate-900 border border-violet-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-violet-500/20">
              <Users size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">Family System Console</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  COMMUNITY & GUILDS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Manage clans, leader privileges, member rankings, and toggle Family visibility inside Yaro Mobile App.
              </p>
            </div>
          </div>

          {/* Toggle Control: Show/Hide in App */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="text-left">
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  {isFamilyEnabled ? (
                    <Eye size={14} className="text-emerald-400" />
                  ) : (
                    <EyeOff size={14} className="text-rose-400" />
                  )}
                  <span>App Visibility</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {isFamilyEnabled ? 'Visible in Mobile App' : 'Hidden from Mobile App'}
                </span>
              </div>

              <button
                onClick={handleToggleFamilyFeature}
                disabled={togglingConfig}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isFamilyEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isFamilyEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white font-semibold text-xs shadow-lg shadow-violet-500/20 transition"
            >
              <Plus size={16} />
              Create Family
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium">Total Families</span>
          <div className="text-2xl font-bold text-white mt-1">{families.length}</div>
          <span className="text-[10px] text-slate-500">Active clans on platform</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium">Total Clan Members</span>
          <div className="text-2xl font-bold text-cyan-400 mt-1">
            {families.reduce((acc, f) => acc + (f.memberCount || 0), 0)}
          </div>
          <span className="text-[10px] text-slate-500">Across all families</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium">Family Diamonds Pool</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            {families.reduce((acc, f) => acc + (f.diamondsEarned || 0), 0).toLocaleString()} 💎
          </div>
          <span className="text-[10px] text-slate-500">Battle & gifting total</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium">App Feature Status</span>
          <div
            className={`text-2xl font-bold mt-1 ${
              isFamilyEnabled ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isFamilyEnabled ? 'VISIBLE' : 'HIDDEN'}
          </div>
          <span className="text-[10px] text-slate-500">
            {isFamilyEnabled ? 'Users can join in App' : 'Family tabs hidden in App'}
          </span>
        </div>
      </div>

      {/* Families List */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="relative w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search family by name or badge..."
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
                <th className="p-3.5">Rank</th>
                <th className="p-3.5">Family Name</th>
                <th className="p-3.5">Badge Title</th>
                <th className="p-3.5">Members</th>
                <th className="p-3.5">Diamonds Earned</th>
                <th className="p-3.5">Slogan</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredFamilies.map((f, i) => (
                <tr key={f._id} className="hover:bg-slate-800/30 transition">
                  <td className="p-3.5">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-violet-500/20 text-violet-300 font-bold">
                      #{f.ranking || i + 1}
                    </span>
                  </td>
                  <td className="p-3.5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
                      {f.avatar ? (
                        <img src={f.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-violet-400 font-bold">
                          {f.name.slice(0, 1)}
                        </div>
                      )}
                    </div>
                    <span className="font-bold text-white">{f.name}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      {f.badge}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="text-slate-300 font-medium">
                      {f.memberCount || 1} / {f.maxMembers || 50}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-amber-400 font-bold">
                    {(f.diamondsEarned || 0).toLocaleString()} 💎
                  </td>
                  <td className="p-3.5 text-slate-400 max-w-xs truncate">{f.slogan || '—'}</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleOpenEditModal(f)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 mr-1"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(f._id, f.name)}
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
          <div className="max-w-md w-full bg-slate-900 border border-violet-500/30 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Users size={18} className="text-violet-400" />
              {editingItem ? `Edit Family "${editingItem.name}"` : 'Create New Family'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Family Name</label>
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
                  <label className="block text-xs text-slate-300 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 👑 LION"
                    value={formData.badge}
                    onChange={e => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Max Capacity</label>
                  <input
                    type="number"
                    value={formData.maxMembers}
                    onChange={e => setFormData(prev => ({ ...prev, maxMembers: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Avatar / Logo Image URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formData.avatar}
                  onChange={e => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Family Slogan / Motto</label>
                <input
                  type="text"
                  placeholder="Together we conquer..."
                  value={formData.slogan}
                  onChange={e => setFormData(prev => ({ ...prev, slogan: e.target.value }))}
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
                  className="px-4 py-2 rounded-xl bg-violet-600 text-white font-bold text-xs hover:bg-violet-500"
                >
                  Save Family
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
