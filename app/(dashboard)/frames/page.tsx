'use client';

import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/Dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/AlertDialog";
import { Plus, Trash2, Image as ImageIcon, Award, Upload } from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';
import type { Frame } from '@/types/models';
import { uploadToCloudinary } from '@/lib/cloudinary';

export default function FramesPage() {
    const [frames, setFrames] = useState<Frame[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddingFrame, setIsAddingFrame] = useState(false);
    const [deletingFrameId, setDeletingFrameId] = useState<string | null>(null);

    // Add Frame State
    const [newFrameName, setNewFrameName] = useState('');
    const [newFrameLevel, setNewFrameLevel] = useState('');
    const [newFrameImage, setNewFrameImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

    useEffect(() => {
        fetchFrames();
    }, []);

    const fetchFrames = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(API_ENDPOINTS.FRAMES.LIST);
            let data: any[] = [];
            if (Array.isArray(response)) {
                data = response;
            } else if (response.success && Array.isArray(response.data)) {
                data = response.data;
            }

            if (data.length > 0) {
                const updatedFrames = data.map((frame: any) => ({
                    ...frame,
                    image: frame.image?.startsWith('http')
                        ? frame.image
                        : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.voicecallclub.com'}${frame.image?.startsWith('/') ? '' : '/'}${frame.image}`
                }));
                setFrames(updatedFrames);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch frames');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewFrameImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddFrame = async () => {
        if (!newFrameName || !newFrameLevel || !newFrameImage) {
            toast.error('Please fill in all fields and upload an image');
            return;
        }

        try {
            // 1. Upload to Cloudinary
            const imageUrl = await uploadToCloudinary(newFrameImage, 'frames');

            // 2. Submit to Backend
            const response = await apiClient.post(API_ENDPOINTS.FRAMES.CREATE, {
                name: newFrameName,
                level: newFrameLevel,
                image: imageUrl
            });

            if (response.success) {
                toast.success('Frame added successfully');
                setIsAddingFrame(false);
                setNewFrameName('');
                setNewFrameLevel('');
                setNewFrameImage(null);
                setImagePreview('');
                fetchFrames();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to add frame');
        }
    };

    const handleDeleteFrame = async () => {
        if (!deletingFrameId) return;

        try {
            const response = await apiClient.delete(API_ENDPOINTS.FRAMES.DELETE(deletingFrameId));

            if (response.success) {
                toast.success('Frame deleted successfully');
                setDeletingFrameId(null);
                fetchFrames();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete frame');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
                        Frame Management
                    </h2>
                    <p className="text-slate-400 mt-1">Manage user profile frames and levels.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => setIsAddingFrame(!isAddingFrame)}>
                        <Plus className="mr-2 h-4 w-4" />
                        {isAddingFrame ? 'Cancel' : 'Add Frame'}
                    </Button>
                </div>
            </div>

            {/* Frame Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card glass className="bg-slate-900/40">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-400">Total Frames</CardTitle>
                        <Award className="h-4 w-4 text-amber-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-100">{frames.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Add Frame Panel */}
            {isAddingFrame && (
                <Card glass className="border-amber-500/50 bg-amber-900/10">
                    <CardHeader>
                        <CardTitle className="text-lg">Add New Frame</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium">Frame Name</label>
                                <Input
                                    id="name"
                                    value={newFrameName}
                                    onChange={e => setNewFrameName(e.target.value)}
                                    placeholder="e.g., Gold Frame"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="level" className="text-sm font-medium">Level</label>
                                <Input
                                    id="level"
                                    type="number"
                                    value={newFrameLevel}
                                    onChange={e => setNewFrameLevel(e.target.value)}
                                    placeholder="e.g., 10"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="image" className="text-sm font-medium">Frame Image</label>
                            <div className="flex items-center gap-4">
                                <label htmlFor="image" className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700">
                                    <Upload className="h-4 w-4" />
                                    Choose Image
                                </label>
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                                {newFrameImage && (
                                    <span className="text-sm text-slate-400">{newFrameImage.name}</span>
                                )}
                            </div>
                            {imagePreview && (
                                <div className="mt-2">
                                    <img src={imagePreview} alt="Preview" className="h-24 w-24 object-cover rounded-lg border border-slate-700" />
                                </div>
                            )}
                        </div>
                        <Button onClick={handleAddFrame} className="w-full md:w-auto bg-amber-600 hover:bg-amber-500">
                            <Plus className="mr-2 h-4 w-4" /> Create Frame
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Frames Table */}
            <Card glass>
                <CardHeader>
                    <CardTitle>Frames Directory</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-slate-500">Loading frames...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-slate-700/50">
                                    <TableHead>Image</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Level</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {frames.map((frame) => (
                                    <TableRow key={frame._id} className="border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                        <TableCell>
                                            {frame.image ? (
                                                <img
                                                    src={frame.image}
                                                    alt={frame.name}
                                                    className="h-12 w-12 object-cover rounded-lg border border-slate-700"
                                                />
                                            ) : (
                                                <div className="h-12 w-12 bg-slate-800 rounded-lg flex items-center justify-center">
                                                    <ImageIcon className="h-6 w-6 text-slate-600" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium text-slate-200">{frame.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                                                Level {frame.level}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-400">
                                            {new Date(frame.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                                onClick={() => setDeletingFrameId(frame._id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {frames.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                            No frames found. Add your first frame above!
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Alert */}
            <AlertDialog open={!!deletingFrameId} onOpenChange={(open) => !open && setDeletingFrameId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the frame
                            from the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteFrame} className="bg-red-600 hover:bg-red-700 text-white border-none">
                            Delete Frame
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
