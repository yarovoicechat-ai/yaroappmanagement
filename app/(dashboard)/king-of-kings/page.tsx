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
  Home,
  MessageCircle,
  Smartphone,
  ChevronRight,
  HelpCircle,
  Car,
  FileText,
  KeyRound,
  Tag,
  Palette,
  Mic,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { suggestAssetName } from '@/lib/aiAssetName';

// 15 Official Royal Privileges strictly matching KingOfKingsScreen in the App
export const APP_ROYAL_PRIVILEGES = [
  { key: 'kings_badge', name: 'Aristocracy Badge', icon: 'ribbon', desc: 'Exclusive nobility badge on your profile.', level: 1 },
  { key: 'exclusive_gifts', name: 'Aristocracy Gifts', icon: 'gift', desc: 'Exclusive gifts for nobility members.', level: 1 },
  { key: 'room_list_badge', name: 'Room List Badge', icon: 'home', desc: 'Nobility badge on the room list.', level: 1 },
  { key: 'rank_the_top', name: 'Ranking Surprise', icon: 'podium', desc: 'Priority position in the room member list.', level: 1 },
  { key: 'entry_effect', name: 'Dazzling Entry', icon: 'sparkles', desc: 'Enter the room with a dazzling effect.', level: 1 },
  { key: 'chat_bubble', name: 'Room Text Bubble', icon: 'chatbubble-ellipses', desc: 'Exclusive text bubble in the room.', level: 2 },
  { key: 'profile_card', name: 'Profile Cover', icon: 'person-circle', desc: 'Exclusive nobility profile cover.', level: 2 },
  { key: 'coloured_message', name: 'Coloured Message', icon: 'chatbubbles', desc: 'Send coloured messages in the room.', level: 2 },
  { key: 'mic_seat_aura', name: 'Unique Voice Wave', icon: 'radio', desc: 'A unique voice wave while speaking on mic.', level: 3 },
  { key: 'room_theme', name: 'Room Theme', icon: 'color-palette', desc: 'Exclusive nobility theme for your room.', level: 3 },
  { key: 'apply_mic', name: 'Apply Mic', icon: 'mic', desc: 'Apply for a mic when the seat is locked.', level: 3 },
  { key: 'vehicle', name: 'Vehicle', icon: 'car-sport', desc: 'Arrive in the room with a special vehicle.', level: 4 },
  { key: 'colorful_nick', name: 'Coloured Mic Name', icon: 'text', desc: 'A coloured name while on the mic.', level: 4 },
  { key: 'room_lock', name: 'Room Lock', icon: 'lock-closed', desc: 'Set a password for friends to enter your room.', level: 5 },
  { key: 'store_discount', name: 'Store Discount', icon: 'pricetags', desc: 'Member discounts in the store.', level: 5 },
];

export const FALLBACK_APP_KING_TIERS: KingPlanItem[] = [
  {
    _id: 'viscount_fallback',
    tierKey: 'viscount',
    name: 'Viscount',
    level: 1,
    title: 'Imperial Viscount',
    coinsPrice: 99000,
    dailyRewardCoins: 1000,
    durationDays: 30,
    heroBadgeUrl: 'https://cdn-icons-png.flaticon.com/512/2583/2583344.png',
    rewards: [
      { key: 'activation_bonus', name: 'Activation bonus', desc: 'Receive 1,000 coins once on activation', icon: 'cash', unlocked: true },
      { key: 'notification_broadcast', name: 'Broadcast', desc: 'App-wide banner when entering rooms', icon: 'megaphone', unlocked: true },
      { key: 'kings_logo', name: 'Logo', desc: 'Exclusive Viscount heraldic emblem on profile', icon: 'shield', unlocked: true },
      { key: 'kings_badge', name: 'Kings badge', desc: 'Dynamic glowing 3D Viscount nobility badge', icon: 'ribbon', unlocked: true },
      { key: 'avatar_frame', name: 'Avatar frame', desc: 'Golden Winged Stag animated frame', icon: 'disc', unlocked: true },
      { key: 'entry_effect', name: 'Entry effect', desc: 'Royal golden sports car arrival effect', icon: 'flash', unlocked: true },
      { key: 'barrage', name: 'Barrage', desc: 'Golden bullet screen text in live party', icon: 'chatbubbles', unlocked: true },
      { key: 'chat_bubble', name: 'Chat bubble', desc: 'Viscount amber glass message bubble', icon: 'chatbubble', unlocked: false },
      { key: 'mic_seat_aura', name: 'Mic aura', desc: 'Floating golden aura when on mic seat', icon: 'radio', unlocked: false },
      { key: 'profile_card', name: 'Profile theme', desc: 'Gold leaf prestige profile card background', icon: 'card', unlocked: false },
      { key: 'custom_gift', name: 'Exclusive gift', desc: 'Send exclusive 3D animated nobility gifts', icon: 'gift', unlocked: false },
    ],
    privileges: APP_ROYAL_PRIVILEGES.map(p => ({
      key: p.key,
      name: p.name,
      desc: p.desc,
      icon: p.icon,
      unlocked: 1 >= p.level,
    })),
    isActive: true,
  },
  {
    _id: 'count_fallback',
    tierKey: 'count',
    name: 'Count',
    level: 2,
    title: 'Royal Count',
    coinsPrice: 249000,
    dailyRewardCoins: 2500,
    durationDays: 30,
    heroBadgeUrl: '/king/viscount_badge.png',
    rewards: [
      { key: 'activation_bonus', name: 'Activation bonus', desc: 'Receive 2,500 coins once on activation', icon: 'cash', unlocked: true },
      { key: 'notification_broadcast', name: 'Broadcast', desc: 'Count royal trumpet arrival announcement', icon: 'megaphone', unlocked: true },
      { key: 'kings_logo', name: 'Logo', desc: 'Amethyst & Gold Count Coat of Arms', icon: 'shield', unlocked: true },
      { key: 'kings_badge', name: 'Kings badge', desc: 'Shimmering Purple & Gold Count Nobility Badge', icon: 'ribbon', unlocked: true },
      { key: 'avatar_frame', name: 'Avatar frame', desc: 'Count Regal Amethyst Wings Frame', icon: 'disc', unlocked: true },
      { key: 'entry_effect', name: 'Entry effect', desc: 'Supercar Phantom Entry with fireworks', icon: 'flash', unlocked: true },
      { key: 'barrage', name: 'Barrage', desc: 'Purple neon bullet comments in room', icon: 'chatbubbles', unlocked: true },
      { key: 'chat_bubble', name: 'Chat bubble', desc: 'Count Purple Velvet chat bubble', icon: 'chatbubble', unlocked: true },
      { key: 'mic_seat_aura', name: 'Mic aura', desc: 'Violet crystal pulsing mic aura', icon: 'radio', unlocked: false },
      { key: 'profile_card', name: 'Profile theme', desc: 'Midnight amethyst nobility card theme', icon: 'card', unlocked: false },
      { key: 'custom_gift', name: 'Exclusive gift', desc: 'Count Royal Crown 3D animated gift', icon: 'gift', unlocked: false },
    ],
    privileges: APP_ROYAL_PRIVILEGES.map(p => ({
      key: p.key,
      name: p.name,
      desc: p.desc,
      icon: p.icon,
      unlocked: 2 >= p.level,
    })),
    isActive: true,
  },
  {
    _id: 'marquis_fallback',
    tierKey: 'marquis',
    name: 'Marquis',
    level: 3,
    title: 'Sovereign Marquis',
    coinsPrice: 499000,
    dailyRewardCoins: 6000,
    durationDays: 30,
    heroBadgeUrl: 'https://cdn-icons-png.flaticon.com/512/2583/2583345.png',
    rewards: [
      { key: 'activation_bonus', name: 'Activation bonus', desc: 'Receive 6,000 coins once on activation', icon: 'cash', unlocked: true },
      { key: 'notification_broadcast', name: 'Broadcast', desc: 'Sovereign banner broadcast across the whole app', icon: 'megaphone', unlocked: true },
      { key: 'kings_logo', name: 'Logo', desc: 'Ruby Marquis Crest with Diamond Insignia', icon: 'shield', unlocked: true },
      { key: 'kings_badge', name: 'Kings badge', desc: '3D Golden Lion & Eagle Marquis Medal', icon: 'ribbon', unlocked: true },
      { key: 'avatar_frame', name: 'Avatar frame', desc: 'Marquis Imperial Golden Eagle Crown Frame', icon: 'disc', unlocked: true },
      { key: 'entry_effect', name: 'Entry effect', desc: 'Golden Chariot & Dragon landing entry effect', icon: 'flash', unlocked: true },
      { key: 'barrage', name: 'Barrage', desc: 'Crimson Red Laser bullet screen', icon: 'chatbubbles', unlocked: true },
      { key: 'chat_bubble', name: 'Chat bubble', desc: 'Marquis Ruby Blaze glass bubble', icon: 'chatbubble', unlocked: true },
      { key: 'mic_seat_aura', name: 'Mic aura', desc: 'Golden Winged mic pedestal aura', icon: 'radio', unlocked: true },
      { key: 'profile_card', name: 'Profile theme', desc: 'Imperial Marquis velvet theme', icon: 'card', unlocked: false },
      { key: 'custom_gift', name: 'Exclusive gift', desc: 'Marquis Sovereign Scepter 3D Gift', icon: 'gift', unlocked: false },
    ],
    privileges: APP_ROYAL_PRIVILEGES.map(p => ({
      key: p.key,
      name: p.name,
      desc: p.desc,
      icon: p.icon,
      unlocked: 3 >= p.level,
    })),
    isActive: true,
  },
  {
    _id: 'duke_fallback',
    tierKey: 'duke',
    name: 'Duke',
    level: 4,
    title: 'Crown Duke',
    coinsPrice: 999000,
    dailyRewardCoins: 15000,
    durationDays: 30,
    heroBadgeUrl: 'https://cdn-icons-png.flaticon.com/512/2583/2583342.png',
    rewards: [
      { key: 'activation_bonus', name: 'Activation bonus', desc: 'Receive 15,000 coins once on activation', icon: 'cash', unlocked: true },
      { key: 'notification_broadcast', name: 'Broadcast', desc: 'Royal herald horn fanfare across all servers', icon: 'megaphone', unlocked: true },
      { key: 'kings_logo', name: 'Logo', desc: 'Crown Duke Golden Wing Crest', icon: 'shield', unlocked: true },
      { key: 'kings_badge', name: 'Kings badge', desc: 'Rotating Diamond Crown Duke Seal', icon: 'ribbon', unlocked: true },
      { key: 'avatar_frame', name: 'Avatar frame', desc: 'Crown Duke Platinum Dragon Frame', icon: 'disc', unlocked: true },
      { key: 'entry_effect', name: 'Entry effect', desc: 'Supersonic Royal Jet entrance animation', icon: 'flash', unlocked: true },
      { key: 'barrage', name: 'Barrage', desc: 'Electric Rainbow laser barrage', icon: 'chatbubbles', unlocked: true },
      { key: 'chat_bubble', name: 'Chat bubble', desc: 'Platinum Duke crystal bubble', icon: 'chatbubble', unlocked: true },
      { key: 'mic_seat_aura', name: 'Mic aura', desc: 'Electric dragon aura circling mic seat', icon: 'radio', unlocked: true },
      { key: 'profile_card', name: 'Profile theme', desc: 'Diamond encrusted duke profile theme', icon: 'card', unlocked: true },
      { key: 'custom_gift', name: 'Exclusive gift', desc: 'Duke Pegasus 3D Animated Gift', icon: 'gift', unlocked: false },
    ],
    privileges: APP_ROYAL_PRIVILEGES.map(p => ({
      key: p.key,
      name: p.name,
      desc: p.desc,
      icon: p.icon,
      unlocked: 4 >= p.level,
    })),
    isActive: true,
  },
  {
    _id: 'king_fallback',
    tierKey: 'king',
    name: 'King',
    level: 5,
    title: 'Supreme King of Kings',
    coinsPrice: 1999000,
    dailyRewardCoins: 35000,
    durationDays: 30,
    heroBadgeUrl: 'https://cdn-icons-png.flaticon.com/512/2583/2583434.png',
    rewards: [
      { key: 'activation_bonus', name: 'Activation bonus', desc: 'Receive 35,000 coins once on activation', icon: 'cash', unlocked: true },
      { key: 'notification_broadcast', name: 'Broadcast', desc: 'Supreme emperor app-wide golden fanfare banner', icon: 'megaphone', unlocked: true },
      { key: 'kings_logo', name: 'Logo', desc: 'Imperial King of Kings Sun & Crown Emblem', icon: 'shield', unlocked: true },
      { key: 'kings_badge', name: 'Kings badge', desc: 'Golden Winged Stag Imperial Crown Badge', icon: 'ribbon', unlocked: true },
      { key: 'avatar_frame', name: 'Avatar frame', desc: 'Supreme King of Kings 3D Sovereign Frame', icon: 'disc', unlocked: true },
      { key: 'entry_effect', name: 'Entry effect', desc: 'Golden Sovereign Yacht & Fireworks Entry', icon: 'flash', unlocked: true },
      { key: 'barrage', name: 'Barrage', desc: 'Supreme Gold Spark barrage', icon: 'chatbubbles', unlocked: true },
      { key: 'chat_bubble', name: 'Chat bubble', desc: 'Imperial Crown diamond glass bubble', icon: 'chatbubble', unlocked: true },
      { key: 'mic_seat_aura', name: 'Mic aura', desc: 'Sunburst solar corona mic aura', icon: 'radio', unlocked: true },
      { key: 'profile_card', name: 'Profile theme', desc: 'Imperial Palace golden throne card theme', icon: 'card', unlocked: true },
      { key: 'custom_gift', name: 'Exclusive gift', desc: 'King of Kings Golden Dragon 3D gift', icon: 'gift', unlocked: true },
    ],
    privileges: APP_ROYAL_PRIVILEGES.map(p => ({
      key: p.key,
      name: p.name,
      desc: p.desc,
      icon: p.icon,
      unlocked: 5 >= p.level,
    })),
    isActive: true,
  },
];

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
  tierKey: 'viscount' | 'count' | 'marquis' | 'duke' | 'king' | string;
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

function getPrivilegeIcon(iconKey: string, isUnlocked: boolean) {
  const colorClass = isUnlocked ? 'text-[#795021]' : 'text-slate-400';
  switch (iconKey) {
    case 'ribbon':
      return <Award className={`w-5 h-5 ${colorClass}`} />;
    case 'gift':
      return <Gift className={`w-5 h-5 ${colorClass}`} />;
    case 'home':
      return <Home className={`w-5 h-5 ${colorClass}`} />;
    case 'podium':
      return <Trophy className={`w-5 h-5 ${colorClass}`} />;
    case 'sparkles':
      return <Sparkles className={`w-5 h-5 ${colorClass}`} />;
    case 'chatbubble-ellipses':
      return <MessageCircle className={`w-5 h-5 ${colorClass}`} />;
    case 'person-circle':
      return <Users className={`w-5 h-5 ${colorClass}`} />;
    case 'chatbubbles':
      return <Flame className={`w-5 h-5 ${colorClass}`} />;
    case 'radio':
      return <Radio className={`w-5 h-5 ${colorClass}`} />;
    case 'color-palette':
      return <Palette className={`w-5 h-5 ${colorClass}`} />;
    case 'mic':
      return <Mic className={`w-5 h-5 ${colorClass}`} />;
    case 'car-sport':
      return <Car className={`w-5 h-5 ${colorClass}`} />;
    case 'text':
      return <FileText className={`w-5 h-5 ${colorClass}`} />;
    case 'lock-closed':
      return <KeyRound className={`w-5 h-5 ${colorClass}`} />;
    case 'pricetags':
      return <Tag className={`w-5 h-5 ${colorClass}`} />;
    default:
      return <Sparkles className={`w-5 h-5 ${colorClass}`} />;
  }
}

export default function KingOfKingsAdminPage() {
  const [plans, setPlans] = useState<KingPlanItem[]>(FALLBACK_APP_KING_TIERS);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<KingPlanItem>(FALLBACK_APP_KING_TIERS[0]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Partial<KingPlanItem> | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.get<any>('/api/king-plans/admin');
      const apiPlans = res?.data?.plans || res?.plans || (Array.isArray(res?.data) ? res.data : []);
      if (apiPlans && Array.isArray(apiPlans) && apiPlans.length > 0) {
        // Merge with APP_ROYAL_PRIVILEGES to guarantee all 15 royal privileges are populated
        const merged = apiPlans.map((p: any) => {
          const tierLevel = p.level || p.tierLevel || 1;
          const mappedPrivileges = APP_ROYAL_PRIVILEGES.map(appPriv => {
            const existing = (p.privileges || []).find((pr: any) => pr.key === appPriv.key);
            return {
              key: appPriv.key,
              name: appPriv.name,
              desc: appPriv.desc,
              icon: appPriv.icon,
              unlocked: existing ? existing.unlocked : tierLevel >= appPriv.level,
            };
          });

          return {
            ...p,
            tierKey: p.slug || p.tierKey || p.name.toLowerCase(),
            level: tierLevel,
            dailyRewardCoins: p.dailyRewardCoins || p.totalReturnCoins || p.dailyCoins || (tierLevel === 1 ? 1000 : tierLevel === 2 ? 2500 : tierLevel === 3 ? 6000 : tierLevel === 4 ? 15000 : 35000),
            privileges: mappedPrivileges,
          };
        });

        setPlans(merged);
        const match = merged.find((p: any) => p.tierKey === selectedPlan?.tierKey) || merged[0];
        setSelectedPlan(match);
      }
    } catch {
      // Keep fallbacks active
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleReseed = async () => {
    if (!confirm('Reseed all 5 Nobility tiers (Viscount, Count, Marquis, Duke, King) with exact app prices and 15 Royal Privileges?')) {
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.post<any>('/api/king-plans/admin/reseed');
      if (res?.success || res?.data?.success) {
        toast.success('Successfully synced all 5 King of Kings tiers with the App!');
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
      const res = await apiClient.uploadFile<any>('/api/upload/file', formData);
      toast.dismiss();
      if (res.data?.url) {
        const suggestedName = await suggestAssetName(file, 'King of Kings badge');
        toast.success('File uploaded successfully!');
        if (editingPlan) {
          setEditingPlan((prev: any) => ({
            ...prev,
            [fieldName]: res.data.url,
            name: prev?.name?.trim() ? prev.name : (suggestedName || prev?.name || ''),
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
    if (!editingPlan) return;

    setLoading(true);
    try {
      if (editingPlan._id && !editingPlan._id.includes('fallback')) {
        const res = await apiClient.put<any>(`/api/king-plans/admin/${editingPlan._id}`, editingPlan);
        if (res?.success || res?.data?.success) {
          toast.success(`Nobility plan "${editingPlan.name}" updated successfully!`);
          setIsEditModalOpen(false);
          fetchPlans();
          return;
        }
      }

      // Local update if fallback mode
      setPlans(prev => prev.map(p => p.tierKey === editingPlan.tierKey ? ({ ...p, ...editingPlan } as KingPlanItem) : p));
      setSelectedPlan(prev => prev.tierKey === editingPlan.tierKey ? ({ ...prev, ...editingPlan } as KingPlanItem) : prev);
      toast.success(`Nobility plan "${editingPlan.name}" saved!`);
      setIsEditModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update plan');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePrivilege = (index: number) => {
    if (!editingPlan || !editingPlan.privileges) return;
    const updated = [...editingPlan.privileges];
    updated[index].unlocked = !updated[index].unlocked;
    setEditingPlan({ ...editingPlan, privileges: updated });
  };

  const currentTier = selectedPlan || plans[0];
  const unlockedPrivilegesCount = currentTier?.privileges?.filter(p => p.unlocked).length || 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-amber-500/20 p-6 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Crown className="w-6 h-6 text-slate-950 font-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">King of Kings Nobility Console</h1>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                App-Synced
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Configure the 5 Royal Tiers (Viscount, Count, Marquis, Duke, King), coin prices, one-time bonuses, and 15 Royal Privileges matching the mobile app.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPlans}
            disabled={loading}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2 border border-white/10"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleReseed}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Sparkles className="w-4 h-4" />
            Reseed App-Matching Tiers
          </button>
        </div>
      </div>

      {/* Main Grid: Left Controls (Tiers + 15 Privileges) & Right Mobile Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tiers and Configuration (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 5 Tiers Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Crown className="w-4 h-4" /> 5 Royal Nobility Tiers
              </h3>
              <span className="text-xs text-slate-400">Click any tier to view and simulate</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {plans.map((p) => {
                const isSelected = selectedPlan?.tierKey === p.tierKey;
                const privsCount = p.privileges?.filter(pr => pr.unlocked).length || 0;

                return (
                  <div
                    key={p.tierKey || p._id}
                    onClick={() => setSelectedPlan(p)}
                    className={`p-3.5 rounded-2xl cursor-pointer border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/80 shadow-lg shadow-amber-500/10 scale-[1.02]'
                        : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black text-amber-400 font-mono uppercase">
                          RANK {p.level}
                        </span>
                        <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                          30D
                        </span>
                      </div>

                      <div className="text-sm font-black text-white">{p.name}</div>
                      <div className="text-[11px] text-amber-300 font-mono mt-0.5">
                        🪙 {p.coinsPrice.toLocaleString()}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/5 space-y-1 text-[10px]">
                      <div className="text-slate-400">⭐ Privileges: <span className="text-amber-300 font-bold">{privsCount}/15</span></div>
                      <div className="text-emerald-400 font-medium">🎁 +{p.dailyRewardCoins.toLocaleString()} bonus</div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPlan({ ...p });
                        setIsEditModalOpen(true);
                      }}
                      className="mt-2.5 w-full py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1"
                    >
                      <Edit2 className="w-2.5 h-2.5" /> Edit
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Plan Details & 15 Royal Privileges Table */}
          {currentTier && (
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                    <Crown className="w-8 h-8 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black text-white">{currentTier.title}</h2>
                      <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                        Rank {currentTier.level}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Price: <span className="text-amber-300 font-bold font-mono">🪙 {currentTier.coinsPrice.toLocaleString()} coins</span> • One-Time Bonus: <span className="text-emerald-400 font-bold font-mono">🪙 {currentTier.dailyRewardCoins.toLocaleString()} coins</span> • Duration: 30 days
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingPlan({ ...currentTier });
                    setIsEditModalOpen(true);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow"
                >
                  <Edit2 className="w-4 h-4" /> Edit Tier & Privileges
                </button>
              </div>

              {/* 15 Royal Privileges Section (matching KingOfKingsScreen) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    15 Royal Privileges ({unlockedPrivilegesCount}/15 Unlocked for {currentTier.name})
                  </h3>
                  <span className="text-[11px] text-slate-400">Strictly matching YaroApp mobile layout</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {(currentTier.privileges || []).map((priv, idx) => {
                    const appRef = APP_ROYAL_PRIVILEGES.find(p => p.key === priv.key) || APP_ROYAL_PRIVILEGES[idx] || { level: 1, icon: 'sparkles' };
                    const isUnlocked = priv.unlocked;

                    return (
                      <div
                        key={priv.key || idx}
                        className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${
                          isUnlocked
                            ? 'bg-amber-500/10 border-amber-500/30 text-white'
                            : 'bg-slate-950/40 border-white/5 text-slate-500 opacity-60'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isUnlocked ? 'bg-gradient-to-br from-amber-400/30 to-yellow-600/30 border border-amber-500/40' : 'bg-slate-800'
                        }`}>
                          {getPrivilegeIcon(appRef.icon, isUnlocked)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold truncate">{priv.name}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                              Lvl {appRef.level}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{priv.desc}</p>
                          <div className="mt-1 flex items-center gap-1.5">
                            {isUnlocked ? (
                              <span className="text-[9px] text-emerald-400 font-semibold flex items-center gap-0.5">
                                <Check className="w-2.5 h-2.5" /> Included in {currentTier.name}
                              </span>
                            ) : (
                              <span className="text-[9px] text-slate-500 font-semibold flex items-center gap-0.5">
                                <Lock className="w-2.5 h-2.5" /> Unlocks at Rank {appRef.level}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 11 Reward Assets Summary */}
              <div className="pt-4 border-t border-white/5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Gift className="w-3.5 h-3.5 text-amber-400" />
                  Nobility Reward Assets ({currentTier.rewards?.filter(r => r.unlocked).length || 0}/11 Unlocked)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(currentTier.rewards || []).map((reward) => (
                    <span
                      key={reward.key}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                        reward.unlocked
                          ? 'bg-amber-950/40 border-amber-500/30 text-amber-200'
                          : 'bg-slate-900 border-white/5 text-slate-500 opacity-50'
                      }`}
                    >
                      {reward.unlocked ? <Check className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-slate-500" />}
                      {reward.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Mobile Simulator Matching KingOfKingsScreen.js (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-amber-400" />
              Live App Simulator (KingOfKingsScreen.js)
            </span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
              375 × 740 px
            </span>
          </div>

          {/* Mobile Screen Shell */}
          <div className="w-full max-w-sm mx-auto bg-[#0F0904] border-4 border-slate-800 rounded-[38px] overflow-hidden shadow-2xl relative select-none">
            {/* Mobile Header Bar */}
            <div className="px-4 pt-4 pb-2 flex items-center justify-between border-b border-[#2A1C0E]">
              <span className="text-base font-bold text-[#FDE047] cursor-pointer">‹</span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-wide text-white">King of Kings</span>
              </div>
              <HelpCircle className="w-4 h-4 text-[#FDE047] cursor-pointer" />
            </div>

            {/* Nobility Tabs Row (Viscount, Count, Marquis, Duke, King) */}
            <div className="flex items-center justify-around px-2 border-b border-[#2A1C0E] text-[11px] pt-2 pb-2 font-bold bg-[#140C04]">
              {['Viscount', 'Count', 'Marquis', 'Duke', 'King'].map((rank) => {
                const isActive = currentTier?.name.toLowerCase() === rank.toLowerCase();
                return (
                  <button
                    key={rank}
                    onClick={() => {
                      const match = plans.find(p => p.name.toLowerCase() === rank.toLowerCase());
                      if (match) setSelectedPlan(match);
                    }}
                    className={`pb-1 relative transition-colors ${
                      isActive ? 'text-[#FDE047] font-black' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {rank}
                    {isActive && (
                      <div className="absolute -bottom-2 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#FDE047] to-[#EAB308] rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Scrollable Simulator Body */}
            <div className="max-h-[560px] overflow-y-auto space-y-4 p-4 scrollbar-thin scrollbar-thumb-amber-900/40">
              {/* Royal Hero Section */}
              <div className="bg-gradient-to-b from-[#221305] to-[#140B03] border border-[#4A2D0E] rounded-2xl p-4 flex flex-col items-center text-center shadow-lg relative">
                {/* Nobility Crest */}
                <div className="w-20 h-20 rounded-full border-2 border-[#FFE5A4] bg-gradient-to-b from-[#BA7B38] to-[#57371F] flex items-center justify-center relative shadow-lg shadow-amber-500/20">
                  <Crown className="w-10 h-10 text-[#F5D49A]" />
                  <div className="absolute -bottom-2 bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-700 px-2.5 py-0.5 rounded-full border border-[#FDE047] text-[8px] font-black text-white uppercase tracking-wider shadow">
                    NOBILITY {currentTier.level}
                  </div>
                </div>

                <div className="mt-3">
                  <span className="text-[9px] font-bold text-amber-500 tracking-[0.16em] uppercase">THE ROYAL COLLECTION</span>
                  <h4 className="text-base font-black text-white">{currentTier.name}</h4>
                  <p className="text-[11px] text-[#E9C889]">{currentTier.title}</p>
                </div>

                {/* Daily Bonus Pill */}
                <div className="mt-2.5 bg-[#2E1A07] border border-[#59340E] px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Gift className="w-3 h-3 text-[#E9C889]" />
                  <span className="text-[10px] font-bold text-[#E9C889]">
                    {currentTier.dailyRewardCoins.toLocaleString()} bonus coins
                  </span>
                </div>
                <span className="text-[9px] text-[#8C6239] mt-1">30 days • bonus paid once</span>
              </div>

              {/* Tier Indicators dots */}
              <div className="flex items-center justify-center gap-1.5 py-1">
                {plans.map((p, idx) => {
                  const isActive = p.tierKey === currentTier.tierKey;
                  return (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all ${
                        isActive ? 'w-5 bg-gradient-to-r from-[#FDE047] to-[#D97706]' : 'w-1.5 bg-white/20'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Benefits Panel: 15 Royal Privileges (5 rows of 3) */}
              <div className="bg-[#170E05] border border-[#3E230B] rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[8px] font-bold text-[#A67C4A] tracking-wider uppercase block">YOUR NOBILITY, ELEVATED</span>
                    <h5 className="text-xs font-black text-[#F4DCB0]">Royal privileges</h5>
                  </div>
                  <div className="bg-[#2C1805] border border-[#5A330B] px-2 py-0.5 rounded-full text-[9px] font-bold text-[#F4DCB0]">
                    {unlockedPrivilegesCount}/15
                  </div>
                </div>

                <p className="text-[9px] text-[#9A7A57]">
                  Discover everything included with {currentTier.name}. Tap a benefit to explore.
                </p>

                {/* 15 Privileges 3-col Grid strictly matching mobile app */}
                <div className="grid grid-cols-3 gap-2">
                  {(currentTier.privileges || []).map((item, index) => {
                    const isUnlocked = item.unlocked;
                    const appRef = APP_ROYAL_PRIVILEGES[index] || { icon: 'sparkles' };

                    return (
                      <div
                        key={item.key || index}
                        className="bg-[#241406] border border-[#3E230B] rounded-xl p-2 flex flex-col items-center text-center relative group"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center relative mb-1.5 ${
                          isUnlocked
                            ? 'bg-gradient-to-br from-[#F7DFAB] to-[#D7A75F]'
                            : 'bg-gradient-to-br from-[#E8E4DD] to-[#D8D3CA] opacity-50'
                        }`}>
                          {getPrivilegeIcon(appRef.icon, isUnlocked)}
                          {!isUnlocked && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-slate-900 border border-white/20 flex items-center justify-center">
                              <Lock className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </div>

                        <span className={`text-[9px] font-bold leading-tight line-clamp-1 w-full ${
                          isUnlocked ? 'text-[#F4DCB0]' : 'text-slate-500'
                        }`}>
                          {item.name}
                        </span>
                        <span className="text-[7.5px] text-[#8C6D4F] line-clamp-2 mt-0.5 leading-tight">
                          {item.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Rules link */}
                <div className="pt-2 border-t border-[#2C1805] flex items-center justify-center text-[9px] text-[#98703C] font-semibold gap-1 cursor-pointer">
                  <span>Membership rules & details</span>
                  <ChevronRight className="w-3 h-3 text-[#98703C]" />
                </div>
              </div>
            </div>

            {/* Floating Bottom Purchase Bar */}
            <div className="p-3 bg-[#140C04] border-t border-amber-500/20 flex items-center justify-between">
              <div>
                <div className="text-xs font-black text-[#FDE047] font-mono">
                  🪙 {currentTier.coinsPrice.toLocaleString()} <span className="text-[9px] text-slate-400 font-normal">/ 30 days</span>
                </div>
                <div className="text-[8px] text-[#A67C4A]">bonus paid once</div>
              </div>
              <button className="px-5 py-2 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-black text-xs rounded-full shadow-lg shadow-amber-500/30">
                Activate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Tier Modal */}
      {isEditModalOpen && editingPlan && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-2xl w-full p-6 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Edit {editingPlan.name} Nobility</h3>
                <p className="text-xs text-slate-400">Update pricing, bonus coins, and toggle 15 Royal Privileges</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Nobility Name</label>
                  <input
                    type="text"
                    value={editingPlan.name || ''}
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Title</label>
                  <input
                    type="text"
                    value={editingPlan.title || ''}
                    onChange={(e) => setEditingPlan({ ...editingPlan, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Rank Level (1-5)</label>
                  <input
                    type="number"
                    value={editingPlan.level || 1}
                    onChange={(e) => setEditingPlan({ ...editingPlan, level: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Coin Price (30 Days)</label>
                  <input
                    type="number"
                    value={editingPlan.coinsPrice || 0}
                    onChange={(e) => setEditingPlan({ ...editingPlan, coinsPrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Bonus Coins (Paid on Activation)</label>
                  <input
                    type="number"
                    value={editingPlan.dailyRewardCoins || 0}
                    onChange={(e) => setEditingPlan({ ...editingPlan, dailyRewardCoins: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              {/* Upload Badge Image */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Hero Nobility Badge Asset</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={editingPlan.heroBadgeUrl || ''}
                    onChange={(e) => setEditingPlan({ ...editingPlan, heroBadgeUrl: e.target.value })}
                    placeholder="/king/viscount_badge.png or https://..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <label className="cursor-pointer px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs flex items-center gap-1.5 shrink-0">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'heroBadgeUrl')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* 15 Privileges Toggle Matrix */}
              <div className="pt-2">
                <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">
                  15 Royal Privileges Unlocked for {editingPlan.name}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1 bg-slate-950/60 rounded-xl border border-slate-800">
                  {(editingPlan.privileges || []).map((priv, idx) => (
                    <div
                      key={priv.key || idx}
                      onClick={() => handleTogglePrivilege(idx)}
                      className={`p-2.5 rounded-lg border cursor-pointer flex items-center justify-between text-xs transition-all ${
                        priv.unlocked
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-200'
                          : 'bg-slate-900 border-white/5 text-slate-500'
                      }`}
                    >
                      <span className="font-semibold">{priv.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        priv.unlocked ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {priv.unlocked ? 'ACTIVE' : 'LOCKED'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20"
                >
                  Save Tier Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
