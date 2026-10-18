'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription,
} from '@/components/ui/Dialog';
import {
    Sparkles, Gem, Gift, UploadCloud, FolderUp, FileUp,
    Loader2, CheckCircle2, Flame, Crown, Zap, Volume2, Clock, Layers, Link as LinkIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';

export interface GiftFormData {
    _id?: string;
    name: string;
    icon: string;
    animationUrl?: string;
    mediaType?: 'image' | 'gif' | 'webp' | 'svg' | 'svga';
    cost: number;
    price?: number;
    diamond?: number;
    diamonds?: number;
    category: string;
    rarity?: 'common' | 'rare' | 'epic' | 'legendary';
    animationType?: 'NORMAL' | 'FLOATING' | 'FLY_TO_RECEIVER' | 'CENTER_STAGE' | 'FULL_SCREEN' | 'SPECIAL' | 'VIP' | 'LUXURY';
    duration?: number;
    sound?: string;
    isHot?: boolean;
    isNewItem?: boolean;
    isVipOnly?: boolean;
    comboEnabled?: boolean;
    sortOrder?: number;
    isActive: boolean;
}

const DEFAULT_CATEGORIES = [
    'Popular', 'Luxury', 'Romantic', 'Special',
    'VIP', 'SVIP', 'Event', 'Surprise', 'Custom', 'Lucky', 'Gifts'
];

const DIAMOND_PRESETS = [10, 50, 100, 250, 500, 1000, 2999, 5999, 9999, 29999, 49999, 99999];

const ANIMATION_TYPES = [
    { value: 'NORMAL', label: 'Normal (Standard Popup)' },
    { value: 'FLOATING', label: 'Floating (Across Screen)' },
    { value: 'FLY_TO_RECEIVER', label: 'Fly To Host (Target Avatar)' },
    { value: 'CENTER_STAGE', label: 'Center Stage (Spotlight Banner)' },
    { value: 'FULL_SCREEN', label: 'Full Screen (SVGA Celebration)' },
    { value: 'SPECIAL', label: 'Special Effects (Particles)' },
    { value: 'VIP', label: 'VIP Exclusive Aura' },
    { value: 'LUXURY', label: 'Luxury Grand Finale' },
];

const RARITY_OPTIONS = [
    { value: 'common', label: 'Common', color: 'border-slate-600 bg-slate-800 text-slate-300' },
    { value: 'rare', label: 'Rare', color: 'border-sky-500/40 bg-sky-950/40 text-sky-400' },
    { value: 'epic', label: 'Epic', color: 'border-purple-500/40 bg-purple-950/40 text-purple-300' },
    { value: 'legendary', label: 'Legendary', color: 'border-amber-500/50 bg-amber-950/40 text-amber-400' },
];

interface GiftFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    gift?: GiftFormData | null;
    existingCategories?: string[];
    onSuccess?: () => void;
}

export default function GiftFormModal({
    open,
    onOpenChange,
    gift,
    existingCategories = [],
    onSuccess,
}: GiftFormModalProps) {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('Popular');
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);

    // Diamond price
    const [diamond, setDiamond] = useState<number>(50);

    // Media
    const [icon, setIcon] = useState('');
    const [iconFileName, setIconFileName] = useState('');
    const [showDirectIconUrl, setShowDirectIconUrl] = useState(false);

    const [animationUrl, setAnimationUrl] = useState('');
    const [animationFileName, setAnimationFileName] = useState('');
    const [showDirectAnimUrl, setShowDirectAnimUrl] = useState(false);

    const [mediaType, setMediaType] = useState<'image' | 'gif' | 'webp' | 'svg' | 'svga'>('image');

    // Advanced attributes
    const [rarity, setRarity] = useState<'common' | 'rare' | 'epic' | 'legendary'>('common');
    const [animationType, setAnimationType] = useState<any>('NORMAL');
    const [duration, setDuration] = useState<number>(2500);
    const [sound, setSound] = useState('');
    const [sortOrder, setSortOrder] = useState<number>(0);

    // Badges / Toggles
    const [isActive, setIsActive] = useState(true);
    const [isHot, setIsHot] = useState(false);
    const [isNewItem, setIsNewItem] = useState(true);
    const [isVipOnly, setIsVipOnly] = useState(false);
    const [comboEnabled, setComboEnabled] = useState(true);

    const [saving, setSaving] = useState(false);
    const [uploadingIcon, setUploadingIcon] = useState(false);
    const [uploadingAnimation, setUploadingAnimation] = useState(false);
    const [isDraggingIcon, setIsDraggingIcon] = useState(false);
    const [isDraggingAnim, setIsDraggingAnim] = useState(false);

    const iconInputRef = useRef<HTMLInputElement>(null);
    const animationInputRef = useRef<HTMLInputElement>(null);

    // Combined category list
    const combinedCategories = Array.from(
        new Set([...DEFAULT_CATEGORIES, ...existingCategories.filter(Boolean)])
    );

    useEffect(() => {
        if (open) {
            if (gift) {
                setName(gift.name || '');
                const targetCat = gift.category || 'Popular';
                setCategory(targetCat);
                setIsCreatingNewCategory(false);
                setNewCategoryName('');
                const rawDiamond = gift.diamond ?? gift.diamonds ?? gift.price ?? gift.cost ?? 50;
                setDiamond(Number(rawDiamond) || 50);
                const currentIcon = gift.icon || (gift as any).image || '';
                setIcon(currentIcon);
                setIconFileName(currentIcon ? 'Current Gift Icon' : '');
                const currentAnim = gift.animationUrl || (gift as any).animation || '';
                setAnimationUrl(currentAnim);
                setAnimationFileName(currentAnim ? 'Current Animation Asset' : '');
                setMediaType(gift.mediaType || 'image');
                setRarity(gift.rarity || 'common');
                setAnimationType(gift.animationType || 'NORMAL');
                setDuration(gift.duration || 2500);
                setSound(gift.sound || '');
                setSortOrder(gift.sortOrder || 0);
                setIsActive(gift.isActive !== undefined ? Boolean(gift.isActive) : true);
                setIsHot(Boolean(gift.isHot));
                setIsNewItem(gift.isNewItem !== undefined ? Boolean(gift.isNewItem) : false);
                setIsVipOnly(Boolean(gift.isVipOnly));
                setComboEnabled(gift.comboEnabled !== undefined ? Boolean(gift.comboEnabled) : true);
            } else {
                setName('');
                setCategory('Popular');
                setNewCategoryName('');
                setIsCreatingNewCategory(false);
                setDiamond(50);
                setIcon('');
                setIconFileName('');
                setAnimationUrl('');
                setAnimationFileName('');
                setMediaType('image');
                setRarity('common');
                setAnimationType('NORMAL');
                setDuration(2500);
                setSound('');
                setSortOrder(0);
                setIsActive(true);
                setIsHot(false);
                setIsNewItem(true);
                setIsVipOnly(false);
                setComboEnabled(true);
            }
        }
    }, [open, gift]);

    const handleFileUpload = async (file: File, field: 'icon' | 'animationUrl') => {
        if (!file) return;

        const isAnimation = field === 'animationUrl';
        if (isAnimation) {
            setUploadingAnimation(true);
            setAnimationFileName(file.name);
        } else {
            setUploadingIcon(true);
            setIconFileName(file.name);
        }

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await apiClient.uploadFile('/api/upload/file', formData);
            if (res.success && res.data?.url) {
                const uploadedUrl = res.data.url;
                const ext = file.name.toLowerCase().split('.').pop();

                if (isAnimation) {
                    setAnimationUrl(uploadedUrl);
                    if (ext === 'svga') setMediaType('svga');
                    else if (ext === 'gif') setMediaType('gif');
                    else if (ext === 'webp') setMediaType('webp');
                    else if (ext === 'svg') setMediaType('svg');
                } else {
                    setIcon(uploadedUrl);
                    if (!name.trim()) {
                        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
                        setName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
                    }
                }
                toast.success(`${isAnimation ? 'Animation Asset' : 'Gift Icon'} uploaded successfully!`);
            } else {
                toast.error(res.message || 'File upload failed');
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to upload file');
        } finally {
            if (isAnimation) setUploadingAnimation(false);
            else setUploadingIcon(false);
        }
    };

    const handleSave = async () => {
        const targetCategory = isCreatingNewCategory ? newCategoryName.trim() : category;

        if (!name.trim()) {
            toast.error('Gift Name is required (गिफ्ट का नाम आवश्यक है)');
            return;
        }

        if (!targetCategory) {
            toast.error('Category is required (कैटेगरी चुनना आवश्यक है)');
            return;
        }

        if (!diamond || Number(diamond) <= 0) {
            toast.error('Diamond Price must be greater than 0 (डायमंड कीमत 0 से अधिक होनी चाहिए)');
            return;
        }

        if (!icon) {
            toast.error('Gift Icon file is required (गिफ्ट आइकन अपलोड करें)');
            return;
        }

        const payload = {
            name: name.trim(),
            category: targetCategory,
            cost: Number(diamond),
            price: Number(diamond),
            diamond: Number(diamond),
            diamonds: Number(diamond),
            icon,
            animationUrl: animationUrl || '',
            mediaType,
            rarity,
            animationType,
            duration: Number(duration) || 2500,
            sound: sound.trim(),
            sortOrder: Number(sortOrder) || 0,
            isActive,
            isHot,
            isNewItem,
            isVipOnly,
            comboEnabled,
        };

        try {
            setSaving(true);
            let res;
            if (gift?._id) {
                res = await apiClient.put((API_ENDPOINTS.GIFTS as any).UPDATE(gift._id), payload);
            } else {
                res = await apiClient.post(API_ENDPOINTS.GIFTS.CREATE, payload);
            }

            if (res.success) {
                toast.success(
                    gift?._id
                        ? `Gift "${name}" updated successfully!`
                        : `Gift "${name}" created successfully under "${targetCategory}" with ${diamond} 💎!`
                );
                onOpenChange(false);
                if (onSuccess) onSuccess();
            } else {
                toast.error(res.message || 'Failed to save gift');
            }
        } catch (err: any) {
            toast.error(err.message || 'An error occurred while saving the gift');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto bg-slate-950 border border-slate-800 text-slate-100 p-6 sm:p-7 rounded-3xl shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2.5 text-2xl font-black bg-gradient-to-r from-pink-400 via-rose-300 to-amber-300 bg-clip-text text-transparent">
                        <Sparkles className="w-6 h-6 text-pink-400 shrink-0" />
                        {gift?._id ? `Edit Virtual Gift: ${gift.name}` : 'Add New Gift to Management Panel'}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-400 leading-relaxed">
                        Configure all options: Gift Name, Category, Diamond Price (💎), Icon Image, Animation Asset (SVGA/GIF), Rarity & VIP tags.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 pt-3">
                    {/* SECTION 1: NAME & CATEGORY & DIAMOND (TOP ESSENTIALS) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* 1. Gift Name */}
                        <div className="space-y-1.5 sm:col-span-2">
                            <Label className="font-extrabold text-sm text-slate-200 flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                    <Gift className="w-4 h-4 text-pink-400" />
                                    Gift Name (गिफ्ट का नाम) <span className="text-rose-400">*</span>
                                </span>
                                <span className="text-[11px] text-slate-400 font-normal">Displayed in live calls & room gift panel</span>
                            </Label>
                            <Input
                                placeholder="e.g. Royal Crown, Golden Rose, Supercar, Magic Castle..."
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="bg-slate-900 border-slate-700 h-11 text-sm font-semibold focus:border-pink-500 rounded-xl"
                            />
                        </div>

                        {/* 2. Gift Category */}
                        <div className="space-y-2 sm:col-span-2 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                            <div className="flex items-center justify-between">
                                <Label className="font-extrabold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                                    Gift Category (कैटेगरी) <span className="text-rose-400">*</span>
                                </Label>
                                <button
                                    type="button"
                                    onClick={() => setIsCreatingNewCategory(!isCreatingNewCategory)}
                                    className="text-xs font-bold text-pink-400 hover:text-pink-300 underline transition-colors cursor-pointer"
                                >
                                    {isCreatingNewCategory ? '← Pick Existing Category' : '+ Add New Category'}
                                </button>
                            </div>

                            {isCreatingNewCategory ? (
                                <div className="space-y-1.5 animate-in fade-in duration-200">
                                    <Input
                                        placeholder="Type NEW Category Name (e.g. Luxury Cars, Bollywood, Anime, Royal Gifts)..."
                                        value={newCategoryName}
                                        onChange={e => setNewCategoryName(e.target.value)}
                                        className="bg-slate-950 border-pink-500 text-pink-200 placeholder:text-pink-400/50 font-bold focus:border-pink-400 rounded-xl"
                                        autoFocus
                                    />
                                    <p className="text-[11px] text-pink-400/80">
                                        ✨ Entering a new category name will automatically create a new Category Tab in the Mobile App!
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <select
                                        value={category}
                                        onChange={e => {
                                            if (e.target.value === '__NEW__') {
                                                setIsCreatingNewCategory(true);
                                            } else {
                                                setCategory(e.target.value);
                                            }
                                        }}
                                        className="flex h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 font-medium focus:border-pink-500"
                                    >
                                        {combinedCategories.map(cat => (
                                            <option key={cat} value={cat}>
                                                {cat} Category
                                            </option>
                                        ))}
                                        <option value="__NEW__" className="text-pink-400 font-bold">
                                            + Add New Custom Category...
                                        </option>
                                    </select>

                                    {/* Quick Category Selection Pills */}
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {combinedCategories.slice(0, 8).map(cat => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setCategory(cat)}
                                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                                    category === cat
                                                        ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 3. Diamond Price (💎 डायमंड्स) */}
                        <div className="space-y-2 sm:col-span-2 bg-gradient-to-r from-amber-950/20 via-slate-900/60 to-slate-900/40 p-4 rounded-2xl border border-amber-500/30">
                            <Label className="font-extrabold text-sm text-amber-300 flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                    <Gem className="w-4 h-4 text-amber-400" />
                                    Gift Price in Diamonds (💎 डायमंड कीमत) <span className="text-rose-400">*</span>
                                </span>
                                <Badge variant="outline" className="text-amber-400 border-amber-500/40 font-mono text-[11px]">
                                    {diamond.toLocaleString()} DIAMONDS
                                </Badge>
                            </Label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg">💎</div>
                                <Input
                                    type="number"
                                    min={1}
                                    placeholder="Enter diamond price (e.g. 100)"
                                    value={diamond || ''}
                                    onChange={e => setDiamond(parseInt(e.target.value) || 0)}
                                    className="pl-10 h-12 bg-slate-950 border-amber-500/50 text-amber-200 text-base font-black focus:border-amber-400 rounded-xl"
                                />
                            </div>

                            {/* Preset Diamond Quick Buttons */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Presets:</span>
                                {DIAMOND_PRESETS.map(amt => (
                                    <button
                                        key={amt}
                                        type="button"
                                        onClick={() => setDiamond(amt)}
                                        className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all border cursor-pointer ${
                                            diamond === amt
                                                ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow'
                                                : 'bg-slate-900 border-slate-700/80 text-amber-300 hover:bg-amber-950/40'
                                        }`}
                                    >
                                        💎 {amt >= 1000 ? `${amt / 1000}k` : amt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: MEDIA UPLOADS (ICON & SVGA/ANIMATION) */}
                    <div className="space-y-4">
                        <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-cyan-400" />
                            Gift Visual Assets & Files (आइकन एवं एनिमेशन फाइल)
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* 1. Gift Icon Upload */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="font-bold text-xs text-slate-200 flex items-center gap-1">
                                        <span>Gift Icon Image <span className="text-rose-400">*</span></span>
                                        <span className="text-[10px] text-slate-400 font-normal">PNG / WebP / SVG</span>
                                    </Label>
                                    <button
                                        type="button"
                                        onClick={() => setShowDirectIconUrl(!showDirectIconUrl)}
                                        className="text-[10px] text-pink-400 hover:text-pink-300 underline flex items-center gap-0.5 cursor-pointer"
                                    >
                                        <LinkIcon className="w-2.5 h-2.5" />
                                        {showDirectIconUrl ? 'Upload File' : 'Paste URL'}
                                    </button>
                                </div>

                                {showDirectIconUrl ? (
                                    <Input
                                        placeholder="https://.../icon.png"
                                        value={icon}
                                        onChange={e => {
                                            setIcon(e.target.value);
                                            setIconFileName('Direct URL Icon');
                                        }}
                                        className="h-10 bg-slate-900 border-slate-700 text-xs font-mono"
                                    />
                                ) : (
                                    <>
                                        <input
                                            type="file"
                                            ref={iconInputRef}
                                            accept="image/*,.svg,.svga"
                                            className="hidden"
                                            onChange={e => {
                                                const file = e.target.files?.[0];
                                                if (file) handleFileUpload(file, 'icon');
                                            }}
                                        />

                                        <div
                                            onClick={() => iconInputRef.current?.click()}
                                            onDragOver={e => { e.preventDefault(); setIsDraggingIcon(true); }}
                                            onDragLeave={e => { e.preventDefault(); setIsDraggingIcon(false); }}
                                            onDrop={e => {
                                                e.preventDefault();
                                                setIsDraggingIcon(false);
                                                const file = e.dataTransfer.files?.[0];
                                                if (file) handleFileUpload(file, 'icon');
                                            }}
                                            className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                                                isDraggingIcon
                                                    ? 'border-pink-400 bg-pink-500/20 scale-[1.01]'
                                                    : icon
                                                    ? 'border-emerald-500/60 bg-emerald-950/20 hover:bg-emerald-950/30'
                                                    : 'border-slate-700 bg-slate-900/60 hover:border-pink-500/60'
                                            }`}
                                        >
                                            {uploadingIcon ? (
                                                <div className="flex flex-col items-center py-2">
                                                    <Loader2 className="w-6 h-6 text-pink-400 animate-spin mb-1" />
                                                    <p className="text-xs font-bold text-slate-300">Uploading Icon...</p>
                                                </div>
                                            ) : icon ? (
                                                <div className="flex items-center gap-3 text-left">
                                                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                                                        <img src={icon} alt="icon preview" className="w-10 h-10 object-contain" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Icon Ready!
                                                        </p>
                                                        <p className="text-[11px] text-slate-400 truncate">{iconFileName || 'Icon File'}</p>
                                                    </div>
                                                    <Button size="sm" variant="outline" className="text-[11px] h-7 px-2 border-slate-700 cursor-pointer">Change</Button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center py-2">
                                                    <FolderUp className="w-7 h-7 text-pink-400 mb-1" />
                                                    <p className="text-xs font-bold text-slate-200">Click or Drag Icon (.PNG / .SVG)</p>
                                                    <p className="text-[10px] text-slate-400">Gift panel button display icon</p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* 2. Full-Screen SVGA / GIF Animation Asset */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="font-bold text-xs text-slate-200 flex items-center gap-1">
                                        <span>Animation Asset File</span>
                                        <span className="text-[10px] text-slate-400 font-normal">.SVGA / .GIF / .WebP</span>
                                    </Label>
                                    <button
                                        type="button"
                                        onClick={() => setShowDirectAnimUrl(!showDirectAnimUrl)}
                                        className="text-[10px] text-cyan-400 hover:text-cyan-300 underline flex items-center gap-0.5 cursor-pointer"
                                    >
                                        <LinkIcon className="w-2.5 h-2.5" />
                                        {showDirectAnimUrl ? 'Upload File' : 'Paste URL'}
                                    </button>
                                </div>

                                {showDirectAnimUrl ? (
                                    <Input
                                        placeholder="https://.../gift.svga"
                                        value={animationUrl}
                                        onChange={e => {
                                            setAnimationUrl(e.target.value);
                                            setAnimationFileName('Direct URL Asset');
                                        }}
                                        className="h-10 bg-slate-900 border-slate-700 text-xs font-mono"
                                    />
                                ) : (
                                    <>
                                        <input
                                            type="file"
                                            ref={animationInputRef}
                                            accept=".svga,.gif,.webp,image/*"
                                            className="hidden"
                                            onChange={e => {
                                                const file = e.target.files?.[0];
                                                if (file) handleFileUpload(file, 'animationUrl');
                                            }}
                                        />

                                        <div
                                            onClick={() => animationInputRef.current?.click()}
                                            onDragOver={e => { e.preventDefault(); setIsDraggingAnim(true); }}
                                            onDragLeave={e => { e.preventDefault(); setIsDraggingAnim(false); }}
                                            onDrop={e => {
                                                e.preventDefault();
                                                setIsDraggingAnim(false);
                                                const file = e.dataTransfer.files?.[0];
                                                if (file) handleFileUpload(file, 'animationUrl');
                                            }}
                                            className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                                                isDraggingAnim
                                                    ? 'border-cyan-400 bg-cyan-500/20 scale-[1.01]'
                                                    : animationUrl
                                                    ? 'border-cyan-500/60 bg-cyan-950/20 hover:bg-cyan-950/30'
                                                    : 'border-slate-700 bg-slate-900/60 hover:border-cyan-500/60'
                                            }`}
                                        >
                                            {uploadingAnimation ? (
                                                <div className="flex flex-col items-center py-2">
                                                    <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mb-1" />
                                                    <p className="text-xs font-bold text-slate-300">Uploading SVGA/GIF...</p>
                                                </div>
                                            ) : animationUrl ? (
                                                <div className="flex items-center gap-3 text-left">
                                                    <div className="w-12 h-12 rounded-xl bg-cyan-950/50 border border-cyan-800/40 flex items-center justify-center shrink-0 text-cyan-300 font-black text-xs">
                                                        {mediaType.toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                                                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Asset Ready!
                                                        </p>
                                                        <p className="text-[11px] text-slate-400 truncate">{animationFileName || 'Animation Asset'}</p>
                                                    </div>
                                                    <Button size="sm" variant="outline" className="text-[11px] h-7 px-2 border-slate-700 cursor-pointer">Change</Button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center py-2">
                                                    <FileUp className="w-7 h-7 text-cyan-400 mb-1" />
                                                    <p className="text-xs font-bold text-slate-200">Click or Drag SVGA / GIF File</p>
                                                    <p className="text-[10px] text-slate-400">Full screen live room animation</p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Format & Animation Type Selectors */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                            {/* Media Format */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-300">Animation File Format</Label>
                                <select
                                    value={mediaType}
                                    onChange={e => setMediaType(e.target.value as any)}
                                    className="flex h-10 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 font-medium focus:border-cyan-500"
                                >
                                    <option value="image">Static Image (.png, .jpg)</option>
                                    <option value="svga">SVGA Animation (.svga - Recommended)</option>
                                    <option value="gif">Animated GIF (.gif)</option>
                                    <option value="webp">Animated WebP (.webp)</option>
                                    <option value="svg">Vector SVG (.svg)</option>
                                </select>
                            </div>

                            {/* Presentation Animation Type */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-300">Display Animation Type</Label>
                                <select
                                    value={animationType}
                                    onChange={e => setAnimationType(e.target.value as any)}
                                    className="flex h-10 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 font-medium focus:border-cyan-500"
                                >
                                    {ANIMATION_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: RARITY, DURATION & SOUND */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
                        {/* Rarity */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-300">Rarity Tier</Label>
                            <select
                                value={rarity}
                                onChange={e => setRarity(e.target.value as any)}
                                className="flex h-10 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 font-medium focus:border-pink-500"
                            >
                                {RARITY_OPTIONS.map(r => (
                                    <option key={r.value} value={r.value}>
                                        {r.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Duration */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-cyan-400" /> Duration (ms)
                            </Label>
                            <Input
                                type="number"
                                min={500}
                                step={500}
                                value={duration}
                                onChange={e => setDuration(parseInt(e.target.value) || 2500)}
                                className="h-10 bg-slate-900 border-slate-700 text-xs font-mono"
                                placeholder="2500"
                            />
                        </div>

                        {/* Sort Order Priority */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-300">Display Priority (Sort)</Label>
                            <Input
                                type="number"
                                value={sortOrder}
                                onChange={e => setSortOrder(parseInt(e.target.value) || 0)}
                                className="h-10 bg-slate-900 border-slate-700 text-xs font-mono"
                                placeholder="0"
                            />
                        </div>

                        {/* Optional Sound URL */}
                        <div className="space-y-1.5 sm:col-span-3">
                            <Label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                                Sound Effect URL (वैकल्पिक ऑडियो इफेक्ट)
                            </Label>
                            <Input
                                placeholder="https://.../sound-effect.mp3 (optional audio played during gift animation)"
                                value={sound}
                                onChange={e => setSound(e.target.value)}
                                className="h-9 bg-slate-900 border-slate-700 text-xs font-mono"
                            />
                        </div>
                    </div>

                    {/* SECTION 4: BADGES & FEATURE TOGGLES */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                        {/* Live Active */}
                        <div className="flex flex-col items-center justify-between gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                            <Label className="text-[11px] font-bold text-emerald-400 text-center">Active Live</Label>
                            <Switch checked={isActive} onCheckedChange={setIsActive} />
                        </div>

                        {/* Hot / Trending */}
                        <div className="flex flex-col items-center justify-between gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                            <Label className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                                <Flame className="w-3 h-3" /> Hot
                            </Label>
                            <Switch checked={isHot} onCheckedChange={setIsHot} />
                        </div>

                        {/* New Item */}
                        <div className="flex flex-col items-center justify-between gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                            <Label className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> New
                            </Label>
                            <Switch checked={isNewItem} onCheckedChange={setIsNewItem} />
                        </div>

                        {/* VIP Only */}
                        <div className="flex flex-col items-center justify-between gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                            <Label className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                                <Crown className="w-3 h-3" /> VIP Only
                            </Label>
                            <Switch checked={isVipOnly} onCheckedChange={setIsVipOnly} />
                        </div>

                        {/* Combo Enabled */}
                        <div className="flex flex-col items-center justify-between gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800 col-span-2 sm:col-span-1">
                            <Label className="text-[11px] font-bold text-pink-400 flex items-center gap-1">
                                <Zap className="w-3 h-3" /> Combo Tap
                            </Label>
                            <Switch checked={comboEnabled} onCheckedChange={setComboEnabled} />
                        </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex gap-3 pt-3 border-t border-slate-800">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 border-slate-700 hover:bg-slate-800 text-slate-300 font-bold cursor-pointer"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            className="flex-1 bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:from-pink-500 hover:to-amber-500 text-white font-extrabold shadow-lg shadow-pink-600/30 border-none h-11 cursor-pointer"
                            onClick={handleSave}
                            disabled={saving || uploadingIcon || uploadingAnimation}
                        >
                            {saving ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {gift?._id ? 'Updating Gift...' : 'Publishing Gift...'}
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    {gift?._id ? 'Update Gift' : `Publish Gift (${diamond} 💎)`}
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
