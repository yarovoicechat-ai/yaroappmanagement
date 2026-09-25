'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  Crown,
  Layers,
  Zap,
  Tag,
  Radio,
  Car,
  Palette,
  Check,
  Flame,
  Diamond,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';

export type StoreCategory =
  | 'All'
  | 'Unique ID'
  | 'Chat Bubble'
  | 'Mic Wave'
  | 'Frames'
  | 'Entry'
  | 'Theme'
  | 'Tassel'
  | 'VIP';

export interface StoreItem {
  _id: string;
  name: string;
  category: string;
  price: number;
  validity: string;
  badgeText?: string;
  previewColor?: string;
  bgColors?: string[];
  icon?: string;
  imageUrl?: string;
  animationUrl?: string;
  desc?: string;
  isActive: boolean;
  sortOrder: number;
  salesCount: number;
  metadata?: Record<string, any>;
  createdAt: string;
}

const CATEGORIES: { label: StoreCategory; icon: any; color: string }[] = [
  { label: 'All', icon: ShoppingBag, color: 'text-pink-400' },
  { label: 'Unique ID', icon: Tag, color: 'text-amber-400' },
  { label: 'Chat Bubble', icon: Zap, color: 'text-cyan-400' },
  { label: 'Mic Wave', icon: Radio, color: 'text-emerald-400' },
  { label: 'Frames', icon: Sparkles, color: 'text-rose-400' },
  { label: 'Entry', icon: Car, color: 'text-orange-400' },
  { label: 'Theme', icon: Palette, color: 'text-purple-400' },
  { label: 'Tassel', icon: Layers, color: 'text-amber-300' },
  { label: 'VIP', icon: Crown, color: 'text-yellow-400' },
];

export default function StoreManagementPage() {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<StoreCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StoreItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Unique ID',
    price: 1000,
    validity: '30 Days',
    badgeText: 'HOT',
    previewColor: '#FF2A85',
    icon: 'sparkles',
    imageUrl: '',
    animationUrl: '',
    desc: '',
    isActive: true,
    metadataNumber: '',
    metadataTag: '',
    metadataBanner: '',
  });

  const fetchStoreItems = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(API_ENDPOINTS.STORE.ITEMS);
      if (res && res.data) {
        const fetchedItems = res.data.items || res.data || [];
        setItems(fetchedItems);
        if (fetchedItems.length > 0 && !selectedItem) {
          setSelectedItem(fetchedItems[0]);
        }
      }
    } catch (err: any) {
      console.error('Failed to load store items:', err);
      toast.error(err?.message || 'Failed to fetch store catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreItems();
  }, []);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: selectedCategory === 'All' ? 'Unique ID' : selectedCategory,
      price: 2500,
      validity: '30 Days',
      badgeText: 'HOT',
      previewColor: '#FF2A85',
      icon: 'sparkles',
      imageUrl: '',
      animationUrl: '',
      desc: '',
      isActive: true,
      metadataNumber: '',
      metadataTag: '',
      metadataBanner: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: StoreItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price,
      validity: item.validity || '30 Days',
      badgeText: item.badgeText || '',
      previewColor: item.previewColor || '#FF2A85',
      icon: item.icon || 'sparkles',
      imageUrl: item.imageUrl || '',
      animationUrl: item.animationUrl || '',
      desc: item.desc || '',
      isActive: item.isActive,
      metadataNumber: item.metadata?.number || '',
      metadataTag: item.metadata?.tag || '',
      metadataBanner: item.metadata?.banner || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Item name is required');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      price: Number(formData.price) || 0,
      validity: formData.validity,
      badgeText: formData.badgeText,
      previewColor: formData.previewColor,
      icon: formData.icon,
      imageUrl: formData.imageUrl,
      animationUrl: formData.animationUrl,
      desc: formData.desc.trim(),
      isActive: formData.isActive,
      metadata: {
        number: formData.metadataNumber,
        tag: formData.metadataTag,
        banner: formData.metadataBanner,
      },
    };

    try {
      if (editingItem) {
        await apiClient.put(API_ENDPOINTS.STORE.UPDATE(editingItem._id), payload);
        toast.success(`Updated ${formData.name}!`);
      } else {
        await apiClient.post(API_ENDPOINTS.STORE.CREATE, payload);
        toast.success(`Created ${formData.name}!`);
      }
      setIsModalOpen(false);
      fetchStoreItems();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save store item');
    }
  };

  const handleDeleteItem = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" from the store catalog?`)) return;
    try {
      await apiClient.delete(API_ENDPOINTS.STORE.DELETE(id));
      toast.success(`Deleted ${name}`);
      setItems(prev => prev.filter(i => i._id !== id));
      if (selectedItem?._id === id) {
        setSelectedItem(items.find(i => i._id !== id) || null);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete store item');
    }
  };

  const handleToggleStatus = async (item: StoreItem) => {
    try {
      await apiClient.patch(API_ENDPOINTS.STORE.TOGGLE(item._id), {});
      const newStatus = !item.isActive;
      toast.success(`${item.name} is now ${newStatus ? 'Active' : 'Inactive'}`);
      setItems(prev =>
        prev.map(i => (i._id === item._id ? { ...i, isActive: newStatus } : i))
      );
      if (selectedItem?._id === item._id) {
        setSelectedItem(prev => (prev ? { ...prev, isActive: newStatus } : null));
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to toggle status');
    }
  };

  const handleResetCatalog = async () => {
    if (!confirm('Re-seed default Yaro Store items? Any custom items might be overwritten.')) return;
    try {
      await apiClient.post(API_ENDPOINTS.STORE.RESET, {});
      toast.success('Catalog restored to Yaro defaults!');
      fetchStoreItems();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to reset catalog');
    }
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const matchCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.metadata?.number?.includes(searchQuery) ||
      item.badgeText?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Category counts
  const totalActive = items.filter(i => i.isActive).length;
  const totalSales = items.reduce((acc, curr) => acc + (curr.salesCount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-pink-500/20 p-8 shadow-2xl backdrop-blur-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/30 border border-white/20">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold tracking-tight text-white">
                  Store Management
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-pink-500/20 text-pink-400 border border-pink-500/30">
                  Live Mobile Catalog
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-1 max-w-xl">
                Configure virtual goods, unique sovereign IDs, animated mic waves, avatar frames, room themes, chat bubbles, and VIP packages directly published to the Yaro app.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetCatalog}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 text-sm font-semibold transition shadow-md"
              title="Reset default catalog items"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset Catalog</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-sm font-bold shadow-lg shadow-pink-500/30 transition transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Item</span>
            </button>
          </div>
        </div>

        {/* Quick Stat Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5 backdrop-blur-md">
            <p className="text-xs font-medium text-slate-400">Total Catalog Items</p>
            <p className="text-2xl font-black text-white mt-1">{items.length}</p>
          </div>
          <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5 backdrop-blur-md">
            <p className="text-xs font-medium text-slate-400">Active Live Items</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{totalActive}</p>
          </div>
          <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5 backdrop-blur-md">
            <p className="text-xs font-medium text-slate-400">Store Categories</p>
            <p className="text-2xl font-black text-pink-400 mt-1">8 Active</p>
          </div>
          <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5 backdrop-blur-md">
            <p className="text-xs font-medium text-slate-400">Total Purchases</p>
            <p className="text-2xl font-black text-amber-400 mt-1">{totalSales.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout (Left: Categories & Grid, Right: Interactive Live Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Catalog Browser) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map(cat => {
              const IconComp = cat.icon;
              const isActive = selectedCategory === cat.label;
              const count = cat.label === 'All' ? items.length : items.filter(i => i.category === cat.label).length;

              return (
                <button
                  key={cat.label}
                  onClick={() => setSelectedCategory(cat.label)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shadow-sm ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-pink-500/25 border-transparent'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-white' : cat.color}`} />
                  <span>{cat.label}</span>
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Actions Bar */}
          <div className="flex items-center gap-4 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search items by title, ID number, badge tag, or description..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 transition"
              />
            </div>
            <span className="text-xs text-slate-400 font-semibold px-2">
              Showing {filteredItems.length} items
            </span>
          </div>

          {/* Items Grid */}
          {loading ? (
            <div className="p-12 text-center bg-slate-900/50 rounded-3xl border border-slate-800">
              <RefreshCw className="w-8 h-8 text-pink-500 animate-spin mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Loading Yaro store items...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-16 text-center bg-slate-900/40 rounded-3xl border border-dashed border-slate-800">
              <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-white font-bold text-base">No items found</h3>
              <p className="text-slate-500 text-xs mt-1">
                No items match category &quot;{selectedCategory}&quot; or search query.
              </p>
              <button
                onClick={handleOpenAddModal}
                className="mt-4 px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold transition inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredItems.map(item => {
                const isSelected = selectedItem?._id === item._id;

                return (
                  <div
                    key={item._id}
                    onClick={() => setSelectedItem(item)}
                    className={`relative group rounded-2xl p-5 border cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-slate-800/90 border-pink-500/80 shadow-xl shadow-pink-500/10'
                        : 'bg-slate-900/70 hover:bg-slate-800/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Badge Text */}
                    {item.badgeText && (
                      <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-500/20 text-pink-400 border border-pink-500/30">
                        {item.badgeText}
                      </span>
                    )}

                    <div className="flex items-start gap-4">
                      {/* Color / Icon Badge */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 text-white font-bold"
                        style={{
                          backgroundColor: item.previewColor || '#8B5CF6',
                          boxShadow: `0 4px 14px ${item.previewColor || '#8B5CF6'}44`,
                        }}
                      >
                        <Sparkles className="w-6 h-6" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                          {!item.isActive && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              Inactive
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{item.desc || 'Virtual luxury asset'}</p>

                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-xs">
                            <span className="text-sm">💎</span>
                            <span>{item.price.toLocaleString()}</span>
                          </div>

                          <span className="text-[11px] text-slate-500 font-medium">
                            • {item.validity}
                          </span>

                          <span className="text-[11px] text-slate-500 font-medium">
                            • {item.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Toolbar on Hover */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5 text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleToggleStatus(item);
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition ${
                            item.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {item.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{item.isActive ? 'Active' : 'Draft'}</span>
                        </button>

                        <span className="text-slate-500 text-[11px]">
                          Sales: <strong className="text-slate-300">{item.salesCount || 0}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleOpenEditModal(item);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          title="Edit Item"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteItem(item._id, item.name);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition"
                          title="Delete Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (Live Contextual Preview) */}
        <div className="space-y-6">
          <div className="sticky top-6 rounded-3xl bg-slate-900/90 border border-slate-800/80 p-6 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-pink-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Mobile In-App Live Preview
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-pink-500/20 text-pink-400">
                Live Renderer
              </span>
            </div>

            {selectedItem ? (
              <div className="mt-6 space-y-6">
                {/* Visual Canvas Simulator */}
                <div
                  className="rounded-2xl p-6 text-center flex flex-col items-center justify-center relative overflow-hidden border border-white/10"
                  style={{
                    background: `linear-gradient(135deg, ${selectedItem.bgColors?.[0] || '#1E1B4B'}, ${selectedItem.previewColor || '#4F46E5'})`,
                    minHeight: '220px',
                  }}
                >
                  {/* Category Specific Visual Render */}
                  {selectedItem.category === 'Unique ID' && (
                    <div className="w-full max-w-[240px] bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-amber-400/40 shadow-xl">
                      <div className="flex items-center justify-center gap-1.5 text-amber-300 font-bold text-xs">
                        <Crown className="w-4 h-4" />
                        <span>Yaro Sovereign ID</span>
                      </div>
                      <p className="text-3xl font-black text-amber-300 tracking-wider my-2">
                        {selectedItem.metadata?.number || selectedItem.name.split(' ')[0]}
                      </p>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-200">
                        {selectedItem.metadata?.tag || 'Exclusive Tier'}
                      </span>
                    </div>
                  )}

                  {selectedItem.category === 'Mic Wave' && (
                    <div className="flex flex-col items-center">
                      <div className="relative w-24 h-24 flex items-center justify-center">
                        <div
                          className="absolute inset-0 rounded-full animate-ping opacity-40"
                          style={{ backgroundColor: selectedItem.previewColor || '#10B981' }}
                        />
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg text-white"
                          style={{ backgroundColor: selectedItem.previewColor || '#10B981' }}
                        >
                          <Radio className="w-8 h-8 animate-pulse" />
                        </div>
                      </div>
                      <p className="text-white text-xs font-bold mt-3">Mic Pulsing Wave</p>
                    </div>
                  )}

                  {selectedItem.category === 'Chat Bubble' && (
                    <div className="w-full max-w-[220px] bg-slate-900/80 backdrop-blur-md rounded-2xl p-3.5 border-2 text-left shadow-lg"
                      style={{ borderColor: selectedItem.previewColor || '#06B6D4' }}
                    >
                      <p className="text-[11px] font-bold text-white">Hey friend! Love this party room ❤️</p>
                      <span className="text-[9px] text-slate-400 block mt-1 text-right">10:45 PM • Yaro Chat</span>
                    </div>
                  )}

                  {selectedItem.category === 'Frames' && (
                    <div className="relative">
                      <div
                        className="w-24 h-24 rounded-full p-1 shadow-2xl flex items-center justify-center"
                        style={{
                          background: `conic-gradient(from 180deg, ${selectedItem.previewColor || '#EC4899'}, #F43F5E, #FB7185, ${selectedItem.previewColor || '#EC4899'})`,
                        }}
                      >
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden border-2 border-white/20">
                          <Crown className="w-10 h-10 text-amber-400" />
                        </div>
                      </div>
                      <p className="text-white text-xs font-bold mt-2">Avatar Frame</p>
                    </div>
                  )}

                  {selectedItem.category === 'Entry' && (
                    <div className="w-full bg-black/60 rounded-2xl p-4 border border-amber-400/30 text-center">
                      <Car className="w-10 h-10 text-amber-400 mx-auto animate-bounce mb-1" />
                      <p className="text-amber-300 font-extrabold text-xs uppercase tracking-wider">
                        {selectedItem.metadata?.banner || 'His Excellency Enters'}
                      </p>
                      <p className="text-white font-bold text-sm mt-1">{selectedItem.name}</p>
                    </div>
                  )}

                  {selectedItem.category === 'VIP' && (
                    <div className="w-full bg-black/50 backdrop-blur-md rounded-2xl p-4 border border-purple-400/40 text-center">
                      <Crown className="w-10 h-10 text-yellow-400 mx-auto mb-1 animate-pulse" />
                      <p className="text-purple-300 font-black text-sm">{selectedItem.name}</p>
                      <p className="text-white text-[11px] mt-1">Daily Diamonds + Royalty Crown</p>
                    </div>
                  )}

                  {selectedItem.category === 'Theme' && (
                    <div className="w-full text-center">
                      <Palette className="w-10 h-10 text-white/80 mx-auto mb-2" />
                      <p className="text-white font-black text-sm">{selectedItem.name}</p>
                      <p className="text-slate-300 text-xs">Custom Room Background</p>
                    </div>
                  )}

                  {selectedItem.category === 'Tassel' && (
                    <div className="w-full text-center">
                      <Layers className="w-10 h-10 text-amber-300 mx-auto mb-2" />
                      <p className="text-white font-black text-sm">{selectedItem.name}</p>
                      <p className="text-slate-300 text-xs">Profile Silk Tassel Badge</p>
                    </div>
                  )}
                </div>

                {/* Details Breakdown */}
                <div className="space-y-3">
                  <div>
                    <h4 className="text-base font-bold text-white">{selectedItem.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">{selectedItem.desc}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                      <span className="text-slate-400 block text-[10px]">Price in Diamonds</span>
                      <span className="text-amber-400 font-black text-sm flex items-center gap-1 mt-0.5">
                        💎 {selectedItem.price.toLocaleString()}
                      </span>
                    </div>

                    <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                      <span className="text-slate-400 block text-[10px]">Duration / Validity</span>
                      <span className="text-white font-bold text-sm mt-0.5 block">
                        {selectedItem.validity}
                      </span>
                    </div>

                    <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                      <span className="text-slate-400 block text-[10px]">Category</span>
                      <span className="text-pink-400 font-bold text-sm mt-0.5 block">
                        {selectedItem.category}
                      </span>
                    </div>

                    <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                      <span className="text-slate-400 block text-[10px]">Catalog Status</span>
                      <span className={`font-bold text-sm mt-0.5 block ${selectedItem.isActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {selectedItem.isActive ? 'Active on App' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleOpenEditModal(selectedItem)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition border border-slate-700 flex items-center justify-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Specifications</span>
                  </button>

                  <button
                    onClick={() => handleToggleStatus(selectedItem)}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs transition border ${
                      selectedItem.isActive
                        ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {selectedItem.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                Select an item from the catalog to view its live simulated preview.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Store Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-500" />
                <span>{editingItem ? 'Edit Store Item' : 'Add New Store Item'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 mt-6">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Item Title / Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 88888 (Fortune Gold), Cyber Neon Wave"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500"
                  >
                    {CATEGORIES.filter(c => c.label !== 'All').map(c => (
                      <option key={c.label} value={c.label}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Price (Diamonds) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

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
                    <option value="7 Days">7 Days</option>
                    <option value="30 Days">30 Days</option>
                    <option value="90 Days">90 Days</option>
                    <option value="Permanent">Permanent</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Badge Tag (e.g. HOT, VIP)
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Theme Hex Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.previewColor}
                      onChange={e => setFormData({ ...formData, previewColor: e.target.value })}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
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
                    Status
                  </label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded text-pink-500 focus:ring-pink-500"
                    />
                    <span className="text-xs text-slate-300">Publish immediately to mobile app</span>
                  </label>
                </div>
              </div>

              {/* Category-Specific Fields */}
              {formData.category === 'Unique ID' && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                  <p className="text-xs font-bold text-amber-400">Unique ID Specifications</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1">ID Number (e.g. 88888)</label>
                      <input
                        type="text"
                        placeholder="88888"
                        value={formData.metadataNumber}
                        onChange={e => setFormData({ ...formData, metadataNumber: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-amber-500/30 rounded-xl text-xs text-amber-300"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1">Badge Tag</label>
                      <input
                        type="text"
                        placeholder="Royal Gold"
                        value={formData.metadataTag}
                        onChange={e => setFormData({ ...formData, metadataTag: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-amber-500/30 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.category === 'Entry' && (
                <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                  <label className="text-xs font-bold text-orange-400 block mb-1">
                    Entry Greeting Banner
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. His Excellency Has Arrived"
                    value={formData.metadataBanner}
                    onChange={e => setFormData({ ...formData, metadataBanner: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-orange-500/30 rounded-xl text-xs text-white"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Item Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain special perks, animation qualities, and appearance..."
                  value={formData.desc}
                  onChange={e => setFormData({ ...formData, desc: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-bold shadow-lg shadow-pink-500/25 transition"
                >
                  {editingItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
