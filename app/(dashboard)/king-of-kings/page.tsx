'use client';

import React, { useState, useEffect } from 'react';
import {
  Crown,
  Sparkles,
  Shield,
  Zap,
  Volume2,
  Users,
  Flame,
  Diamond,
  Plus,
  Trash2,
  Edit2,
  Eye,
  Check,
  X,
  RefreshCw,
  Search,
  UploadCloud,
  FileImage,
  Award,
  Layers,
  Radio,
  Star,
  Settings2,
  Lock,
  Unlock,
  Coins,
  Gift,
  Trophy,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

interface KingRewardItem {
  key: string;
  name: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  previewUrl?: string;
  animationUrl?: string;
}

interface KingPrivilegeItem {
  key: string;
  name: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  previewUrl?: string;
}

interface KingPlanItem {
  _id: string;
  tierKey: 'knight' | 'count' | 'duke' | 'prince' | 'king';
  name: string;
  level: number;
  title: string;
  coinsPrice: number;
  dailyRewardCoins: number;
  durationDays: number;
  rewardCount?: number;
  totalRewards?: number;
  privilegeCount?: number;
  totalPrivileges?: number;
  heroBadgeUrl?: string;
  heroAnimationUrl?: string;
  rewards: KingRewardItem[];
  privileges: KingPrivilegeItem[];
  isActive: boolean;
}

export default function KingOfKingsAdminPage() {
  const [plans, setPlans] = useState<KingPlanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'tiers' | 'simulator'>('tiers');
  const [selectedPlan, setSelectedPlan] = useState<KingPlanItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Partial<KingPlanItem> | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<any>('/api/king-plans/admin');
      if (res.data?.success && res.data.plans) {
        setPlans(res.data.plans);
        if (!selectedPlan && res.data.plans.length > 0) {
          setSelectedPlan(res.data.plans[0]);
        } else if (selectedPlan) {
          const updated = res.data.plans.find((p: KingPlanItem) => p._id === selectedPlan._id);
          if (updated) setSelectedPlan(updated);
        }
      }
    } catch (err: any) {
      toast.error('Failed to load King of Kings nobility tiers: ' + (err.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleReseed = async () => {
    if (!confirm('Reseed all 5 Nobility tiers (Knight, Count, Duke, Prince, King) with 11 reward assets and 13 exclusive privileges?')) {
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.post<any>('/api/king-plans/admin/reseed');
      if (res.data?.success) {
        toast.success('Successfully reseeded all 5 King of Kings tiers!');
        fetchPlans();
      }
    } catch (err: any) {
      toast.error('Reseed failed: ' + (err.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setUploadingField(fieldName);

    try {
      toast.loading('Uploading asset...');
      const res = await apiClient.post<any>('/api/uploads/file', formData);
      toast.dismiss();
      if (res.data?.url) {
        toast.success('File uploaded successfully!');
        if (editingPlan) {
          setEditingPlan((prev: any) => ({
            ...prev,
            [fieldName]: res.data.url,
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

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan || !editingPlan._id) return;

    setLoading(true);
    try {
      const res = await apiClient.put<any>(`/api/king-plans/admin/${editingPlan._id}`, editingPlan);
      if (res.data?.success) {
        toast.success(`Nobility plan "${editingPlan.name}" updated successfully!`);
        setIsEditModalOpen(false);
        fetchPlans();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update plan');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReward = (index: number) => {
    if (!editingPlan || !editingPlan.rewards) return;
    const updated = [...editingPlan.rewards];
    updated[index].unlocked = !updated[index].unlocked;
    setEditingPlan({ ...editingPlan, rewards: updated });
  };

  const handleTogglePrivilege = (index: number) => {
    if (!editingPlan || !editingPlan.privileges) return;
    const updated = [...editingPlan.privileges];
    updated[index].unlocked = !updated[index].unlocked;
    setEditingPlan({ ...editingPlan, privileges: updated });
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
            <Crown className="w-4 h-4" /> Nobility Management Studio
          </div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            King of Kings System
            <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-mono">
              5 NOBILITY RANKS
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Configure Knight, Count, Duke, Prince, and King nobility tiers. Manage pricing, daily coin rewards, 11 reward assets, and 13 exclusive privileges matching Screenshot 2.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPlans}
            disabled={loading}
            className="px-4 py-2 bg-slate-800 text-slate-200 border border-white/10 rounded-xl hover:bg-slate-700 text-xs font-semibold flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={handleReseed}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 text-slate-950 font-bold rounded-xl hover:brightness-110 text-xs shadow-lg shadow-amber-600/20 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            1-Click Reseed (5 Tiers)
          </button>
        </div>
      </div>

      {/* Main Grid: Tiers Table + Mobile Simulator */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Tiers Cards */}
        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {plans.map((p) => {
              const isSelected = selectedPlan?._id === p._id;
              const unlockedRewards = p.rewards?.filter((r) => r.unlocked)?.length || 0;
              const unlockedPrivs = p.privileges?.filter((pr) => pr.unlocked)?.length || 0;

              return (
                <div
                  key={p._id}
                  onClick={() => setSelectedPlan(p)}
                  className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-400 font-mono">
                      RANK {p.level}
                    </span>
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                      30 Days
                    </span>
                  </div>

                  <div className="text-base font-black text-white">{p.name}</div>
                  <div className="text-xs text-amber-300 font-mono mt-1">
                    🪙 {p.coinsPrice.toLocaleString()}
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/5 text-[11px] text-slate-400 space-y-1">
                    <div>🎁 Assets: {unlockedRewards}/11</div>
                    <div>⚡ Powers: {unlockedPrivs}/13</div>
                    <div className="text-emerald-400">🪙 +{p.dailyRewardCoins.toLocaleString()}/day</div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingPlan({ ...p });
                      setIsEditModalOpen(true);
                    }}
                    className="mt-3 w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Edit2 className="w-3 h-3" /> Edit Tier
                  </button>
                </div>
              );
            })}
          </div>

          {/* Selected Plan Details Table */}
          {selectedPlan && (
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                    <Crown className="w-8 h-8 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">{selectedPlan.title}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Cost: 🪙 {selectedPlan.coinsPrice.toLocaleString()} coins • Daily Login Reward: 🪙 {selectedPlan.dailyRewardCoins.toLocaleString()} coins
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingPlan({ ...selectedPlan });
                    setIsEditModalOpen(true);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" /> Configure Assets & Powers
                </button>
              </div>

              {/* 11 Reward Assets Section */}
              <div>
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  Reward Assets ({selectedPlan.rewards?.filter((r) => r.unlocked)?.length || 0}/11 Unlocked)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {(selectedPlan.rewards || []).map((reward) => (
                    <div
                      key={reward.key}
                      className={`p-3 rounded-xl border flex items-center gap-3 ${
                        reward.unlocked
                          ? 'bg-amber-500/10 border-amber-500/30 text-white'
                          : 'bg-slate-950/40 border-white/5 text-slate-500 opacity-60'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                        {reward.unlocked ? (
                          <Unlock className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Lock className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-tight">{reward.name}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-1">{reward.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 13 Exclusive Privileges Section */}
              <div>
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Exclusive Privileges ({selectedPlan.privileges?.filter((pr) => pr.unlocked)?.length || 0}/13 Unlocked)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {(selectedPlan.privileges || []).map((priv) => (
                    <div
                      key={priv.key}
                      className={`p-3 rounded-xl border flex items-center gap-3 ${
                        priv.unlocked
                          ? 'bg-amber-500/10 border-amber-500/30 text-white'
                          : 'bg-slate-950/40 border-white/5 text-slate-500 opacity-60'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                        {priv.unlocked ? (
                          <Sparkles className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Lock className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-tight">{priv.name}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-1">{priv.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Mobile Simulator Matching Screenshot 2 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Live Mobile Simulator (Screenshot 2)
            </span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">
              375 × 740 px
            </span>
          </div>

          <div className="w-full max-w-sm mx-auto bg-[#0F0904] border-4 border-slate-800 rounded-[36px] overflow-hidden shadow-2xl relative">
            {/* Top Bar */}
            <div className="px-4 pt-4 pb-2 flex items-center justify-between text-yellow-400">
              <span className="text-sm font-bold">‹</span>
              <span className="text-xs font-black tracking-wide text-yellow-300">King of Kings</span>
              <span className="text-xs">?</span>
            </div>

            {/* Nobility Tabs */}
            <div className="flex items-center justify-around px-2 border-b border-amber-500/20 text-[11px] pb-2 font-bold">
              {['Knight', 'Count', 'Duke', 'Prince', 'King'].map((rank) => {
                const isActive = selectedPlan?.name.toLowerCase().includes(rank.toLowerCase());
                return (
                  <span
                    key={rank}
                    className={`cursor-pointer ${
                      isActive ? 'text-yellow-300 border-b-2 border-yellow-300 pb-1' : 'text-slate-500'
                    }`}
                  >
                    {rank}
                  </span>
                );
              })}
            </div>

            {/* Hero Crest Section */}
            <div className="py-6 flex flex-col items-center justify-center relative">
              <div className="w-24 h-24 rounded-full border-2 border-yellow-400 bg-[#2A1705] flex items-center justify-center relative shadow-lg shadow-amber-500/30">
                <Crown className="w-12 h-12 text-yellow-300" />
                <div className="absolute -bottom-2 bg-gradient-to-r from-amber-600 to-yellow-600 px-3 py-0.5 rounded-full border border-yellow-300 text-[9px] font-black text-amber-950 uppercase">
                  {selectedPlan?.name || 'KNIGHT'}
                </div>
              </div>
              <div className="text-sm font-black text-yellow-200 mt-3">
                {selectedPlan?.title || 'Imperial Knight'}
              </div>
              <div className="text-[10px] text-yellow-400/80">
                Daily {selectedPlan?.dailyRewardCoins.toLocaleString()} Coins • {selectedPlan?.privileges?.filter(p => p.unlocked).length || 4} Unlocked Powers
              </div>
            </div>

            {/* Blue Crystalline Curved Divider */}
            <div className="mx-6 h-[2px] bg-gradient-to-r from-sky-500 via-indigo-400 to-sky-500 relative flex items-center justify-center my-2">
              <div className="w-2 h-2 bg-sky-400 rotate-45 border border-sky-200"></div>
            </div>

            {/* Reward (7/11) Grid */}
            <div className="p-3 mx-3 bg-[#170E05] rounded-xl border border-amber-500/20 my-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-yellow-300 mb-2">
                <span>Reward ({selectedPlan?.rewards?.filter(r => r.unlocked).length || 7}/11)</span>
                <span className="text-[10px] text-yellow-400/70">Asset Rules ›</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(selectedPlan?.rewards?.slice(0, 6) || []).map((r) => (
                  <div
                    key={r.key}
                    className="p-1.5 rounded-lg bg-[#251506] border border-amber-500/20 flex flex-col items-center text-center"
                  >
                    <div className="w-6 h-6 rounded-full bg-amber-900/40 flex items-center justify-center mb-1">
                      {r.unlocked ? (
                        <Gift className="w-3 h-3 text-yellow-300" />
                      ) : (
                        <Lock className="w-3 h-3 text-slate-500" />
                      )}
                    </div>
                    <span className="text-[9px] text-yellow-200 font-semibold truncate w-full">
                      {r.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Exclusive Privileges (4/13) Badges */}
            <div className="p-3 mx-3 bg-[#170E05] rounded-xl border border-amber-500/20 my-2">
              <div className="text-[11px] font-bold text-yellow-300 mb-2">
                Exclusive privileges ({selectedPlan?.privileges?.filter(p => p.unlocked).length || 4}/13)
              </div>
              <div className="flex items-center justify-around">
                {(selectedPlan?.privileges?.slice(0, 4) || []).map((pr) => (
                  <div key={pr.key} className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full border border-yellow-400 bg-amber-900/40 flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 text-yellow-300" />
                    </div>
                    <span className="text-[8px] text-yellow-100 font-bold mt-1 max-w-[45px] text-center truncate">
                      {pr.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Purchase Bar */}
            <div className="p-3 bg-[#140C04] border-t border-amber-500/30 flex items-center justify-between">
              <div>
                <div className="text-xs font-black text-yellow-300">
                  🪙 {selectedPlan?.coinsPrice.toLocaleString()} <span className="text-[9px] font-normal text-slate-400">/ 30 days</span>
                </div>
                <div className="text-[9px] text-yellow-400/70">Daily Coins Claim Ready</div>
              </div>
              <button className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs rounded-full">
                Activate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Tier Modal */}
      {isEditModalOpen && editingPlan && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-2xl w-full p-6 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Edit {editingPlan.name} Nobility</h3>
                <p className="text-xs text-slate-400">Update pricing, daily rewards, and toggle asset unlock status</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Title Name
                  </label>
                  <input
                    type="text"
                    value={editingPlan.title || ''}
                    onChange={(e) => setEditingPlan({ ...editingPlan, title: e.target.value })}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Coins Price (30 Days)
                  </label>
                  <input
                    type="number"
                    value={editingPlan.coinsPrice || 0}
                    onChange={(e) => setEditingPlan({ ...editingPlan, coinsPrice: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Daily Login Reward (Coins)
                  </label>
                  <input
                    type="number"
                    value={editingPlan.dailyRewardCoins || 0}
                    onChange={(e) => setEditingPlan({ ...editingPlan, dailyRewardCoins: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Hero Badge Icon / Animation URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingPlan.heroBadgeUrl || ''}
                      onChange={(e) => setEditingPlan({ ...editingPlan, heroBadgeUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                    />
                    <label className="cursor-pointer px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-lg text-xs font-semibold text-slate-200 flex items-center justify-center shrink-0">
                      <UploadCloud className="w-4 h-4" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,.svga,.gif,.webp,.json"
                        onChange={(e) => handleFileUpload(e, 'heroBadgeUrl')}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Toggle 11 Reward Assets */}
              <div className="border-t border-white/10 pt-4">
                <label className="text-xs font-bold text-amber-400 block mb-2">
                  Toggle Unlocked Reward Assets (11 Total)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
                  {(editingPlan.rewards || []).map((reward, idx) => (
                    <div
                      key={reward.key}
                      onClick={() => handleToggleReward(idx)}
                      className={`p-2.5 rounded-lg border cursor-pointer flex items-center justify-between text-xs transition-colors ${
                        reward.unlocked
                          ? 'bg-amber-500/15 border-amber-500/40 text-white font-semibold'
                          : 'bg-slate-800/40 border-white/5 text-slate-400'
                      }`}
                    >
                      <span>{reward.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        reward.unlocked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {reward.unlocked ? 'UNLOCKED' : 'LOCKED'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggle 13 Exclusive Privileges */}
              <div className="border-t border-white/10 pt-4">
                <label className="text-xs font-bold text-amber-400 block mb-2">
                  Toggle Unlocked Exclusive Privileges (13 Total)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
                  {(editingPlan.privileges || []).map((priv, idx) => (
                    <div
                      key={priv.key}
                      onClick={() => handleTogglePrivilege(idx)}
                      className={`p-2.5 rounded-lg border cursor-pointer flex items-center justify-between text-xs transition-colors ${
                        priv.unlocked
                          ? 'bg-amber-500/15 border-amber-500/40 text-white font-semibold'
                          : 'bg-slate-800/40 border-white/5 text-slate-400'
                      }`}
                    >
                      <span>{priv.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        priv.unlocked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {priv.unlocked ? 'UNLOCKED' : 'LOCKED'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold rounded-xl text-xs hover:brightness-110 shadow-lg shadow-amber-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
