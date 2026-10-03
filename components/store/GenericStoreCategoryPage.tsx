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
  Film,
  Check,
  X,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';
import { uploadToCloudinary } from '@/lib/cloudinary';

export interface GenericStoreItem {
  _id: string;
  name: string;
  category: string;
  price: number;
  priceOptions?: { days: number; diamonds: number }[];
  validity: string;
  badgeText?: string;
  previewColor?: string;
  bgColors?: string[];
  icon?: string;
  imageUrl?: string;
  image?: string;
  animationUrl?: string;
  desc?: string;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt?: string;
}

interface Props {
  categoryName: string;
  categoryTitle: string;
  categoryDescription: string;
  themeColor: string; // e.g. '#06B6D4' or 'cyan'
  icon: LucideIcon;
  defaultPrice?: number;
  extraFieldLabel?: string;
  extraFieldKey?: string;
  extraFieldPlaceholder?: string;
}

export default function GenericStoreCategoryPage({
  categoryName,
  categoryTitle,
  categoryDescription,
  themeColor,
  icon: CategoryIcon,
  defaultPrice = 2500,
  extraFieldLabel,
  extraFieldKey,
  extraFieldPlaceholder,
}: Props) {
  const [items, setItems] = useState<GenericStoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [uploadingField, setUploadingField] = useState<'image' | 'animation' | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GenericStoreItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: defaultPrice,
    price3Days: Math.round(defaultPrice * 0.15),
    price7Days: Math.round(defaultPrice * 0.3),
    price15Days: Math.round(defaultPrice * 0.55),
    price30Days: defaultPrice,
    validity: '30 Days',
    badgeText: 'HOT',
    previewColor: themeColor,
    image: '',
    imageName: '',
    animationUrl: '',
    animationFileName: '',
    desc: '',
    extraValue: '',
    isActive: true,
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(API_ENDPOINTS.STORE.ITEMS, { category: categoryName });
      if (res && res.data) {
        const raw = Array.isArray(res.data) ? res.data : (res.data.items || []);
        if (Array.isArray(raw)) {
          setItems(raw.filter((i: any) => i.category === categoryName));
        }
      }
    } catch (err: any) {
      toast.error(err?.message || `Failed to fetch ${categoryTitle}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [categoryName]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      price: defaultPrice,
      price3Days: Math.round(defaultPrice * 0.15),
      price7Days: Math.round(defaultPrice * 0.3),
      price15Days: Math.round(defaultPrice * 0.55),
      price30Days: defaultPrice,
      validity: '30 Days',
      badgeText: 'HOT',
      previewColor: themeColor,
      image: '',
      imageName: '',
      animationUrl: '',
      animationFileName: '',
      desc: '',
      extraValue: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: GenericStoreItem) => {
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
      previewColor: item.previewColor || themeColor,
      image: item.imageUrl || item.image || '',
      imageName: item.imageUrl ? item.imageUrl.split('/').pop() || 'Existing image' : '',
      animationUrl: item.animationUrl || '',
      animationFileName: item.animationUrl ? item.animationUrl.split('/').pop() || 'Existing animation' : '',
      desc: item.desc || '',
      extraValue: extraFieldKey && item.metadata ? String(item.metadata[extraFieldKey] || '') : '',
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
        url = await uploadToCloudinary(file, 'store');
      }

      if (!url) throw new Error('File URL not returned');
      setFormData(prev => ({ ...prev, image: url, imageName: file.name }));
      toast.success('Preview image uploaded successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload image');
    } finally {
      setUploadingField(null);
    }
  };

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

      setFormData(prev => ({ ...prev, animationUrl: url, animationFileName: file.name }));
      toast.success(`Animation asset (.${ext}) uploaded!`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload animation');
    } finally {
      setUploadingField(null);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Item name is required');
      return;
    }

    const price = Number(formData.price30Days) || Number(formData.price) || 0;
    const metadata: Record<string, any> = {};
    if (extraFieldKey && formData.extraValue) {
      metadata[extraFieldKey] = formData.extraValue.trim();
    }

    const payload = {
      name: formData.name.trim(),
      category: categoryName,
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
      desc: formData.desc || `Exclusive ${categoryTitle}: ${formData.name}`,
      isActive: formData.isActive,
      metadata,
    };

    try {
      if (editingItem) {
        await apiClient.put(API_ENDPOINTS.STORE.UPDATE(editingItem._id), payload);
        toast.success(`"${formData.name}" updated successfully!`);
      } else {
        await apiClient.post(API_ENDPOINTS.STORE.CREATE, payload);
        toast.success(`"${formData.name}" published! Live in Yaro App store.`);
      }
      setIsModalOpen(false);
      fetchItems();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save store item');
    }
  };

  const handleToggleStatus = async (item: GenericStoreItem) => {
    try {
      await apiClient.patch(API_ENDPOINTS.STORE.TOGGLE(item._id), {});
      const nextStatus = !item.isActive;
      toast.success(`"${item.name}" is now ${nextStatus ? 'Active' : 'Inactive'}`);
      setItems(prev => prev.map(i => (i._id === item._id ? { ...i, isActive: nextStatus } : i)));
    } catch (err: any) {
      toast.error(err?.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await apiClient.delete(API_ENDPOINTS.STORE.DELETE(id));
      toast.success(`"${name}" deleted from store`);
      setDeletingId(null);
      setItems(prev => prev.filter(i => i._id !== id));
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete item');
    }
  };

  const filteredItems = items.filter(item => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || item.name?.toLowerCase().includes(q) || item.badgeText?.toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === 'all' ? true : statusFilter === 'active' ? item.isActive : !item.isActive;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-2xl border"
            style={{
              backgroundColor: `${themeColor}15`,
              borderColor: `${themeColor}35`,
              color: themeColor,
            }}
          >
            <CategoryIcon size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{categoryTitle}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{categoryDescription}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchItems}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
            title="Refresh list"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium text-sm shadow-lg transition"
            style={{
              backgroundColor: themeColor,
              boxShadow: `0 8px 20px -4px ${themeColor}50`,
            }}
          >
            <Plus size={16} />
            Upload New {categoryName}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Items</span>
            <CategoryIcon size={16} style={{ color: themeColor }} />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{items.length}</div>
          <div className="text-[10px] text-slate-500 mt-1">Available in catalog</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Active in App</span>
            <Check size={16} className="text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400">
            {items.filter(i => i.isActive).length}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Purchasable right now</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">With Media Asset</span>
            <Film size={16} className="text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-cyan-400">
            {items.filter(i => i.imageUrl || i.animationUrl).length}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Image / SVGA configured</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Avg Diamond Price</span>
            <Diamond size={16} className="text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-400">
            {items.length > 0
              ? Math.round(items.reduce((acc, i) => acc + (i.price || 0), 0) / items.length).toLocaleString()
              : 0}{' '}
            💎
          </div>
          <div className="text-[10px] text-slate-500 mt-1">30 Days validity</div>
        </div>
      </div>

      {/* Filter / Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder={`Search ${categoryTitle}...`}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {(['all', 'active', 'inactive'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition capitalize ${
                statusFilter === tab
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <RefreshCw size={28} className="animate-spin mb-3 text-slate-400" />
          <p className="text-sm">Loading {categoryTitle}...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 border border-slate-800/60 rounded-3xl p-8">
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
          >
            <CategoryIcon size={28} />
          </div>
          <h3 className="text-base font-semibold text-white">No Items Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery ? 'No items match your search query.' : `Click "Upload New ${categoryName}" to create your first item.`}
          </p>
          {!searchQuery && (
            <button
              onClick={handleOpenAddModal}
              className="mt-4 px-4 py-2 rounded-xl text-white text-xs font-medium transition"
              style={{ backgroundColor: themeColor }}
            >
              Upload {categoryName}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map(item => {
            const displayUrl = item.animationUrl || item.imageUrl || item.image || '';
            const p30 = item.priceOptions?.find(p => p.days === 30)?.diamonds ?? item.price;
            const p3 = item.priceOptions?.find(p => p.days === 3)?.diamonds ?? Math.round(p30 * 0.15);

            return (
              <div
                key={item._id}
                className="group relative rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/80 hover:border-slate-700 p-4 transition-all duration-300 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{
                        backgroundColor: `${themeColor}20`,
                        color: themeColor,
                        border: `1px solid ${themeColor}35`,
                      }}
                    >
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

                  {/* Visual preview */}
                  <div
                    className="relative w-full h-28 rounded-xl p-3 flex items-center justify-center overflow-hidden my-2 border border-slate-800/60"
                    style={{
                      background: `linear-gradient(135deg, ${themeColor}15, rgba(15,23,42,0.8))`,
                    }}
                  >
                    {displayUrl ? (
                      <img
                        src={displayUrl}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain drop-shadow-md group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <CategoryIcon size={44} style={{ color: themeColor }} />
                    )}
                  </div>

                  {/* Title & Desc */}
                  <div className="text-center mt-2">
                    <h3 className="font-semibold text-white text-sm truncate" title={item.name}>
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {item.desc || `Exclusive ${categoryName} for user profile & rooms`}
                    </p>
                    {extraFieldKey && item.metadata?.[extraFieldKey] && (
                      <div className="mt-1">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-amber-300 font-mono">
                          {item.metadata[extraFieldKey]}
                        </span>
                      </div>
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
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Edit Item"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => setDeletingId(item._id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                    title="Delete Item"
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
            <h3 className="text-lg font-bold text-white">Delete {categoryName}?</h3>
            <p className="text-xs text-slate-400 mt-2">
              Are you sure you want to permanently delete this item from the store?
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
                  const target = items.find(i => i._id === deletingId);
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

      {/* Upload / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-xl border"
                  style={{
                    backgroundColor: `${themeColor}15`,
                    borderColor: `${themeColor}35`,
                    color: themeColor,
                  }}
                >
                  <CategoryIcon size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingItem ? `Edit ${categoryName}` : `Upload New ${categoryName}`}
                  </h3>
                  <p className="text-xs text-slate-400">Configure assets, pricing, and tags for Yaro App.</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {categoryName} Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={`e.g. Royal ${categoryName}`}
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Store Tag / Badge
                  </label>
                  <input
                    type="text"
                    placeholder="HOT, VIP, NEW, LIMITED"
                    value={formData.badgeText}
                    onChange={e => setFormData(prev => ({ ...prev, badgeText: e.target.value.toUpperCase() }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {extraFieldLabel && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {extraFieldLabel}
                  </label>
                  <input
                    type="text"
                    placeholder={extraFieldPlaceholder || ''}
                    value={formData.extraValue}
                    onChange={e => setFormData(prev => ({ ...prev, extraValue: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              )}

              {/* Uploads Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    Preview Image (.png, .webp, .jpg)
                  </label>
                  <div className="flex items-center gap-3 mt-3">
                    <label className="flex-1 flex flex-col items-center justify-center p-3 border border-dashed border-slate-700 hover:border-slate-500 rounded-xl cursor-pointer bg-slate-900/40 transition">
                      <UploadCloud size={20} className="text-slate-400 mb-1" />
                      <span className="text-[11px] text-slate-300 font-medium truncate max-w-[140px]">
                        {uploadingField === 'image' ? 'Uploading...' : formData.imageName || 'Choose Image File'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
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

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    Animation File (.svga, .gif, .webp, .mp4)
                  </label>
                  <div className="flex items-center gap-3 mt-3">
                    <label className="flex-1 flex flex-col items-center justify-center p-3 border border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl cursor-pointer bg-slate-900/40 transition">
                      <Film size={20} className="text-cyan-400 mb-1" />
                      <span className="text-[11px] text-slate-300 font-medium truncate max-w-[140px]">
                        {uploadingField === 'animation' ? 'Uploading...' : formData.animationFileName || 'Upload Animation'}
                      </span>
                      <input
                        type="file"
                        accept=".svga,.gif,.webp,.png,.mp4"
                        className="hidden"
                        onChange={e => handleUploadAnimationFile(e.target.files?.[0])}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Pricing breakdown */}
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
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-amber-400 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Description & Active */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.desc}
                    onChange={e => setFormData(prev => ({ ...prev, desc: e.target.value }))}
                    placeholder="Brief description of perks..."
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 h-fit self-end">
                  <div>
                    <div className="text-xs font-medium text-white">Active in App</div>
                    <div className="text-[10px] text-slate-500">Live in Store</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Submit */}
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
                  className="px-6 py-2.5 rounded-xl text-white text-xs font-bold transition shadow-lg disabled:opacity-50"
                  style={{ backgroundColor: themeColor }}
                >
                  {editingItem ? 'Save Changes' : `Publish ${categoryName}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
