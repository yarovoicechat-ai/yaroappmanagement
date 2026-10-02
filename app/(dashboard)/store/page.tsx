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
  UploadCloud,
  FileImage,
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
  | 'VIP'
  | 'King of Kings';

export interface StoreItem {
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
  animationUrl?: string;
  desc?: string;
  isActive: boolean;
  sortOrder: number;
  salesCount: number;
  metadata?: Record<string, any>;
  createdAt: string;
}

const durationPrice = (item: StoreItem, days: number) =>
  item.priceOptions?.find(option => option.days === days)?.diamonds ??
  Math.max(0, Math.round(item.price * (({ 3: 0.15, 7: 0.3, 15: 0.55, 30: 1 } as Record<number, number>)[days] || 1)));

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
  { label: 'King of Kings', icon: Crown, color: 'text-amber-300' },
];

export default function StoreManagementPage() {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<StoreCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [uploadingField, setUploadingField] = useState<'imageUrl' | 'animationUrl' | 'sound' | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StoreItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Entry' as StoreCategory,
    price: 15000,
    price3Days: 2250,
    price7Days: 4500,
    price15Days: 8250,
    price30Days: 15000,
    validity: '30 Days',
    badgeText: 'HOT',
    previewColor: '#FF2A85',
    icon: 'sparkles',
    imageUrl: '',
    animationUrl: '',
    sound: '',
    desc: '',
    isActive: true,
    // Entry specific
    metadataBanner: '👑 VIP HAS ENTERED',
    animationType: 'VIP_ENTRANCE',
    duration: 3500,
    // Unique ID specific
    metadataNumber: '',
    metadataTag: '',
    // Frames specific
    frameLevel: '1',
    // Mic Wave specific
    wavePulseStyle: 'Multi Wave',
    // Chat Bubble specific
    bubbleTextColor: '#FFFFFF',
    bubbleBorderColor: '#06B6D4',
    // VIP specific
    dailyAllowance: 500,
    metadataBenefits: '',
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
      console.warn('Failed to load store items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreItems();
  }, []);

  const handleOpenAddModal = (targetCategory?: StoreCategory) => {
    setEditingItem(null);
    const cat = (targetCategory && targetCategory !== 'All') 
      ? targetCategory 
      : (selectedCategory !== 'All' ? selectedCategory : 'Entry');

    let defaultPrice = 15000;
    let defaultBanner = '👑 VIP HAS ENTERED';
    let defaultDesc = 'Luxury room arrival ride animation';
    let defaultColor = '#FF2A85';

    if (cat === 'Frames') {
      defaultPrice = 3500;
      defaultDesc = 'Exclusive animated avatar profile frame';
      defaultColor = '#F43F5E';
    } else if (cat === 'Mic Wave') {
      defaultPrice = 2000;
      defaultDesc = 'Dynamic microphone pulsing wave aura';
      defaultColor = '#10B981';
    } else if (cat === 'Chat Bubble') {
      defaultPrice = 1500;
      defaultDesc = 'Special glowing chat message bubble';
      defaultColor = '#06B6D4';
    } else if (cat === 'Unique ID') {
      defaultPrice = 10000;
      defaultDesc = 'Rare sovereign short profile ID';
      defaultColor = '#F59E0B';
    } else if (cat === 'Theme') {
      defaultPrice = 5000;
      defaultDesc = 'Custom luxury voice room wallpaper & atmosphere';
      defaultColor = '#8B5CF6';
    } else if (cat === 'Tassel') {
      defaultPrice = 4000;
      defaultDesc = 'Silk ribbon profile tassel badge';
      defaultColor = '#F59E0B';
    } else if (cat === 'VIP' || cat === 'King of Kings') {
      defaultPrice = 25000;
      defaultDesc = 'Elite VIP crown membership & daily diamonds';
      defaultColor = '#EAB308';
    }

    setFormData({
      name: '',
      category: cat,
      price: defaultPrice,
      price3Days: Math.round(defaultPrice * 0.15),
      price7Days: Math.round(defaultPrice * 0.3),
      price15Days: Math.round(defaultPrice * 0.55),
      price30Days: defaultPrice,
      validity: '30 Days',
      badgeText: 'HOT',
      previewColor: defaultColor,
      icon: 'sparkles',
      imageUrl: '',
      animationUrl: '',
      sound: '',
      desc: defaultDesc,
      isActive: true,
      metadataNumber: cat === 'Unique ID' ? '88888' : '',
      metadataTag: cat === 'Unique ID' ? 'Royal Gold' : '',
      metadataBanner: defaultBanner,
      animationType: 'VIP_ENTRANCE',
      duration: 3500,
      frameLevel: '1',
      wavePulseStyle: 'Multi Wave',
      bubbleTextColor: '#FFFFFF',
      bubbleBorderColor: '#06B6D4',
      dailyAllowance: 500,
      metadataBenefits: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: StoreItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: (item.category as StoreCategory) || 'Entry',
      price: item.price,
      price3Days: durationPrice(item, 3),
      price7Days: durationPrice(item, 7),
      price15Days: durationPrice(item, 15),
      price30Days: durationPrice(item, 30),
      validity: item.validity || '30 Days',
      badgeText: item.badgeText || '',
      previewColor: item.previewColor || '#FF2A85',
      icon: item.icon || 'sparkles',
      imageUrl: item.imageUrl || '',
      animationUrl: item.animationUrl || '',
      sound: item.metadata?.sound || '',
      desc: item.desc || '',
      isActive: item.isActive,
      metadataNumber: item.metadata?.number || '',
      metadataTag: item.metadata?.tag || '',
      metadataBanner: item.metadata?.banner || '👑 VIP HAS ENTERED',
      animationType: item.metadata?.animationType || 'VIP_ENTRANCE',
      duration: item.metadata?.duration || 3500,
      frameLevel: String(item.metadata?.frameLevel || '1'),
      wavePulseStyle: item.metadata?.wavePulseStyle || 'Multi Wave',
      bubbleTextColor: item.metadata?.bubbleTextColor || '#FFFFFF',
      bubbleBorderColor: item.metadata?.bubbleBorderColor || '#06B6D4',
      dailyAllowance: item.metadata?.dailyAllowance || 500,
      metadataBenefits: Array.isArray(item.metadata?.benefits) ? item.metadata.benefits.join('\n') : '',
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
      price: Number(formData.price30Days) || 0,
      priceOptions: [
        { days: 3, diamonds: Number(formData.price3Days) || 0 },
        { days: 7, diamonds: Number(formData.price7Days) || 0 },
        { days: 15, diamonds: Number(formData.price15Days) || 0 },
        { days: 30, diamonds: Number(formData.price30Days) || 0 },
      ],
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
        animationType: formData.animationType,
        duration: Number(formData.duration) || 3500,
        sound: formData.sound,
        frameLevel: Number(formData.frameLevel) || 1,
        bubbleTextColor: formData.bubbleTextColor,
        bubbleBorderColor: formData.bubbleBorderColor,
        wavePulseStyle: formData.wavePulseStyle,
        dailyAllowance: Number(formData.dailyAllowance) || 0,
        benefits: formData.metadataBenefits.split(/\n|,/).map(value => value.trim()).filter(Boolean),
      },
    };

    try {
      if (editingItem) {
        await apiClient.put(API_ENDPOINTS.STORE.UPDATE(editingItem._id), payload);
        toast.success(`Updated ${formData.name}!`);
      } else {
        await apiClient.post(API_ENDPOINTS.STORE.CREATE, payload);
        toast.success(`Created ${formData.name}! Store catalog me live add ho gaya.`);
      }

      // Cross-sync Entry Effect to dedicated /api/entry-effects
      if (formData.category === 'Entry') {
        try {
          await apiClient.post(API_ENDPOINTS.ENTRY_EFFECTS.CREATE, {
            name: formData.name.trim(),
            tagText: formData.metadataBanner || '👑 VIP HAS ENTERED',
            animationType: formData.animationType || 'VIP_ENTRANCE',
            price: Number(formData.price30Days) || 15000,
            image: formData.imageUrl,
            imageUrl: formData.imageUrl,
            animationUrl: formData.animationUrl,
            sound: formData.sound,
            duration: Number(formData.duration) || 3500,
            isActive: formData.isActive,
            isVip: true,
          });
        } catch (_) {}
      }

      // Cross-sync Frame to dedicated /api/frames
      if (formData.category === 'Frames') {
        try {
          await apiClient.post(API_ENDPOINTS.FRAMES.CREATE, {
            name: formData.name.trim(),
            price: Number(formData.price30Days) || 3500,
            image: formData.imageUrl,
            imageUrl: formData.imageUrl,
            animationUrl: formData.animationUrl,
            level: Number(formData.frameLevel) || 1,
            isActive: formData.isActive,
          });
        } catch (_) {}
      }

      setIsModalOpen(false);
      fetchStoreItems();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save store item');
    }
  };

  const handleAssetUpload = async (file: File | undefined, field: 'imageUrl' | 'animationUrl' | 'sound') => {
    if (!file) return;
    const isAnimation = field === 'animationUrl';
    const isSound = field === 'sound';
    if (isAnimation && !/\.(svga|gif|webp|png|mp4|wav|wave|mp3)$/i.test(file.name)) {
      toast.error('Animation file must be .svga, .gif, .webp, .png, .wave, or .mp4');
      return;
    }
    if (isSound && !/\.(mp3|wav|ogg|aac|m4a)$/i.test(file.name)) {
      toast.error('Sound file must be .mp3, .wav, or .m4a');
      return;
    }

    try {
      setUploadingField(field);
      const body = new FormData();
      body.append('file', file);
      const response = await apiClient.uploadFile<{ url: string }>(API_ENDPOINTS.UPLOAD.FILE || '/api/upload/file', body);
      const url = response.data?.url || (response as any).url;
      if (!url) throw new Error('Upload URL was not returned');
      setFormData(current => ({ ...current, [field]: url }));
      toast.success(`${isAnimation ? 'Animation file' : isSound ? 'Sound file' : 'Preview image'} uploaded successfully!`);
    } catch (error: any) {
      toast.error(error?.message || 'File upload failed');
    } finally {
      setUploadingField(null);
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
              onClick={() => handleOpenAddModal(selectedCategory !== 'All' ? selectedCategory : 'Entry')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-sm font-bold shadow-lg shadow-pink-500/30 transition transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Item</span>
            </button>
          </div>
        </div>

        {/* Quick Add Bar for All Categories */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>Direct Add By Category (Sabhi Chije Yahan Se Add Karein)</span>
            </p>
            <span className="text-[11px] text-pink-400 font-semibold hidden sm:inline">
              1-Click Instant Modal
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            <button
              type="button"
              onClick={() => handleOpenAddModal('Entry')}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-gradient-to-b from-orange-500/15 to-orange-500/5 hover:from-orange-500/30 hover:to-orange-500/15 text-orange-300 border border-orange-500/30 hover:border-orange-500/60 transition shadow-sm text-center group"
            >
              <Car className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-[11px] font-bold">+ Entry (सवारी)</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenAddModal('Frames')}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-gradient-to-b from-rose-500/15 to-rose-500/5 hover:from-rose-500/30 hover:to-rose-500/15 text-rose-300 border border-rose-500/30 hover:border-rose-500/60 transition shadow-sm text-center group"
            >
              <Sparkles className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-[11px] font-bold">+ Frame (फ़्रेम)</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenAddModal('Mic Wave')}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-gradient-to-b from-emerald-500/15 to-emerald-500/5 hover:from-emerald-500/30 hover:to-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/60 transition shadow-sm text-center group"
            >
              <Radio className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-[11px] font-bold">+ Mic Wave</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenAddModal('Chat Bubble')}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-gradient-to-b from-cyan-500/15 to-cyan-500/5 hover:from-cyan-500/30 hover:to-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/60 transition shadow-sm text-center group"
            >
              <Zap className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-[11px] font-bold">+ Chat Bubble</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenAddModal('Unique ID')}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-gradient-to-b from-amber-500/15 to-amber-500/5 hover:from-amber-500/30 hover:to-amber-500/15 text-amber-300 border border-amber-500/30 hover:border-amber-500/60 transition shadow-sm text-center group"
            >
              <Tag className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-[11px] font-bold">+ Unique ID</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenAddModal('Theme')}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-gradient-to-b from-purple-500/15 to-purple-500/5 hover:from-purple-500/30 hover:to-purple-500/15 text-purple-300 border border-purple-500/30 hover:border-purple-500/60 transition shadow-sm text-center group"
            >
              <Palette className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-[11px] font-bold">+ Room Theme</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenAddModal('Tassel')}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-gradient-to-b from-yellow-500/15 to-yellow-500/5 hover:from-yellow-500/30 hover:to-yellow-500/15 text-yellow-300 border border-yellow-500/30 hover:border-yellow-500/60 transition shadow-sm text-center group"
            >
              <Layers className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-[11px] font-bold">+ Tassel (टैसल)</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenAddModal('VIP')}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-gradient-to-b from-pink-500/15 to-pink-500/5 hover:from-pink-500/30 hover:to-pink-500/15 text-pink-300 border border-pink-500/30 hover:border-pink-500/60 transition shadow-sm text-center group"
            >
              <Crown className="w-5 h-5 text-pink-400 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-[11px] font-bold">+ VIP Crown</span>
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
                <p className="text-2xl font-black text-pink-400 mt-1">{CATEGORIES.length - 1} Available</p>
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
              <h3 className="text-white font-bold text-base">
                {selectedCategory === 'All' 
                  ? 'No items found' 
                  : selectedCategory === 'Entry'
                  ? 'Store me abhi koi Entry Effect (सवारी) add nahi hai'
                  : `Store me abhi koi ${selectedCategory} add nahi hai`}
              </h3>
              <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto">
                {selectedCategory === 'Entry'
                  ? 'Niche diye gaye button par click karke turant new Entry effect (सवारी) ka preview image aur SVGA/GIF animation upload karein.'
                  : `Niche button par click karke turant new ${selectedCategory} add karein.`}
              </p>
              <button
                type="button"
                onClick={() => handleOpenAddModal(selectedCategory !== 'All' ? selectedCategory : 'Entry')}
                className={`mt-4 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition inline-flex items-center gap-2 shadow-lg ${
                  selectedCategory === 'Entry'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/25'
                    : selectedCategory === 'Frames'
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-rose-500/25'
                    : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-pink-500/25'
                }`}
              >
                {selectedCategory === 'Entry' ? <Car className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>
                  {selectedCategory === 'Entry'
                    ? '+ Add Entry Effect (सवारी upload karein)'
                    : `+ Add ${selectedCategory === 'All' ? 'Item' : selectedCategory}`}
                </span>
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
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt="" className="h-full w-full rounded-xl object-cover" />
                        ) : (
                          <Sparkles className="w-6 h-6" />
                        )}
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
                            <span>From {durationPrice(item, 3).toLocaleString()}</span>
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

                  {(selectedItem.category === 'VIP' || selectedItem.category === 'King of Kings') && (
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

              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Diamond className="h-4 w-4 text-cyan-400" />
                  <p className="text-xs font-bold text-cyan-300">Duration-wise diamond pricing</p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {([
                    [3, 'price3Days'],
                    [7, 'price7Days'],
                    [15, 'price15Days'],
                    [30, 'price30Days'],
                  ] as const).map(([days, key]) => (
                    <div key={days}>
                      <label className="mb-1 block text-[11px] text-slate-400">{days} Days</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={formData[key]}
                        onChange={event => setFormData({ ...formData, [key]: Number(event.target.value) })}
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => {
                      const newCat = e.target.value as StoreCategory;
                      let newPrice = formData.price30Days;
                      let newDesc = formData.desc;
                      if (!editingItem) {
                        if (newCat === 'Entry') { newPrice = 15000; newDesc = 'Luxury room arrival ride animation'; }
                        else if (newCat === 'Frames') { newPrice = 3500; newDesc = 'Exclusive animated avatar profile frame'; }
                        else if (newCat === 'Mic Wave') { newPrice = 2000; newDesc = 'Dynamic microphone pulsing wave aura'; }
                        else if (newCat === 'Chat Bubble') { newPrice = 1500; newDesc = 'Special glowing chat message bubble'; }
                        else if (newCat === 'Unique ID') { newPrice = 10000; newDesc = 'Rare sovereign short profile ID'; }
                        else if (newCat === 'Theme') { newPrice = 5000; newDesc = 'Custom luxury voice room wallpaper & atmosphere'; }
                        else if (newCat === 'Tassel') { newPrice = 4000; newDesc = 'Silk ribbon profile tassel badge'; }
                        else if (newCat === 'VIP' || newCat === 'King of Kings') { newPrice = 25000; newDesc = 'Elite VIP crown membership & daily diamonds'; }
                      }
                      setFormData({
                        ...formData,
                        category: newCat,
                        price: newPrice,
                        price3Days: Math.round(newPrice * 0.15),
                        price7Days: Math.round(newPrice * 0.3),
                        price15Days: Math.round(newPrice * 0.55),
                        price30Days: newPrice,
                        desc: newDesc,
                      });
                    }}
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
                    30-Day Price (Diamonds) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.price30Days}
                    onChange={e => setFormData({ ...formData, price30Days: Number(e.target.value), price: Number(e.target.value) })}
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
              {formData.category === 'Entry' && (
                <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/25 space-y-4">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-orange-400" />
                    <p className="text-xs font-bold text-orange-400">Entry Effect (सवारी / रूम अराइवल) Settings</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Entry Greeting Banner Text *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 👑 His Excellency Has Arrived"
                        value={formData.metadataBanner}
                        onChange={e => setFormData({ ...formData, metadataBanner: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-orange-500/30 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Ride Animation Type *
                      </label>
                      <select
                        value={formData.animationType}
                        onChange={e => setFormData({ ...formData, animationType: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-900 border border-orange-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                      >
                        <option value="VIP_ENTRANCE">👑 VIP Entrance (Royalty Ride)</option>
                        <option value="FLYING_RIDE">🏎️ Flying Ride (Car / Dragon Sweeping Screen)</option>
                        <option value="BANNER">🚩 Banner Across Room</option>
                        <option value="CENTER_AVATAR">✨ Center Avatar Spotlight</option>
                        <option value="PARTICLES">🎆 Golden Fireworks & Particles</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Ride Screen Duration (ms)
                      </label>
                      <input
                        type="number"
                        min="1000"
                        step="500"
                        value={formData.duration}
                        onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-900 border border-orange-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Recommended: 3500ms (3.5 seconds)</span>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Optional Entry Sound / Chime
                      </label>
                      <label className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 border border-orange-500/30 text-xs text-slate-300 cursor-pointer hover:border-orange-400 transition">
                        <span className="truncate max-w-[140px]">
                          {uploadingField === 'sound'
                            ? 'Uploading Sound...'
                            : formData.sound
                            ? formData.sound.split('/').pop()
                            : 'Choose Audio (.mp3, .wav)'}
                        </span>
                        <UploadCloud className="w-4 h-4 text-orange-400 flex-shrink-0 ml-1" />
                        <input
                          type="file"
                          accept="audio/mp3,audio/wav,audio/aac,audio/m4a"
                          className="hidden"
                          disabled={uploadingField !== null}
                          onChange={e => handleAssetUpload(e.target.files?.[0], 'sound')}
                        />
                      </label>
                      {formData.sound && (
                        <span className="text-[10px] text-emerald-400 mt-0.5 block">✓ Entry chime audio attached</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {formData.category === 'Frames' && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-rose-400" />
                      <p className="text-xs font-bold text-rose-400">Avatar Profile Frame Settings</p>
                    </div>
                    <span className="text-[11px] font-bold text-rose-300">Live Avatar Ring</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 items-center">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Required User Level
                      </label>
                      <select
                        value={formData.frameLevel}
                        onChange={e => setFormData({ ...formData, frameLevel: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-rose-500/30 rounded-xl text-xs text-white focus:outline-none"
                      >
                        <option value="1">Level 1 (All users)</option>
                        <option value="5">Level 5+</option>
                        <option value="10">Level 10+ (Bronze)</option>
                        <option value="20">Level 20+ (Silver)</option>
                        <option value="30">Level 30+ (Gold)</option>
                        <option value="50">Level 50+ (Diamond Legend)</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-900/60 p-2.5 rounded-xl border border-rose-500/20">
                      <div
                        className="w-12 h-12 rounded-full p-0.5 flex items-center justify-center shadow-lg"
                        style={{ background: formData.previewColor || '#F43F5E' }}
                      >
                        <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                          <Crown className="w-5 h-5 text-amber-400" />
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-white">Avatar Preview</p>
                        <p className="text-[9px] text-slate-400">App profile screen live</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {formData.category === 'Mic Wave' && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-3">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    <p className="text-xs font-bold text-emerald-400">Microphone Pulsing Wave Settings</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 items-center">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Pulsing Animation Style
                      </label>
                      <select
                        value={formData.wavePulseStyle}
                        onChange={e => setFormData({ ...formData, wavePulseStyle: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-emerald-500/30 rounded-xl text-xs text-white focus:outline-none"
                      >
                        <option value="Multi Wave">Multi Ring Ripple (Double)</option>
                        <option value="Single Ripple">Single Expanding Pulse</option>
                        <option value="Neon Pulsar">Neon Energy Flash</option>
                        <option value="Golden Aura">Golden Radiant Halo</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-900/60 p-2.5 rounded-xl border border-emerald-500/20">
                      <div className="relative w-10 h-10 flex items-center justify-center">
                        <div
                          className="absolute inset-0 rounded-full animate-ping opacity-40"
                          style={{ backgroundColor: formData.previewColor || '#10B981' }}
                        />
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center shadow-md text-white"
                          style={{ backgroundColor: formData.previewColor || '#10B981' }}
                        >
                          <Radio className="w-4 h-4" />
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-white">Mic Simulation</p>
                        <p className="text-[9px] text-slate-400">Speaking effect in room</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {formData.category === 'Chat Bubble' && (
                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <p className="text-xs font-bold text-cyan-400">Room Chat Message Bubble Settings</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Bubble Text Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.bubbleTextColor}
                          onChange={e => setFormData({ ...formData, bubbleTextColor: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <input
                          type="text"
                          value={formData.bubbleTextColor}
                          onChange={e => setFormData({ ...formData, bubbleTextColor: e.target.value })}
                          className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-cyan-500/30 rounded-xl text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-xl border-2 shadow-md flex flex-col justify-center"
                      style={{ borderColor: formData.previewColor || '#06B6D4' }}
                    >
                      <p className="text-[10px] font-bold" style={{ color: formData.bubbleTextColor || '#FFFFFF' }}>
                        Hello room friends! ❤️
                      </p>
                      <span className="text-[8px] text-slate-500 text-right mt-0.5">Live bubble</span>
                    </div>
                  </div>
                </div>
              )}

              {formData.category === 'Unique ID' && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-400" />
                    <p className="text-xs font-bold text-amber-400">Sovereign Unique ID Specifications</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1">ID Number (e.g. 88888, 777777)</label>
                      <input
                        type="text"
                        placeholder="88888"
                        value={formData.metadataNumber}
                        onChange={e => setFormData({ ...formData, metadataNumber: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-amber-500/30 rounded-xl text-xs text-amber-300 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1">Badge Tag / Title</label>
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

              {formData.category === 'Theme' && (
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/25 space-y-2">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-purple-400" />
                    <p className="text-xs font-bold text-purple-400">Custom Room Theme / Background Wallpaper</p>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Upload room wallpaper in &quot;Bahar Jo Image Dikhe&quot; and optional background animated effects in &quot;Item Animation File&quot;.
                  </p>
                </div>
              )}

              {formData.category === 'Tassel' && (
                <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/25 space-y-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-yellow-400" />
                    <p className="text-xs font-bold text-yellow-400">Profile Tassel Silk Ribbon Badge</p>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Upload tassel preview photo in &quot;Bahar Jo Image Dikhe&quot; and optional SVGA ribbon swaying effect in &quot;Item Animation File&quot;.
                  </p>
                </div>
              )}

              {(formData.category === 'VIP' || formData.category === 'King of Kings') && (
                <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/25 space-y-3">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-400" />
                    <p className="text-xs font-bold text-yellow-400">VIP / King of Kings Privileges</p>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Daily Diamond Reward
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.dailyAllowance}
                      onChange={e => setFormData({ ...formData, dailyAllowance: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-900 border border-yellow-500/30 rounded-xl text-xs text-amber-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Included Privileges & Benefits (One per line)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Royal Crown badge&#10;Anti-kick immunity&#10;Free monthly animated frame&#10;Flying dragon entry"
                      value={formData.metadataBenefits}
                      onChange={e => setFormData({ ...formData, metadataBenefits: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-yellow-500/30 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Bahar Jo Image Dikhe (Preview Image) */}
                <div className="rounded-2xl border border-pink-500/30 bg-slate-800/80 p-4">
                  <label className="mb-1 flex items-center gap-2 text-xs font-bold text-pink-300">
                    <FileImage className="h-4 w-4 text-pink-400" />
                    Bahar Jo Image Dikhe *
                  </label>
                  <p className="text-[10px] text-slate-400 mb-2">Store catalog me bahar show hone wali preview photo.</p>

                  <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-pink-500/50 hover:border-pink-400 bg-slate-900/60 p-3.5 text-center transition">
                    <UploadCloud className="h-5 w-5 text-pink-400" />
                    <span className="text-xs font-semibold text-white">
                      {uploadingField === 'imageUrl' ? 'Uploading Image...' : 'Choose Preview Image'}
                    </span>
                    <span className="text-[10px] text-slate-400">PNG, JPG, WEBP (Choose file)</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                      disabled={uploadingField !== null}
                      onChange={event => handleAssetUpload(event.target.files?.[0], 'imageUrl')}
                    />
                  </label>

                  {formData.imageUrl && (
                    <div className="mt-2.5 rounded-xl border border-slate-700 bg-slate-950 p-2 text-center">
                      <img src={formData.imageUrl} alt="Item preview" className="h-20 w-full object-contain mx-auto" />
                      <span className="inline-block mt-1 text-[10px] font-medium text-emerald-400 truncate max-w-full">
                        ✓ Image uploaded & connected
                      </span>
                    </div>
                  )}
                </div>

                {/* Animation File (SVGA, GIF, WEBP, WAVE, MP4) */}
                <div className="rounded-2xl border border-violet-500/30 bg-slate-800/80 p-4">
                  <label className="mb-1 flex items-center gap-2 text-xs font-bold text-violet-300">
                    <Sparkles className="h-4 w-4 text-violet-400" />
                    Item Animation File *
                  </label>
                  <p className="text-[10px] text-slate-400 mb-2">File type: SVGA, GIF, WEBP, WAVE, MP4</p>

                  <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-violet-500/50 hover:border-violet-400 bg-slate-900/60 p-3.5 text-center transition">
                    <UploadCloud className="h-5 w-5 text-violet-400" />
                    <span className="text-xs font-semibold text-white">
                      {uploadingField === 'animationUrl' ? 'Uploading File...' : 'Choose Animation File'}
                    </span>
                    <span className="text-[10px] text-slate-400">.svga, .gif, .webp, .wave, .mp4</span>
                    <input
                      type="file"
                      accept=".svga,image/gif,image/webp,image/png,.mp4,.wav,.wave,.mp3"
                      className="hidden"
                      disabled={uploadingField !== null}
                      onChange={event => handleAssetUpload(event.target.files?.[0], 'animationUrl')}
                    />
                  </label>

                  {formData.animationUrl && (
                    <div className="mt-2.5 rounded-xl border border-violet-500/30 bg-violet-950/40 p-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-violet-500 text-white">
                          {formData.animationUrl.split('.').pop()?.toUpperCase() || 'SVGA'}
                        </span>
                        <span className="text-[11px] font-semibold text-violet-200 truncate max-w-[150px]">
                          {formData.animationUrl.split('/').pop()}
                        </span>
                      </div>
                      <span className="inline-block mt-0.5 text-[10px] text-violet-300/80">
                        ✓ Connected to mobile app
                      </span>
                    </div>
                  )}
                </div>
              </div>

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
