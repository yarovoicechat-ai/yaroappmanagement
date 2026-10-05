'use client';

import React, { useState, useEffect } from 'react';
import {
  Car,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Search,
  Diamond,
  UploadCloud,
  Film,
  Music,
  Check,
  X,
  Crown,
  Play,
  Flame,
  Zap,
  Volume2,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';
import { uploadToCloudinary } from '@/lib/cloudinary';

export interface EntryItem {
  _id: string;
  name: string;
  slug?: string;
  tagText: string;
  animationType: 'BANNER' | 'CENTER_AVATAR' | 'PARTICLES' | 'VIP_ENTRANCE' | 'SPECIAL_EVENT';
  image?: string;
  icon?: string;
  animationUrl?: string;
  sound?: string;
  bannerColors: string[];
  price: number;
  priceOptions?: { days: number; diamonds: number }[];
  validity?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  isVip: boolean;
  isLimited: boolean;
  isActive: boolean;
  duration: number;
  sortOrder: number;
  badgeText?: string;
  desc?: string;
  createdAt?: string;
}

export default function StoreEntriesPage() {
  const [entries, setEntries] = useState<EntryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [uploadingField, setUploadingField] = useState<'image' | 'animation' | 'sound' | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EntryItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [testingItem, setTestingItem] = useState<EntryItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    tagText: '👑 VIP HAS ENTERED',
    animationType: 'BANNER' as EntryItem['animationType'],
    price: 15000,
    price3Days: 2250,
    price7Days: 4500,
    price15Days: 8250,
    price30Days: 15000,
    validity: '30 Days',
    badgeText: 'VIP',
    rarity: 'epic' as EntryItem['rarity'],
    bannerColor1: '#F59E0B',
    bannerColor2: '#B45309',
    image: '',
    imageName: '',
    animationUrl: '',
    animationFileName: '',
    sound: '',
    duration: 3200,
    isVip: true,
    isLimited: false,
    isActive: true,
    desc: '',
  });

  const fetchEntries = async () => {
    try {
      setLoading(true);
      let list: EntryItem[] = [];

      // 1. Fetch from Entry Effects admin endpoint
      try {
        const res = await apiClient.get(API_ENDPOINTS.ENTRY_EFFECTS.LIST);
        if (res && res.data) {
          const raw = Array.isArray(res.data) ? res.data : (res.data.data || []);
          if (Array.isArray(raw) && raw.length > 0) {
            list = raw;
          }
        }
      } catch (err) {
        console.warn('Entry effects list fetch error:', err);
      }

      // 2. Fallback / Merge with Store catalog items under category 'Entry'
      try {
        const storeRes = await apiClient.get(API_ENDPOINTS.STORE.ITEMS, { category: 'Entry' });
        if (storeRes && storeRes.data) {
          const storeItems = Array.isArray(storeRes.data) ? storeRes.data : (storeRes.data.items || []);
          if (Array.isArray(storeItems) && storeItems.length > 0) {
            storeItems.forEach((si: any) => {
              const alreadyInList = list.some(item =>
                item.name?.toLowerCase() === si.name?.toLowerCase() ||
                (item.animationUrl && si.animationUrl && item.animationUrl === si.animationUrl)
              );
              if (!alreadyInList) {
                list.push({
                  _id: si._id || si.id,
                  name: si.name,
                  tagText: si.metadata?.banner || si.badgeText || '👑 VIP HAS ENTERED',
                  animationType: si.metadata?.animationType || 'BANNER',
                  image: si.imageUrl || si.image || '',
                  animationUrl: si.animationUrl || '',
                  bannerColors: si.bgColors && si.bgColors.length >= 2 ? si.bgColors : ['#F59E0B', '#B45309'],
                  price: si.price || 15000,
                  priceOptions: si.priceOptions,
                  validity: si.validity || '30 Days',
                  rarity: 'epic',
                  isVip: Boolean(si.badgeText?.includes('VIP')),
                  isLimited: false,
                  isActive: si.isActive !== false,
                  duration: si.metadata?.entryDurationSec ? si.metadata.entryDurationSec * 1000 : 3000,
                  sortOrder: si.sortOrder || 1,
                  badgeText: si.badgeText || 'HOT',
                  desc: si.desc,
                });
              }
            });
          }
        }
      } catch (_) {}

      setEntries(list);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to fetch entry effects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      tagText: '👑 VIP HAS ENTERED',
      animationType: 'BANNER',
      price: 15000,
      price3Days: 2250,
      price7Days: 4500,
      price15Days: 8250,
      price30Days: 15000,
      validity: '30 Days',
      badgeText: 'VIP',
      rarity: 'epic',
      bannerColor1: '#F59E0B',
      bannerColor2: '#B45309',
      image: '',
      imageName: '',
      animationUrl: '',
      animationFileName: '',
      sound: '',
      duration: 3200,
      isVip: true,
      isLimited: false,
      isActive: true,
      desc: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: EntryItem) => {
    setEditingItem(item);
    const p30 = item.priceOptions?.find(p => p.days === 30)?.diamonds ?? item.price;
    const p15 = item.priceOptions?.find(p => p.days === 15)?.diamonds ?? Math.round(p30 * 0.55);
    const p7 = item.priceOptions?.find(p => p.days === 7)?.diamonds ?? Math.round(p30 * 0.3);
    const p3 = item.priceOptions?.find(p => p.days === 3)?.diamonds ?? Math.round(p30 * 0.15);

    setFormData({
      name: item.name || '',
      tagText: item.tagText || '👑 VIP HAS ENTERED',
      animationType: item.animationType || 'BANNER',
      price: p30,
      price3Days: p3,
      price7Days: p7,
      price15Days: p15,
      price30Days: p30,
      validity: item.validity || '30 Days',
      badgeText: item.badgeText || (item.isVip ? 'VIP' : 'HOT'),
      rarity: item.rarity || 'epic',
      bannerColor1: item.bannerColors?.[0] || '#F59E0B',
      bannerColor2: item.bannerColors?.[1] || '#B45309',
      image: item.image || '',
      imageName: item.image ? item.image.split('/').pop() || 'Existing Image' : '',
      animationUrl: item.animationUrl || '',
      animationFileName: item.animationUrl ? item.animationUrl.split('/').pop() || 'Existing Animation' : '',
      sound: item.sound || '',
      duration: item.duration || 3200,
      isVip: item.isVip !== false,
      isLimited: Boolean(item.isLimited),
      isActive: item.isActive !== false,
      desc: item.desc || '',
    });
    setIsModalOpen(true);
  };

  const handleBasePriceChange = (val: number) => {
    const p = Math.max(0, val);
    setFormData(prev => ({
      ...prev,
      price: p,
      price30Days: p,
      price15Days: Math.round(p * 0.55),
      price7Days: Math.round(p * 0.3),
      price3Days: Math.round(p * 0.15),
    }));
  };

  // Upload Preview Image
  const handleUploadImageFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      setUploadingField('image');
      let url = '';
      try {
        const body = new FormData();
        body.append('file', file);
        const res = await apiClient.uploadFile<{ url: string }>(API_ENDPOINTS.UPLOAD.FILE, body);
        url = res.data?.url || (res as any).url;
      } catch {
        url = await uploadToCloudinary(file, 'entries');
      }

      if (!url) throw new Error('File URL not returned');

      setFormData(prev => ({
        ...prev,
        image: url,
        imageName: file.name,
      }));
      toast.success('Entrance icon/preview image uploaded!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload preview image');
    } finally {
      setUploadingField(null);
    }
  };

  // Upload Animation Asset (.svga, .gif, .webp, .mp4)
  const handleUploadAnimationFile = async (file: File | undefined) => {
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const allowed = ['svga', 'gif', 'webp', 'png', 'mp4'];
    if (!allowed.includes(ext)) {
      toast.error(`Invalid format .${ext}. Allowed: .svga, .gif, .webp, .png, .mp4`);
      return;
    }

    try {
      setUploadingField('animation');
      const body = new FormData();
      body.append('file', file);
      const res = await apiClient.uploadFile<{ url: string }>(API_ENDPOINTS.UPLOAD.FILE, body);
      const url = res.data?.url || (res as any).url;
      if (!url) throw new Error('Animation URL not returned');

      setFormData(prev => ({
        ...prev,
        animationUrl: url,
        animationFileName: file.name,
      }));
      toast.success(`Entry animation (.${ext}) uploaded successfully!`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload animation asset');
    } finally {
      setUploadingField(null);
    }
  };

  // Upload Sound File (.mp3, .wav)
  const handleUploadSoundFile = async (file: File | undefined) => {
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!['mp3', 'wav', 'ogg'].includes(ext)) {
      toast.error(`Invalid sound format .${ext}. Allowed: .mp3, .wav, .ogg`);
      return;
    }

    try {
      setUploadingField('sound');
      const body = new FormData();
      body.append('file', file);
      const res = await apiClient.uploadFile<{ url: string }>(API_ENDPOINTS.UPLOAD.FILE, body);
      const url = res.data?.url || (res as any).url;
      if (!url) throw new Error('Sound URL not returned');

      setFormData(prev => ({
        ...prev,
        sound: url,
      }));
      toast.success(`Entrance fanfare sound (.${ext}) uploaded!`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload sound file');
    } finally {
      setUploadingField(null);
    }
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Entry effect name is required');
      return;
    }

    const price = Number(formData.price30Days) || Number(formData.price) || 0;
    const bannerColors = [formData.bannerColor1, formData.bannerColor2];

    const payload = {
      name: formData.name.trim(),
      tagText: formData.tagText.trim() || '👑 VIP HAS ENTERED',
      animationType: formData.animationType,
      image: formData.image,
      imageUrl: formData.image,
      animationUrl: formData.animationUrl,
      sound: formData.sound,
      bannerColors,
      price,
      priceOptions: [
        { days: 3, diamonds: Number(formData.price3Days) || Math.round(price * 0.15) },
        { days: 7, diamonds: Number(formData.price7Days) || Math.round(price * 0.3) },
        { days: 15, diamonds: Number(formData.price15Days) || Math.round(price * 0.55) },
        { days: 30, diamonds: price },
      ],
      validity: formData.validity,
      rarity: formData.rarity,
      isVip: formData.isVip,
      isLimited: formData.isLimited,
      isActive: formData.isActive,
      duration: Number(formData.duration) || 3200,
      badgeText: formData.badgeText || (formData.isVip ? 'VIP' : 'HOT'),
      desc: formData.desc || `Exclusive room entrance effect: ${formData.name}`,
    };

    try {
      if (editingItem) {
        await apiClient.put(API_ENDPOINTS.ENTRY_EFFECTS.UPDATE(editingItem._id), payload);
        toast.success(`Entry effect "${formData.name}" updated successfully!`);
      } else {
        await apiClient.post(API_ENDPOINTS.ENTRY_EFFECTS.CREATE, payload);
        toast.success(`Entry effect "${formData.name}" published! Live in voice rooms & store.`);
      }
      setIsModalOpen(false);
      fetchEntries();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save entry effect');
    }
  };

  const handleToggleStatus = async (item: EntryItem) => {
    try {
      await apiClient.patch(API_ENDPOINTS.ENTRY_EFFECTS.TOGGLE(item._id), {});
      const nextStatus = !item.isActive;
      toast.success(`"${item.name}" is now ${nextStatus ? 'Active' : 'Inactive'}`);
      setEntries(prev => prev.map(e => (e._id === item._id ? { ...e, isActive: nextStatus } : e)));
    } catch (err: any) {
      toast.error(err?.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await apiClient.delete(API_ENDPOINTS.ENTRY_EFFECTS.DELETE(id));
      toast.success(`Entry effect "${name}" deleted`);
      setDeletingId(null);
      setEntries(prev => prev.filter(e => e._id !== id));
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete entry effect');
    }
  };

  const filteredEntries = entries.filter(item => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.name?.toLowerCase().includes(q) ||
      item.tagText?.toLowerCase().includes(q) ||
      item.rarity?.toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === 'all' ? true : statusFilter === 'active' ? item.isActive : !item.isActive;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <Car size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Room Entry Effects Store</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure luxury cars, dragon descent, banners, fanfare sounds, and voice room entry animations.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchEntries}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
            title="Refresh list"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-medium text-sm shadow-lg shadow-orange-500/20 transition"
          >
            <Plus size={16} />
            Upload New Entry Effect
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Entrance Effects</span>
            <Car size={16} className="text-orange-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{entries.length}</div>
          <div className="text-[10px] text-slate-500 mt-1">Available in database</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Active in App</span>
            <Check size={16} className="text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400">
            {entries.filter(e => e.isActive).length}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Live in store & rooms</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">VIP Tier Entries</span>
            <Crown size={16} className="text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-400">
            {entries.filter(e => e.isVip).length}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Sovereign & royal entrances</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Avg Diamond Price</span>
            <Diamond size={16} className="text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-cyan-400">
            {entries.length > 0
              ? Math.round(entries.reduce((acc, e) => acc + (e.price || 0), 0) / entries.length).toLocaleString()
              : 0}{' '}
            💎
          </div>
          <div className="text-[10px] text-slate-500 mt-1">For 30 Days</div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search entrance effect or tag..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {(['all', 'active', 'inactive'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition capitalize ${
                statusFilter === tab
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Entry Effects */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <RefreshCw size={28} className="animate-spin mb-3 text-orange-500" />
          <p className="text-sm">Loading entry effects...</p>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 border border-slate-800/60 rounded-3xl p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <Car size={28} />
          </div>
          <h3 className="text-base font-semibold text-white">No Entry Effects Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'No entry effects match your search.'
              : 'Click "Upload New Entry Effect" to add luxury vehicles, banners, or dragon arrivals to the store.'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleOpenAddModal}
              className="mt-4 px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-medium hover:bg-orange-600 transition"
            >
              Upload Entry Effect
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredEntries.map(item => {
            const displayUrl = item.animationUrl || item.image || '';
            const c1 = item.bannerColors?.[0] || '#F59E0B';
            const c2 = item.bannerColors?.[1] || '#B45309';
            const p30 = item.priceOptions?.find(p => p.days === 30)?.diamonds ?? item.price;
            const p3 = item.priceOptions?.find(p => p.days === 3)?.diamonds ?? Math.round(p30 * 0.15);

            return (
              <div
                key={item._id}
                className="group relative rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/80 hover:border-orange-500/40 p-4 transition-all duration-300 shadow-lg flex flex-col justify-between"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-white uppercase tracking-wider"
                      style={{
                        background: `linear-gradient(135deg, ${c1}, ${c2})`,
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                      }}
                    >
                      {item.rarity || 'EPIC'}
                    </span>
                    <button
                      onClick={() => handleToggleStatus(item)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition ${
                        item.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {item.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  {/* Banner Simulation Card */}
                  <div
                    className="relative w-full h-24 rounded-xl p-3 flex items-center justify-between overflow-hidden shadow-inner my-2"
                    style={{ background: `linear-gradient(135deg, ${c1}33, ${c2}66)` }}
                  >
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `radial-gradient(${c1} 1px, transparent 1px)`,
                        backgroundSize: '8px 8px',
                      }}
                    />

                    <div className="relative z-10 max-w-[65%]">
                      <div className="text-[10px] font-bold text-amber-200 tracking-wider flex items-center gap-1">
                        <Flame size={12} className="text-amber-400" />
                        {item.tagText || 'VIP ARRIVED'}
                      </div>
                      <div className="text-xs font-bold text-white mt-1 truncate" title={item.name}>
                        {item.name}
                      </div>
                      <div className="text-[9px] text-slate-300 mt-0.5 capitalize">
                        {item.animationType.replace('_', ' ').toLowerCase()}
                      </div>
                    </div>

                    {/* Vehicle or Dragon Image */}
                    <div className="relative z-10 w-16 h-16 flex items-center justify-center">
                      {displayUrl ? (
                        <img
                          src={displayUrl}
                          alt={item.name}
                          className="w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <Car size={36} className="text-amber-400 drop-shadow-md" />
                      )}
                    </div>
                  </div>

                  {/* Sound & Type Tags */}
                  <div className="flex items-center gap-2 mt-2">
                    {item.sound && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                        <Volume2 size={10} /> Fanfare Sound
                      </span>
                    )}
                    {item.isVip && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] bg-amber-500/10 border border-amber-500/30 text-amber-300">
                        <Crown size={10} /> VIP Only
                      </span>
                    )}
                  </div>

                  {/* Pricing */}
                  <div className="mt-3.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                      <Diamond size={13} />
                      <span>{p30.toLocaleString()} 💎</span>
                    </div>
                    <span className="text-[10px] text-slate-500">From {p3.toLocaleString()} (3d)</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => setTestingItem(item)}
                    className="flex items-center gap-1 text-[11px] text-orange-400 hover:text-orange-300 transition"
                  >
                    <Play size={12} /> Test Live
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Edit Entry Effect"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setDeletingId(item._id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                      title="Delete Entry Effect"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Delete Entry Effect?</h3>
            <p className="text-xs text-slate-400 mt-2">
              Are you sure you want to remove this entrance animation from Yaro app? It will no longer be available in the Store.
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const target = entries.find(e => e._id === deletingId);
                  if (target) handleDelete(target._id, target.name);
                }}
                className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Live Entrance Modal */}
      {testingItem && (
        <div
          onClick={() => setTestingItem(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 cursor-pointer"
        >
          <div className="text-center mb-6">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
              Live Voice Room Entrance Simulation
            </span>
            <p className="text-xs text-slate-400 mt-1">Click anywhere to close</p>
          </div>

          <div
            className="w-full max-w-lg p-5 rounded-2xl border border-white/20 shadow-2xl relative overflow-hidden animate-in slide-in-from-left duration-500"
            style={{
              background: `linear-gradient(135deg, ${testingItem.bannerColors?.[0] || '#F59E0B'}, ${testingItem.bannerColors?.[1] || '#B45309'})`,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-xs font-black text-amber-200 tracking-wider">
                  {testingItem.tagText}
                </div>
                <div className="text-base font-extrabold text-white">{testingItem.name}</div>
                <div className="text-[11px] text-white/80">User Shivansh entered the room</div>
              </div>

              <div className="w-20 h-20 shrink-0 flex items-center justify-center">
                {testingItem.animationUrl || testingItem.image ? (
                  <img
                    src={testingItem.animationUrl || testingItem.image}
                    alt={testingItem.name}
                    className="w-full h-full object-contain animate-bounce"
                  />
                ) : (
                  <Car size={48} className="text-white drop-shadow-lg" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload / Edit Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-orange-500/10 via-transparent to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  <Car size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingItem ? 'Edit Room Entry Effect' : 'Upload New Room Entry Effect'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Add luxury vehicles, SVGA animations, banner colors, and fanfare sounds for room arrivals.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="p-6 space-y-5">
              {/* Name & Animation Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Entry Effect Name <span className="text-orange-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Phantom Rolls, Golden Dragon Descent"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Animation Style
                  </label>
                  <select
                    value={formData.animationType}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, animationType: e.target.value as any }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="BANNER">Top Banner Slide (Car / Limousine)</option>
                    <option value="VIP_ENTRANCE">Grand VIP Entrance (Royal Aura)</option>
                    <option value="CENTER_AVATAR">Center Screen Avatar Pop</option>
                    <option value="PARTICLES">Screen Sparkling Particles</option>
                    <option value="SPECIAL_EVENT">Mythic Dragon / Stage Arrival</option>
                  </select>
                </div>
              </div>

              {/* Tag / Banner Text & Rarity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Tag / Banner Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 👑 VIP HAS ENTERED, 🔥 KING IS HERE"
                    value={formData.tagText}
                    onChange={e => setFormData(prev => ({ ...prev, tagText: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Rarity Tier
                  </label>
                  <select
                    value={formData.rarity}
                    onChange={e => setFormData(prev => ({ ...prev, rarity: e.target.value as any }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 capitalize"
                  >
                    <option value="rare">Rare</option>
                    <option value="epic">Epic</option>
                    <option value="legendary">Legendary</option>
                    <option value="mythic">Mythic</option>
                  </select>
                </div>
              </div>

              {/* Uploads Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Vehicle / Entrance Icon */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    Vehicle / Icon Image (.png, .webp)
                  </label>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Transparent car or creature image.
                  </p>

                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex flex-col items-center justify-center p-3 border border-dashed border-slate-700 hover:border-orange-500/50 rounded-xl cursor-pointer bg-slate-900/40 hover:bg-slate-900 transition">
                      <UploadCloud size={20} className="text-orange-400 mb-1" />
                      <span className="text-[11px] text-slate-300 font-medium truncate max-w-[140px]">
                        {uploadingField === 'image'
                          ? 'Uploading...'
                          : formData.imageName || 'Choose PNG/WebP'}
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/webp,image/jpeg"
                        className="hidden"
                        onChange={e => handleUploadImageFile(e.target.files?.[0])}
                      />
                    </label>

                    {formData.image && (
                      <div className="w-14 h-14 rounded-xl border border-slate-800 bg-slate-900 p-1 flex items-center justify-center shrink-0">
                        <img src={formData.image} alt="Preview" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. SVGA Animation File */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    Animation File (.svga / .mp4 / .gif)
                  </label>
                  <p className="text-[11px] text-slate-500 mb-3">
                    High-end entrance animation in SVGA format.
                  </p>

                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex flex-col items-center justify-center p-3 border border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl cursor-pointer bg-slate-900/40 hover:bg-slate-900 transition">
                      <Film size={20} className="text-cyan-400 mb-1" />
                      <span className="text-[11px] text-slate-300 font-medium truncate max-w-[140px]">
                        {uploadingField === 'animation'
                          ? 'Uploading SVGA...'
                          : formData.animationFileName || 'Upload .svga / .gif'}
                      </span>
                      <input
                        type="file"
                        accept=".svga,.gif,.webp,.png,.mp4"
                        className="hidden"
                        onChange={e => handleUploadAnimationFile(e.target.files?.[0])}
                      />
                    </label>

                    {formData.animationUrl && (
                      <div className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono shrink-0">
                        SVGA OK
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Fanfare Sound & Banner Colors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    Fanfare Sound (.mp3, .wav)
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">Optional audio sound on entrance</p>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer text-xs text-slate-300">
                      <Music size={14} className="text-purple-400" />
                      <span>{uploadingField === 'sound' ? 'Uploading...' : 'Choose Audio'}</span>
                      <input
                        type="file"
                        accept="audio/mp3,audio/wav,audio/ogg"
                        className="hidden"
                        onChange={e => handleUploadSoundFile(e.target.files?.[0])}
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="or sound name e.g. fanfare.mp3"
                      value={formData.sound}
                      onChange={e => setFormData(prev => ({ ...prev, sound: e.target.value }))}
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    Banner Gradient Colors
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">Color 1 (Left) and Color 2 (Right)</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={formData.bannerColor1}
                        onChange={e => setFormData(prev => ({ ...prev, bannerColor1: e.target.value }))}
                        className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                      />
                      <span className="text-[10px] text-slate-400 font-mono">{formData.bannerColor1}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={formData.bannerColor2}
                        onChange={e => setFormData(prev => ({ ...prev, bannerColor2: e.target.value }))}
                        className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                      />
                      <span className="text-[10px] text-slate-400 font-mono">{formData.bannerColor2}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing (3, 7, 15, 30 days) */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Diamond size={14} className="text-amber-400" />
                    Diamonds Pricing Breakdown
                  </label>
                  <span className="text-[10px] text-slate-500">Auto-calculated; editable</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">3 Days (15%)</label>
                    <input
                      type="number"
                      value={formData.price3Days}
                      onChange={e => setFormData(prev => ({ ...prev, price3Days: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">7 Days (30%)</label>
                    <input
                      type="number"
                      value={formData.price7Days}
                      onChange={e => setFormData(prev => ({ ...prev, price7Days: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">15 Days (55%)</label>
                    <input
                      type="number"
                      value={formData.price15Days}
                      onChange={e => setFormData(prev => ({ ...prev, price15Days: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">30 Days (Base)</label>
                    <input
                      type="number"
                      value={formData.price30Days}
                      onChange={e => handleBasePriceChange(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-orange-400 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <div className="text-xs font-medium text-white">VIP Exclusive</div>
                    <div className="text-[10px] text-slate-500">Requires VIP membership</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isVip}
                    onChange={e => setFormData(prev => ({ ...prev, isVip: e.target.checked }))}
                    className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <div className="text-xs font-medium text-white">Limited Edition</div>
                    <div className="text-[10px] text-slate-500">Seasonal / special</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isLimited}
                    onChange={e => setFormData(prev => ({ ...prev, isLimited: e.target.checked }))}
                    className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <div className="text-xs font-medium text-white">Active in App</div>
                    <div className="text-[10px] text-slate-500">Visible in Store</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingField !== null}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs font-bold hover:from-orange-600 hover:to-amber-700 transition shadow-lg shadow-orange-500/25 disabled:opacity-50"
                >
                  {editingItem ? 'Save Changes' : 'Publish Entry Effect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
