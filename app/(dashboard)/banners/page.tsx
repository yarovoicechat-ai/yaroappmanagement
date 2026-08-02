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
import { Plus, Trash2, ToggleLeft, ToggleRight, Layers, Sliders, Calendar, Edit, Upload, X, Image as ImageIcon } from "lucide-react";
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

            // Fallback to Base64 Data URL if Cloudinary upload is unconfigured or fails
            return await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });
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

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Banners Management
                </h2>
                <p className="text-muted-foreground mt-1 font-medium font-sans">
                    Manage promotional banners with upload, edit, and activation controls
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Create Banner Form */}
                <Card className="glass-card md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <Plus size={20} />
                            Add New Banner
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateBanner} className="space-y-4">
                            {/* Title */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Banner Title</label>
                                <Input
                                    placeholder="Enter banner title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-semibold text-slate-300">Banner Image *</label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (imagePreview.startsWith('http') && !imageFile) {
                                                setImagePreview('');
                                            } else {
                                                setImageFile(null);
                                                setImagePreview('');
                                            }
                                        }}
                                        className="text-xs text-primary hover:underline font-medium"
                                    >
                                        {imagePreview ? 'Clear Image' : ''}
                                    </button>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />
                                {imagePreview ? (
                                    <div className="relative h-36 w-full rounded-xl bg-slate-800 overflow-hidden border border-slate-700 group">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="h-full w-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="bg-slate-900/90 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800"
                                            >
                                                Change Image
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImageFile(null);
                                                    setImagePreview('');
                                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                                }}
                                                className="bg-rose-600/90 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-rose-700"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="border-2 border-dashed border-slate-600 hover:border-primary rounded-xl p-5 text-center cursor-pointer transition-all bg-slate-900/40 hover:bg-slate-800/40 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-slate-300"
                                        >
                                            <Upload size={24} className="text-primary" />
                                            <div>
                                                <p className="text-xs font-bold text-slate-200">Click to Choose Image File</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WEBP, GIF (Max 5MB)</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 my-1">
                                            <div className="h-[1px] bg-slate-800 flex-1" />
                                            <span className="text-[10px] font-semibold text-slate-500 uppercase">Or Paste URL</span>
                                            <div className="h-[1px] bg-slate-800 flex-1" />
                                        </div>
                                        <Input
                                            placeholder="https://image-host.com/my-banner.jpg"
                                            value={imagePreview}
                                            onChange={(e) => {
                                                setImageFile(null);
                                                setImagePreview(e.target.value);
                                            }}
                                            className="text-xs"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Banner Action */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">On Tap Action</label>
                                <select className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm" value={targetType} onChange={(e) => { setTargetType(e.target.value as any); setTargetScreen(''); setLinkName(''); }}>
                                    <option value="none">No action</option>
                                    <option value="internal">Open app page</option>
                                    <option value="external">Open website URL</option>
                                </select>
                            </div>
                            {targetType === 'internal' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300">App Page</label>
                                    <select required className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm" value={targetScreen} onChange={(e) => setTargetScreen(e.target.value)}>
                                        <option value="">Select app page</option>
                                        {APP_PAGE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                                    </select>
                                </div>
                            )}
                            {targetType === 'external' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300">Website URL</label>
                                    <Input type="url" required placeholder="https://example.com" value={linkName} onChange={(e) => setLinkName(e.target.value)} />
                                </div>
                            )}
                            {/* Priority */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Priority Weight</label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                />
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-400">Start Date</label>
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-400">Expiry Date</label>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full font-bold"
                                disabled={submitting || uploading}
                            >
                                {submitting || uploading ? 'Uploading...' : 'Create Banner'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Banners List Table */}
                <Card className="glass-card md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <Layers size={20} />
                            Banners List ({banners.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-bold text-slate-300 w-8">Sr No</TableHead>
                                    <TableHead className="font-bold text-slate-300">Photo</TableHead>
                                    <TableHead className="font-bold text-slate-300">Title</TableHead>
                                    <TableHead className="font-bold text-slate-300">Link</TableHead>
                                    <TableHead className="font-bold text-slate-300 text-center">Active</TableHead>
                                    <TableHead className="text-right font-bold text-slate-300">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                                            Loading banners...
                                        </TableCell>
                                    </TableRow>
                                ) : banners.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-slate-400 font-medium">
                                            No banners created yet
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    banners.map((banner, index) => (
                                        <TableRow key={banner._id} className="hover:bg-muted/30">
                                            {/* Sr No */}
                                            <TableCell className="font-semibold text-slate-300">{index + 1}</TableCell>

                                            {/* Photo */}
                                            <TableCell>
                                                <div className="h-12 w-20 rounded bg-slate-800 overflow-hidden border border-slate-700 flex items-center justify-center">
                                                    {banner.imageUrl ? (
                                                        <img
                                                            src={banner.imageUrl}
                                                            alt={banner.title}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <ImageIcon size={16} className="text-slate-600" />
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Title */}
                                            <TableCell>
                                                <p className="font-semibold text-slate-200">{banner.title}</p>
                                            </TableCell>

                                            {/* Action */}
                                            <TableCell>
                                                {banner.targetType === 'internal' && banner.targetScreen ? (
                                                    <span className="text-xs text-cyan-400 font-semibold">App: {banner.targetScreen}</span>
                                                ) : banner.linkUrl ? (
                                                    <p className="text-xs text-primary font-mono truncate max-w-xs" title={banner.linkUrl}>{banner.linkUrl}</p>
                                                ) : (
                                                    <span className="text-xs text-slate-500 italic">No action</span>
                                                )}
                                            </TableCell>
                                            {/* Active/Inactive Toggle */}
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleToggleStatus(banner)}
                                                        className="px-2"
                                                        title={banner.isActive ? "Click to deactivate" : "Click to activate"}
                                                    >
                                                        {banner.isActive ? (
                                                            <ToggleRight size={22} className="text-emerald-500" />
                                                        ) : (
                                                            <ToggleLeft size={22} className="text-slate-600" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleOpenEditModal(banner)}
                                                        title="Edit banner"
                                                        className="text-blue-400 hover:text-blue-300 border-blue-400 hover:border-blue-300"
                                                    >
                                                        <Edit size={16} />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleDeleteBanner(banner._id)}
                                                        title="Delete banner"
                                                    >
                                                        <Trash2 size={16} />
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
            </div>

            {/* Edit Banner Modal */}
            {editingBanner && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <CardTitle className="text-slate-200">Edit Banner</CardTitle>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingBanner(null)}
                            >
                                <X size={20} />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateBanner} className="space-y-4">
                                {/* Title */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300">Banner Title</label>
                                    <Input
                                        placeholder="Enter banner title"
                                        value={editingBanner.title}
                                        onChange={(e) => setEditingBanner({
                                            ...editingBanner,
                                            title: e.target.value
                                        })}
                                        required
                                    />
                                </div>

                                {/* Image */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300">Banner Image</label>
                                    <button
                                        type="button"
                                        onClick={() => editFileInputRef.current?.click()}
                                        className="w-full p-3 border-2 border-dashed border-slate-600 rounded-lg hover:border-primary hover:bg-primary/5 transition-all cursor-pointer flex items-center justify-center gap-2 text-slate-400 hover:text-slate-300"
                                    >
                                        <Upload size={18} />
                                        <span>{editImageFile ? 'Change Image' : 'Update Image'}</span>
                                    </button>
                                    <input
                                        ref={editFileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleEditImageSelect}
                                        className="hidden"
                                    />
                                    {editImagePreview && (
                                        <div className="relative h-40 w-full rounded-lg bg-slate-800 overflow-hidden border border-slate-700">
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
                                                    className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 p-1 rounded text-white"
                                                >
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Banner Action */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300">On Tap Action</label>
                                    <select className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm" value={editingBanner.targetType} onChange={(e) => setEditingBanner({ ...editingBanner, targetType: e.target.value as any, targetScreen: '', linkUrl: '' })}>
                                        <option value="none">No action</option>
                                        <option value="internal">Open app page</option>
                                        <option value="external">Open website URL</option>
                                    </select>
                                </div>
                                {editingBanner.targetType === 'internal' && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-300">App Page</label>
                                        <select required className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm" value={editingBanner.targetScreen} onChange={(e) => setEditingBanner({ ...editingBanner, targetScreen: e.target.value })}>
                                            <option value="">Select app page</option>
                                            {APP_PAGE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                                        </select>
                                    </div>
                                )}
                                {editingBanner.targetType === 'external' && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-300">Website URL</label>
                                        <Input type="url" required placeholder="https://example.com" value={editingBanner.linkUrl} onChange={(e) => setEditingBanner({ ...editingBanner, linkUrl: e.target.value })} />
                                    </div>
                                )}
                                {/* Priority */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300">Priority Weight</label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={editingBanner.priority}
                                        onChange={(e) => setEditingBanner({
                                            ...editingBanner,
                                            priority: e.target.value
                                        })}
                                    />
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-300">Start Date</label>
                                        <Input
                                            type="date"
                                            value={editingBanner.startDate}
                                            onChange={(e) => setEditingBanner({
                                                ...editingBanner,
                                                startDate: e.target.value
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-300">Expiry Date</label>
                                        <Input
                                            type="date"
                                            value={editingBanner.endDate}
                                            onChange={(e) => setEditingBanner({
                                                ...editingBanner,
                                                endDate: e.target.value
                                            })}
                                        />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="submit"
                                        className="flex-1"
                                        disabled={editSubmitting || uploading}
                                    >
                                        {editSubmitting || uploading ? 'Updating...' : 'Update Banner'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setEditingBanner(null)}
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
