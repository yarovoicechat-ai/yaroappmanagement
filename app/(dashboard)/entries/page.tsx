'use client';

import React, { useState, useEffect } from 'react';
import {
  Car,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  Search,
  Diamond,
  UploadCloud,
  FileImage,
  Film,
  Flame,
  Volume2,
  Check,
  X,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';

export interface EntryEffectItem {
  _id: string;
  name: string;
  slug?: string;
  tagText: string;
  animationType: 'BANNER' | 'CENTER_AVATAR' | 'PARTICLES' | 'VIP_ENTRANCE' | 'SPECIAL_EVENT';
  image?: string;
  imageUrl?: string;
  animationUrl?: string;
  sound?: string;
  bannerColors?: string[];
  price: number;
  duration?: number;
  isActive: boolean;
  sortOrder?: number;
  isVip?: boolean;
  rarity?: string;
  createdAt?: string;
}

export default function EntriesManagementPage() {
  const [entries, setEntries] = useState<EntryEffectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingField, setUploadingField] = useState<'image' | 'animation' | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EntryEffectItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State (Strictly choose file / upload file - NO manual URL inputs)
  const [formData, setFormData] = useState({
    name: '',
    tagText: '👑 VIP HAS ENTERED',
    animationType: 'VIP_ENTRANCE' as EntryEffectItem['animationType'],
    price: 15000,
    price3Days: 2250,
    price7Days: 4500,
    price15Days: 8250,
    price30Days: 15000,
    image: '',
    imageName: '',
    animationUrl: '',
    animationFileName: '',
    animationFileType: '',
    sound: '',
    bannerColor1: '#8B5CF6',
    bannerColor2: '#4C1D95',
    duration: 3200,
    isActive: true,
    isVip: true,
  });

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(API_ENDPOINTS.ENTRY_EFFECTS.LIST);
      let list: EntryEffectItem[] = [];
      if (res && res.data) {
        list = Array.isArray(res.data) ? res.data : (res.data.items || []);
      }
      setEntries(list);
    } catch (err: any) {
      console.warn('Failed to load entry effects:', err);
      // Fallback: load from store category Entry
      try {
        const storeRes = await apiClient.get(API_ENDPOINTS.STORE.ITEMS, { category: 'Entry' });
        if (storeRes && storeRes.data) {
          const rawItems = Array.isArray(storeRes.data) ? storeRes.data : (storeRes.data.items || []);
          const mapped: EntryEffectItem[] = rawItems.map((item: any) => ({
            _id: item._id,
            name: item.name,
            tagText: item.metadata?.banner || '👑 VIP HAS ENTERED',
            animationType: item.metadata?.animationType || 'VIP_ENTRANCE',
            image: item.imageUrl || item.image || '',
            imageUrl: item.imageUrl || item.image || '',
            animationUrl: item.animationUrl || '',
            price: item.price || 15000,
            duration: item.metadata?.duration || 3200,
            isActive: item.isActive,
            isVip: true,
          }));
          setEntries(mapped);
        }
      } catch (_) {
        console.warn('Fallback store entry fetch failed');
      }
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
      animationType: 'VIP_ENTRANCE',
      price: 15000,
      price3Days: 2250,
      price7Days: 4500,
      price15Days: 8250,
      price30Days: 15000,
      image: '',
      imageName: '',
      animationUrl: '',
      animationFileName: '',
      animationFileType: '',
      sound: '',
      bannerColor1: '#8B5CF6',
      bannerColor2: '#4C1D95',
      duration: 3200,
      isActive: true,
      isVip: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: EntryEffectItem) => {
    setEditingItem(item);
    const colors = item.bannerColors && item.bannerColors.length >= 2 ? item.bannerColors : ['#8B5CF6', '#4C1D95'];
    const p = item.price || 15000;
    const animExt = item.animationUrl ? item.animationUrl.split('.').pop()?.toUpperCase() || '' : '';
    setFormData({
      name: item.name,
      tagText: item.tagText || '👑 VIP HAS ENTERED',
      animationType: item.animationType || 'VIP_ENTRANCE',
      price: p,
      price3Days: Math.round(p * 0.15),
      price7Days: Math.round(p * 0.3),
      price15Days: Math.round(p * 0.55),
      price30Days: p,
      image: item.image || item.imageUrl || '',
      imageName: (item.image || item.imageUrl || '').split('/').pop() || '',
      animationUrl: item.animationUrl || '',
      animationFileName: (item.animationUrl || '').split('/').pop() || '',
      animationFileType: animExt,
      sound: item.sound || '',
      bannerColor1: colors[0],
      bannerColor2: colors[1],
      duration: item.duration || 3200,
      isActive: item.isActive,
      isVip: Boolean(item.isVip),
    });
    setIsModalOpen(true);
  };

  // Upload Preview Image ("Bahar jo image dikhe")
  const handleUploadPreviewImage = async (file: File | undefined) => {
    if (!file) return;
    try {
      setUploadingField('image');
      const body = new FormData();
      body.append('file', file);
      const res = await apiClient.uploadFile<{ url: string }>(API_ENDPOINTS.UPLOAD.FILE, body);
      const url = res.data?.url || (res as any).url;
      if (!url) throw new Error('File URL was not returned by server');
      setFormData(prev => ({
        ...prev,
        image: url,
        imageName: file.name,
      }));
      toast.success('Bahar ki preview image upload ho gayi!');
    } catch (err: any) {
      toast.error(err?.message || 'Preview image upload failed');
    } finally {
      setUploadingField(null);
    }
  };

  // Upload Animation / Ride File (SVGA, GIF, WEBP, WAVE, MP4)
  const handleUploadAnimationFile = async (file: File | undefined) => {
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const allowed = ['svga', 'gif', 'webp', 'png', 'mp4', 'wav', 'wave', 'mp3'];
    if (!allowed.includes(ext)) {
      toast.error(`Invalid file format: .${ext}. Allowed: .svga, .gif, .webp, .png, .wave, .wav, .mp3, .mp4`);
      return;
    }

    try {
      setUploadingField('animation');
      const body = new FormData();
      body.append('file', file);
      const res = await apiClient.uploadFile<{ url: string }>(API_ENDPOINTS.UPLOAD.FILE, body);
      const url = res.data?.url || (res as any).url;
      if (!url) throw new Error('File URL was not returned by server');
      setFormData(prev => ({
        ...prev,
        animationUrl: url,
        animationFileName: file.name,
        animationFileType: ext.toUpperCase(),
      }));
      toast.success(`Entry animation file (.${ext}) upload ho gayi!`);
    } catch (err: any) {
      toast.error(err?.message || 'Animation file upload failed');
    } finally {
      setUploadingField(null);
    }
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Entry name is required');
      return;
    }
    if (!formData.image && !formData.animationUrl) {
      toast.error('Kripya preview image ya animation file upload karein');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      tagText: formData.tagText.trim(),
      animationType: formData.animationType,
      price: Number(formData.price30Days) || Number(formData.price) || 0,
      image: formData.image,
      imageUrl: formData.image,
      animationUrl: formData.animationUrl,
      sound: formData.sound,
      bannerColors: [formData.bannerColor1, formData.bannerColor2],
      duration: Number(formData.duration) || 3200,
      isActive: formData.isActive,
      isVip: formData.isVip,
    };

    try {
      if (editingItem) {
        await apiClient.put(API_ENDPOINTS.ENTRY_EFFECTS.UPDATE(editingItem._id), payload);
        toast.success(`Entry effect "${formData.name}" updated successfully!`);
      } else {
        await apiClient.post(API_ENDPOINTS.ENTRY_EFFECTS.CREATE, payload);
        toast.success(`Entry effect "${formData.name}" uploaded successfully! App me turant live.`);
      }
      setIsModalOpen(false);
      fetchEntries();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save entry effect');
    }
  };

  const handleToggleStatus = async (item: EntryEffectItem) => {
    try {
      await apiClient.patch(API_ENDPOINTS.ENTRY_EFFECTS.TOGGLE(item._id), {});
      const nextStatus = !item.isActive;
      toast.success(`"${item.name}" is now ${nextStatus ? 'Active' : 'Inactive'}`);
      setEntries(prev => prev.map(e => e._id === item._id ? { ...e, isActive: nextStatus } : e));
    } catch (err: any) {
      toast.error(err?.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await apiClient.delete(API_ENDPOINTS.ENTRY_EFFECTS.DELETE(id));
      toast.success(`"${name}" deleted successfully`);
      setEntries(prev => prev.filter(e => e._id !== id));
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete entry effect');
    }
  };

  const filteredEntries = entries.filter(e => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (e.name && e.name.toLowerCase().includes(q)) ||
      (e.tagText && e.tagText.toLowerCase().includes(q)) ||
      (e.animationType && e.animationType.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-orange-500 to-pink-500 shadow-lg shadow-orange-500/20">
              <Car className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Room Entry & Ride Effects
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Upload room entrance rides (SVGA, GIF, WEBP, WAVE, MP4), choose preview image, set diamond cost & connect immediately to mobile app.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchEntries}
            className="p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:border-slate-600 transition"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white font-semibold text-xs shadow-lg shadow-pink-500/25 hover:opacity-95 transition"
          >
            <Plus className="h-4 w-4" />
            Upload New Entry
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-[11px] font-medium text-slate-400">Total Entry Effects</p>
          <p className="text-2xl font-bold text-white mt-1">{entries.length}</p>
          <p className="text-[10px] text-emerald-400 mt-1">Live in store & party rooms</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-[11px] font-medium text-slate-400">Active Effects</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">
            {entries.filter(e => e.isActive).length}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Visible to users</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-[11px] font-medium text-slate-400">VIP / Exclusive Rides</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">
            {entries.filter(e => e.isVip || (e.price && e.price >= 10000)).length}
          </p>
          <p className="text-[10px] text-amber-400 mt-1">Phantom, Dragon, Sports Cars</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-[11px] font-medium text-slate-400">Supported Asset Formats</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">SVGA & GIF</p>
          <p className="text-[10px] text-purple-300 mt-1">.svga, .gif, .webp, .wave, .mp4</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search entry effects by name, tag, or type..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Entry Effects Grid / Table */}
      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="h-8 w-8 text-orange-400 animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading entry effects catalog...</p>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-slate-800 bg-slate-900/40">
          <Car className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">No entry effects found</p>
          <p className="text-xs text-slate-500 mt-1">Click "Upload New Entry" to upload your first SVGA/GIF entrance effect.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEntries.map(item => {
            const previewImg = item.image || item.imageUrl || '';
            const animFile = item.animationUrl || '';
            const animExt = animFile ? animFile.split('.').pop()?.toUpperCase() : '';
            const colors = item.bannerColors && item.bannerColors.length >= 2 ? item.bannerColors : ['#8B5CF6', '#4C1D95'];

            return (
              <div
                key={item._id}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 hover:border-orange-500/40 transition group flex flex-col justify-between"
              >
                <div>
                  {/* Top Row: Preview Card (Bahar ki image) & Animation Tag */}
                  <div className="relative h-36 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center p-3 border border-slate-800/80">
                    {/* Background Banner Colors */}
                    <div
                      className="absolute inset-0 opacity-25"
                      style={{
                        background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
                      }}
                    />

                    {/* Preview Image ("Bahar jo image dikhe") */}
                    {previewImg ? (
                      <img
                        src={previewImg}
                        alt={item.name}
                        className="max-h-28 max-w-full object-contain relative z-10 drop-shadow-md group-hover:scale-105 transition"
                      />
                    ) : (
                      <div className="text-center relative z-10">
                        <Car className="h-12 w-12 text-orange-400 mx-auto mb-1 opacity-70" />
                        <span className="text-[10px] text-slate-500">No preview image</span>
                      </div>
                    )}

                    {/* Format Pill (SVGA / GIF / WAVE) */}
                    <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5">
                      {animExt && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/80 text-white backdrop-blur-md shadow">
                          {animExt}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.isActive ? 'bg-emerald-500/80 text-white' : 'bg-rose-500/80 text-white'}`}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Greeting Tag Pill */}
                    <div className="absolute bottom-2 left-2 z-20">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-900/90 text-amber-300 border border-amber-500/30 backdrop-blur-md">
                        {item.tagText || '👑 VIP HAS ENTERED'}
                      </span>
                    </div>
                  </div>

                  {/* Info Row */}
                  <div className="mt-3.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white group-hover:text-orange-400 transition truncate">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-1 text-xs font-bold text-cyan-400">
                        <Diamond className="h-3.5 w-3.5 text-cyan-400" />
                        <span>{item.price.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Type: <strong className="text-slate-300">{item.animationType}</strong></span>
                      <span>Duration: <strong className="text-slate-300">{(item.duration || 3200) / 1000}s</strong></span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleStatus(item)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition ${
                      item.isActive
                        ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                        : 'border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {item.isActive ? 'Active (Live)' : 'Disabled'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:border-slate-600 transition"
                      title="Edit"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id, item.name)}
                      className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* UPLOAD / EDIT MODAL - CHOOSE FILE ONLY (NO URL INPUTS) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  <Car className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingItem ? 'Edit Entry Effect / Ride' : 'Upload New Entry Effect / Ride'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    File choose karein, name & diamond set karein. Upload karte hi mobile app me live hoga.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-4 mt-5">
              {/* 1. Name */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Entry Effect / Ride Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Phantom Rolls, Golden Dragon Flight, Cyber Hypercar"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* 2. Diamond Price (Diamonds) */}
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Diamond className="h-4 w-4 text-cyan-400" />
                    <p className="text-xs font-bold text-cyan-300">Diamond Price (Diamonds Cost) *</p>
                  </div>
                  <span className="text-[10px] text-cyan-400/80 font-medium">Diamond me price</span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-[11px] text-slate-400">3 Days</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.price3Days}
                      onChange={e => setFormData({ ...formData, price3Days: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-slate-400">7 Days</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.price7Days}
                      onChange={e => setFormData({ ...formData, price7Days: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-slate-400">15 Days</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.price15Days}
                      onChange={e => setFormData({ ...formData, price15Days: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-slate-400">30 Days (Main)</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.price30Days}
                      onChange={e => setFormData({ ...formData, price30Days: Number(e.target.value), price: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-cyan-300 font-bold focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3. ASSET UPLOADS: BAHAR KI IMAGE & ANIMATION FILE (NO URL INPUTS) */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Bahar Jo Image Dikhe (Preview / Thumbnail) */}
                <div className="rounded-2xl border border-pink-500/30 bg-slate-800/80 p-4">
                  <label className="mb-1 flex items-center gap-2 text-xs font-bold text-pink-300">
                    <FileImage className="h-4 w-4 text-pink-400" />
                    Bahar Jo Image Dikhe *
                  </label>
                  <p className="text-[10px] text-slate-400 mb-3">Store/list me bahar show hone wali preview photo.</p>

                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-pink-500/50 hover:border-pink-400 bg-slate-900/60 p-4 text-center transition">
                    <UploadCloud className="h-6 w-6 text-pink-400 animate-bounce" />
                    <span className="text-xs font-semibold text-white">
                      {uploadingField === 'image' ? 'Image Uploading...' : 'Choose Preview Image'}
                    </span>
                    <span className="text-[10px] text-slate-400">PNG, JPG, WEBP (Tap to choose file)</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                      disabled={uploadingField !== null}
                      onChange={e => handleUploadPreviewImage(e.target.files?.[0])}
                    />
                  </label>

                  {/* Live Image Preview */}
                  {formData.image && (
                    <div className="mt-3 relative rounded-xl border border-slate-700 bg-slate-950 p-2 text-center">
                      <img
                        src={formData.image}
                        alt="Bahar ki preview"
                        className="h-24 w-full object-contain mx-auto rounded-lg"
                      />
                      <span className="inline-block mt-1 text-[10px] font-medium text-emerald-400 truncate max-w-full px-2">
                        ✓ {formData.imageName || 'Uploaded successfully'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Animation File (SVGA, GIF, WEBP, WAVE, MP4) */}
                <div className="rounded-2xl border border-purple-500/30 bg-slate-800/80 p-4">
                  <label className="mb-1 flex items-center gap-2 text-xs font-bold text-purple-300">
                    <Film className="h-4 w-4 text-purple-400" />
                    Entry Animation File *
                  </label>
                  <p className="text-[10px] text-slate-400 mb-3">File type: SVGA, GIF, WEBP, WAVE, MP4</p>

                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-purple-500/50 hover:border-purple-400 bg-slate-900/60 p-4 text-center transition">
                    <UploadCloud className="h-6 w-6 text-purple-400" />
                    <span className="text-xs font-semibold text-white">
                      {uploadingField === 'animation' ? 'Uploading File...' : 'Choose Animation File'}
                    </span>
                    <span className="text-[10px] text-slate-400">.svga, .gif, .webp, .wave, .mp4</span>
                    <input
                      type="file"
                      accept=".svga,.gif,.webp,.png,.mp4,.wav,.wave,.mp3"
                      className="hidden"
                      disabled={uploadingField !== null}
                      onChange={e => handleUploadAnimationFile(e.target.files?.[0])}
                    />
                  </label>

                  {/* Uploaded File Status */}
                  {formData.animationUrl && (
                    <div className="mt-3 rounded-xl border border-purple-500/30 bg-purple-950/40 p-2.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500 text-white">
                          {formData.animationFileType || 'SVGA'}
                        </span>
                        <span className="text-xs font-semibold text-purple-200 truncate max-w-[150px]">
                          {formData.animationFileName || 'Animation file attached'}
                        </span>
                      </div>
                      <p className="text-[10px] text-purple-300/80 mt-1">App me native hardware player se run hoga.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Greeting Tag & Animation Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Greeting Banner Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 👑 VIP HAS ENTERED"
                    value={formData.tagText}
                    onChange={e => setFormData({ ...formData, tagText: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Animation Style
                  </label>
                  <select
                    value={formData.animationType}
                    onChange={e => setFormData({ ...formData, animationType: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="VIP_ENTRANCE">VIP Ride / Entrance (Car/Dragon)</option>
                    <option value="CENTER_AVATAR">Center Avatar Stage Reveal</option>
                    <option value="BANNER">Luxury Sliding Top Banner</option>
                    <option value="PARTICLES">Floating Star & Gems Shower</option>
                    <option value="SPECIAL_EVENT">Grand Special Event</option>
                  </select>
                </div>
              </div>

              {/* 5. Banner Colors & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Banner Gradient Colors
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.bannerColor1}
                      onChange={e => setFormData({ ...formData, bannerColor1: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="color"
                      value={formData.bannerColor2}
                      onChange={e => setFormData({ ...formData, bannerColor2: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-[10px] text-slate-400">Gradient Colors</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Display Duration (Seconds)
                  </label>
                  <select
                    value={formData.duration}
                    onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value={2500}>2.5 Seconds</option>
                    <option value={3200}>3.2 Seconds</option>
                    <option value={4000}>4.0 Seconds</option>
                    <option value={5000}>5.0 Seconds (Long Ride)</option>
                  </select>
                </div>
              </div>

              {/* 6. Active Checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-xs text-slate-200">
                    Publish immediately (App me turant active dikhega)
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingField !== null}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-xs font-bold text-white shadow-lg shadow-pink-500/25 hover:opacity-95 disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  {editingItem ? 'Save Changes' : 'Upload & Publish to App'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
