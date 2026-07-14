'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { User, Mail, Shield, Calendar, MapPin, Camera, Save } from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(API_ENDPOINTS.ADMIN.PROFILE);
            console.log("response : ", response);
            if (response.success && response.data) {
                const data = response.data as any;
                setProfile(data);
                setFormData({
                    name: data.name || '',
                    email: data.email || ''
                });
            }
        } catch (error) {
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const response = await apiClient.patch(API_ENDPOINTS.USERS.UPDATE(profile.userId), {
                name: formData.name
            });

            if (response.success) {
                toast.success("Profile updated successfully");
                setProfile({ ...profile, name: formData.name });
            }
        } catch (error) {
            toast.error("Failed to update profile");
        }
    };

    if (loading) return <div className="text-center py-10 text-slate-500">Loading profile...</div>;
    if (!profile) return <div className="text-center py-10 text-slate-500">Profile not found</div>;

    const initials = profile.name ? profile.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'AU';

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-dosti-400 to-indigo-400 bg-clip-text text-transparent">My Profile</h2>
                <p className="text-slate-400 mt-1">Manage your account details and public information.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
                {/* Profile Card */}
                <div className="space-y-6">
                    <Card glass className="text-center">
                        <CardHeader>
                            <div className="relative mx-auto w-32 h-32 mb-4">
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-dosti-500 to-indigo-600 flex items-center justify-center text-4xl font-bold text-white border-4 border-slate-900 shadow-xl overflow-hidden">
                                    {profile.image ? (
                                        <img src={profile.image} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        initials
                                    )}
                                </div>
                            </div>
                            <CardTitle>{profile.name}</CardTitle>
                            <CardDescription className="capitalize">{profile.role}</CardDescription>
                            <div className="flex justify-center gap-2 mt-4">
                                <Badge className="bg-dosti-500/20 text-dosti-300 hover:bg-dosti-500/30 capitalize">{profile.role}</Badge>
                                <Badge variant="outline" className="border-green-500/50 text-green-400">Verified</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="text-sm text-slate-400 space-y-2">
                            <div className="flex items-center justify-center gap-2">
                                <Mail className="h-4 w-4" /> {profile.email}
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <Calendar className="h-4 w-4" /> Joined {new Date(profile.createdAt).toLocaleDateString()}
                            </div>
                        </CardContent>
                    </Card>

                    <Card glass className="bg-gradient-to-br from-dosti-900/20 to-transparent border-dosti-500/20">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <Shield className="h-8 w-8 text-dosti-400 shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-slate-200">Security Status</h3>
                                    <p className="text-sm text-slate-400 mt-1">Your account is secure.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Edit Form */}
                <Card glass>
                    <CardHeader>
                        <CardTitle>Edit Information</CardTitle>
                        <CardDescription>Update your personal details here.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Full Name</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Email Address</label>
                            <Input value={formData.email} disabled className="opacity-70" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Role / Title</label>
                            <Input value={profile.role} disabled className="bg-slate-900/50 opacity-70 capitalize" />
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button onClick={handleSave} className="bg-dosti-600 hover:bg-dosti-500">
                                <Save className="mr-2 h-4 w-4" /> Save Changes
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
