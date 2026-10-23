'use client';

import { useState, useEffect, useCallback } from 'react';
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
    Search, User, Award, Briefcase, ShieldCheck, 
    RefreshCw, CheckCircle2, XCircle, Loader2, UserCheck, ShieldAlert
} from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

interface AppAccessUser {
    _id: string;
    userId: number;
    name: string;
    userName?: string;
    avatar?: string;
    image?: string;
    role: string;
    isAgency: boolean;
    isBd: boolean;
    createdAt?: string;
}

export default function BdAgencyAccessPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'agency' | 'bd'>('all');
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<AppAccessUser[]>([]);

    // Specific user lookup card
    const [lookupInput, setLookupInput] = useState('');
    const [lookupLoading, setLookupLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AppAccessUser | null>(null);

    // Action toggle loading tracking
    const [togglingType, setTogglingType] = useState<string | null>(null);

    const fetchUsers = useCallback(async (query = searchQuery, filter = filterType) => {
        setLoading(true);
        try {
            const params: any = {};
            if (query.trim()) params.search = query.trim();
            if (filter !== 'all') params.filter = filter;

            const res = await apiClient.get<any>('/api/admin/app-access/users', { params });
            if (res.data?.success && Array.isArray(res.data?.data)) {
                setUsers(res.data.data);
            } else {
                setUsers([]);
            }
        } catch (err: any) {
            console.error('Error fetching app access users:', err);
            toast.error(err.response?.data?.message || 'Could not load users list');
        } finally {
            setLoading(false);
        }
    }, [searchQuery, filterType]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchUsers(searchQuery, filterType);
    };

    const handleLookupUser = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!lookupInput.trim()) {
            toast.error('Please enter a User ID or Name to search');
            return;
        }

        setLookupLoading(true);
        try {
            const res = await apiClient.get<any>('/api/admin/app-access/users', {
                params: { search: lookupInput.trim() },
            });
            if (res.data?.success && Array.isArray(res.data?.data) && res.data.data.length > 0) {
                setSelectedUser(res.data.data[0]);
                toast.success(`Found user: ${res.data.data[0].name || res.data.data[0].userId}`);
            } else {
                setSelectedUser(null);
                toast.error('User not found. Check the ID and try again.');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to search user');
        } finally {
            setLookupLoading(false);
        }
    };

    const handleToggleAccess = async (userId: number | string, type: 'agency' | 'bd', currentStatus: boolean) => {
        const nextStatus = !currentStatus;
        const key = `${userId}-${type}`;
        setTogglingType(key);

        try {
            const res = await apiClient.post<any>('/api/admin/app-access/toggle', {
                userId,
                type,
                enabled: nextStatus,
            });

            if (res.data?.success) {
                toast.success(res.data.message || `App ${type.toUpperCase()} access updated`);
                
                // Update selectedUser if matched
                if (selectedUser && String(selectedUser.userId) === String(userId)) {
                    setSelectedUser({
                        ...selectedUser,
                        [type === 'agency' ? 'isAgency' : 'isBd']: nextStatus,
                    });
                }

                // Update users list state
                setUsers((prev) =>
                    prev.map((u) => {
                        if (String(u.userId) === String(userId)) {
                            return {
                                ...u,
                                [type === 'agency' ? 'isAgency' : 'isBd']: nextStatus,
                            };
                        }
                        return u;
                    })
                );
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || `Failed to update ${type} access`);
        } finally {
            setTogglingType(null);
        }
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Briefcase className="h-7 w-7 text-indigo-500" />
                        App BD & Agency Access
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Grant or revoke Agency Hub & BD Center privileges in Yaro App for any user ID.
                    </p>
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fetchUsers()} 
                    disabled={loading}
                    className="gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Quick User ID Lookup Card */}
            <Card className="border-indigo-500/20 shadow-sm bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <UserCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        Assign Privilege to Any User ID
                    </CardTitle>
                    <CardDescription>
                        Search any user by ID, username, or name to instantly toggle their App Agency or BD access.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleLookupUser} className="flex gap-2 max-w-md">
                        <Input
                            placeholder="Enter User ID (e.g. 1000000002)"
                            value={lookupInput}
                            onChange={(e) => setLookupInput(e.target.value)}
                            className="bg-white dark:bg-slate-950"
                        />
                        <Button type="submit" disabled={lookupLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                            {lookupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            Lookup
                        </Button>
                    </form>

                    {/* Found User Action Card */}
                    {selectedUser && (
                        <div className="mt-4 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white/80 dark:bg-slate-950/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-lg border border-indigo-300">
                                    {selectedUser.avatar || selectedUser.image ? (
                                        <img src={selectedUser.avatar || selectedUser.image} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        selectedUser.name?.charAt(0) || 'U'
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-900 dark:text-slate-100">{selectedUser.name || 'Unnamed'}</span>
                                        <Badge variant="outline" className="text-xs">ID: {selectedUser.userId}</Badge>
                                        <Badge variant="secondary" className="capitalize text-xs">{selectedUser.role || 'user'}</Badge>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Username: {selectedUser.userName || '—'}
                                    </p>
                                </div>
                            </div>

                            {/* Privilege Toggles */}
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                {/* Agency Toggle */}
                                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800">
                                    <div className="text-left">
                                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                            <Briefcase className="h-3.5 w-3.5 text-sky-500" />
                                            Agency Hub
                                        </div>
                                        <div className="text-[10px] text-slate-400">
                                            {selectedUser.isAgency ? 'Access Enabled' : 'No Access'}
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant={selectedUser.isAgency ? 'destructive' : 'default'}
                                        disabled={togglingType === `${selectedUser.userId}-agency`}
                                        onClick={() => handleToggleAccess(selectedUser.userId, 'agency', selectedUser.isAgency)}
                                        className="h-8 text-xs gap-1.5"
                                    >
                                        {togglingType === `${selectedUser.userId}-agency` ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : selectedUser.isAgency ? (
                                            <>
                                                <XCircle className="h-3 w-3" />
                                                Revoke
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="h-3 w-3" />
                                                Grant
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {/* BD Toggle */}
                                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800">
                                    <div className="text-left">
                                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                            <Award className="h-3.5 w-3.5 text-amber-500" />
                                            BD Center
                                        </div>
                                        <div className="text-[10px] text-slate-400">
                                            {selectedUser.isBd ? 'Access Enabled' : 'No Access'}
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant={selectedUser.isBd ? 'destructive' : 'default'}
                                        disabled={togglingType === `${selectedUser.userId}-bd`}
                                        onClick={() => handleToggleAccess(selectedUser.userId, 'bd', selectedUser.isBd)}
                                        className="h-8 text-xs gap-1.5"
                                    >
                                        {togglingType === `${selectedUser.userId}-bd` ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : selectedUser.isBd ? (
                                            <>
                                                <XCircle className="h-3 w-3" />
                                                Revoke
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="h-3 w-3" />
                                                Grant
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Privileges Table Card */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader className="pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-base font-semibold">Active App Privilege Holders</CardTitle>
                        <CardDescription>
                            Users with active Agency Hub or BD Center privileges in Yaro App.
                        </CardDescription>
                    </div>

                    {/* Filter and Search */}
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 p-1 bg-slate-50 dark:bg-slate-900">
                            <button
                                onClick={() => { setFilterType('all'); fetchUsers(searchQuery, 'all'); }}
                                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                                    filterType === 'all'
                                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                                }`}
                            >
                                All ({users.length})
                            </button>
                            <button
                                onClick={() => { setFilterType('agency'); fetchUsers(searchQuery, 'agency'); }}
                                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                                    filterType === 'agency'
                                        ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                                }`}
                            >
                                Agency
                            </button>
                            <button
                                onClick={() => { setFilterType('bd'); fetchUsers(searchQuery, 'bd'); }}
                                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                                    filterType === 'bd'
                                        ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                                }`}
                            >
                                BD
                            </button>
                        </div>

                        <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5 flex-1 sm:flex-none">
                            <Input
                                placeholder="Filter list..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-8 text-xs w-full sm:w-48 bg-white dark:bg-slate-950"
                            />
                            <Button type="submit" size="sm" variant="ghost" className="h-8 px-2">
                                <Search className="h-3.5 w-3.5" />
                            </Button>
                        </form>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                                <TableHead className="font-semibold">User</TableHead>
                                <TableHead className="font-semibold">User ID</TableHead>
                                <TableHead className="font-semibold">Base Role</TableHead>
                                <TableHead className="font-semibold">Agency Access</TableHead>
                                <TableHead className="font-semibold">BD Access</TableHead>
                                <TableHead className="text-right font-semibold">Quick Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-500" />
                                        Loading privileges...
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                                        No users found with active BD or Agency app access.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((u) => (
                                    <TableRow key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                                        <TableCell>
                                            <div className="flex items-center gap-2.5">
                                                <div className="h-9 w-9 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-semibold text-slate-700 dark:text-slate-300 text-sm border border-slate-200 dark:border-slate-700">
                                                    {u.avatar || u.image ? (
                                                        <img src={u.avatar || u.image} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        u.name?.charAt(0) || 'U'
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                                                        {u.name || 'Unnamed'}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {u.userName ? `@${u.userName}` : 'No username'}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                {u.userId}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize text-xs">
                                                {u.role || 'user'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {u.isAgency ? (
                                                <Badge className="bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800 gap-1 font-semibold">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Active Agency
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-slate-400">
                                                    Disabled
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {u.isBd ? (
                                                <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 gap-1 font-semibold">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Active BD
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-slate-400">
                                                    Disabled
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button
                                                    size="sm"
                                                    variant={u.isAgency ? 'ghost' : 'outline'}
                                                    disabled={togglingType === `${u.userId}-agency`}
                                                    onClick={() => handleToggleAccess(u.userId, 'agency', u.isAgency)}
                                                    className="h-7 text-xs px-2"
                                                >
                                                    {u.isAgency ? 'Remove Agency' : '+ Agency'}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant={u.isBd ? 'ghost' : 'outline'}
                                                    disabled={togglingType === `${u.userId}-bd`}
                                                    onClick={() => handleToggleAccess(u.userId, 'bd', u.isBd)}
                                                    className="h-7 text-xs px-2"
                                                >
                                                    {u.isBd ? 'Remove BD' : '+ BD'}
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
    );
}
