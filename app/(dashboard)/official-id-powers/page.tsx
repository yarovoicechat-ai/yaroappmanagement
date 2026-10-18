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
    Zap, ShieldAlert, EyeOff, UserX, VolumeX, Lock, ShieldCheck,
    Search, UserCheck, Trash2, CheckCircle2, AlertTriangle, Crown,
    RefreshCw, Sparkles, SlidersHorizontal, CheckSquare, Square
} from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

interface OfficialPowers {
    canBanRoom: boolean;
    canBanUser: boolean;
    canGhostEntry: boolean;
    canKickAnyUser: boolean;
    canMuteAnyUser: boolean;
    canLockAnySeat: boolean;
    isGlobalRoomManager: boolean;
}

interface EmpoweredUser {
    userId: number;
    name: string;
    userName: string;
    image: string;
    role: string;
    status: string;
    isBlocked: boolean;
    isGlobalRoomManager: boolean;
    officialPowers: OfficialPowers;
    updatedAt?: string;
}

const DEFAULT_POWERS: OfficialPowers = {
    canBanRoom: false,
    canBanUser: false,
    canGhostEntry: false,
    canKickAnyUser: false,
    canMuteAnyUser: false,
    canLockAnySeat: false,
    isGlobalRoomManager: false,
};

const POWER_DEFINITIONS = [
    {
        key: 'canBanRoom' as keyof OfficialPowers,
        title: 'Room Ban & Terminate 🚫',
        hindi: 'कमरा बैन और बंद करने का अधिकार',
        description: 'Allows this ID to ban and terminate any voice room directly from the mobile app interface.',
        color: 'border-red-500/30 text-red-400 bg-red-950/20',
        badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
        icon: ShieldAlert,
    },
    {
        key: 'canBanUser' as keyof OfficialPowers,
        title: 'User Ban & Blacklist 🔨',
        hindi: 'उपयोगकर्ता बैन करने का अधिकार',
        description: 'Allows this ID to block and ban abusive users directly from rooms or mobile profile cards.',
        color: 'border-orange-500/30 text-orange-400 bg-orange-950/20',
        badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
        icon: UserX,
    },
    {
        key: 'canGhostEntry' as keyof OfficialPowers,
        title: 'Ghost / Invisible Room Entry 👻',
        hindi: 'अदृश्य प्रवेश (कमरे में जाने पर किसी को दिखेगा नहीं)',
        description: 'When entering any room, this user is completely invisible: no entry animation, hidden from audience lists, and silent observation.',
        color: 'border-purple-500/30 text-purple-400 bg-purple-950/20',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        icon: EyeOff,
    },
    {
        key: 'canKickAnyUser' as keyof OfficialPowers,
        title: 'Kick Any User 👢',
        hindi: 'किसी भी यूजर को बाहर निकालने का अधिकार',
        description: 'Can kick and remove users from seats or eject them from the room with a 24-hour room restriction.',
        color: 'border-amber-500/30 text-amber-400 bg-amber-950/20',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        icon: UserCheck,
    },
    {
        key: 'canMuteAnyUser' as keyof OfficialPowers,
        title: 'Mute Any Mic / Speaker 🔇',
        hindi: 'किसी भी यूजर का माइक म्यूट करने का अधिकार',
        description: 'Can mute and silence any speaker on any seat across all voice rooms.',
        color: 'border-sky-500/30 text-sky-400 bg-sky-950/20',
        badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
        icon: VolumeX,
    },
    {
        key: 'canLockAnySeat' as keyof OfficialPowers,
        title: 'Lock / Unlock Seats 🔒',
        hindi: 'सीट लॉक या अनलॉक करने का अधिकार',
        description: 'Can lock or unlock any seat in any voice room even if not the room owner.',
        color: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        icon: Lock,
    },
    {
        key: 'isGlobalRoomManager' as keyof OfficialPowers,
        title: 'Global Master Room Manager 👑',
        hindi: 'सर्वव्यापी रूम प्रबंधक (सभी कमरों का पूर्ण नियंत्रण)',
        description: 'Full master controller access over all voice rooms in the platform: edit details, change theme/skins, bypass PIN, and oversee seats.',
        color: 'border-yellow-500/30 text-yellow-400 bg-yellow-950/20',
        badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        icon: Crown,
    },
];

export default function OfficialIdPowersPage() {
    const [empoweredUsers, setEmpoweredUsers] = useState<EmpoweredUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searching, setSearching] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [currentPowers, setCurrentPowers] = useState<OfficialPowers>(DEFAULT_POWERS);
    const [saving, setSaving] = useState(false);
    const [tableFilter, setTableFilter] = useState('');

    useEffect(() => {
        fetchEmpoweredUsers();
    }, []);

    const fetchEmpoweredUsers = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get<any>('/api/admin/official-powers');
            if (res.success && Array.isArray(res.data)) {
                setEmpoweredUsers(res.data);
            }
        } catch (err: any) {
            toast.error(err?.message || 'Failed to load official power users');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchUser = async () => {
        const query = searchTerm.trim();
        if (!query) {
            toast.error('Please enter a User ID (numeric), name or phone number');
            return;
        }

        try {
            setSearching(true);
            const res = await apiClient.get<any>(`/api/admin/official-powers/search?q=${encodeURIComponent(query)}`);
            if (res.success && Array.isArray(res.data) && res.data.length > 0) {
                const found = res.data[0];
                setSelectedUser(found);
                setCurrentPowers(found.officialPowers || DEFAULT_POWERS);
                toast.success(`Found User ID #${found.userId} (${found.name})`);
            } else {
                toast.error(`No user found matching "${query}"`);
                setSelectedUser(null);
                setCurrentPowers(DEFAULT_POWERS);
            }
        } catch (err: any) {
            toast.error(err?.message || 'Search failed');
        } finally {
            setSearching(false);
        }
    };

    const togglePower = (key: keyof OfficialPowers) => {
        setCurrentPowers(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleSelectAll = () => {
        setCurrentPowers({
            canBanRoom: true,
            canBanUser: true,
            canGhostEntry: true,
            canKickAnyUser: true,
            canMuteAnyUser: true,
            canLockAnySeat: true,
            isGlobalRoomManager: true,
        });
        toast.info('All Super-Access powers selected');
    };

    const handleSelectModeratorOnly = () => {
        setCurrentPowers({
            canBanRoom: true,
            canBanUser: true,
            canGhostEntry: false,
            canKickAnyUser: true,
            canMuteAnyUser: true,
            canLockAnySeat: true,
            isGlobalRoomManager: false,
        });
        toast.info('Moderator preset selected');
    };

    const handleSelectGhostOnly = () => {
        setCurrentPowers({
            canBanRoom: false,
            canBanUser: false,
            canGhostEntry: true,
            canKickAnyUser: false,
            canMuteAnyUser: false,
            canLockAnySeat: false,
            isGlobalRoomManager: false,
        });
        toast.info('Ghost/Stealth mode preset selected');
    };

    const handleClearAll = () => {
        setCurrentPowers(DEFAULT_POWERS);
        toast.info('All checkboxes cleared');
    };

    const handleSavePowers = async () => {
        if (!selectedUser?.userId) {
            toast.error('Please search and select a User ID first');
            return;
        }

        try {
            setSaving(true);
            const res = await apiClient.post<any>('/api/admin/official-powers', {
                userId: selectedUser.userId,
                powers: currentPowers,
            });

            if (res.success) {
                toast.success(`Official powers applied to ID #${selectedUser.userId}!`);
                fetchEmpoweredUsers();
            } else {
                toast.error(res.message || 'Failed to save powers');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Error updating powers');
        } finally {
            setSaving(false);
        }
    };

    const handleRevokePowers = async (userId: number, name: string) => {
        if (!confirm(`Are you sure you want to revoke ALL official powers from ID #${userId} (${name})?`)) {
            return;
        }

        try {
            const res = await apiClient.delete<any>(`/api/admin/official-powers/${userId}`);
            if (res.success) {
                toast.success(`Revoked all official powers from ID #${userId}`);
                if (selectedUser?.userId === userId) {
                    setCurrentPowers(DEFAULT_POWERS);
                    setSelectedUser(null);
                }
                fetchEmpoweredUsers();
            } else {
                toast.error(res.message || 'Failed to revoke powers');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Error revoking powers');
        }
    };

    const handleEditFromTable = (user: EmpoweredUser) => {
        setSelectedUser(user);
        setCurrentPowers(user.officialPowers || DEFAULT_POWERS);
        setSearchTerm(String(user.userId));
        window.scrollTo({ top: 200, behavior: 'smooth' });
    };

    // Filter table records
    const filteredUsers = empoweredUsers.filter(u => {
        if (!tableFilter) return true;
        const q = tableFilter.toLowerCase();
        return (
            String(u.userId).includes(q) ||
            (u.name && u.name.toLowerCase().includes(q)) ||
            (u.userName && u.userName.toLowerCase().includes(q))
        );
    });

    const activeRoomBannersCount = empoweredUsers.filter(u => u.officialPowers?.canBanRoom).length;
    const activeGhostCount = empoweredUsers.filter(u => u.officialPowers?.canGhostEntry).length;
    const activeGlobalCount = empoweredUsers.filter(u => u.officialPowers?.isGlobalRoomManager || u.isGlobalRoomManager).length;

    return (
        <div className="space-y-8 pb-16">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 p-0.5 shadow-lg shadow-purple-950/40">
                            <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                                <Zap className="h-6 w-6 text-amber-400" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-amber-300">
                                Official ID Powers (आईडी अधिकार नियंत्रण)
                            </h1>
                            <p className="text-sm text-slate-400">
                                Assign granular powers to User IDs: Room Ban, User Ban, Invisible Ghost Entry, Seat Lock, and Global Room Manager.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={fetchEmpoweredUsers}
                        disabled={loading}
                        className="border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh List
                    </Button>
                </div>
            </div>

            {/* Metrics Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-900/40 border-slate-800/80 backdrop-blur-xl">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-400">Empowered IDs Total</p>
                            <h3 className="text-2xl font-black text-white mt-1">{empoweredUsers.length}</h3>
                            <p className="text-[11px] text-amber-400 mt-0.5">Active Super-Access IDs</p>
                        </div>
                        <div className="h-11 w-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                            <ShieldCheck className="h-6 w-6 text-amber-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/40 border-slate-800/80 backdrop-blur-xl">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-400">Room Ban Powers 🚫</p>
                            <h3 className="text-2xl font-black text-red-400 mt-1">{activeRoomBannersCount}</h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">App Room Terminators</p>
                        </div>
                        <div className="h-11 w-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <ShieldAlert className="h-6 w-6 text-red-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/40 border-slate-800/80 backdrop-blur-xl">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-400">Ghost / Invisible IDs 👻</p>
                            <h3 className="text-2xl font-black text-purple-400 mt-1">{activeGhostCount}</h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">Hidden Spectators</p>
                        </div>
                        <div className="h-11 w-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                            <EyeOff className="h-6 w-6 text-purple-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/40 border-slate-800/80 backdrop-blur-xl">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-400">Global Controllers 👑</p>
                            <h3 className="text-2xl font-black text-yellow-400 mt-1">{activeGlobalCount}</h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">Full Room Access</p>
                        </div>
                        <div className="h-11 w-11 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                            <Crown className="h-6 w-6 text-yellow-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ID Search & Checkbox Configuration Card */}
            <Card className="bg-slate-900/60 border-purple-500/30 shadow-2xl shadow-purple-950/20 backdrop-blur-xl overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600" />
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl font-black text-white flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-amber-400" />
                                Search ID & Assign Checkbox Powers (आईडी को अधिकार दें)
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Enter the numeric User ID, toggle the checkboxes for each required power, and click Save.
                            </CardDescription>
                        </div>

                        {/* Search Input Box */}
                        <div className="flex items-center gap-2 max-w-md w-full">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <Input
                                    placeholder="Enter User ID (e.g. 10001, 205766) or Phone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
                                    className="pl-9 bg-slate-950/80 border-slate-700 text-white placeholder:text-slate-500 rounded-xl"
                                />
                            </div>
                            <Button
                                onClick={handleSearchUser}
                                disabled={searching}
                                className="bg-gradient-to-r from-amber-500 to-pink-600 hover:from-amber-400 hover:to-pink-500 text-white font-bold rounded-xl px-5"
                            >
                                {searching ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Search ID'}
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Selected User Banner */}
                    {selectedUser ? (
                        <div className="p-4 rounded-2xl bg-slate-950/70 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <img
                                        src={selectedUser.image || 'https://api.yaroapp.in/uploads/avatars/female_default.webp'}
                                        alt={selectedUser.name}
                                        className="h-16 w-16 rounded-2xl object-cover border-2 border-amber-500/50 shadow-md"
                                    />
                                    <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-amber-500 text-slate-950 text-[10px] font-black rounded-md">
                                        Lv.{selectedUser.level || 1}
                                    </span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-black text-white">{selectedUser.name}</h3>
                                        <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-300 font-mono">
                                            ID: {selectedUser.userId}
                                        </Badge>
                                        <Badge variant="outline" className="border-slate-700 bg-slate-800 text-slate-300">
                                            {selectedUser.role || 'user'}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1 font-mono">
                                        @{selectedUser.userName || 'user' + selectedUser.userId} • Status: <span className="text-emerald-400 font-bold">{selectedUser.status || 'Active'}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Preset Buttons */}
                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleSelectAll}
                                    className="border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs rounded-lg"
                                >
                                    ⚡ Select All (Super-Access)
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleSelectModeratorOnly}
                                    className="border-sky-500/40 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 text-xs rounded-lg"
                                >
                                    🛡️ Moderator Preset
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleSelectGhostOnly}
                                    className="border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 text-xs rounded-lg"
                                >
                                    👻 Ghost Preset
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleClearAll}
                                    className="text-slate-400 hover:text-white text-xs"
                                >
                                    Clear Checkboxes
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-center">
                            <SlidersHorizontal className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                            <p className="text-sm font-bold text-slate-300">No User ID Selected Yet</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Search an ID in the bar above or click &quot;Edit Powers&quot; on any user in the table below to configure their checkboxes.
                            </p>
                        </div>
                    )}

                    {/* Checkboxes Power Matrix Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {POWER_DEFINITIONS.map(def => {
                            const isChecked = Boolean(currentPowers[def.key]);
                            const IconComponent = def.icon;

                            return (
                                <div
                                    key={def.key}
                                    onClick={() => togglePower(def.key)}
                                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative select-none ${
                                        isChecked
                                            ? `${def.color} shadow-lg shadow-black/40`
                                            : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700/80 text-slate-400 opacity-70 hover:opacity-100'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`p-2 rounded-xl ${isChecked ? 'bg-white/10' : 'bg-slate-900 border border-slate-800'}`}>
                                                <IconComponent className={`h-5 w-5 ${isChecked ? 'text-white' : 'text-slate-500'}`} />
                                            </div>
                                            <div>
                                                <h4 className={`text-sm font-black ${isChecked ? 'text-white' : 'text-slate-300'}`}>
                                                    {def.title}
                                                </h4>
                                                <p className="text-[11px] text-amber-300/80 font-medium">{def.hindi}</p>
                                            </div>
                                        </div>

                                        {/* Checkbox Icon */}
                                        <div className="mt-0.5">
                                            {isChecked ? (
                                                <CheckSquare className="h-5 w-5 text-emerald-400" />
                                            ) : (
                                                <Square className="h-5 w-5 text-slate-600" />
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                                        {def.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                        <div className="text-xs text-slate-400">
                            {Object.values(currentPowers).filter(Boolean).length} of {POWER_DEFINITIONS.length} powers active for selected user.
                        </div>

                        <Button
                            onClick={handleSavePowers}
                            disabled={saving || !selectedUser}
                            className="bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black px-8 py-2.5 rounded-xl shadow-lg shadow-emerald-950/50"
                        >
                            {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                            Save & Apply Powers to ID #{selectedUser?.userId || '...'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Currently Empowered IDs Table */}
            <Card className="bg-slate-900/60 border-slate-800 shadow-xl backdrop-blur-xl">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-lg font-black text-white flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                                Active Empowered IDs List (अधिकार प्राप्त आईडी सूची)
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                All user IDs who currently hold special moderation, room ban, ghost entry, or global manager permissions.
                            </CardDescription>
                        </div>

                        <div className="max-w-xs w-full">
                            <Input
                                placeholder="Filter table by ID or Name..."
                                value={tableFilter}
                                onChange={(e) => setTableFilter(e.target.value)}
                                className="bg-slate-950/80 border-slate-800 text-xs rounded-xl"
                            />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-800/80 bg-slate-950/50 hover:bg-slate-950/50">
                                <TableHead className="text-slate-400 font-bold">User / ID</TableHead>
                                <TableHead className="text-slate-400 font-bold">Role</TableHead>
                                <TableHead className="text-slate-400 font-bold">Active Checkbox Powers</TableHead>
                                <TableHead className="text-slate-400 font-bold text-center">Ghost Mode</TableHead>
                                <TableHead className="text-slate-400 font-bold text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                                        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-slate-600" />
                                        Loading empowered IDs...
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                                        <ShieldCheck className="h-10 w-10 mx-auto mb-2 text-slate-700 opacity-50" />
                                        No empowered IDs found. Search a User ID above to grant powers.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map(user => {
                                    const powers = user.officialPowers || DEFAULT_POWERS;
                                    const activePowerCount = Object.values(powers).filter(Boolean).length;

                                    return (
                                        <TableRow key={user.userId} className="border-slate-800/60 hover:bg-slate-800/30">
                                            {/* User Info */}
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={user.image || 'https://api.yaroapp.in/uploads/avatars/female_default.webp'}
                                                        alt={user.name}
                                                        className="h-10 w-10 rounded-xl object-cover border border-slate-700"
                                                    />
                                                    <div>
                                                        <p className="font-bold text-white text-sm">{user.name}</p>
                                                        <p className="text-xs font-mono text-amber-400">ID: {user.userId}</p>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Role */}
                                            <TableCell>
                                                <Badge variant="outline" className="border-slate-700 bg-slate-800/80 text-slate-300 font-mono text-[11px]">
                                                    {user.role}
                                                </Badge>
                                            </TableCell>

                                            {/* Active Powers Badges */}
                                            <TableCell>
                                                <div className="flex flex-wrap items-center gap-1.5 max-w-lg">
                                                    {powers.canBanRoom && (
                                                        <Badge variant="outline" className="bg-red-500/15 text-red-300 border-red-500/30 text-[10px] font-bold">
                                                            🚫 Ban Room
                                                        </Badge>
                                                    )}
                                                    {powers.canBanUser && (
                                                        <Badge variant="outline" className="bg-orange-500/15 text-orange-300 border-orange-500/30 text-[10px] font-bold">
                                                            🔨 Ban User
                                                        </Badge>
                                                    )}
                                                    {powers.canGhostEntry && (
                                                        <Badge variant="outline" className="bg-purple-500/15 text-purple-300 border-purple-500/30 text-[10px] font-bold">
                                                            👻 Ghost Entry
                                                        </Badge>
                                                    )}
                                                    {powers.canKickAnyUser && (
                                                        <Badge variant="outline" className="bg-amber-500/15 text-amber-300 border-amber-500/30 text-[10px] font-bold">
                                                            👢 Kick
                                                        </Badge>
                                                    )}
                                                    {powers.canMuteAnyUser && (
                                                        <Badge variant="outline" className="bg-sky-500/15 text-sky-300 border-sky-500/30 text-[10px] font-bold">
                                                            🔇 Mute
                                                        </Badge>
                                                    )}
                                                    {powers.canLockAnySeat && (
                                                        <Badge variant="outline" className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-[10px] font-bold">
                                                            🔒 Lock Seat
                                                        </Badge>
                                                    )}
                                                    {powers.isGlobalRoomManager && (
                                                        <Badge variant="outline" className="bg-yellow-500/15 text-yellow-300 border-yellow-500/30 text-[10px] font-bold">
                                                            👑 Global Master
                                                        </Badge>
                                                    )}
                                                    {activePowerCount === 0 && (
                                                        <span className="text-xs text-slate-500 italic">No specific powers active</span>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Ghost Status */}
                                            <TableCell className="text-center">
                                                {powers.canGhostEntry ? (
                                                    <span className="inline-flex items-center gap-1 text-xs text-purple-400 font-bold bg-purple-950/40 px-2.5 py-1 rounded-full border border-purple-500/30">
                                                        <EyeOff className="h-3 w-3" /> Invisible
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-500">Normal</span>
                                                )}
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleEditFromTable(user)}
                                                        className="h-8 px-3 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-950/30 rounded-lg"
                                                    >
                                                        Edit Powers
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleRevokePowers(user.userId, user.name)}
                                                        className="h-8 px-2.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg"
                                                        title="Revoke All Powers"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
