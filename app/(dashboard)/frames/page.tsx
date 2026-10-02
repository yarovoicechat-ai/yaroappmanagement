'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Search,
  Diamond,
  UploadCloud,
  FileImage,
  Film,
  Check,
  X,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';

export interface FrameItem {
  _id: string;
  name: string;
  price: number;
  priceOptions?: { days: number; diamonds: number }[];
  validity: string;
  badgeText?: string;
  previewColor?: string;
  imageUrl?: string;
  image?: string;
  animationUrl?: string;
  desc?: string;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt?: string;
}

export default function FramesManagementPage() {
  const [frames, setFrames] = useState<FrameItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingField, setUploadingField] = useState<'image' | 'animation' | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FrameItem | null>(null);

  // Form State (Strictly choose file / upload file - NO manual URL inputs)
  const [formData, setFormData] = useState({
    name: '',
    price: 3500,
    price3Days: 525,
    price7Days: 1050,
    price15Days: 1925,
    price30Days: 3500,
    validity: '30 Days',
    badgeText: 'HOT',
    previewColor: '#F43F5E',
    image: '',
    imageName: '',
    animationUrl: '',
    animationFileName: '',
    animationFileType: '',
    levelRequired: '1',
    desc: '',
    isActive: true,
  });

  const fetchFrames = async () => {
    try {
      setLoading(true);
      let list: FrameItem[] = [];

      // 1. Try store catalog category Frames
      try {
        const res = await apiClient.get(API_ENDPOINTS.STORE.ITEMS, { category: 'Frames' });
        if (res && res.data) {
          const raw = Array.isArray(res.data) ? res.data : (res.data.items || []);
          if (Array.isArray(raw)) list = raw;
        }
      } catch (err) {
        console.warn('Store items fetch error:', err);
      }

      // 2. If empty, check legacy /api/frames endpoint
      if (list.length === 0) {
        try {
          const legacyRes = await apiClient.get(API_ENDPOINTS.FRAMES.LIST);
          const legacyItems = Array.isArray(legacyRes) ? legacyRes : (legacyRes?.data || []);
          if (Array.isArray(legacyItems) && legacyItems.length > 0) {
            list = legacyItems.map((f: any) => ({
              _id: f._id || f.id,
              name: f.name || f.text || 'Avatar Frame',
              price: f.price || 3500,
              validity: '30 Days',
              imageUrl: f.image?.startsWith('http') ? f.image : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yaroapp.in'}${f.image?.startsWith('/') ? '' : '/'}${f.image}`,
              image: f.image,
              animationUrl: f.animationUrl || '',
              isActive: true,
              metadata: { frameLevel: f.level || 1 },
            }));
          }
        } catch (_) {}
      }

      setFrames(list);
    } catch (err: any) {
      console.warn('Failed to load frames:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFrames();
  }, []);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      price: 3500,
      price3Days: 525,
      price7Days: 1050,
      price15Days: 1925,
      price30Days: 3500,
      validity: '30 Days',
      badgeText: 'HOT',
      previewColor: '#F43F5E',
      image: '',
      imageName: '',
      animationUrl: '',
      animationFileName: '',
      animationFileType: '',
      levelRequired: '1',
      desc: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: FrameItem) => {
    setEditingItem(item);
    const p = item.price || 3500;
    const animExt = item.animationUrl ? item.animationUrl.split('.').pop()?.toUpperCase() || '' : '';
    setFormData({
      name: item.name,
      price: p,
      price3Days: Math.round(p * 0.15),
      price7Days: Math.round(p * 0.3),
      price15Days: Math.round(p * 0.55),
      price30Days: p,
      validity: item.validity || '30 Days',
      badgeText: item.badgeText || 'HOT',
      previewColor: item.previewColor || '#F43F5E',
      image: item.imageUrl || item.image || '',
      imageName: (item.imageUrl || item.image || '').split('/').pop() || '',
      animationUrl: item.animationUrl || '',
      animationFileName: (item.animationUrl || '').split('/').pop() || '',
      animationFileType: animExt,
      levelRequired: String(item.metadata?.frameLevel || '1'),
      desc: item.desc || '',
      isActive: item.isActive,
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

  // Upload Frame Animation File (SVGA, GIF, WEBP, PNG, WAVE)
  const handleUploadAnimationFile = async (file: File | undefined) => {
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const allowed = ['svga', 'gif', 'webp', 'png', 'wav', 'wave', 'mp3', 'mp4'];
    if (!allowed.includes(ext)) {
      toast.error(`Invalid file format: .${ext}. Allowed: .svga, .gif, .webp, .png, .wave`);
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
      toast.success(`Frame animation file (.${ext}) upload ho gayi!`);
    } catch (err: any) {
      toast.error(err?.message || 'Frame animation file upload failed');
    } finally {
      setUploadingField(null);
    }
  };

  const handleSaveFrame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Frame name is required');
      return;
    }
    if (!formData.image && !formData.animationUrl) {
      toast.error('Kripya preview image ya animation file upload karein');
      return;
    }

    const price = Number(formData.price30Days) || Number(formData.price) || 0;
    const payload = {
      name: formData.name.trim(),
      category: 'Frames',
      price,
      priceOptions: [
        { days: 3, diamonds: Number(formData.price3Days) || Math.round(price * 0.15) },
        { days: 7, diamonds: Number(formData.price7Days) || Math.round(price * 0.3) },
        { days: 15, diamonds: Number(formData.price15Days) || Math.round(price * 0.55) },
        { days: 30, diamonds: price },
      ],
      validity: formData.validity,
      badgeText: formData.badgeText,
      previewColor: formData.previewColor,
      imageUrl: formData.image,
      image: formData.image,
      animationUrl: formData.animationUrl,
      desc: formData.desc || `Exclusive avatar profile frame: ${formData.name}`,
      isActive: formData.isActive,
      metadata: {
        frameLevel: Number(formData.levelRequired) || 1,
        animated: Boolean(formData.animationUrl),
      },
    };

    try {
      if (editingItem) {
        await apiClient.put(API_ENDPOINTS.STORE.UPDATE(editingItem._id), payload);
        toast.success(`Frame "${formData.name}" updated successfully!`);
      } else {
        await apiClient.post(API_ENDPOINTS.STORE.CREATE, payload);
        toast.success(`Frame "${formData.name}" uploaded successfully! App me turant live.`);
      }
      setIsModalOpen(false);
      fetchFrames();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save frame');
    }
  };

  const handleToggleStatus = async (item: FrameItem) => {
    try {
      await apiClient.patch(API_ENDPOINTS.STORE.TOGGLE(item._id), {});
      const nextStatus = !item.isActive;
      toast.success(`"${item.name}" is now ${nextStatus ? 'Active' : 'Inactive'}`);
      setFrames(prev => prev.map(f => f._id === item._id ? { ...f, isActive: nextStatus } : f));
    } catch (err: any) {
      toast.error(err?.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await apiClient.delete(API_ENDPOINTS.STORE.DELETE(id));
      toast.success(`"${name}" deleted successfully`);
      setFrames(prev => prev.filter(f => f._id !== id));
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete frame');
    }
  };

  const filteredFrames = frames.filter(f => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (f.name && f.name.toLowerCase().includes(q)) ||
      (f.badgeText && f.badgeText.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 shadow-lg shadow-pink-500/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 via-rose-400 to-amber-300 bg-clip-text text-transparent">
                Avatar Frame Management
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Upload user profile frames (SVGA, GIF, WEBP, PNG), choose preview image, set diamond price & connect immediately to mobile app.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchFrames}
            className="p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:border-slate-600 transition"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-semibold text-xs shadow-lg shadow-pink-500/25 hover:opacity-95 transition"
          >
            <Plus className="h-4 w-4" />
            Upload New Frame
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-[11px] font-medium text-slate-400">Total Frames</p>
          <p className="text-2xl font-bold text-white mt-1">{frames.length}</p>
          <p className="text-[10px] text-emerald-400 mt-1">Live in store & user profiles</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-[11px] font-medium text-slate-400">Active Frames</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">
            {frames.filter(f => f.isActive).length}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Visible to users</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-[11px] font-medium text-slate-400">Diamond Pricing</p>
          <p className="text-2xl font-bold text-cyan-400 mt-1">
            {frames.length > 0 ? `${Math.round(frames.reduce((a, b) => a + (b.price || 0), 0) / frames.length).toLocaleString()}` : '3,500'}
          </p>
          <p className="text-[10px] text-cyan-400 mt-1">Avg diamonds per frame</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-[11px] font-medium text-slate-400">Supported Formats</p>
          <p className="text-2xl font-bold text-rose-400 mt-1">SVGA & GIF</p>
          <p className="text-[10px] text-rose-300 mt-1">.svga, .gif, .webp, .png</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search avatar frames by name or tag..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
          />
        </div>
      </div>

      {/* Frames Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="h-8 w-8 text-pink-400 animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading frames catalog...</p>
        </div>
      ) : filteredFrames.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-slate-800 bg-slate-900/40">
          <Sparkles className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">No avatar frames found</p>
          <p className="text-xs text-slate-500 mt-1">Click "Upload New Frame" to upload your first frame.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredFrames.map(item => {
            const previewImg = item.imageUrl || item.image || '';
            const animFile = item.animationUrl || '';
            const animExt = animFile ? animFile.split('.').pop()?.toUpperCase() : '';

            return (
              <div
                key={item._id}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 hover:border-pink-500/40 transition group flex flex-col justify-between"
              >
                <div>
                  {/* Avatar Frame Live Mockup Card */}
                  <div className="relative h-36 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center p-3 border border-slate-800/80">
                    {/* Background glow */}
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        background: `radial-gradient(circle, ${item.previewColor || '#F43F5E'} 0%, transparent 70%)`,
                      }}
                    />

                    {/* Circular Mock Avatar with Frame */}
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120"
                          alt="Demo Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Frame Overlay */}
                      {previewImg && (
                        <img
                          src={previewImg}
                          alt={item.name}
                          className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-md group-hover:scale-110 transition"
                        />
                      )}
                    </div>

                    {/* Format Pill (SVGA / GIF / PNG) */}
                    <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5">
                      {animExt && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/80 text-white backdrop-blur-md">
                          {animExt}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.isActive ? 'bg-emerald-500/80 text-white' : 'bg-rose-500/80 text-white'}`}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Badge Pill */}
                    {item.badgeText && (
                      <div className="absolute bottom-2 left-2 z-20">
                        <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-slate-900/90 text-amber-300 border border-amber-500/30">
                          {item.badgeText}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Frame Info */}
                  <div className="mt-3.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white group-hover:text-pink-400 transition truncate">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-1 text-xs font-bold text-cyan-400">
                        <Diamond className="h-3.5 w-3.5 text-cyan-400" />
                        <span>{item.price.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Validity: <strong className="text-slate-300">{item.validity || '30 Days'}</strong></span>
                      <span>Level: <strong className="text-slate-300">Lv.{item.metadata?.frameLevel || 1}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleStatus(item)}
                    className={`text-[11px] font-semibold px-2 py-1 rounded-lg border transition ${
                      item.isActive
                        ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                        : 'border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {item.isActive ? 'Active' : 'Disabled'}
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
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingItem ? 'Edit Avatar Frame' : 'Upload New Avatar Frame'}
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

            <form onSubmit={handleSaveFrame} className="space-y-4 mt-5">
              {/* 1. Name */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Frame Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Crown Imperial Frame, Rose Sovereign, Cyber Neon Ring"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
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
                  <p className="text-[10px] text-slate-400 mb-3">Store/profile me bahar dikhne wali frame image.</p>

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

                  {/* Live Mockup with Avatar */}
                  {formData.image && (
                    <div className="mt-3 relative rounded-xl border border-slate-700 bg-slate-950 p-2 text-center flex flex-col items-center">
                      <div className="relative w-16 h-16 flex items-center justify-center my-1">
                        <div className="w-12 h-12 rounded-full bg-slate-800 overflow-hidden">
                          <img
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120"
                            alt="Mockup"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <img
                          src={formData.image}
                          alt="Frame"
                          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                        />
                      </div>
                      <span className="inline-block text-[10px] font-medium text-emerald-400 truncate max-w-full px-2">
                        ✓ {formData.imageName || 'Uploaded successfully'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Animation File (SVGA, GIF, WEBP, PNG, WAVE) */}
                <div className="rounded-2xl border border-purple-500/30 bg-slate-800/80 p-4">
                  <label className="mb-1 flex items-center gap-2 text-xs font-bold text-purple-300">
                    <Film className="h-4 w-4 text-purple-400" />
                    Frame Animation File *
                  </label>
                  <p className="text-[10px] text-slate-400 mb-3">File type: SVGA, GIF, WEBP, PNG, WAVE</p>

                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-purple-500/50 hover:border-purple-400 bg-slate-900/60 p-4 text-center transition">
                    <UploadCloud className="h-6 w-6 text-purple-400" />
                    <span className="text-xs font-semibold text-white">
                      {uploadingField === 'animation' ? 'Uploading File...' : 'Choose Animation File'}
                    </span>
                    <span className="text-[10px] text-slate-400">.svga, .gif, .webp, .png, .wave</span>
                    <input
                      type="file"
                      accept=".svga,.gif,.webp,.png,.wav,.wave"
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
                      <p className="text-[10px] text-purple-300/80 mt-1">App me native SVG/GIF engine se play hoga.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Validity & Badge */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Validity Duration
                  </label>
                  <select
                    value={formData.validity}
                    onChange={e => setFormData({ ...formData, validity: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500"
                  >
                    <option value="3 Days">3 Days</option>
                    <option value="7 Days">7 Days</option>
                    <option value="15 Days">15 Days</option>
                    <option value="30 Days">30 Days</option>
                    <option value="90 Days">90 Days</option>
                    <option value="Permanent">Permanent</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Badge Tag
                  </label>
                  <select
                    value={formData.badgeText}
                    onChange={e => setFormData({ ...formData, badgeText: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500"
                  >
                    <option value="">None</option>
                    <option value="HOT">HOT 🔥</option>
                    <option value="NEW">NEW ✨</option>
                    <option value="LIMITED">LIMITED ⏳</option>
                    <option value="SALE">SALE 🏷️</option>
                    <option value="VIP">VIP 👑</option>
                  </select>
                </div>
              </div>

              {/* 5. Theme Color & Level */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Aura Hex Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.previewColor}
                      onChange={e => setFormData({ ...formData, previewColor: e.target.value })}
                      className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={formData.previewColor}
                      onChange={e => setFormData({ ...formData, previewColor: e.target.value })}
                      className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Required Level
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.levelRequired}
                    onChange={e => setFormData({ ...formData, levelRequired: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* 6. Active Checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-pink-500 focus:ring-pink-500"
                  />
                  <span className="text-xs text-slate-200">
                    Publish immediately (App me turant active dikhega)
                  </span>
                </label>
              </div>

              {/* Buttons */}
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
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-xs font-bold text-white shadow-lg shadow-pink-500/25 hover:opacity-95 disabled:opacity-50"
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
