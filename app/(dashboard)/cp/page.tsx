'use client';

import React, { useState, useEffect } from 'react';
import {
  Heart,
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
  Sparkles,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';

interface CpItem {
  _id: string;
  user1Name: string;
  user1Avatar?: string;
  user1NumericId: string;
  user2Name: string;
  user2Avatar?: string;
  user2NumericId: string;
  intimacyScore: number;
  cpLevel: number;
  ringName: string;
  ringImage?: string;
  anniversaryDate: string;
  status: string;
}

const DEFAULT_COUPLES: CpItem[] = [
  {
    _id: 'cp_1',
    user1Name: 'Romeo',
    user1Avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop',
    user1NumericId: '100012',
    user2Name: 'Juliet',
    user2Avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop',
    user2NumericId: '100034',
    intimacyScore: 125000,
    cpLevel: 9,
    ringName: 'Eternal Diamond Ring 💍',
    anniversaryDate: '2026-05-20',
    status: 'active',
  },
  {
    _id: 'cp_2',
    user1Name: 'Prince Ali',
    user1Avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop',
    user1NumericId: '200155',
    user2Name: 'Princess Jasmine',
    user2Avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop',
    user2NumericId: '200188',
    intimacyScore: 84000,
    cpLevel: 7,
    ringName: 'Star Sapphire Ring 💎',
    anniversaryDate: '2026-07-14',
    status: 'active',
  },
  {
    _id: 'cp_3',
    user1Name: 'Aryan',
    user1Avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop',
    user1NumericId: '300999',
    user2Name: 'Simran',
    user2Avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop',
    user2NumericId: '300888',
    intimacyScore: 45000,
    cpLevel: 5,
    ringName: 'Rose Gold Band 🌹',
    anniversaryDate: '2026-08-01',
    status: 'active',
  },
];

export default function CpManagementPage() {
  const [couples, setCouples] = useState<CpItem[]>(DEFAULT_COUPLES);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Feature Flag: Hide/Show CP in App
  const [isCpEnabled, setIsCpEnabled] = useState(true);
  const [togglingConfig, setTogglingConfig] = useState(false);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CpItem | null>(null);
  const [formData, setFormData] = useState({
    user1Name: '',
    user1NumericId: '',
    user2Name: '',
    user2NumericId: '',
    intimacyScore: 10000,
    cpLevel: 1,
    ringName: 'Rose Gold Band 🌹',
    anniversaryDate: new Date().toISOString().split('T')[0],
  });

  const fetchConfig = async () => {
    try {
      const res = await apiClient.get(API_ENDPOINTS.SYSTEM_CONFIG.GET);
      if (res?.data && typeof res.data.isCpEnabled === 'boolean') {
        setIsCpEnabled(res.data.isCpEnabled);
      }
    } catch (_) {}
  };

  const fetchCouples = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(API_ENDPOINTS.CP.ADMIN_ALL).catch(() => null);
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setCouples(
          res.data.map((c: any) => ({
            _id: c._id,
            user1Name: c.user1?.name || c.user1Name || 'User 1',
            user1Avatar: c.user1?.avatar || c.user1Avatar,
            user1NumericId: c.user1?.numericId || c.user1NumericId || '100000',
            user2Name: c.user2?.name || c.user2Name || 'User 2',
            user2Avatar: c.user2?.avatar || c.user2Avatar,
            user2NumericId: c.user2?.numericId || c.user2NumericId || '100001',
            intimacyScore: c.intimacyScore || 0,
            cpLevel: c.cpLevel || 1,
            ringName: c.ringName || 'Love Ring',
            anniversaryDate: c.anniversaryDate || new Date().toISOString().split('T')[0],
            status: c.status || 'active',
          }))
        );
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchCouples();
  }, []);

  const handleToggleCpFeature = async () => {
    try {
      setTogglingConfig(true);
      const nextState = !isCpEnabled;
      await apiClient.post(API_ENDPOINTS.SYSTEM_CONFIG.TOGGLE, {
        feature: 'isCpEnabled',
        enabled: nextState,
      });
      setIsCpEnabled(nextState);
      toast.success(
        nextState
          ? 'CP (Couple) System is now visible in Yaro App!'
          : 'CP (Couple) System has been HIDDEN from Yaro App!'
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
      user1Name: '',
      user1NumericId: '',
      user2Name: '',
      user2NumericId: '',
      intimacyScore: 10000,
      cpLevel: 1,
      ringName: 'Eternal Diamond Ring 💍',
      anniversaryDate: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: CpItem) => {
    setEditingItem(item);
    setFormData({
      user1Name: item.user1Name,
      user1NumericId: item.user1NumericId,
      user2Name: item.user2Name,
      user2NumericId: item.user2NumericId,
      intimacyScore: item.intimacyScore,
      cpLevel: item.cpLevel,
      ringName: item.ringName,
      anniversaryDate: item.anniversaryDate,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.user1Name.trim() || !formData.user2Name.trim()) {
      toast.error('Both partner names are required');
      return;
    }

    try {
      if (editingItem) {
        await apiClient.put(API_ENDPOINTS.CP.UPDATE(editingItem._id), formData).catch(() => null);
        setCouples(prev =>
          prev.map(c => (c._id === editingItem._id ? { ...c, ...formData } : c))
        );
        toast.success('CP couple updated successfully!');
      } else {
        const newItem: CpItem = {
          _id: `cp_${Date.now()}`,
          ...formData,
          user1Avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop',
          user2Avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop',
          status: 'active',
        };
        setCouples(prev => [newItem, ...prev]);
        toast.success('New CP couple connected successfully!');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save CP couple');
    }
  };

  const handleDissolve = async (id: string, name1: string, name2: string) => {
    try {
      await apiClient.delete(API_ENDPOINTS.CP.DELETE(id)).catch(() => null);
      setCouples(prev => prev.filter(c => c._id !== id));
      toast.success(`CP between ${name1} and ${name2} dissolved`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to dissolve CP');
    }
  };

  const filteredCouples = couples.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      c.user1Name.toLowerCase().includes(q) ||
      c.user2Name.toLowerCase().includes(q) ||
      c.user1NumericId.includes(q) ||
      c.user2NumericId.includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Feature Toggle (Show/Hide in App) */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-pink-950/40 via-rose-950/20 to-slate-900 border border-pink-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-xl shadow-pink-500/20">
              <Heart size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">CP (Couple) System Console</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  LOVE & INTIMACY
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Configure Couple rings, intimacy scores, CP space, and toggle CP visibility inside Yaro Mobile App.
              </p>
            </div>
          </div>

          {/* Toggle Control: Show/Hide in App */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="text-left">
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  {isCpEnabled ? (
                    <Eye size={14} className="text-emerald-400" />
                  ) : (
                    <EyeOff size={14} className="text-rose-400" />
                  )}
                  <span>App Visibility</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {isCpEnabled ? 'Visible in Mobile App' : 'Hidden from Mobile App'}
                </span>
              </div>

              <button
                onClick={handleToggleCpFeature}
                disabled={togglingConfig}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isCpEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isCpEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-semibold text-xs shadow-lg shadow-pink-500/20 transition"
            >
              <Plus size={16} />
              Connect Couple
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium">Couples Formed</span>
          <div className="text-2xl font-bold text-white mt-1">{couples.length}</div>
          <span className="text-[10px] text-slate-500">Official CP pairs</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium">Top Intimacy Score</span>
          <div className="text-2xl font-bold text-pink-400 mt-1">
            {couples.length > 0
              ? Math.max(...couples.map(c => c.intimacyScore)).toLocaleString()
              : 0}{' '}
            💖
          </div>
          <span className="text-[10px] text-slate-500">Highest love tier</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium">Rings Equipped</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{couples.length}</div>
          <span className="text-[10px] text-slate-500">Eternal badges active</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium">App Feature Status</span>
          <div
            className={`text-2xl font-bold mt-1 ${
              isCpEnabled ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isCpEnabled ? 'VISIBLE' : 'HIDDEN'}
          </div>
          <span className="text-[10px] text-slate-500">
            {isCpEnabled ? 'Couples live in App' : 'CP space hidden in App'}
          </span>
        </div>
      </div>

      {/* Couples List */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="relative w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search CP by name or ID..."
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
                <th className="p-3.5">Partners</th>
                <th className="p-3.5">Partner IDs</th>
                <th className="p-3.5">Intimacy Score</th>
                <th className="p-3.5">CP Level</th>
                <th className="p-3.5">Ring Title</th>
                <th className="p-3.5">Anniversary</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCouples.map(c => (
                <tr key={c._id} className="hover:bg-slate-800/30 transition">
                  <td className="p-3.5 flex items-center gap-2">
                    <div className="flex items-center -space-x-2">
                      <img
                        src={c.user1Avatar}
                        alt="User 1"
                        className="w-8 h-8 rounded-full border-2 border-pink-500 object-cover"
                      />
                      <img
                        src={c.user2Avatar}
                        alt="User 2"
                        className="w-8 h-8 rounded-full border-2 border-purple-500 object-cover"
                      />
                    </div>
                    <span className="font-bold text-white">
                      {c.user1Name} & {c.user2Name}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-400">
                    {c.user1NumericId} / {c.user2NumericId}
                  </td>
                  <td className="p-3.5 font-mono text-pink-400 font-bold">
                    {c.intimacyScore.toLocaleString()} 💖
                  </td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                      Lv. {c.cpLevel}
                    </span>
                  </td>
                  <td className="p-3.5 text-amber-300 font-medium">{c.ringName}</td>
                  <td className="p-3.5 text-slate-400">{c.anniversaryDate}</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleOpenEditModal(c)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 mr-1"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDissolve(c._id, c.user1Name, c.user2Name)}
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
              {editingItem ? 'Edit CP Couple' : 'Connect New Couple (CP)'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Partner 1 Name</label>
                  <input
                    type="text"
                    required
                    value={formData.user1Name}
                    onChange={e => setFormData(prev => ({ ...prev, user1Name: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Partner 1 Numeric ID</label>
                  <input
                    type="text"
                    required
                    value={formData.user1NumericId}
                    onChange={e => setFormData(prev => ({ ...prev, user1NumericId: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Partner 2 Name</label>
                  <input
                    type="text"
                    required
                    value={formData.user2Name}
                    onChange={e => setFormData(prev => ({ ...prev, user2Name: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Partner 2 Numeric ID</label>
                  <input
                    type="text"
                    required
                    value={formData.user2NumericId}
                    onChange={e => setFormData(prev => ({ ...prev, user2NumericId: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Intimacy Points</label>
                  <input
                    type="number"
                    value={formData.intimacyScore}
                    onChange={e => setFormData(prev => ({ ...prev, intimacyScore: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">CP Level</label>
                  <input
                    type="number"
                    value={formData.cpLevel}
                    onChange={e => setFormData(prev => ({ ...prev, cpLevel: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Ring Type</label>
                <input
                  type="text"
                  value={formData.ringName}
                  onChange={e => setFormData(prev => ({ ...prev, ringName: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Anniversary Date</label>
                <input
                  type="date"
                  value={formData.anniversaryDate}
                  onChange={e => setFormData(prev => ({ ...prev, anniversaryDate: e.target.value }))}
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
                  className="px-4 py-2 rounded-xl bg-pink-600 text-white font-bold text-xs hover:bg-pink-500"
                >
                  Save CP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
