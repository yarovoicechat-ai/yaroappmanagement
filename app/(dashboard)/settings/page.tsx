'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { Bell, Lock, Server, User, Save, Settings } from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState({ name: '', email: '' });
    const [settings, setSettings] = useState({
        commissionRate: 20,
        coinPrice: 0.1,
        minPayout: 50,
        emailAlerts: true,
        systemDigest: true,
        maintenanceMode: false
    });
    const [passwords, setPasswords] = useState({ current: '', new: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [profileRes, settingsRes] = await Promise.all([
                    apiClient.get(API_ENDPOINTS.ADMIN.PROFILE),
                    apiClient.get(API_ENDPOINTS.ADMIN.SETTINGS)
                ]);

                if (profileRes.success) setProfile(profileRes.data as any);
                if (settingsRes.success) setSettings(settingsRes.data as any);
            } catch (error) {
                toast.error("Failed to load settings");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSaveProfile = async () => {
        try {
            const res = await apiClient.patch(API_ENDPOINTS.ADMIN.UPDATE_PROFILE, { name: profile.name });
            if (res.success) toast.success("Profile updated successfully");
        } catch (error) {
            toast.error("Failed to update profile");
        }
    };

    const handleSaveSecurity = async () => {
        if (!passwords.new) return toast.error("New password is required");
        try {
            const res = await apiClient.patch(API_ENDPOINTS.ADMIN.UPDATE_PROFILE, { password: passwords.new });
            if (res.success) {
                toast.success("Password updated successfully");
                setPasswords({ current: '', new: '' });
            }
        } catch (error) {
            toast.error("Failed to update password");
        }
    };

    const handleSaveSettings = async (override?: any) => {
        try {
            const payload = override || settings;
            const res = await apiClient.patch(API_ENDPOINTS.ADMIN.UPDATE_SETTINGS, payload);
            if (res.success) {
                if (!override) toast.success("Settings saved successfully");
                setSettings(res.data as any);
            }
        } catch (error) {
            toast.error("Failed to save settings");
        }
    };

    const handleToggle = (key: string, value: boolean) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        handleSaveSettings(newSettings); // Auto-save toggles
    };

    if (loading) return <div className="text-center py-10 text-slate-500">Loading settings...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">Settings</h2>
                <p className="text-slate-400 mt-1">Manage app preferences and system configuration.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    <Card glass>
                        <CardHeader className="flex flex-row items-center gap-2">
                            <User className="h-5 w-5 text-dosti-400" />
                            <CardTitle>Profile Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Display Name</label>
                                <Input
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Email Address</label>
                                <Input value={profile.email} disabled className="opacity-70" />
                            </div>
                            <Button onClick={handleSaveProfile} className="bg-dosti-600 hover:bg-dosti-500">
                                <Save className="mr-2 h-4 w-4" /> Save Changes
                            </Button>
                        </CardContent>
                    </Card>

                    <Card glass>
                        <CardHeader className="flex flex-row items-center gap-2">
                            <Bell className="h-5 w-5 text-dosti-400" />
                            <CardTitle>Notifications</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <label className="text-sm font-medium text-slate-200">Email Alerts</label>
                                    <p className="text-xs text-slate-400">Receive emails about high-severity reports.</p>
                                </div>
                                <Switch checked={settings.emailAlerts} onCheckedChange={(c) => handleToggle('emailAlerts', c)} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <label className="text-sm font-medium text-slate-200">System Digest</label>
                                    <p className="text-xs text-slate-400">Weekly summary of app activity.</p>
                                </div>
                                <Switch checked={settings.systemDigest} onCheckedChange={(c) => handleToggle('systemDigest', c)} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card glass>
                        <CardHeader className="flex flex-row items-center gap-2">
                            <Settings className="h-5 w-5 text-dosti-400" />
                            <CardTitle>App Logic</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-sm font-medium text-muted-foreground">Commission Rate (%)</label>
                                    <span className="text-sm font-bold text-primary">{settings.commissionRate}%</span>
                                </div>
                                <Input
                                    type="range" min="0" max="50"
                                    value={settings.commissionRate}
                                    onChange={(e) => setSettings({ ...settings, commissionRate: parseInt(e.target.value) })}
                                    className="accent-dosti-500"
                                />
                                <p className="text-xs text-muted-foreground">Percentage taken from every completed call.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Coin Price ($)</label>
                                    <Input
                                        type="number" step="0.01"
                                        value={settings.coinPrice}
                                        onChange={(e) => setSettings({ ...settings, coinPrice: parseFloat(e.target.value) })}
                                    />
                                    <p className="text-xs text-muted-foreground">Cost per coin for users.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Minimum Payout ($)</label>
                                    <Input
                                        type="number"
                                        value={settings.minPayout}
                                        onChange={(e) => setSettings({ ...settings, minPayout: parseInt(e.target.value) })}
                                    />
                                    <p className="text-xs text-muted-foreground">Operational payout threshold.</p>
                                </div>
                            </div>

                            <Button onClick={() => handleSaveSettings()} className="w-full">
                                <Save className="mr-2 h-4 w-4" /> Save Financial Settings
                            </Button>
                        </CardContent>
                    </Card>

                    <Card glass>
                        <CardHeader className="flex flex-row items-center gap-2">
                            <Lock className="h-5 w-5 text-dosti-400" />
                            <CardTitle>Security</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Current Password</label>
                                <Input
                                    type="password"
                                    value={passwords.current}
                                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">New Password</label>
                                <Input
                                    type="password"
                                    value={passwords.new}
                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                />
                            </div>
                            <Button variant="outline" className="w-full" onClick={handleSaveSecurity}>Update Password</Button>
                        </CardContent>
                    </Card>

                    <Card glass className="border-destructive/20 bg-destructive/5">
                        <CardHeader className="flex flex-row items-center gap-2">
                            <Server className="h-5 w-5 text-destructive" />
                            <CardTitle className="text-destructive">Danger Zone</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <label className="text-sm font-medium text-destructive">Maintenance Mode</label>
                                    <p className="text-xs text-destructive/70">Shut down user facing app.</p>
                                </div>
                                <Switch
                                    className="data-[state=checked]:bg-destructive"
                                    checked={settings.maintenanceMode}
                                    onCheckedChange={(c) => handleToggle('maintenanceMode', c)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
