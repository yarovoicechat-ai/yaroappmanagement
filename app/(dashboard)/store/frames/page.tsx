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
  Sliders,
  Eye,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';
import { uploadToCloudinary } from '@/lib/cloudinary';

export interface FrameItem {
  _id: string;
  name: string;
  category?: string;
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

export default function StoreFramesPage() {
  const [frames, setFrames] = useState<FrameItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [uploadingField, setUploadingField] = useState<'image' | 'animation' | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FrameItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
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
    levelRequired: '1',
    desc: '',
    isActive: true,
  });

  const fetchFrames = async () => {
    try {
      setLoading(true);
      let list: FrameItem[] = [];

      // 1. Fetch from Store catalog category Frames
      try {
        const res = await apiClient.get(API_ENDPOINTS.STORE.ITEMS, { category: 'Frames' });
        if (res && res.data) {
          const raw = Array.isArray(res.data) ? res.data : (res.data.items || []);
          if (Array.isArray(raw) && raw.length > 0) {
            list = raw;
          }
        }
      } catch (err) {
        console.warn('Store items fetch warning:', err);
      }

      // 2. Fetch / fallback from /api/frames (Levels) to ensure no uploaded frame is missed
      try {
        const legacyRes = await apiClient.get(API_ENDPOINTS.FRAMES.LIST);
        const legacyItems = Array.isArray(legacyRes) ? legacyRes : (legacyRes?.data || []);
        if (Array.isArray(legacyItems) && legacyItems.length > 0) {
          legacyItems.forEach((f: any) => {
            const frameName = f.name || f.text || `Level ${f.level} Frame`;
            const alreadyInList = list.some(item =>
              item.name?.toLowerCase() === frameName.toLowerCase() ||
              (item.imageUrl && f.image && item.imageUrl === f.image)
            );
            if (!alreadyInList) {
              list.push({
                _id: f._id || f.id,
                name: frameName,
                category: 'Frames',
                price: f.price || 3500,
                validity: '30 Days',
                badgeText: 'NEW',
                imageUrl: f.image?.startsWith('http')
                  ? f.image
                  : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yaroapp.in'}${f.image?.startsWith('/') ? '' : '/'}${f.image}`,
                image: f.image,
                animationUrl: f.animationUrl || '',
                isActive: true,
                metadata: { frameLevel: f.level || 1 },
              });
            }
          });
        }
      } catch (_) {}

      setFrames(list);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to fetch frames');
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
      levelRequired: '1',
      desc: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: FrameItem) => {
    setEditingItem(item);
    const p30 = item.priceOptions?.find(p => p.days === 30)?.diamonds ?? item.price;
    const p15 = item.priceOptions?.find(p => p.days === 15)?.diamonds ?? Math.round(p30 * 0.55);
    const p7 = item.priceOptions?.find(p => p.days === 7)?.diamonds ?? Math.round(p30 * 0.3);
    const p3 = item.priceOptions?.find(p => p.days === 3)?.diamonds ?? Math.round(p30 * 0.15);

    setFormData({
      name: item.name || '',
      price: p30,
      price3Days: p3,
      price7Days: p7,
      price15Days: p15,
      price30Days: p30,
      validity: item.validity || '30 Days',
      badgeText: item.badgeText || 'HOT',
      previewColor: item.previewColor || '#F43F5E',
      image: item.imageUrl || item.image || '',
      imageName: item.imageUrl ? item.imageUrl.split('/').pop() || 'Existing image' : '',
      animationUrl: item.animationUrl || '',
      animationFileName: item.animationUrl ? item.animationUrl.split('/').pop() || 'Existing animation' : '',
      levelRequired: String(item.metadata?.frameLevel || 1),
      desc: item.desc || '',
      isActive: item.isActive !== false,
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

  // Upload Preview Image File
  const handleUploadImageFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      setUploadingField('image');
      let url = '';

      // Direct upload
      try {
        const body = new FormData();
        body.append('file', file);
        const res = await apiClient.uploadFile<{ url: string }>(API_ENDPOINTS.UPLOAD.FILE, body);
        url = res.data?.url || (res as any).url;
      } catch {
        // Fallback to Cloudinary signature upload
        url = await uploadToCloudinary(file, 'frames');
      }

      if (!url) throw new Error('File URL not returned from server');

      setFormData(prev => ({
        ...prev,
        image: url,
        imageName: file.name,
      }));
      toast.success('Preview image uploaded successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload preview image');
    } finally {
      setUploadingField(null);
    }
  };

  // Upload Animation File (.svga, .gif, .webp, .png)
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
      if (!url) throw new Error('Animation URL not returned from server');

      setFormData(prev => ({
        ...prev,
        animationUrl: url,
        animationFileName: file.name,
      }));
      toast.success(`Animation file (.${ext}) uploaded!`);
    } catch (err: any) {
      toast.error(err?.message || 'Animation file upload failed');
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
      toast.error('Please upload at least a preview image or animation file');
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
        // Also sync legacy frame endpoint
        try {
          await apiClient.post(API_ENDPOINTS.FRAMES.CREATE, {
            name: formData.name.trim(),
            level: Number(formData.levelRequired) || 1,
            image: formData.image,
            animationUrl: formData.animationUrl || '',
          });
        } catch (_) {}
        toast.success(`Frame "${formData.name}" uploaded! Live in store & app.`);
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
      setFrames(prev => prev.map(f => (f._id === item._id ? { ...f, isActive: nextStatus } : f)));
    } catch (err: any) {
      toast.error(err?.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await apiClient.delete(API_ENDPOINTS.STORE.DELETE(id));
      try {
        await apiClient.delete(API_ENDPOINTS.FRAMES.DELETE(id));
      } catch (_) {}
      toast.success(`Frame "${name}" deleted successfully`);
      setDeletingId(null);
      setFrames(prev => prev.filter(f => f._id !== id));
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete frame');
    }
  };

  const filteredFrames = frames.filter(f => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || f.name?.toLowerCase().includes(q) || f.badgeText?.toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === 'all' ? true : statusFilter === 'active' ? f.isActive : !f.isActive;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Avatar Frames Store</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage user profile frames, animated SVGA borders, and pricing live in Yaro App.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchFrames}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
            title="Refresh list"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-medium text-sm shadow-lg shadow-rose-500/20 transition"
          >
            <Plus size={16} />
            Upload New Frame
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Frames</span>
            <Sparkles size={16} className="text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{frames.length}</div>
          <div className="text-[10px] text-slate-500 mt-1">Available in catalog</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Active in App</span>
            <Check size={16} className="text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400">
            {frames.filter(f => f.isActive).length}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Purchasable right now</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Animated (SVGA/WebP)</span>
            <Film size={16} className="text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-cyan-400">
            {frames.filter(f => f.animationUrl).length}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Rich looping animations</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Avg Base Price</span>
            <Diamond size={16} className="text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-400">
            {frames.length > 0
              ? Math.round(frames.reduce((acc, f) => acc + (f.price || 0), 0) / frames.length).toLocaleString()
              : 0}{' '}
            💎
          </div>
          <div className="text-[10px] text-slate-500 mt-1">For 30 Days validity</div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search frame by name or tag..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {(['all', 'active', 'inactive'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition capitalize ${
                statusFilter === tab
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Frames */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <RefreshCw size={28} className="animate-spin mb-3 text-rose-500" />
          <p className="text-sm">Loading frames...</p>
        </div>
      ) : filteredFrames.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 border border-slate-800/60 rounded-3xl p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Sparkles size={28} />
          </div>
          <h3 className="text-base font-semibold text-white">No Frames Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery ? 'No frames match your search query.' : 'Click "Upload New Frame" to add your first profile frame to the store.'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleOpenAddModal}
              className="mt-4 px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-medium hover:bg-rose-600 transition"
            >
              Upload Frame
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFrames.map(item => {
            const displayUrl = (item.animationUrl && !item.animationUrl.includes('.svga') ? item.animationUrl : '') || item.imageUrl || item.image || '';
            const p30 = item.priceOptions?.find(p => p.days === 30)?.diamonds ?? item.price;
            const p3 = item.priceOptions?.find(p => p.days === 3)?.diamonds ?? Math.round(p30 * 0.15);

            return (
              <div
                key={item._id}
                className="group relative rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/80 hover:border-rose-500/40 p-4 transition-all duration-300 shadow-lg flex flex-col justify-between"
              >
                <div>
                  {/* Top bar */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      {item.badgeText || 'HOT'}
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

                  {/* Frame Visual with Avatar Superimposed */}
                  <div className="relative w-28 h-28 mx-auto my-3 flex items-center justify-center">
                    {/* Placeholder Avatar */}
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-inner">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop"
                        alt="Demo Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Frame Superimposed */}
                    {displayUrl ? (
                      <img
                        src={displayUrl}
                        alt={item.name}
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-[0_4px_10px_rgba(244,63,94,0.35)]"
                      />
                    ) : (
                      <div className="absolute inset-0 border-2 border-dashed border-rose-500/30 rounded-full animate-spin" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="text-center mt-2">
                    <h3 className="font-semibold text-white text-sm truncate" title={item.name}>
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {item.desc || `Level ${item.metadata?.frameLevel || 1} exclusive frame`}
                    </p>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="mt-3.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                      <Diamond size={13} />
                      <span>{p30.toLocaleString()} 💎</span>
                    </div>
                    <span className="text-[10px] text-slate-500">From {p3.toLocaleString()} (3d)</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Edit Frame"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => setDeletingId(item._id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                    title="Delete Frame"
                  >
                    <Trash2 size={14} />
                  </button>
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
            <h3 className="text-lg font-bold text-white">Delete Frame?</h3>
            <p className="text-xs text-slate-400 mt-2">
              Are you sure you want to permanently delete this frame from the catalog and Yaro mobile app? Users who already equipped it might see a fallback.
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
                  const target = frames.find(f => f._id === deletingId);
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

      {/* Upload / Edit Frame Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-rose-500/10 via-transparent to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingItem ? 'Edit Avatar Frame' : 'Upload New Avatar Frame'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Set up assets, pricing (3/7/15/30 days), and level requirement for Yaro App store.
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

            <form onSubmit={handleSaveFrame} className="p-6 space-y-5">
              {/* Name & Badge */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Frame Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Golden Crown, Rose Sovereign"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Store Tag / Badge Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HOT, VIP, NEW, LIMITED"
                    value={formData.badgeText}
                    onChange={e => setFormData(prev => ({ ...prev, badgeText: e.target.value.toUpperCase() }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Uploads row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Preview Image (PNG/WebP with transparent center) */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    Frame Preview Image (.png, .webp) <span className="text-rose-400">*</span>
                  </label>
                  <p className="text-[11px] text-slate-500 mb-3">
                    High-res circular border with transparent center.
                  </p>

                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex flex-col items-center justify-center p-3 border border-dashed border-slate-700 hover:border-rose-500/50 rounded-xl cursor-pointer bg-slate-900/40 hover:bg-slate-900 transition">
                      <UploadCloud size={20} className="text-rose-400 mb-1" />
                      <span className="text-[11px] text-slate-300 font-medium truncate max-w-[140px]">
                        {uploadingField === 'image'
                          ? 'Uploading...'
                          : formData.imageName || 'Choose PNG/WebP file'}
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

                {/* 2. Animation Asset (.svga, .gif, .webp, .mp4) */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-cyan-500/30">
                  <label className="block text-xs font-semibold text-cyan-300 mb-1">
                    Frame Animation File (SVGA / GIF / WebP) *
                  </label>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Asli frame jo avatar par ghumega & popup me play hoga (.svga, .gif).
                  </p>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <label className="flex-1 flex flex-col items-center justify-center p-3 border border-dashed border-cyan-500/40 hover:border-cyan-400 rounded-xl cursor-pointer bg-slate-900/40 hover:bg-slate-900 transition">
                        <Film size={20} className="text-cyan-400 mb-1" />
                        <span className="text-[11px] text-slate-200 font-medium truncate max-w-[140px]">
                          {uploadingField === 'animation'
                            ? 'Uploading SVGA...'
                            : formData.animationFileName || 'Upload .svga / .gif / .webp'}
                        </span>
                        <input
                          type="file"
                          accept=".svga,.gif,.webp,.png,.mp4"
                          className="hidden"
                          onChange={e => handleUploadAnimationFile(e.target.files?.[0])}
                        />
                      </label>

                      {formData.animationUrl && (
                        <div className="flex items-center gap-2">
                          <div className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono shrink-0">
                            ✓ ACTIVE
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, animationUrl: '', animationFileName: '' }))}
                            className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 bg-rose-500/10 rounded-lg"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-1">
                      <input
                        type="text"
                        placeholder="Ya direct Animation URL dalein (https://.../frame.svga)"
                        value={formData.animationUrl}
                        onChange={e => setFormData(p => ({ ...p, animationUrl: e.target.value.trim(), animationFileName: e.target.value.split('/').pop() || '' }))}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-[11px] text-cyan-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Preview Simulator */}
              {(formData.image || formData.animationUrl) && (
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/20 flex items-center gap-4">
                  <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-purple-700">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop"
                        alt="Avatar Demo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {formData.animationUrl && !formData.animationUrl.includes('.svga') ? (
                      <img
                        src={formData.animationUrl}
                        alt="Frame preview"
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-[0_2px_8px_rgba(6,182,212,0.4)]"
                      />
                    ) : formData.image ? (
                      <img
                        src={formData.image}
                        alt="Frame preview"
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-[0_2px_8px_rgba(6,182,212,0.4)]"
                      />
                    ) : (
                      <div className="absolute inset-0 rounded-full border border-dashed border-amber-500/60 flex items-center justify-center pointer-events-none">
                        <span className="text-[9px] font-mono text-amber-300 bg-slate-950/90 px-1 py-0.5 rounded">Preview Only</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Live App Simulation</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {formData.animationUrl
                        ? '✨ Avatar frame animation is active! This file will animate around user avatars.'
                        : '⚠️ Frame Preview Image is uploaded. Avatar par animation frame lagane ke liye "Frame Animation File" attach karein.'}
                    </p>
                  </div>
                </div>
              )}

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
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-rose-400 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Level Requirement & Active Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Level Required
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.levelRequired}
                    onChange={e => setFormData(prev => ({ ...prev, levelRequired: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <div className="text-xs font-medium text-white">Active in App Store</div>
                    <div className="text-[10px] text-slate-500">Visible to users immediately</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Description / Story
                </label>
                <textarea
                  rows={2}
                  placeholder="A romantic floral frame with blooming roses and glowing sparkle petals..."
                  value={formData.desc}
                  onChange={e => setFormData(prev => ({ ...prev, desc: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                />
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
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-bold hover:from-rose-600 hover:to-pink-700 transition shadow-lg shadow-rose-500/25 disabled:opacity-50"
                >
                  {editingItem ? 'Save Changes' : 'Publish Frame to Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
