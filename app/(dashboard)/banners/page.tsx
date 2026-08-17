'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import {
    Plus, Trash2, Layers, Sliders, Calendar,
    Edit, Upload, X, Image as ImageIcon, ExternalLink, Smartphone, Sparkles,
    CheckCircle2, Eye
} from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { uploadToCloudinary } from '@/lib/cloudinary';

interface Banner {
    _id: string;
    title: string;
    imageUrl: string;
    linkUrl: string;
    targetType: 'none' | 'internal' | 'external';
    targetScreen: string;
    priority: number;
    startDate?: string;
    endDate?: string;
    isActive: boolean;
    createdAt?: string;
}

interface EditFormState {
    _id: string;
    title: string;
    imageUrl: string;
    linkUrl: string;
    targetType: 'none' | 'internal' | 'external';
    targetScreen: string;
    priority: string;
    startDate: string;
    endDate: string;
}

const APP_PAGE_OPTIONS = [
    ['Wallet', 'Wallet / Recharge'], ['Level', 'Host Levels'], ['Frame', 'Profile Frames'],
    ['Withdrawal', 'Withdrawal'], ['Kyc', 'KYC Verification'], ['VerificationHub', 'Verification Center'],
    ['HelpAndSupport', 'Help & Support'], ['Notifications', 'Activity'], ['SystemMessage', 'System Messages'],
    ['CallHistory', 'Call History'], ['Earning', 'Host Earnings'], ['ExchangeCoins', 'Exchange Coins'],
    ['HostApply', 'Become a Host'], ['Setting', 'App Settings'], ['Profile', 'Profile'],
] as const;

export default function BannersPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);

    // Create Modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form states for create
    const [title, setTitle] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState('');
    const [linkName, setLinkName] = useState('');
    const [targetType, setTargetType] = useState<'none' | 'internal' | 'external'>('none');
    const [targetScreen, setTargetScreen] = useState('');
    const [priority, setPriority] = useState('0');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Edit modal states
    const [editingBanner, setEditingBanner] = useState<EditFormState | null>(null);
    const [editImageFile, setEditImageFile] = useState<File | null>(null);
    const [editImagePreview, setEditImagePreview] = useState('');
    const [editSubmitting, setEditSubmitting] = useState(false);
    const editFileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/api/admin/banners');
            if (response.success && response.data) {
                setBanners(response.data || []);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch banners');
        } finally {
            setLoading(false);
        }
    };

    const compressBase64Image = (base64Str: string, maxWidth = 1000, maxHeight = 500, quality = 0.7): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', quality));
                } else {
                    resolve(base64Str);
                }
            };
            img.onerror = () => resolve(base64Str);
            img.src = base64Str;
        });
    };

    const handleImageUpload = async (file: File) => {
        try {
            setUploading(true);
            let url = null;
            try {
                url = await uploadToCloudinary(file, 'banners');
            } catch (err) {
                console.warn('Cloudinary upload fallback to Data URL', err);
            }

            if (url) {
                setImagePreview(url);
                return url;
            }

            // Fallback to compressed Base64 Data URL if Cloudinary upload fails
            const rawBase64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });
            const compressed = await compressBase64Image(rawBase64);
            return compressed;
        } catch (error: any) {
            toast.error('Failed to process image');
            throw error;
        } finally {
            setUploading(false);
        }
    };

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEditImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            setEditImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setEditImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreateBanner = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) {
            toast.error('Title is required');
            return;
        }
        if (!imageFile && !imagePreview) {
            toast.error('Banner image is required');
            return;
        }
        if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
            toast.error('Expiry date cannot be before start date');
            return;
        }

        try {
            setSubmitting(true);
            let uploadedImageUrl = imagePreview;

            if (imageFile) {
                uploadedImageUrl = await handleImageUpload(imageFile);
            }

            const response = await apiClient.post('/api/admin/banners', {
                title,
                imageUrl: uploadedImageUrl,
                linkUrl: targetType === 'external' ? linkName : '',
                targetType,
                targetScreen: targetType === 'internal' ? targetScreen : '',
                priority: parseInt(priority) || 0,
                startDate: startDate || undefined,
                endDate: endDate || undefined
            });

            if (response.success) {
                toast.success('Banner created successfully');
                setTitle('');
                setImageFile(null);
                setImagePreview('');
                setLinkName('');
                setTargetType('none');
                setTargetScreen('');
                setPriority('0');
                setStartDate('');
                setEndDate('');
                if (fileInputRef.current) fileInputRef.current.value = '';
                setIsCreateModalOpen(false);
                fetchBanners();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to create banner');
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenEditModal = (banner: Banner) => {
        setEditingBanner({
            _id: banner._id,
            title: banner.title,
            imageUrl: banner.imageUrl,
            linkUrl: banner.linkUrl || '',
            targetType: banner.targetType || (banner.linkUrl ? 'external' : 'none'),
            targetScreen: banner.targetScreen || '',
            priority: banner.priority.toString(),
            startDate: banner.startDate ? banner.startDate.split('T')[0] : '',
            endDate: banner.endDate ? banner.endDate.split('T')[0] : ''
        });
        setEditImagePreview(banner.imageUrl);
        setEditImageFile(null);
    };

    const handleUpdateBanner = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBanner) return;
        if (!editingBanner.title) {
            toast.error('Title is required');
            return;
        }
        if (editingBanner.startDate && editingBanner.endDate && new Date(editingBanner.endDate) < new Date(editingBanner.startDate)) {
            toast.error('Expiry date cannot be before start date');
            return;
        }

        try {
            setEditSubmitting(true);
            let imageUrl = editingBanner.imageUrl;

            if (editImageFile) {
                imageUrl = await handleImageUpload(editImageFile);
            }

            const response = await apiClient.patch(`/api/admin/banners/${editingBanner._id}`, {
                title: editingBanner.title,
                imageUrl,
                linkUrl: editingBanner.targetType === 'external' ? editingBanner.linkUrl : '',
                targetType: editingBanner.targetType,
                targetScreen: editingBanner.targetType === 'internal' ? editingBanner.targetScreen : '',
                priority: parseInt(editingBanner.priority) || 0,
                startDate: editingBanner.startDate || undefined,
                endDate: editingBanner.endDate || undefined
            });

            if (response.success) {
                toast.success('Banner updated successfully');
                setEditingBanner(null);
                setEditImageFile(null);
                setEditImagePreview('');
                if (editFileInputRef.current) editFileInputRef.current.value = '';
                fetchBanners();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update banner');
        } finally {
            setEditSubmitting(false);
        }
    };

    const handleToggleStatus = async (banner: Banner) => {
        try {
            const response = await apiClient.patch(`/api/admin/banners/${banner._id}`, {
                isActive: !banner.isActive
            });
            if (response.success) {
                toast.success(`Banner successfully ${!banner.isActive ? 'activated' : 'deactivated'}`);
                fetchBanners();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update banner state');
        }
    };

    const handleDeleteBanner = async (bannerId: string) => {
        if (!confirm('Are you sure you want to delete this banner?')) return;
        try {
            const response = await apiClient.delete(`/api/admin/banners/${bannerId}`);
            if (response.success) {
                toast.success('Banner deleted successfully');
                fetchBanners();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete banner');
        }
    };

    const activeCount = banners.filter(b => b.isActive).length;

    return (
        <div className="space-y-6 p-1 sm:p-2">
            {/* Top Bar Header with Title & Action Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-600/20 border border-pink-500/30 text-pink-400 shadow-lg shadow-pink-500/10">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                            Banners Carousel Management
                        </h2>
                        <p className="text-sm font-medium text-slate-400 mt-0.5">
                            Live dynamic slider banners, priority weighting, schedule rules & instant mobile app sync
                        </p>
                    </div>
                </div>

                {/* Top Right Counter & New + Button */}
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-semibold">
                        <Layers size={15} className="text-purple-400" />
                        <span>Total: <strong className="text-white">{banners.length}</strong></span>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                        <CheckCircle2 size={15} />
                        <span>Active: <strong className="text-emerald-300">{activeCount}</strong></span>
                    </div>

                    {/* Top Right New + Button */}
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="h-10 px-4 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-bold shadow-lg shadow-purple-500/25 transition-all text-xs flex items-center gap-2 cursor-pointer"
                    >
                        <Plus size={18} /> New +
                    </Button>
                </div>
            </div>

            {/* Banners List Full Width Table */}
            <Card className="glass-card border-slate-800 bg-slate-950/80 shadow-2xl overflow-hidden">
                <CardHeader className="border-b border-slate-800/80 pb-4 bg-slate-900/40 flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-slate-100 text-lg">
                        <Layers size={20} className="text-purple-400" />
                        Banners Carousel List
                    </CardTitle>

                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-purple-500/10 text-purple-300 border-purple-500/30 font-semibold px-2.5 py-1 text-xs">
                            {banners.length} Total Banners
                        </Badge>
                        <Button
                            size="sm"
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5"
                        >
                            <Plus size={14} /> Add Banner
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-900/60">
                            <TableRow className="border-slate-800/80 hover:bg-transparent">
                                <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-wider w-14 text-center">Sr No</TableHead>
                                <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Preview</TableHead>
                                <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Title & Tap Action</TableHead>
                                <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-wider text-center">Weight</TableHead>
                                <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Schedule</TableHead>
                                <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-wider text-center">Status</TableHead>
                                <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-wider text-right pr-6">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Sparkles size={24} className="animate-spin text-pink-400" />
                                            <span className="text-xs font-semibold text-slate-300">Loading banner carousel data...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : banners.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-16 text-slate-400 font-medium">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <ImageIcon size={36} className="text-slate-600" />
                                            <div>
                                                <p className="text-sm font-bold text-slate-300">No Banners Created Yet</p>
                                                <p className="text-xs text-slate-500 mt-0.5">Click the "New +" button at top right to add your first banner</p>
                                            </div>
                                            <Button
                                                onClick={() => setIsCreateModalOpen(true)}
                                                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs rounded-xl px-4 py-2 mt-1"
                                            >
                                                <Plus size={15} /> Add First Banner
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                banners.map((banner, index) => (
                                    <TableRow key={banner._id} className="border-slate-800/60 hover:bg-slate-900/40 transition-colors group">
                                        {/* Sr No */}
                                        <TableCell className="text-center font-bold text-xs text-slate-400 py-3.5 pl-4">
                                            {index + 1}
                                        </TableCell>

                                        {/* Preview Thumbnail */}
                                        <TableCell className="py-3.5">
                                            <div className="h-12 w-24 rounded-xl bg-slate-900 overflow-hidden border border-slate-700/80 shadow-md group-hover:border-slate-500 transition-colors flex items-center justify-center">
                                                {banner.imageUrl ? (
                                                    <img
                                                        src={banner.imageUrl}
                                                        alt={banner.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <ImageIcon size={18} className="text-slate-600" />
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Title & Action Badges */}
                                        <TableCell className="py-3.5">
                                            <div className="space-y-1">
                                                <p className="font-bold text-slate-100 text-sm">{banner.title}</p>
                                                {banner.targetType === 'internal' && banner.targetScreen ? (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                                                        <Smartphone size={11} /> App: {banner.targetScreen}
                                                    </span>
                                                ) : banner.linkUrl ? (
                                                    <a
                                                        href={banner.linkUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-[11px] font-mono text-pink-400 hover:underline max-w-[220px] truncate"
                                                    >
                                                        <ExternalLink size={11} /> {banner.linkUrl}
                                                    </a>
                                                ) : (
                                                    <span className="text-[11px] text-slate-500 italic">No action</span>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Weight Priority */}
                                        <TableCell className="text-center py-3.5">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-amber-400 shadow-inner">
                                                <Sliders size={12} className="text-slate-500" /> {banner.priority}
                                            </span>
                                        </TableCell>

                                        {/* Schedule Dates */}
                                        <TableCell className="py-3.5 text-xs font-medium text-slate-300">
                                            <div className="space-y-0.5 text-[11px]">
                                                <div className="flex items-center gap-1 text-slate-400">
                                                    <Calendar size={12} className="text-slate-500" />
                                                    <span>From: <strong className="text-slate-200">{banner.startDate ? new Date(banner.startDate).toLocaleDateString() : 'Immediate'}</strong></span>
                                                </div>
                                                <div className="flex items-center gap-1 text-slate-400">
                                                    <Calendar size={12} className="text-slate-500" />
                                                    <span>To: <strong className="text-slate-200">{banner.endDate ? new Date(banner.endDate).toLocaleDateString() : 'Forever'}</strong></span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Active/Inactive Toggle Badge */}
                                        <TableCell className="text-center py-3.5">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleStatus(banner)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-sm ${
                                                    banner.isActive
                                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                                                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                                                }`}
                                                title={banner.isActive ? "Click to disable" : "Click to enable"}
                                            >
                                                {banner.isActive ? (
                                                    <>
                                                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                                        Active
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="h-2 w-2 rounded-full bg-rose-400" />
                                                        Disabled
                                                    </>
                                                )}
                                            </button>
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell className="text-right py-3.5 pr-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleOpenEditModal(banner)}
                                                    title="Edit Banner"
                                                    className="h-8 px-2.5 rounded-xl border-slate-700 bg-slate-900 text-blue-400 hover:text-blue-300 hover:border-blue-500 hover:bg-blue-950/40 transition-all"
                                                >
                                                    <Edit size={14} />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDeleteBanner(banner._id)}
                                                    title="Delete Banner"
                                                    className="h-8 px-2.5 rounded-xl bg-rose-950/60 text-rose-400 border border-rose-800/60 hover:bg-rose-900 hover:text-white transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* CREATE BANNER POPUP MODAL */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <Card className="glass-card border-slate-800 bg-slate-950 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500" />
                        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/80 pb-4">
                            <CardTitle className="text-slate-100 text-lg flex items-center gap-2">
                                <Plus size={20} className="text-pink-400" /> Add New Banner
                            </CardTitle>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full h-8 w-8 p-0"
                            >
                                <X size={18} />
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-5">
                            <form onSubmit={handleCreateBanner} className="space-y-4">
                                {/* Title */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Banner Title *</label>
                                    <Input
                                        placeholder="e.g. VIP Diamond Recharge Offer"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        className="bg-slate-900 border-slate-800 text-slate-100"
                                    />
                                </div>

                                {/* Image Upload & Preview */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Banner Photo *</label>
                                        {imagePreview && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImageFile(null);
                                                    setImagePreview('');
                                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                                }}
                                                className="text-xs text-pink-400 hover:text-pink-300 font-semibold flex items-center gap-1"
                                            >
                                                <X size={13} /> Clear
                                            </button>
                                        )}
                                    </div>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                                        onChange={handleImageSelect}
                                        className="hidden"
                                    />

                                    {imagePreview ? (
                                        <div className="relative h-44 w-full rounded-2xl bg-slate-900 overflow-hidden border border-slate-700/80 shadow-inner group">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="h-full w-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-600 text-white text-xs font-bold hover:bg-slate-700 transition-all shadow-lg flex items-center gap-1.5"
                                                >
                                                    <Upload size={14} /> Change Image
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="border-2 border-dashed border-slate-800 hover:border-pink-500/60 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-900/50 hover:bg-slate-900/80 flex flex-col items-center justify-center gap-2.5 group"
                                            >
                                                <div className="p-3 rounded-xl bg-pink-500/10 text-pink-400 group-hover:scale-110 transition-transform">
                                                    <Upload size={22} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-200">Click to Choose Image File</p>
                                                    <p className="text-[10px] text-slate-400 mt-1 font-mono">PNG, JPG, WEBP, GIF (Max 5MB)</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 my-2">
                                                <div className="h-[1px] bg-slate-800 flex-1" />
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Or Web URL</span>
                                                <div className="h-[1px] bg-slate-800 flex-1" />
                                            </div>

                                            <Input
                                                placeholder="https://res.cloudinary.com/.../banner.jpg"
                                                value={imagePreview}
                                                onChange={(e) => {
                                                    setImageFile(null);
                                                    setImagePreview(e.target.value);
                                                }}
                                                className="bg-slate-900 border-slate-800 text-xs text-slate-200"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* On Tap Action */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">On Tap Action</label>
                                    <select
                                        className="h-10 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-xs font-medium text-slate-200 focus:border-pink-500 focus:outline-none"
                                        value={targetType}
                                        onChange={(e) => {
                                            setTargetType(e.target.value as any);
                                            setTargetScreen('');
                                            setLinkName('');
                                        }}
                                    >
                                        <option value="none">No Action (Display only)</option>
                                        <option value="internal">Open App Screen</option>
                                        <option value="external">Open External Website URL</option>
                                    </select>
                                </div>

                                {targetType === 'internal' && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                                            <Smartphone size={13} /> Select App Screen
                                        </label>
                                        <select
                                            required
                                            className="h-10 w-full rounded-xl border border-cyan-500/40 bg-slate-900 px-3 text-xs font-medium text-cyan-200 focus:border-cyan-400 focus:outline-none"
                                            value={targetScreen}
                                            onChange={(e) => setTargetScreen(e.target.value)}
                                        >
                                            <option value="">Choose screen page</option>
                                            {APP_PAGE_OPTIONS.map(([value, label]) => (
                                                <option key={value} value={value}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {targetType === 'external' && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1">
                                            <ExternalLink size={13} /> External Website Link
                                        </label>
                                        <Input
                                            type="url"
                                            required
                                            placeholder="https://example.com/promo"
                                            value={linkName}
                                            onChange={(e) => setLinkName(e.target.value)}
                                            className="bg-slate-900 border-pink-500/40 text-xs text-pink-200"
                                        />
                                    </div>
                                )}

                                {/* Priority Weight & Dates */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Weight</label>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            value={priority}
                                            onChange={(e) => setPriority(e.target.value)}
                                            className="bg-slate-900 border-slate-800 text-xs font-mono text-center text-slate-100 font-bold"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Start Date</label>
                                        <Input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="bg-slate-900 border-slate-800 text-xs text-slate-200"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Expiry Date</label>
                                        <Input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="bg-slate-900 border-slate-800 text-xs text-slate-200"
                                        />
                                    </div>
                                </div>

                                {/* Modal Footer Actions */}
                                <div className="flex gap-3 pt-4 border-t border-slate-800">
                                    <Button
                                        type="submit"
                                        className="flex-1 h-11 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-bold shadow-lg shadow-purple-500/25 text-sm"
                                        disabled={submitting || uploading}
                                    >
                                        {submitting || uploading ? (
                                            <span className="flex items-center gap-2">
                                                <Sparkles size={16} className="animate-spin" /> Publishing...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Plus size={18} /> Publish New Banner
                                            </span>
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="h-11 px-5 rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* EDIT BANNER MODAL */}
            {editingBanner && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <Card className="glass-card border-slate-800 bg-slate-950 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/80 pb-4">
                            <CardTitle className="text-slate-100 text-lg flex items-center gap-2">
                                <Edit size={18} className="text-blue-400" /> Edit Banner Settings
                            </CardTitle>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingBanner(null)}
                                className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full h-8 w-8 p-0"
                            >
                                <X size={18} />
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-5">
                            <form onSubmit={handleUpdateBanner} className="space-y-4">
                                {/* Title */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Banner Title *</label>
                                    <Input
                                        placeholder="Enter banner title"
                                        value={editingBanner.title}
                                        onChange={(e) => setEditingBanner({
                                            ...editingBanner,
                                            title: e.target.value
                                        })}
                                        required
                                        className="bg-slate-900 border-slate-800 text-slate-100"
                                    />
                                </div>

                                {/* Image */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Banner Image</label>
                                    <button
                                        type="button"
                                        onClick={() => editFileInputRef.current?.click()}
                                        className="w-full p-3 border-2 border-dashed border-slate-700/80 rounded-xl hover:border-blue-500 hover:bg-blue-500/5 transition-all cursor-pointer flex items-center justify-center gap-2 text-slate-300 font-semibold text-xs"
                                    >
                                        <Upload size={16} className="text-blue-400" />
                                        <span>{editImageFile ? 'Change Selected File' : 'Click to Upload New Image File'}</span>
                                    </button>
                                    <input
                                        ref={editFileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleEditImageSelect}
                                        className="hidden"
                                    />
                                    {editImagePreview && (
                                        <div className="relative h-44 w-full rounded-2xl bg-slate-900 overflow-hidden border border-slate-700/80 shadow-md">
                                            <img
                                                src={editImagePreview}
                                                alt="Preview"
                                                className="h-full w-full object-cover"
                                            />
                                            {editImageFile && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditImageFile(null);
                                                        setEditImagePreview(editingBanner.imageUrl);
                                                        if (editFileInputRef.current) editFileInputRef.current.value = '';
                                                    }}
                                                    className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 px-3 py-1 rounded-xl text-xs font-bold text-white shadow-lg flex items-center gap-1"
                                                >
                                                    <X size={14} /> Revert
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Banner Action */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">On Tap Action</label>
                                    <select
                                        className="h-10 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-xs font-medium text-slate-200 focus:border-blue-500"
                                        value={editingBanner.targetType}
                                        onChange={(e) => setEditingBanner({ ...editingBanner, targetType: e.target.value as any, targetScreen: '', linkUrl: '' })}
                                    >
                                        <option value="none">No Action</option>
                                        <option value="internal">Open App Screen</option>
                                        <option value="external">Open External Website URL</option>
                                    </select>
                                </div>

                                {editingBanner.targetType === 'internal' && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider">App Page Screen</label>
                                        <select
                                            required
                                            className="h-10 w-full rounded-xl border border-cyan-500/40 bg-slate-900 px-3 text-xs font-medium text-cyan-200"
                                            value={editingBanner.targetScreen}
                                            onChange={(e) => setEditingBanner({ ...editingBanner, targetScreen: e.target.value })}
                                        >
                                            <option value="">Select app page</option>
                                            {APP_PAGE_OPTIONS.map(([value, label]) => (
                                                <option key={value} value={value}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {editingBanner.targetType === 'external' && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-pink-400 uppercase tracking-wider">Website URL</label>
                                        <Input
                                            type="url"
                                            required
                                            placeholder="https://example.com"
                                            value={editingBanner.linkUrl}
                                            onChange={(e) => setEditingBanner({ ...editingBanner, linkUrl: e.target.value })}
                                            className="bg-slate-900 border-pink-500/40 text-xs text-pink-200"
                                        />
                                    </div>
                                )}

                                {/* Priority & Dates */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Priority Weight</label>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            value={editingBanner.priority}
                                            onChange={(e) => setEditingBanner({
                                                ...editingBanner,
                                                priority: e.target.value
                                            })}
                                            className="bg-slate-900 border-slate-800 text-xs text-center font-mono text-amber-400 font-bold"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Start Date</label>
                                        <Input
                                            type="date"
                                            value={editingBanner.startDate}
                                            onChange={(e) => setEditingBanner({
                                                ...editingBanner,
                                                startDate: e.target.value
                                            })}
                                            className="bg-slate-900 border-slate-800 text-xs text-slate-200"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Expiry Date</label>
                                        <Input
                                            type="date"
                                            value={editingBanner.endDate}
                                            onChange={(e) => setEditingBanner({
                                                ...editingBanner,
                                                endDate: e.target.value
                                            })}
                                            className="bg-slate-900 border-slate-800 text-xs text-slate-200"
                                        />
                                    </div>
                                </div>

                                {/* Modal Footer Actions */}
                                <div className="flex gap-3 pt-4 border-t border-slate-800">
                                    <Button
                                        type="submit"
                                        className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 text-sm"
                                        disabled={editSubmitting || uploading}
                                    >
                                        {editSubmitting || uploading ? 'Updating Changes...' : 'Save Banner Updates'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setEditingBanner(null)}
                                        className="h-11 px-5 rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
