'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Smile,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  UploadCloud,
  FileImage,
  Film,
  Check,
  X,
  Layers,
  ArrowUpDown,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';

export interface EmojiItem {
  _id: string;
  code: string;
  name: string;
  category: string;
  icon?: string;
  pngUrl: string;
  gifUrl: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const COMMON_CATEGORIES = ['Expressions', 'Special', 'Love & Moods', 'Gestures', 'VIP', 'Animals', 'Fun'];

export default function EmojisManagementPage() {
  const [emojis, setEmojis] = useState<EmojiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [uploadingField, setUploadingField] = useState<'png' | 'gif' | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EmojiItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'Expressions',
    pngUrl: '',
    gifUrl: '',
    sortOrder: 0,
    isActive: true,
  });

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yaroapp.in';
  const resolveUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // Fetch all emojis
  const fetchEmojis = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<any>(API_ENDPOINTS.EMOJIS.LIST);
      const list = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : (res.data?.data || []);
      setEmojis(list);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load emojis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmojis();
  }, []);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      code: '',
      category: 'Expressions',
      pngUrl: '',
      gifUrl: '',
      sortOrder: emojis.length > 0 ? Math.max(...emojis.map((e) => e.sortOrder || 0)) + 1 : 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: EmojiItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      code: item.code,
      category: item.category || 'Expressions',
      pngUrl: item.pngUrl || item.icon || '',
      gifUrl: item.gifUrl || '',
      sortOrder: item.sortOrder ?? 0,
      isActive: item.isActive !== false,
    });
    setIsModalOpen(true);
  };

  // Upload PNG Preview Image ("Bahar popup me dikhne wali image")
  const handleUploadPng = async (file: File | undefined) => {
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!['png', 'webp', 'jpg', 'jpeg'].includes(ext)) {
      toast.error('Preview image must be .png, .webp, or .jpg');
      return;
    }
    try {
      setUploadingField('png');
      const body = new FormData();
      body.append('file', file);
      const res = await apiClient.uploadFile<{ url: string }>(API_ENDPOINTS.UPLOAD.FILE, body);
      const url = res.data?.url || (res as any).url;
      if (!url) throw new Error('File URL was not returned by server');
      setFormData((prev) => ({
        ...prev,
        pngUrl: url,
      }));
      toast.success('Preview PNG image upload ho gayi!');
    } catch (err: any) {
      toast.error(err?.message || 'PNG upload failed');
    } finally {
      setUploadingField(null);
    }
  };

  // Upload GIF Animation File ("Seat par chalne wala animated looping GIF")
  const handleUploadGif = async (file: File | undefined) => {
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!['gif', 'webp'].includes(ext)) {
      toast.error('Seat animation must be an animated .gif (or .webp)');
      return;
    }
    try {
      setUploadingField('gif');
      const body = new FormData();
      body.append('file', file);
      const res = await apiClient.uploadFile<{ url: string }>(API_ENDPOINTS.UPLOAD.FILE, body);
      const url = res.data?.url || (res as any).url;
      if (!url) throw new Error('File URL was not returned by server');
      setFormData((prev) => ({
        ...prev,
        gifUrl: url,
      }));
      toast.success('Seat GIF animation upload ho gayi!');
    } catch (err: any) {
      toast.error(err?.message || 'GIF upload failed');
    } finally {
      setUploadingField(null);
    }
  };

  // Save / Upsert Emoji
  const handleSaveEmoji = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Emoji name is required');
      return;
    }
    if (!formData.pngUrl.trim()) {
      toast.error('Preview PNG image upload is required');
      return;
    }
    if (!formData.gifUrl.trim()) {
      toast.error('Seat GIF animation upload is required');
      return;
    }

    const code = (formData.code.trim() || formData.name.trim().toLowerCase().replace(/\s+/g, '_')).toLowerCase();

    try {
      const payload: any = {
        name: formData.name.trim(),
        code,
        category: formData.category.trim() || 'Expressions',
        icon: formData.pngUrl.trim(),
        pngUrl: formData.pngUrl.trim(),
        gifUrl: formData.gifUrl.trim(),
        sortOrder: Number(formData.sortOrder) || 0,
        isActive: Boolean(formData.isActive),
      };

      if (editingItem?._id) {
        payload._id = editingItem._id;
      }

      await apiClient.post(API_ENDPOINTS.EMOJIS.UPSERT, payload);
      toast.success(editingItem ? 'Reaction updated successfully!' : 'New Reaction added successfully!');
      setIsModalOpen(false);
      fetchEmojis();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save reaction');
    }
  };

  // Toggle Active State
  const handleToggleActive = async (item: EmojiItem) => {
    try {
      await apiClient.post(API_ENDPOINTS.EMOJIS.UPSERT, {
        _id: item._id,
        code: item.code,
        name: item.name,
        category: item.category,
        pngUrl: item.pngUrl,
        gifUrl: item.gifUrl,
        sortOrder: item.sortOrder,
        isActive: !item.isActive,
      });
      toast.success(`Reaction ${!item.isActive ? 'activated' : 'deactivated'}`);
      setEmojis((prev) =>
        prev.map((e) => (e._id === item._id ? { ...e, isActive: !e.isActive } : e))
      );
    } catch (err: any) {
      toast.error(err?.message || 'Failed to toggle status');
    }
  };

  // Delete Emoji
  const handleDeleteEmoji = async (id: string) => {
    try {
      await apiClient.delete(API_ENDPOINTS.EMOJIS.DELETE(id));
      toast.success('Reaction deleted successfully');
      setDeletingId(null);
      setEmojis((prev) => prev.filter((e) => e._id !== id));
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete reaction');
    }
  };

  // Categories list derived from emojis
  const availableCategories = useMemo(() => {
    const set = new Set(COMMON_CATEGORIES);
    emojis.forEach((e) => {
      if (e.category) set.add(e.category);
    });
    return ['All', ...Array.from(set)];
  }, [emojis]);

  // Filtered emojis
  const filteredEmojis = useMemo(() => {
    return emojis.filter((e) => {
      const matchCat = selectedCategory === 'All' || e.category === selectedCategory;
      const matchSearch =
        searchQuery === '' ||
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.category && e.category.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [emojis, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Smile className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Room Reactions & Emojis
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage room emoji reactions: upload static PNG for picker popup & animated GIF for seat loops
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchEmojis}
            disabled={loading}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Reaction / Emoji
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <Smile className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">Total Reactions</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{emojis.length}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">Active in Rooms</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {emojis.filter((e) => e.isActive !== false).length}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">Categories</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {new Set(emojis.map((e) => e.category || 'Expressions')).size}
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${selectedCategory === cat
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-orange-500/40'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search emoji name, code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>
      </div>

      {/* Emojis Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-400">
          <RefreshCw className="w-8 h-8 animate-spin mb-3 text-orange-500" />
          <p className="text-sm">Loading reactions catalog...</p>
        </div>
      ) : filteredEmojis.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <Smile className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">No emojis found</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Try changing category or add a new reaction</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredEmojis.map((item) => (
            <div
              key={item._id || item.code}
              className={`rounded-2xl p-4 bg-white dark:bg-gray-900 border transition-all ${item.isActive !== false
                  ? 'border-gray-200 dark:border-gray-800 hover:border-orange-500/40 hover:shadow-lg'
                  : 'border-gray-200/50 dark:border-gray-850 opacity-60'
                }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border border-orange-200/50 dark:border-orange-800/40">
                  {item.category || 'Expressions'}
                </span>
                <span className="text-[11px] text-gray-400 dark:text-gray-500 font-mono">
                  #{item.sortOrder ?? 0}
                </span>
              </div>

              {/* Visual Previews Row: Static PNG Preview & Looping GIF Animation */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {/* 1. Static PNG Preview */}
                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <div className="w-14 h-14 flex items-center justify-center">
                    {item.pngUrl || item.icon ? (
                      <img
                        src={resolveUrl(item.pngUrl || item.icon)}
                        alt={item.name}
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                          (e.target as any).src = 'https://via.placeholder.com/64?text=PNG';
                        }}
                      />
                    ) : (
                      <FileImage className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                    <FileImage className="w-3 h-3 text-blue-500" /> Popup PNG
                  </span>
                </div>

                {/* 2. Looping GIF Animation Preview */}
                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                  <div className="w-14 h-14 flex items-center justify-center">
                    {item.gifUrl ? (
                      <img
                        src={resolveUrl(item.gifUrl)}
                        alt={`${item.name} Loop`}
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                          (e.target as any).src = 'https://via.placeholder.com/64?text=GIF';
                        }}
                      />
                    ) : (
                      <Film className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-orange-600 dark:text-orange-400 mt-1 flex items-center gap-1">
                    <Film className="w-3 h-3" /> Seat GIF
                  </span>
                </div>
              </div>

              {/* Title & Code */}
              <div className="mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{item.name}</h3>
                <p className="text-[11px] font-mono text-gray-400 dark:text-gray-500 truncate">:{item.code}:</p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => handleToggleActive(item)}
                  className={`text-xs font-medium flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${item.isActive !== false
                      ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30'
                      : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  {item.isActive !== false ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" /> Disabled
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors"
                    title="Edit reaction"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingId(item._id)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    title="Delete reaction"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg border border-gray-200 dark:border-gray-800 shadow-2xl p-6 relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingItem ? 'Edit Room Reaction' : 'Add New Room Reaction'}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Upload both static PNG preview and animated GIF loop for voice rooms
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEmoji} className="space-y-4">
              {/* Name & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Reaction Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cool Glasses"
                    value={formData.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        name: val,
                        code: editingItem ? prev.code : val.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''),
                      }));
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Reaction Code (slug) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. cool_glasses"
                    value={formData.code}
                    onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Category & Sort Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    list="category-suggestions"
                    placeholder="e.g. Expressions"
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <datalist id="category-suggestions">
                    {COMMON_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* UPLOAD SECTION 1: PNG PREVIEW FILE */}
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileImage className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      1. Popup Preview PNG (.png / .webp)
                    </span>
                  </div>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                    Displayed in picker bottom sheet
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {formData.pngUrl ? (
                    <div className="w-14 h-14 rounded-xl bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 flex items-center justify-center p-1 relative flex-shrink-0">
                      <img
                        src={resolveUrl(formData.pngUrl)}
                        alt="Preview"
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center flex-shrink-0 text-gray-400">
                      <FileImage className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 space-y-1">
                    <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 hover:border-blue-500 cursor-pointer transition-colors">
                      <UploadCloud className="w-4 h-4 text-blue-500" />
                      {uploadingField === 'png' ? 'Uploading PNG...' : 'Choose PNG File'}
                      <input
                        type="file"
                        accept="image/png,image/webp,image/jpeg"
                        className="hidden"
                        onChange={(e) => handleUploadPng(e.target.files?.[0])}
                        disabled={uploadingField !== null}
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Or enter PNG URL directly"
                      value={formData.pngUrl}
                      onChange={(e) => setFormData((prev) => ({ ...prev, pngUrl: e.target.value }))}
                      className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* UPLOAD SECTION 2: GIF ANIMATION FILE */}
              <div className="p-4 rounded-2xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/50 dark:border-orange-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Film className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      2. Seat Looping GIF Animation (.gif / .webp)
                    </span>
                  </div>
                  <span className="text-[10px] text-orange-600 dark:text-orange-400 font-medium">
                    Plays on avatar chair
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {formData.gifUrl ? (
                    <div className="w-14 h-14 rounded-xl bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-800 flex items-center justify-center p-1 relative flex-shrink-0">
                      <img
                        src={resolveUrl(formData.gifUrl)}
                        alt="GIF Preview"
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center flex-shrink-0 text-gray-400">
                      <Film className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 space-y-1">
                    <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 hover:border-orange-500 cursor-pointer transition-colors">
                      <UploadCloud className="w-4 h-4 text-orange-500" />
                      {uploadingField === 'gif' ? 'Uploading GIF...' : 'Choose GIF File'}
                      <input
                        type="file"
                        accept="image/gif,image/webp"
                        className="hidden"
                        onChange={(e) => handleUploadGif(e.target.files?.[0])}
                        disabled={uploadingField !== null}
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Or enter GIF URL directly"
                      value={formData.gifUrl}
                      onChange={(e) => setFormData((prev) => ({ ...prev, gifUrl: e.target.value }))}
                      className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Active Toggle */}
              <label className="flex items-center gap-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 border-gray-300 dark:border-gray-700"
                />
                Active (Users can select this reaction in voice chat rooms)
              </label>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingField !== null}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 transition-all text-sm disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {editingItem ? 'Update Reaction' : 'Create Reaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-sm w-full p-6 border border-gray-200 dark:border-gray-800 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Delete Reaction?</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-5">
              Are you sure you want to delete this reaction? It will no longer appear in voice chat rooms.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteEmoji(deletingId)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-medium shadow-lg shadow-red-600/20 transition-all"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

