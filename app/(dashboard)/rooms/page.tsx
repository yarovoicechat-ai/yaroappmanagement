'use client';

import { useState, useEffect } from 'react';
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
import { getAdminAvatar } from '@/lib/avatar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/Dialog";
import { Radio, Lock, Unlock, ShieldAlert, VolumeX, Trash2, Search, Users, Shield, Pin, PinOff, Star, Crown, EyeOff, Sparkles, CheckCircle2, UserCheck, RefreshCw } from "lucide-react";
import { toast } from 'sonner';
import { Pagination } from "@/components/ui/Pagination";
import { apiClient } from '@/lib/apiClient';

export default function RoomsPage() {
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
    const [isActionOpen, setIsActionOpen] = useState(false);
    const [targetUserId, setTargetUserId] = useState('');
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [pinningRoom, setPinningRoom] = useState<any | null>(null);
    const [pinOrder, setPinOrder] = useState<number>(1);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 10
    });

    const [globalManagers, setGlobalManagers] = useState<any[]>([]);
    const [newManagerId, setNewManagerId] = useState('');
    const [loadingManagers, setLoadingManagers] = useState(false);

    useEffect(() => {
        fetchRooms(pagination.currentPage);
        fetchGlobalManagers();
    }, [pagination.currentPage]);

    const fetchGlobalManagers = async () => {
        try {
            setLoadingManagers(true);
            const res = await apiClient.get<any>('/api/admin/room-managers');
            if (res.success && res.data) {
                setGlobalManagers(Array.isArray(res.data) ? res.data : []);
            }
        } catch (err: any) {
            console.warn('Could not load global room managers:', err);
        } finally {
            setLoadingManagers(false);
        }
    };

    const handleGrantManager = async (e: React.FormEvent) => {
        e.preventDefault();
        const id = newManagerId.trim();
        if (!/^\d+$/.test(id)) {
            toast.error('Enter a valid numeric user ID (e.g. 1000000002)');
            return;
        }
        try {
            setLoadingManagers(true);
            const res = await apiClient.post('/api/admin/room-managers', { userId: id });
            if (!res.success) throw new Error(res.message || 'Failed to grant official room access');
            toast.success(`Official Room Controller access granted to User ID ${id}!`);
            setNewManagerId('');
            fetchGlobalManagers();
        } catch (err: any) {
            toast.error(err.message || 'Failed to grant access');
        } finally {
            setLoadingManagers(false);
        }
    };

    const handleRevokeManager = async (userId: number) => {
        if (!confirm(`Are you sure you want to revoke Official Controller status from User ID ${userId}?`)) return;
        try {
            setLoadingManagers(true);
            const res = await apiClient.delete(`/api/admin/room-managers/${userId}`);
            if (!res.success) throw new Error(res.message || 'Failed to revoke access');
            toast.success(`Official Room Controller status revoked from ID ${userId}`);
            fetchGlobalManagers();
        } catch (err: any) {
            toast.error(err.message || 'Failed to revoke access');
        } finally {
            setLoadingManagers(false);
        }
    };

    const fetchRooms = async (page: number) => {
        try {
            setLoading(true);
            const response = await apiClient.get('/api/admin/rooms', { page, limit: pagination.limit, search });
            if (response.success && response.data) {
                setRooms(response.data.rooms || []);
                setPagination({
                    currentPage: response.data.page,
                    totalPages: response.data.totalPages,
                    totalCount: response.data.total,
                    limit: response.data.limit
                });
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch rooms');
        } finally {
            setLoading(false);
        }
    };

    const handleLockToggle = async (roomId: string) => {
        try {
            const response = await apiClient.patch(`/api/admin/rooms/${roomId}/lock`);
            if (response.success) {
                toast.success(response.message);
                fetchRooms(pagination.currentPage);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to lock/unlock room');
        }
    };

    const handleDeleteRoom = async (roomId: string) => {
        if (!confirm('Are you sure you want to close this room?')) return;
        try {
            const response = await apiClient.delete(`/api/admin/rooms/${roomId}`);
            if (response.success) {
                toast.success('Room closed successfully');
                fetchRooms(pagination.currentPage);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to close room');
        }
    };

    const openPinModal = (room: any) => {
        setPinningRoom(room);
        setPinOrder(room.pinnedOrder || 1);
        setIsPinModalOpen(true);
    };

    const handleSavePin = async (isPinned: boolean) => {
        if (!pinningRoom) return;
        try {
            const response = await apiClient.patch(`/api/admin/rooms/${pinningRoom._id}/pin`, {
                isPinned,
                pinnedOrder: Number(pinOrder) || 1,
            });
            if (response.success) {
                toast.success(response.message || `Room '${pinningRoom.title}' ${isPinned ? 'pinned to top' : 'unpinned'}`);
                setIsPinModalOpen(false);
                setPinningRoom(null);
                fetchRooms(pagination.currentPage);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update pin on room');
        }
    };

    const handleRoomAction = async (actionType: 'kick' | 'mute') => {
        if (!selectedRoom || !targetUserId) return;
        try {
            const endpoint = `/api/admin/rooms/${selectedRoom._id}/${actionType}`;
            const response = await apiClient.post(endpoint, { userId: parseInt(targetUserId) });
            if (response.success) {
                toast.success(`User ${actionType}ed successfully`);
                setIsActionOpen(false);
                setTargetUserId('');
                setSelectedRoom(null);
            }
        } catch (error: any) {
            toast.error(error.message || `Failed to perform ${actionType}`);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Live Rooms</h2>
                    <p className="text-muted-foreground mt-1 font-medium">Moderate and manage active audio channels & pin official rooms</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20 text-sm font-semibold">
                    <ActivityIcon className="h-4 w-4 animate-pulse" />
                    <span>{pagination.totalCount} rooms</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search rooms..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                        onKeyDown={(e) => e.key === 'Enter' && fetchRooms(1)}
                    />
                </div>
                <Button onClick={() => fetchRooms(1)} className="font-semibold">Search</Button>
            </div>

            <Card className="glass-card">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-bold text-slate-300">Room Details</TableHead>
                                <TableHead className="font-bold text-slate-300">Category</TableHead>
                                <TableHead className="font-bold text-slate-300">Host (Owner)</TableHead>
                                <TableHead className="font-bold text-slate-300">Channel Key</TableHead>
                                <TableHead className="font-bold text-slate-300">Pin State</TableHead>
                                <TableHead className="font-bold text-slate-300">Status</TableHead>
                                <TableHead className="text-right font-bold text-slate-300">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-slate-400">Loading rooms...</TableCell>
                                </TableRow>
                            ) : rooms.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-slate-400">No active rooms found</TableCell>
                                </TableRow>
                            ) : (
                                rooms.map((room) => (
                                    <TableRow key={room._id} className="hover:bg-muted/30">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${room.isPinned ? 'bg-amber-500/20 text-amber-400' : 'bg-primary/10 text-primary'}`}>
                                                    <Radio size={20} className="animate-pulse" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <p className="font-bold text-slate-200">{room.title}</p>
                                                        {room.isPinned && (
                                                            <Pin size={13} className="text-amber-400 fill-amber-400" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground font-medium">Created: {new Date(room.createdAt).toLocaleTimeString()}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-semibold text-slate-300">{room.category}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center font-bold text-xs">
                                                    <img src={getAdminAvatar(room.ownerId)} alt={room.ownerId?.name} className="h-full w-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-200">{room.ownerId?.name || 'Unknown'}</p>
                                                    <p className="text-xs text-muted-foreground font-medium">ID: {room.ownerId?.userId}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-muted-foreground">{room.channelName}</TableCell>
                                        <TableCell>
                                            {room.isPinned ? (
                                                <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 w-fit font-bold">
                                                    <Pin size={12} className="fill-amber-400" />
                                                    <span>Pinned #{room.pinnedOrder || 1}</span>
                                                </Badge>
                                            ) : (
                                                <span className="text-xs text-muted-foreground font-medium">Standard</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={room.isLocked ? "destructive" : "secondary"} className="font-semibold">
                                                {room.isLocked ? 'Locked' : 'Open'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant={room.isPinned ? "default" : "outline"}
                                                    className={room.isPinned ? "bg-amber-500 hover:bg-amber-600 text-black font-bold" : "hover:border-amber-500/50 hover:text-amber-400"}
                                                    onClick={() => openPinModal(room)}
                                                    title={room.isPinned ? `Pinned #${room.pinnedOrder || 1}. Click to edit or unpin` : "Pin Room to Top"}
                                                >
                                                    <Pin size={16} className={room.isPinned ? "fill-black" : ""} />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleLockToggle(room._id)}
                                                    title={room.isLocked ? "Unlock room" : "Lock room"}
                                                >
                                                    {room.isLocked ? <Unlock size={16} /> : <Lock size={16} />}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedRoom(room);
                                                        setIsActionOpen(true);
                                                    }}
                                                    title="Moderate User"
                                                >
                                                    <Shield size={16} />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDeleteRoom(room._id)}
                                                    title="Close room"
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

            <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={(page) => setPagination(p => ({ ...p, currentPage: page }))}
            />

            {/* Global Room Managers (Official Room Controllers) Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                <Card className="lg:col-span-2 bg-slate-900/60 border-white/10 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/5">
                        <div>
                            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                                <Crown className="w-5 h-5 text-amber-400" />
                                Official Global Room Controllers ({globalManagers.length})
                            </CardTitle>
                            <p className="text-xs text-slate-400 mt-1">
                                Designated app IDs authorized to manage, edit, and moderate ANY room as full Owner across the entire platform.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchGlobalManagers}
                            disabled={loadingManagers}
                            className="bg-slate-800/60 border-white/10 text-white text-xs"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loadingManagers ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-950/40">
                                <TableRow className="border-white/5">
                                    <TableHead className="text-slate-400 text-xs">Official User ID</TableHead>
                                    <TableHead className="text-slate-400 text-xs">Name / Username</TableHead>
                                    <TableHead className="text-slate-400 text-xs">Special Powers</TableHead>
                                    <TableHead className="text-right text-slate-400 text-xs">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {globalManagers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-10 text-slate-500 text-xs">
                                            No Global Room Managers configured yet. Grant access using the form on the right.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    globalManagers.map((mgr) => (
                                        <TableRow key={mgr.userId} className="border-white/5 hover:bg-white/[0.02]">
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-xs text-amber-400 font-mono">
                                                        👑
                                                    </div>
                                                    <div>
                                                        <span className="font-mono font-bold text-amber-300 text-sm">
                                                            {mgr.userId}
                                                        </span>
                                                        <span className="ml-2 text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold uppercase">
                                                            CONTROLLER
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs font-semibold text-white">{mgr.name || 'User'}</div>
                                                <div className="text-[10px] text-slate-400 font-mono">@{mgr.userName || mgr.userId}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1 text-[10px]">
                                                    <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                                                        Room Edit ✏️
                                                    </span>
                                                    <span className="bg-red-500/10 text-red-300 border border-red-500/20 px-2 py-0.5 rounded-full font-medium">
                                                        Room Ban 🚫
                                                    </span>
                                                    <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-full font-medium">
                                                        Stealth Mode 👻
                                                    </span>
                                                    <span className="bg-sky-500/10 text-sky-300 border border-sky-500/20 px-2 py-0.5 rounded-full font-medium">
                                                        Immunity 🛡️
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleRevokeManager(mgr.userId)}
                                                    className="h-7 text-xs bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/30"
                                                >
                                                    Revoke Power
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Quick Grant Form */}
                <Card className="bg-slate-900/60 border-white/10 rounded-2xl">
                    <CardHeader className="border-b border-white/5 pb-4">
                        <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                            <UserCheck className="w-5 h-5 text-amber-400" />
                            Grant Global Controller Power
                        </CardTitle>
                        <p className="text-xs text-slate-400">
                            Give an authorized user numeric ID the ability to manage and edit any voice room as owner.
                        </p>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleGrantManager} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-300 block mb-1">
                                    Target App User Numeric ID
                                </label>
                                <Input
                                    placeholder="e.g. 1000000002"
                                    value={newManagerId}
                                    onChange={(e) => setNewManagerId(e.target.value)}
                                    className="bg-slate-800 border-white/10 text-xs font-mono"
                                    required
                                />
                            </div>

                            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 text-[11px] space-y-2 text-slate-300">
                                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Active Powers Granted:
                                </div>
                                <ul className="space-y-1 list-disc list-inside text-slate-400">
                                    <li><strong className="text-slate-200">Full Room Edit:</strong> Title, About, Cover, Seats (8/9/12/16), Mode, PIN, Themes, Seat Skins.</li>
                                    <li><strong className="text-slate-200">Room Ban & Terminate:</strong> Direct power to ban abusive rooms from room tools.</li>
                                    <li><strong className="text-slate-200">Stealth / Ghost Join:</strong> Enter rooms invisibly with zero broadcast.</li>
                                    <li><strong className="text-slate-200">Anti-Kick Immunity:</strong> Regular hosts cannot kick, mute, or ban this ID.</li>
                                </ul>
                            </div>

                            <Button
                                type="submit"
                                disabled={loadingManagers || !newManagerId.trim()}
                                className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold hover:brightness-110 shadow-lg shadow-amber-500/20 text-xs h-10"
                            >
                                <Crown className="w-4 h-4 mr-1.5" />
                                Grant Official Controller Access
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Moderation dialog */}
            <Dialog open={isActionOpen} onOpenChange={setIsActionOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Moderate User inside Room</DialogTitle>
                        <DialogDescription>
                            Kick or mute a user inside the active channel `{selectedRoom?.title}`.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Target User System ID</label>
                            <Input
                                placeholder="Enter User ID (e.g. 10002)"
                                value={targetUserId}
                                onChange={(e) => setTargetUserId(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => handleRoomAction('mute')}
                            className="flex items-center gap-2 font-semibold"
                            disabled={!targetUserId}
                        >
                            <VolumeX size={16} />
                            Mute User
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => handleRoomAction('kick')}
                            className="flex items-center gap-2 font-semibold"
                            disabled={!targetUserId}
                        >
                            <ShieldAlert size={16} />
                            Kick User
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Pin Room Dialog */}
            <Dialog open={isPinModalOpen} onOpenChange={setIsPinModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-slate-100">
                            <Pin className="h-5 w-5 text-amber-400 fill-amber-400" />
                            <span>Pin Room to Top of App</span>
                        </DialogTitle>
                        <DialogDescription>
                            Pinned rooms always stay at the very top of the mobile app live rooms list (even with 0 users). Select priority order (1 is topmost).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-3">
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-300">
                            <p className="font-bold text-base text-amber-200">{pinningRoom?.title}</p>
                            <p className="text-xs text-amber-300/70 font-mono mt-0.5">Channel: {pinningRoom?.channelName}</p>
                            {pinningRoom?.isPinned && (
                                <p className="text-xs text-emerald-400 font-semibold mt-1">Currently Pinned as #{pinningRoom.pinnedOrder || 1}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Priority Order (1 = Topmost / Priority #1)</label>
                            <div className="grid grid-cols-5 gap-2">
                                {[1, 2, 3, 4, 5].map((order) => (
                                    <button
                                        key={order}
                                        type="button"
                                        onClick={() => setPinOrder(order)}
                                        className={`py-2 text-sm font-bold rounded-lg border transition-all ${
                                            pinOrder === order
                                                ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/25'
                                                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                                        }`}
                                    >
                                        #{order}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-slate-400 font-medium">Custom Priority:</span>
                                <Input
                                    type="number"
                                    min="1"
                                    max="99"
                                    value={pinOrder}
                                    onChange={(e) => setPinOrder(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-24 text-center font-bold"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:justify-between">
                        {pinningRoom?.isPinned ? (
                            <Button
                                variant="outline"
                                onClick={() => handleSavePin(false)}
                                className="border-red-500/40 text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                            >
                                <PinOff size={16} />
                                Unpin Room
                            </Button>
                        ) : (
                            <div />
                        )}
                        <Button
                            onClick={() => handleSavePin(true)}
                            className="bg-amber-500 hover:bg-amber-600 text-black font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20"
                        >
                            <Pin size={16} className="fill-black" />
                            {pinningRoom?.isPinned ? 'Update Priority' : 'Pin to Top'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function ActivityIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    );
}
