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
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { uploadToCloudinary } from '@/lib/cloudinary';

interface KingPackage {
  _id: string;
  name: string;
  slug: string;
  title: string;
  tierLevel: number;
  priceDiamonds: number;
  validityDays: number;
  badge: string;
  crownImageUrl: string;
  throneImageUrl: string;
  entryBroadcastBanner: string;
  entrySoundName: string;
  bubbleTheme: string;
  micWaveAura: string;
  perks: {
    worldAnnouncement: boolean;
    goldenThroneSeat: boolean;
    kickMuteImmunity: boolean;
    stealthGhostMode: boolean;
    sovereignBadge: boolean;
    vipConcierge: boolean;
    customMicWave: boolean;
    rechargeBonusPercent: number;
  };
  isActive: boolean;
}

interface KingMember {
  _id: string;
  userId: string;
  userNumericId: string;
  userName: string;
  userAvatar: string;
  packageTier: string;
  grantedAt: string | null;
  expiresAt: string | null;
  status: 'active' | 'expired';
}

const DEFAULT_KING_PACKAGES: KingPackage[] = [
  {
    _id: 'kok_supreme',
    name: 'King of Kings Supreme',
    slug: 'king-of-kings-supreme',
    title: '👑 King of Kings Supreme Sovereign',
    tierLevel: 1,
    priceDiamonds: 500000,
    validityDays: 30,
    badge: '👑 KING OF KINGS',
    crownImageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200&auto=format&fit=crop',
    throneImageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop',
    entryBroadcastBanner: '👑 KING OF KINGS SUPREME HAS ENTERED THE REALM',
    entrySoundName: 'sovereign_fanfare.mp3',
    bubbleTheme: 'gold_emperor',
    micWaveAura: '#FFD700,#FF4500',
    perks: {
      worldAnnouncement: true,
      goldenThroneSeat: true,
      kickMuteImmunity: true,
      stealthGhostMode: true,
      sovereignBadge: true,
      vipConcierge: true,
      customMicWave: true,
      rechargeBonusPercent: 20,
    },
    isActive: true,
  },
  {
    _id: 'kok_emperor',
    name: 'Grand Sovereign Emperor',
    slug: 'grand-sovereign-emperor',
    title: '⚜️ Grand Sovereign Emperor',
    tierLevel: 2,
    priceDiamonds: 1200000,
    validityDays: 90,
    badge: '⚜️ EMPEROR',
    crownImageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=200&auto=format&fit=crop',
    throneImageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=200&auto=format&fit=crop',
    entryBroadcastBanner: '⚜️ GRAND EMPEROR DESCENDS UPON THE HALL',
    entrySoundName: 'imperial_royal_horns.mp3',
    bubbleTheme: 'imperial_ruby_gold',
    micWaveAura: '#DC2626,#F59E0B',
    perks: {
      worldAnnouncement: true,
      goldenThroneSeat: true,
      kickMuteImmunity: true,
      stealthGhostMode: true,
      sovereignBadge: true,
      vipConcierge: true,
      customMicWave: true,
      rechargeBonusPercent: 30,
    },
    isActive: true,
  },
  {
    _id: 'kok_overlord',
    name: 'Immortal King Monarch',
    slug: 'immortal-king-monarch',
    title: '🌌 Immortal King Monarch (Annual)',
    tierLevel: 3,
    priceDiamonds: 4500000,
    validityDays: 365,
    badge: '🌌 MONARCH',
    crownImageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&auto=format&fit=crop',
    throneImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&auto=format&fit=crop',
    entryBroadcastBanner: '🌌 THE IMMORTAL KING MONARCH BLESSES THIS ROOM',
    entrySoundName: 'celestial_hymn.mp3',
    bubbleTheme: 'celestial_amethyst_gold',
    micWaveAura: '#7C3AED,#F59E0B',
    perks: {
      worldAnnouncement: true,
      goldenThroneSeat: true,
      kickMuteImmunity: true,
      stealthGhostMode: true,
      sovereignBadge: true,
      vipConcierge: true,
      customMicWave: true,
      rechargeBonusPercent: 50,
    },
    isActive: true,
  },
];

const storeItemToKingPackage = (item: any, index: number): KingPackage => {
  const metadata = item.metadata || {};
  const fallback = DEFAULT_KING_PACKAGES[Math.min(index, DEFAULT_KING_PACKAGES.length - 1)];
  const validityDays = Number.parseInt(String(item.validity || metadata.validityDays || 30), 10) || 30;
  return {
    _id: String(item._id || item.id),
    name: item.name || fallback.name,
    slug: metadata.vipSlug || metadata.slug || String(item.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    title: metadata.title || item.desc || fallback.title,
    tierLevel: Number(metadata.tierLevel || index + 1),
    priceDiamonds: Number(item.price || 0),
    validityDays,
    badge: item.badgeText || metadata.badge || fallback.badge,
    crownImageUrl: item.imageUrl || metadata.crownImageUrl || '',
    throneImageUrl: metadata.throneImageUrl || '',
    entryBroadcastBanner: metadata.banner || metadata.entryBroadcastBanner || fallback.entryBroadcastBanner,
    entrySoundName: metadata.entrySound || metadata.entrySoundName || '',
    bubbleTheme: metadata.bubbleTheme || 'gold_emperor',
    micWaveAura: metadata.micWaveAura || '#FFD700,#FF4500',
    perks: { ...fallback.perks, ...(metadata.kokPerks || metadata.perks || {}) },
    isActive: item.isActive !== false,
  };
};

export default function KingOfKingsManagementPage() {
  const [activeTab, setActiveTab] = useState<'packages' | 'perks' | 'members' | 'preview'>('packages');
  const [packages, setPackages] = useState<KingPackage[]>(DEFAULT_KING_PACKAGES);
  const [loading, setLoading] = useState(false);

  // Members list
  const [members, setMembers] = useState<KingMember[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<KingPackage | null>(null);

  // Grant Modal
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [grantNumericId, setGrantNumericId] = useState('');
  const [grantSelectedPkg, setGrantSelectedPkg] = useState('');
  const [grantDays, setGrantDays] = useState(30);

  // Form State
  const [formData, setFormData] = useState<KingPackage>({ ...DEFAULT_KING_PACKAGES[0] });

  const fetchKingData = async () => {
    try {
      setLoading(true);
      const [packageRes, memberRes] = await Promise.all([
        apiClient.get('/api/store/items', { category: 'King of Kings' }),
        apiClient.get('/api/store/king-members'),
      ]);
      const packagePayload: any = packageRes.data || {};
      const rawPackages = Array.isArray(packagePayload) ? packagePayload : (packagePayload.items || []);
      const mappedPackages = rawPackages
        .filter((item: any) => item.category === 'King of Kings')
        .map(storeItemToKingPackage);
      setPackages(mappedPackages.length ? mappedPackages : DEFAULT_KING_PACKAGES);
      setGrantSelectedPkg(current => current || mappedPackages[0]?._id || '');

      const memberPayload: any = memberRes.data || {};
      setMembers(Array.isArray(memberPayload) ? memberPayload : (memberPayload.members || []));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to sync King of Kings data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKingData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingPkg(null);
    setFormData({
      _id: `kok_${Date.now()}`,
      name: '',
      slug: '',
      title: '',
      tierLevel: packages.length + 1,
      priceDiamonds: 500000,
      validityDays: 30,
      badge: '👑 KING OF KINGS',
      crownImageUrl: '',
      throneImageUrl: '',
      entryBroadcastBanner: '👑 A SOVEREIGN KING HAS ENTERED',
      entrySoundName: 'sovereign_fanfare.mp3',
      bubbleTheme: 'gold_emperor',
      micWaveAura: '#FFD700,#FF4500',
      perks: {
        worldAnnouncement: true,
        goldenThroneSeat: true,
        kickMuteImmunity: true,
        stealthGhostMode: true,
        sovereignBadge: true,
        vipConcierge: true,
        customMicWave: true,
        rechargeBonusPercent: 25,
      },
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pkg: KingPackage) => {
    setEditingPkg(pkg);
    setFormData({ ...pkg });
    setIsModalOpen(true);
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Package name is required');
      return;
    }

    if (editingPkg) {
      setPackages(prev => prev.map(p => (p._id === editingPkg._id ? formData : p)));
      toast.success(`King package "${formData.name}" updated!`);
    } else {
      setPackages(prev => [...prev, formData]);
      toast.success(`New Sovereign Tier "${formData.name}" created!`);
    }

    // Sync with store backend as King of Kings item
    try {
      await apiClient.post('/api/store/items', {
        name: formData.name,
        category: 'King of Kings',
        price: formData.priceDiamonds,
        priceOptions: [
          { days: 30, diamonds: formData.priceDiamonds },
        ],
        validity: `${formData.validityDays} Days`,
        badgeText: formData.badge,
        imageUrl: formData.crownImageUrl,
        desc: formData.title,
        metadata: {
          kokPerks: formData.perks,
          banner: formData.entryBroadcastBanner,
        },
      }).catch(() => null);
    } catch (_) {}

    setIsModalOpen(false);
  };

  const handleDeletePackage = (id: string, name: string) => {
    setPackages(prev => prev.filter(p => p._id !== id));
    toast.success(`King package "${name}" deleted`);
  };

  const handleGrantKing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantNumericId.trim()) {
      toast.error('Enter valid user numeric ID');
      return;
    }

    const newMember: KingMember = {
      _id: `km_${Date.now()}`,
      userId: `user_${grantNumericId}`,
      userNumericId: grantNumericId.trim(),
      userName: `King VIP ${grantNumericId}`,
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop',
      packageTier: grantSelectedPkg,
      grantedAt: new Date().toISOString().split('T')[0],
      expiresAt: new Date(Date.now() + grantDays * 86400000).toISOString().split('T')[0],
      status: 'active',
    };

    setMembers(prev => [newMember, ...prev]);
    toast.success(`👑 Sovereign King of Kings status granted to ID: ${grantNumericId}!`);
    setIsGrantModalOpen(false);
    setGrantNumericId('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header with Golden Sovereign Theme */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-yellow-950/20 to-slate-900 border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/20">
            <Crown size={30} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500 tracking-tight">
                King of Kings Console
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 tracking-wider">
                SUPREME TIER
              </span>
            </div>
            <p className="text-xs text-amber-200/70 mt-1">
              Configure sovereign privileges, golden throne seats, world broadcast announcements, and immortal badges.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => setIsGrantModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold text-xs transition"
          >
            <Award size={16} />
            Grant Sovereign Status
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition"
          >
            <Plus size={16} />
            Create Sovereign Package
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'packages', label: 'Sovereign Packages', icon: Crown },
          { id: 'perks', label: 'Privileges & Powers', icon: Zap },
          { id: 'members', label: `King Members (${members.length})`, icon: Users },
          { id: 'preview', label: 'Live Simulation', icon: Eye },
        ].map(tab => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <TabIcon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Sovereign Packages */}
      {activeTab === 'packages' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map(pkg => (
              <div
                key={pkg._id}
                className="group relative rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-amber-500/25 hover:border-amber-500/50 p-6 transition-all duration-300 shadow-xl flex flex-col justify-between overflow-hidden"
              >
                {/* Glow pill */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      TIER {pkg.tierLevel}
                    </span>
                    <span className="text-xs font-bold text-amber-400">
                      {pkg.validityDays} Days Validity
                    </span>
                  </div>

                  {/* Visual Crown & Name */}
                  <div className="mt-5 text-center">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/10 border border-amber-500/30 p-2 flex items-center justify-center shadow-inner">
                      {pkg.crownImageUrl ? (
                        <img src={pkg.crownImageUrl} alt="Crown" className="w-full h-full object-contain rounded-xl" />
                      ) : (
                        <Crown size={36} className="text-amber-400" />
                      )}
                    </div>
                    <h3 className="text-lg font-black text-white mt-3">{pkg.name}</h3>
                    <p className="text-xs text-amber-200/70 mt-0.5">{pkg.title}</p>
                  </div>

                  {/* Price */}
                  <div className="mt-5 p-3 rounded-2xl bg-slate-950/80 border border-amber-500/20 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Diamond Cost</span>
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold text-sm">
                      <Diamond size={15} />
                      {pkg.priceDiamonds.toLocaleString()} 💎
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Check size={14} className="text-amber-400 shrink-0" />
                      <span>World Global Room Entry Banner</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Check size={14} className="text-amber-400 shrink-0" />
                      <span>Reserved 1st Golden Throne Seat</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Check size={14} className="text-amber-400 shrink-0" />
                      <span>Kick & Mute Shield (Admin Immunity)</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Check size={14} className="text-amber-400 shrink-0" />
                      <span>Stealth Ghost Mode Entry</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Check size={14} className="text-amber-400 shrink-0" />
                      <span>+{pkg.perks.rechargeBonusPercent}% Recharge Bonus Diamonds</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEditModal(pkg)}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Edit Package"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDeletePackage(pkg._id, pkg.name)}
                    className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                    title="Delete Package"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Privileges & Powers */}
      {activeTab === 'perks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: 'Global World Announcement',
              desc: 'Broadcasting an animated gilded banner to all active voice rooms the instant the King arrives.',
              icon: Radio,
              badge: 'BROADCAST',
            },
            {
              title: 'Golden Throne Priority Seat',
              desc: 'Users with King status automatically occupy Seat #1 with an imperial golden throne overlay.',
              icon: Crown,
              badge: 'SEATING',
            },
            {
              title: 'Admin Kick & Mute Immunity',
              desc: 'Room hosts and room admins cannot kick, mic-mute, or banish a verified King of Kings member.',
              icon: Shield,
              badge: 'PROTECTION',
            },
            {
              title: 'Stealth Invisible Ghost Mode',
              desc: 'Toggle invisibility to enter any room without triggering banners or appearing in the audience list.',
              icon: Eye,
              badge: 'STEALTH',
            },
            {
              title: 'Sovereign Emperor Voice Wave',
              desc: 'Custom animated fire & gold frequency sound ripples pulsing around the mic when speaking.',
              icon: Flame,
              badge: 'MIC AURA',
            },
            {
              title: 'Dedicated 24/7 Royal Concierge',
              desc: 'Direct priority WhatsApp and in-app concierge channel for instant top-ups and support.',
              icon: Award,
              badge: 'SUPPORT',
            },
          ].map((perk, i) => {
            const PkIcon = perk.icon;
            return (
              <div
                key={i}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/30 transition flex items-start gap-4"
              >
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                  <PkIcon size={22} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{perk.title}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                      {perk.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{perk.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: Members Directory */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Active King of Kings Members</h3>
            <button
              onClick={() => setIsGrantModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition"
            >
              + Grant to User
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Numeric ID</th>
                  <th className="p-3.5">Sovereign Tier</th>
                  <th className="p-3.5">Granted Date</th>
                  <th className="p-3.5">Expires</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {members.map(m => (
                  <tr key={m._id} className="hover:bg-slate-800/30 transition">
                    <td className="p-3.5 flex items-center gap-3">
                      <img src={m.userAvatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover border border-amber-400" />
                      <span className="font-semibold text-white">{m.userName}</span>
                    </td>
                    <td className="p-3.5 font-mono text-amber-300 font-bold">{m.userNumericId}</td>
                    <td className="p-3.5 text-amber-200">{m.packageTier}</td>
                    <td className="p-3.5 text-slate-400">{m.grantedAt}</td>
                    <td className="p-3.5 text-slate-400">{m.expiresAt}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {m.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => {
                          setMembers(prev => prev.filter(x => x._id !== m._id));
                          toast.success(`Revoked King status from ${m.userNumericId}`);
                        }}
                        className="text-rose-400 hover:text-rose-300 text-xs font-medium"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Live Simulation */}
      {activeTab === 'preview' && (
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-amber-500/30 text-center max-w-2xl mx-auto space-y-6">
          <div className="relative inline-block">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.5)] mx-auto">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop"
                alt="Demo King"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14">
              <Crown className="w-full h-full text-amber-400 drop-shadow-[0_4px_12px_rgba(245,158,11,0.8)]" />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs tracking-wider shadow-lg">
              👑 KING OF KINGS SUPREME
            </div>
            <h3 className="text-xl font-black text-white mt-3">Royal Sovereign Highness</h3>
            <p className="text-xs text-amber-200/80 mt-1">ID: 888888 • Wealth Lv. 99 • Charm Lv. 99</p>
          </div>

          {/* Banner mockup */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-slate-950 font-black text-xs tracking-wider shadow-2xl flex items-center justify-center gap-2">
            <Crown size={16} />
            <span>🔥 KING OF KINGS HAS ARRIVED IN THE ROOM 🔥</span>
            <Crown size={16} />
          </div>
        </div>
      )}

      {/* Grant Sovereign Status Modal */}
      {isGrantModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Crown className="text-amber-400" size={20} />
              Grant King of Kings Status
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Manually activate Sovereign privileges for any user account.
            </p>

            <form onSubmit={handleGrantKing} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">User Numeric ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 888888 or 100234"
                  value={grantNumericId}
                  onChange={e => setGrantNumericId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Package Tier</label>
                <select
                  value={grantSelectedPkg}
                  onChange={e => setGrantSelectedPkg(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                >
                  {packages.map(p => (
                    <option key={p._id} value={p.name}>
                      {p.name} ({p.validityDays} Days)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Duration (Days)</label>
                <input
                  type="number"
                  value={grantDays}
                  onChange={e => setGrantDays(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsGrantModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400"
                >
                  Confirm Grant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Package Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-xl w-full bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl p-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Crown size={18} className="text-amber-400" />
                {editingPkg ? 'Edit Sovereign Package' : 'Create Sovereign Package'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="space-y-4 mt-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Package Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={e => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Diamond Price</label>
                  <input
                    type="number"
                    value={formData.priceDiamonds}
                    onChange={e => setFormData(prev => ({ ...prev, priceDiamonds: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Validity (Days)</label>
                  <input
                    type="number"
                    value={formData.validityDays}
                    onChange={e => setFormData(prev => ({ ...prev, validityDays: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">World Arrival Broadcast Banner Text</label>
                <input
                  type="text"
                  value={formData.entryBroadcastBanner}
                  onChange={e => setFormData(prev => ({ ...prev, entryBroadcastBanner: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
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
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
