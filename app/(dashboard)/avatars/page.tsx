'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Plus, Trash2, Upload, User, Image as ImageIcon } from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';
import Image from 'next/image';
import { uploadToCloudinary } from '@/lib/cloudinary';

type Avatar = {
    _id: string;
    url: string;
    gender: 'male' | 'female';
    createdAt: string;
};

export default function AvatarsPage() {
    const [activeTab, setActiveTab] = useState('male');
    const [avatars, setAvatars] = useState<Avatar[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [newAvatar, setNewAvatar] = useState<{ file: File | null; preview: string | null }>({
        file: null,
        preview: null
    });

    useEffect(() => {
        fetchAvatars(activeTab);
    }, [activeTab]);

    const fetchAvatars = async (gender: string) => {
        try {
            setLoading(true);
            const endpoint = API_ENDPOINTS.AVATARS.LIST(gender);
            const response = await apiClient.get(endpoint);
            if (response.success) {
                const data = response.data as any[] || [];
                const updatedAvatars = data.map((avatar: any) => ({
                    ...avatar,
                    url: avatar.avatarUrl.startsWith('http')
                        ? avatar.avatarUrl
                        : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yaroapp.in'}${avatar.avatarUrl.startsWith('/') ? '' : '/'}${avatar.avatarUrl}`
                }));
                setAvatars(updatedAvatars);
            }
        } catch (error) {
            toast.error("Failed to load avatars");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewAvatar({
                file,
                preview: URL.createObjectURL(file)
            });
        }
    };

    const handleUpload = async () => {
        if (!newAvatar.file) return toast.error("Please select an image");

        try {
            setUploading(true);

            // 1. Upload to Cloudinary with Data URL fallback
            let imageUrl = '';
            try {
                imageUrl = await uploadToCloudinary(newAvatar.file, 'avatars');
            } catch (err: any) {
                console.warn('Cloudinary upload fallback to Data URL', err);
                imageUrl = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(newAvatar.file!);
                });
            }

            // 2. Submit to Backend
            const response = await apiClient.post(API_ENDPOINTS.AVATARS.CREATE, {
                gender: activeTab,
                image: imageUrl
            });

            if (response.success || response) {
                toast.success("Avatar uploaded successfully");
                setNewAvatar({ file: null, preview: null });
                fetchAvatars(activeTab);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to upload avatar");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await apiClient.delete(API_ENDPOINTS.AVATARS.DELETE(id));
            if (response.success || response) {
                toast.success("Avatar deleted");
                setAvatars(avatars.filter(a => a._id !== id));
            }
        } catch (error) {
            toast.error("Failed to delete avatar");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">Avatars</h2>
                    <p className="text-slate-400 mt-1">Manage default user avatars.</p>
                </div>
            </div>

            <Tabs defaultValue="male" className="space-y-6" onValueChange={setActiveTab}>
                <TabsList className="bg-slate-800/50 border border-slate-700">
                    <TabsTrigger value="male" className="data-[state=active]:bg-slate-700">Male Avatars</TabsTrigger>
                    <TabsTrigger value="female" className="data-[state=active]:bg-slate-700">Female Avatars</TabsTrigger>
                </TabsList>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Upload Card */}
                    <Card glass className="md:col-span-1 border-dashed border-2 border-slate-700 bg-slate-900/20">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Upload className="h-5 w-5 text-dosti-400" /> Upload New
                            </CardTitle>
                            <CardDescription>Add a new {activeTab} avatar</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <label
                                htmlFor="avatar-file-input"
                                className="flex flex-col items-center justify-center gap-4 py-8 border-2 border-dashed border-slate-700 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer relative w-full"
                            >
                                <input
                                    id="avatar-file-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                {newAvatar.preview ? (
                                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-dosti-500">
                                        <Image src={newAvatar.preview} alt="Preview" fill className="object-cover" />
                                    </div>
                                ) : (
                                    <div className="h-24 w-24 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                                        <ImageIcon className="h-10 w-10" />
                                    </div>
                                )}
                                <span className="text-sm text-slate-400 font-medium text-center">
                                    {newAvatar.file ? newAvatar.file.name : "Click to select image"}
                                </span>
                            </label>
                            <Button
                                onClick={handleUpload}
                                disabled={!newAvatar.file || uploading}
                                className="w-full bg-gradient-to-r from-dosti-600 to-dosti-500"
                            >
                                {uploading ? "Uploading..." : "Upload Avatar"}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Avatar Grid */}
                    <Card glass className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Existing Avatars</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="text-center py-10 text-slate-500">Loading avatars...</div>
                            ) : avatars.length === 0 ? (
                                <div className="text-center py-10 text-slate-500">No avatars found. Add one!</div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {avatars.map((avatar) => (
                                        <div key={avatar._id} className="group relative aspect-square rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
                                            <Image
                                                src={avatar.url}
                                                alt="Avatar"
                                                fill
                                                unoptimized
                                                className="object-cover transition-transform group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full"
                                                    onClick={() => handleDelete(avatar._id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </Tabs>
        </div>
    );
}
