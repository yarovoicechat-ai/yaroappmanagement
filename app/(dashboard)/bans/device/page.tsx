'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
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
    Search, Monitor, ShieldAlert, Smartphone,
    User, RefreshCw, Sliders, Shield
} from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

export default function DeviceBansPage() {
    // Search state for User ID -> Device ID lookup
    const [userSearchInput, setUserSearchInput] = useState('');
    const [searchingUser, setSearchingUser] = useState(false);
    const [searchedData, setSearchedData] = useState<any>(null);

    // Limit form state
    const [targetDeviceId, setTargetDeviceId] = useState('');
    const [maxAccountsInput, setMaxAccountsInput] = useState<number>(1);
    const [noteInput, setNoteInput] = useState('');
    const [savingLimit, setSavingLimit] = useState(false);

    // Existing overrides & device limits list
    const [loadingLimits, setLoadingLimits] = useState(false);
    const [deviceLimits, setDeviceLimits] = useState<any[]>([]);
    const [defaultMaxAccounts, setDefaultMaxAccounts] = useState<number>(1);
    const [filterQuery, setFilterQuery] = useState('');

    // Fetch existing device limits list from server
    const fetchDeviceLimits = async () => {
        try {
            setLoadingLimits(true);
            const res = await apiClient.get('/api/admin/device-limits');
            if (res.success && res.data) {
                setDeviceLimits(res.data.deviceOverrides || []);
                if (res.data.defaultMaxAccounts) {
                    setDefaultMaxAccounts(res.data.defaultMaxAccounts);
                }
            }
        } catch (err: any) {
            console.error('Failed to load device limits:', err);
        } finally {
            setLoadingLimits(false);
        }
    };

    useEffect(() => {
        fetchDeviceLimits();
    }, []);

    // Search User ID to extract Hardware Device ID & all linked accounts
    const handleSearchUser = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const query = userSearchInput.trim();
        if (!query) {
            toast.error('Please enter a User ID, Meethi ID, or Phone Number');
            return;
        }

        try {
            setSearchingUser(true);
            const res = await apiClient.get(`/api/admin/users/device-info/${encodeURIComponent(query)}`);
            if (res.success && res.data) {
                setSearchedData(res.data);
                if (res.data.deviceId) {
                    setTargetDeviceId(res.data.deviceId);
                    setMaxAccountsInput(res.data.maxAllowedAccounts ?? 1);
                    setNoteInput(res.data.customLimit?.note || `Allowed limit for User #${res.data.user?.userId}`);
                    toast.success(`Device ID found: ${res.data.deviceId}`);
                } else {
                    toast.warning('User found, but no hardware device ID registered yet.');
                }
            } else {
                toast.error(res.message || 'User not found');
                setSearchedData(null);
            }
        } catch (err: any) {
            console.error('User device search error:', err);
            toast.error(err.message || 'User not found');
            setSearchedData(null);
        } finally {
            setSearchingUser(false);
        }
    };

    // Save/Update max allowed accounts for a hardware device ID
    const handleSaveDeviceLimit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetDeviceId.trim()) {
            toast.error('Device ID is required');
            return;
        }

        try {
            setSavingLimit(true);
            const limitVal = Number(maxAccountsInput);
            const res = await apiClient.post('/api/admin/device-limits', {
                deviceId: targetDeviceId.trim(),
                maxAllowedAccounts: isNaN(limitVal) ? 1 : Math.max(0, limitVal),
                note: noteInput.trim()
            });

            if (res.success) {
                toast.success(limitVal === 0
                    ? `Device hardware ${targetDeviceId.slice(0, 12)}... BLOCKED (0 accounts allowed)`
                    : `Device limit updated to ${limitVal} max accounts!`
                );
                fetchDeviceLimits();
                if (searchedData && searchedData.deviceId === targetDeviceId) {
                    setSearchedData({
                        ...searchedData,
                        maxAllowedAccounts: limitVal,
                        customLimit: res.data
                    });
                }
            } else {
                toast.error(res.message || 'Failed to update device limit');
            }
        } catch (err: any) {
            console.error('Update device limit error:', err);
            toast.error(err.message || 'Failed to update device limit');
        } finally {
            setSavingLimit(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
                        <Smartphone className="h-8 w-8 text-cyan-400" /> Device ID & Hardware Limits Control
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm font-medium">
                        Search User ID to extract Hardware Device ID and assign custom account creation limits (1, 2, 5, or 0 for block).
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={fetchDeviceLimits} disabled={loadingLimits} className="border-slate-800">
                        <RefreshCw className={`h-4 w-4 mr-1 ${loadingLimits ? 'animate-spin' : ''}`} /> Refresh Limits
                    </Button>
                </div>
            </div>

            {/* Step 1: User Search Box */}
            <Card className="glass-card border-cyan-500/30">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-slate-100">
                        <Search className="h-5 w-5 text-cyan-400" />
                        1. Find Hardware Device ID by User ID
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-xs">
                        Enter User ID (e.g. 100452), Meethi ID (e.g. MC100452), or Phone Number to extract registered hardware device signature.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearchUser} className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Input
                                placeholder="Enter User ID / Meethi ID / Phone Number (e.g. 100452)..."
                                value={userSearchInput}
                                onChange={(e) => setUserSearchInput(e.target.value)}
                                className="pl-10 font-mono text-sm bg-slate-900/60 border-slate-700 text-cyan-300"
                                required
                            />
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                        </div>
                        <Button type="submit" disabled={searchingUser} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold shrink-0">
                            {searchingUser ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                            Find Device Signature
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Step 2 & 3: Device Search Result & Account Limit Form */}
            {searchedData && (
                <div className="grid gap-6 md:grid-cols-3">
                    {/* User & Device Details Card */}
                    <Card className="glass-card border-slate-700 md:col-span-1">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center justify-between text-slate-200">
                                <span>Matched User Profile</span>
                                <Badge variant="outline" className={searchedData.user?.isBlocked ? "border-rose-500 text-rose-400" : "border-emerald-500 text-emerald-400"}>
                                    {searchedData.user?.isBlocked ? "Blocked" : "Active"}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/60 border border-slate-700">
                                <div className="h-10 w-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-400">
                                    {searchedData.user?.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="overflow-hidden">
                                    <h4 className="font-bold text-slate-100 truncate">{searchedData.user?.name || 'User'}</h4>
                                    <p className="text-xs text-slate-400 font-mono">
                                        ID #{searchedData.user?.userId} • {searchedData.user?.meethiId || 'No Meethi ID'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between py-1 border-b border-slate-800">
                                    <span className="text-slate-400">Phone Number:</span>
                                    <span className="font-mono text-slate-200 font-bold">{searchedData.user?.phoneNumber || '-'}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-800">
                                    <span className="text-slate-400">Role:</span>
                                    <span className="font-semibold text-cyan-400 uppercase">{searchedData.user?.role || 'user'}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-800">
                                    <span className="text-slate-400">Hardware Device ID:</span>
                                    <span className="font-mono text-[11px] text-cyan-300 font-bold truncate max-w-[140px]" title={searchedData.deviceId}>
                                        {searchedData.deviceId ? searchedData.deviceId.slice(0, 16) + '...' : 'Not Recorded'}
                                    </span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-800">
                                    <span className="text-slate-400">Device IP Address:</span>
                                    <span className="font-mono text-xs text-amber-300 font-bold">
                                        {searchedData.ipAddress || searchedData.user?.ipAddress || searchedData.user?.lastIp || 'Not Recorded'}
                                    </span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-slate-400">Accounts on Device:</span>
                                    <span className="font-bold text-emerald-400">{searchedData.totalAccountsCount} Registered</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Limit Override Form */}
                    <Card className="glass-card border-blue-500/40 md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2 text-slate-100">
                                <Sliders className="h-5 w-5 text-blue-400" />
                                2. Set Max Account Registrations for Device ID
                            </CardTitle>
                            <CardDescription className="text-slate-400 text-xs">
                                Configure how many total account IDs this specific hardware device signature is allowed to register on the platform.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSaveDeviceLimit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Device ID Signature</label>
                                    <Input
                                        value={targetDeviceId}
                                        onChange={(e) => setTargetDeviceId(e.target.value)}
                                        placeholder="Hardware Device UUID Signature..."
                                        className="font-mono text-xs bg-slate-900 border-slate-700 text-cyan-300"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                                            Max Allowed Accounts (0 = Block Device)
                                        </label>
                                        <Input
                                            type="number"
                                            min="0"
                                            max="50"
                                            value={maxAccountsInput}
                                            onChange={(e) => setMaxAccountsInput(parseInt(e.target.value) || 0)}
                                            className="font-bold bg-slate-900 border-slate-700 text-white"
                                            required
                                        />
                                        <p className="text-[11px] text-slate-400">
                                            Default: {defaultMaxAccounts} limit. Set to 0 to block all future signups.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Admin Note / Reason</label>
                                        <Input
                                            value={noteInput}
                                            onChange={(e) => setNoteInput(e.target.value)}
                                            placeholder="e.g. Granted multi-account access to User #100452"
                                            className="bg-slate-900 border-slate-700 text-slate-200 text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className={maxAccountsInput === 0 ? "border-rose-500/40 text-rose-400" : "border-cyan-500/40 text-cyan-400"}>
                                            {maxAccountsInput === 0 ? "Hardware Ban (0 Accounts)" : `Limit: ${maxAccountsInput} Accounts Allowed`}
                                        </Badge>
                                    </div>
                                    <Button type="submit" disabled={savingLimit} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold">
                                        {savingLimit ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Shield className="h-4 w-4 mr-2" />}
                                        Save Device Limit
                                    </Button>
                                </div>
                            </form>

                            {/* Registered Accounts Table */}
                            {searchedData.registeredAccounts && searchedData.registeredAccounts.length > 0 && (
                                <div className="mt-6 pt-4 border-t border-slate-800">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                                        <User className="h-4 w-4 text-cyan-400" />
                                        Accounts Created on Same Hardware Signature ({searchedData.registeredAccounts.length})
                                    </h4>
                                    <div className="rounded-lg border border-slate-800 overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-slate-800 bg-slate-900/60">
                                                    <TableHead className="text-xs font-bold text-slate-400">User ID</TableHead>
                                                    <TableHead className="text-xs font-bold text-slate-400">Name</TableHead>
                                                    <TableHead className="text-xs font-bold text-slate-400">Phone</TableHead>
                                                    <TableHead className="text-xs font-bold text-slate-400">Role</TableHead>
                                                    <TableHead className="text-xs font-bold text-slate-400">Registered</TableHead>
                                                    <TableHead className="text-xs font-bold text-slate-400">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {searchedData.registeredAccounts.map((acc: any) => (
                                                    <TableRow key={acc._id} className="hover:bg-slate-800/40 border-slate-800">
                                                        <TableCell className="font-mono text-xs text-cyan-400 font-bold">#{acc.userId}</TableCell>
                                                        <TableCell className="font-medium text-slate-200 text-xs">{acc.name || 'User'}</TableCell>
                                                        <TableCell className="font-mono text-slate-300 text-xs">{acc.phoneNumber || '-'}</TableCell>
                                                        <TableCell className="text-xs uppercase font-bold text-slate-400">{acc.role || 'user'}</TableCell>
                                                        <TableCell className="text-xs text-slate-400">{acc.createdAt ? new Date(acc.createdAt).toLocaleDateString() : '-'}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className={acc.isBlocked ? "border-rose-500 text-rose-400 text-[10px]" : "border-emerald-500 text-emerald-400 text-[10px]"}>
                                                                {acc.isBlocked ? "Blocked" : "Active"}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* List of All Custom Device Limits */}
            <Card className="glass-card border-slate-800">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-slate-200 text-lg">
                            <ShieldAlert className="h-5 w-5 text-cyan-400" />
                            Hardware Device Limit Overrides & Blocklist
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-xs">
                            Active custom registration limits per hardware device signature
                        </CardDescription>
                    </div>
                    <div className="w-full sm:w-64">
                        <Input
                            placeholder="Filter Device ID / Note..."
                            value={filterQuery}
                            onChange={(e) => setFilterQuery(e.target.value)}
                            className="bg-slate-900 border-slate-700 text-xs text-slate-200"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-800">
                                <TableHead className="font-bold text-slate-300">Device Signature ID</TableHead>
                                <TableHead className="font-bold text-slate-300">Max Allowed Accounts</TableHead>
                                <TableHead className="font-bold text-slate-300">Status</TableHead>
                                <TableHead className="font-bold text-slate-300">Admin Note</TableHead>
                                <TableHead className="font-bold text-slate-300">Last Updated</TableHead>
                                <TableHead className="text-right font-bold text-slate-300">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {deviceLimits
                                .filter(d => d.deviceId.toLowerCase().includes(filterQuery.toLowerCase()) || (d.note || '').toLowerCase().includes(filterQuery.toLowerCase()))
                                .map((lim) => (
                                    <TableRow key={lim._id || lim.deviceId} className="hover:bg-slate-800/40 border-slate-800">
                                        <TableCell className="font-mono text-xs text-cyan-400 font-bold max-w-[200px] truncate" title={lim.deviceId}>
                                            {lim.deviceId}
                                        </TableCell>
                                        <TableCell className="font-extrabold text-slate-100">
                                            {lim.maxAllowedAccounts} Accounts
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={lim.maxAllowedAccounts === 0 ? "border-rose-500 text-rose-400" : "border-cyan-500 text-cyan-400"}>
                                                {lim.maxAllowedAccounts === 0 ? "Banned (0)" : `Allowed (${lim.maxAllowedAccounts})`}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-300">{lim.note || '-'}</TableCell>
                                        <TableCell className="text-xs text-slate-400">
                                            {lim.updatedAt ? new Date(lim.updatedAt).toLocaleString() : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setTargetDeviceId(lim.deviceId);
                                                    setMaxAccountsInput(lim.maxAllowedAccounts);
                                                    setNoteInput(lim.note || '');
                                                    setUserSearchInput(lim.deviceId);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                                className="text-xs border-slate-700 text-cyan-400 hover:bg-cyan-500/10"
                                            >
                                                Edit Limit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            {deviceLimits.length === 0 && !loadingLimits && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                        No custom device limit overrides set yet. All devices follow default max {defaultMaxAccounts} account rule.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
