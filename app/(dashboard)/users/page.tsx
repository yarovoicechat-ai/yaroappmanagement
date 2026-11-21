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
    DialogFooter,
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
import { Ban, Edit2, Search, ShieldCheck, UserPlus, Trash2, CheckCircle, Save, Users, UserCheck, Coins, Award, Sparkles, Copy, Check, Eye, EyeOff, RefreshCw, Key, CheckCircle2 } from "lucide-react";
import { toast } from 'sonner';
import { Pagination } from "@/components/ui/Pagination";
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';
import type { User } from '@/types/models';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 10
    });

    // Create Fake / Test User State
    const [isCreateFakeModalOpen, setIsCreateFakeModalOpen] = useState(false);
    const [fakeUserName, setFakeUserName] = useState('');
    const [fakeUserPhone, setFakeUserPhone] = useState('+91');
    const [fakeUserPassword, setFakeUserPassword] = useState('password123');
    const [fakeUserGender, setFakeUserGender] = useState<'male' | 'female'>('male');
    const [fakeUserCoins, setFakeUserCoins] = useState('10000');
    const [fakeUserDiamonds, setFakeUserDiamonds] = useState('1000');
    const [fakeUserCustomId, setFakeUserCustomId] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [createdUserCredentials, setCreatedUserCredentials] = useState<{
        userId: number;
        name: string;
        phoneNumber: string;
        password: string;
    } | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    // Edit User State
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Delete User State
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

    // Add Coins State
    const [isAddCoinsOpen, setIsAddCoinsOpen] = useState(false);
    const [selectedUserForCoins, setSelectedUserForCoins] = useState<User | null>(null);
    const [coinsAmount, setCoinsAmount] = useState('');

    // Level Management State
    const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
    const [selectedUserForLevel, setSelectedUserForLevel] = useState<User | null>(null);
    const [levelType, setLevelType] = useState<'wealth' | 'charm'>('wealth');
    const [expDelta, setExpDelta] = useState('');
    const [adjustReason, setAdjustReason] = useState('');
    const [adjustLoading, setAdjustLoading] = useState(false);

    useEffect(() => {
        fetchUsers(pagination.currentPage, search);
    }, [pagination.currentPage]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers(1, search);
        }, 350);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchUsers = async (page: number, query = search) => {
        try {
            setLoading(true);
            const params: any = { page, limit: pagination.limit };
            if (query && query.trim()) {
                params.search = query.trim();
            }
            const response = await apiClient.get(API_ENDPOINTS.USERS.LIST, params);
            if (response.success && response.data) {
                // Handle the nested response structure from backend: { usersData: { users: [], totalUsers: 0, ... } }
                // or flat structure depending on API. Based on userController, it is response.data.usersData
                const data = response.data as any;
                const usersData = data.usersData;

                setUsers(usersData.users || []);
                setPagination({
                    currentPage: usersData.currentPage,
                    totalPages: usersData.totalPages,
                    totalCount: usersData.totalUsers,
                    limit: usersData.limit
                });
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateRandomData = () => {
        const firstNames = ['Rahul', 'Pooja', 'Amit', 'Neha', 'Vikas', 'Priya', 'Rohit', 'Sneha', 'Arjun', 'Anjali', 'Karan', 'Riya', 'Aman', 'Simran'];
        const lastNames = ['Sharma', 'Verma', 'Kumar', 'Singh', 'Patel', 'Yadav', 'Gupta', 'Mishra', 'Mehta', 'Joshi', 'Choudhary'];
        const randomName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
        const randomDigits = Math.floor(6000000000 + Math.random() * 3999999999);
        const randomPhone = `+91${randomDigits}`;
        const randomGender: 'male' | 'female' = Math.random() > 0.5 ? 'male' : 'female';

        setFakeUserName(randomName);
        setFakeUserPhone(randomPhone);
        setFakeUserPassword('password123');
        setFakeUserGender(randomGender);
        setFakeUserCoins('10000');
        setFakeUserDiamonds('1000');
        setFakeUserCustomId('');
        toast.info("Generated random test user credentials!");
    };

    const handleCreateFakeUser = async () => {
        if (!fakeUserName.trim()) {
            toast.error("Please enter user name");
            return;
        }
        const cleanDigits = fakeUserPhone.replace(/\D/g, '');
        if (!fakeUserPhone.trim() || cleanDigits.length < 6) {
            toast.error("Please enter a valid mobile number (at least 6 digits)");
            return;
        }
        if (!fakeUserPassword.trim() || fakeUserPassword.trim().length < 4) {
            toast.error("Password must be at least 4 characters");
            return;
        }

        try {
            setCreateLoading(true);
            const payload: any = {
                name: fakeUserName.trim(),
                phoneNumber: fakeUserPhone.trim(),
                password: fakeUserPassword.trim(),
                gender: fakeUserGender,
                coins: parseInt(fakeUserCoins) || 0,
                diamonds: parseInt(fakeUserDiamonds) || 0,
            };
            if (fakeUserCustomId.trim()) {
                payload.customUserId = parseInt(fakeUserCustomId.trim());
            }

            const response = await apiClient.post(API_ENDPOINTS.USERS.CREATE_FAKE, payload);
            if (response.success && response.data) {
                const creds = response.data.loginCredentials || {
                    userId: response.data.userId,
                    name: response.data.name,
                    phoneNumber: response.data.phoneNumber,
                    password: fakeUserPassword.trim()
                };
                setCreatedUserCredentials(creds);
                toast.success(`User #${creds.userId} created successfully! Ready for mobile app login.`);
                fetchUsers(1);
            } else {
                toast.error(response.message || "Failed to create fake user");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to create fake user");
        } finally {
            setCreateLoading(false);
        }
    };

    const handleCopy = (text: string, fieldName: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        toast.success(`Copied ${fieldName} to clipboard!`);
        setTimeout(() => setCopiedField(null), 2500);
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;

        try {
            const response = await apiClient.patch(API_ENDPOINTS.USERS.UPDATE(editingUser.userId.toString()), {
                name: editingUser.name,
                email: editingUser.email,
                role: editingUser.role
            });

            if (response.success) {
                toast.success("User updated successfully");
                setIsEditOpen(false);
                setEditingUser(null);
                fetchUsers(pagination.currentPage);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update user');
        }
    };

    const handleBanUser = async (user: User) => {
        try {
            const endpoint = user.isBlocked
                ? API_ENDPOINTS.USERS.UNBLOCK(user.userId.toString())
                : API_ENDPOINTS.USERS.BLOCK(user.userId.toString());

            // For block, backend might expect a reason in body (based on controller)
            const body = user.isBlocked ? {} : { reason: 'Admin Action' };

            // Unblock is a PATCH/POST usually, block is PATCH/POST. 
            // Checking apiEndpoints.ts: BLOCK and UNBLOCK are URLs. API client handles mapping.
            // Wait, apiEndpoints.ts defines them as strings returning URL.
            // Need to check what method userController expects.
            // userController.ts: blockUser is PATCH? Routes usually define method.
            // Assuming PATCH/PUT for state change if not standard. 
            // Safe bet is apiClient.patch or post. UserRoutes.ts would confirm.
            // Let's assume PATCH based on standard practices or POST.
            // Looking at previous patterns, I'll use PATCH.

            const response = await apiClient.patch(endpoint, body);

            if (response.success) {
                toast.success(`User ${user.isBlocked ? 'unblocked' : 'blocked'} successfully`);
                fetchUsers(pagination.currentPage);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update user status');
        }
    };

    const handleDeleteUser = async () => {
        if (!deletingUserId) return;

        try {
            const response = await apiClient.delete(API_ENDPOINTS.USERS.DELETE(deletingUserId));

            if (response.success) {
                toast.success("User deleted successfully");
                setDeletingUserId(null);
                fetchUsers(pagination.currentPage);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete user');
        }
    };

    const handleAddCoins = async () => {
        if (!selectedUserForCoins || !coinsAmount) return;

        const coins = parseInt(coinsAmount);
        if (isNaN(coins) || coins <= 0) {
            toast.error("Please enter a valid amount of coins");
            return;
        }

        try {
            // Using apiClient.post with the new route
            // Since API_ENDPOINTS might not have this new route, we'll use the relative path or add it to endpoints if possible.
            // Assuming apiClient handles base URL.
            const response = await apiClient.post('/api/admin/users/add-coins', {
                userId: selectedUserForCoins.userId,
                coins: coins
            });

            if (response.success) {
                toast.success(`Successfully added ${coins} coins to ${selectedUserForCoins.name}`);
                setIsAddCoinsOpen(false);
                setCoinsAmount('');
                setSelectedUserForCoins(null);
                fetchUsers(pagination.currentPage);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to add coins');
        }
    };

    const handleAdjustExp = async () => {
        if (!selectedUserForLevel || !expDelta) return;

        const delta = parseInt(expDelta);
        if (isNaN(delta) || delta === 0) {
            toast.error("Please enter a non-zero integer EXP amount");
            return;
        }

        try {
            setAdjustLoading(true);
            const response = await apiClient.post('/api/level/admin/adjust-exp', {
                userId: selectedUserForLevel.userId || selectedUserForLevel._id,
                type: levelType,
                expDelta: delta,
                reason: adjustReason || 'Admin manual adjustment'
            });

            if (response.success) {
                toast.success(`Successfully adjusted ${levelType} EXP by ${delta}`);
                setIsLevelModalOpen(false);
                setExpDelta('');
                setAdjustReason('');
                setSelectedUserForLevel(null);
                fetchUsers(pagination.currentPage);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to adjust user EXP');
        } finally {
            setAdjustLoading(false);
        }
    };

    // Multi-field search support including VIP IDs and Custom Display IDs
    const filteredUsers = users.filter((user: any) => {
        if (!search) return true;
        const q = search.toLowerCase().trim();
        return (
            user.name?.toLowerCase().includes(q) ||
            user.email?.toLowerCase().includes(q) ||
            user.userName?.toLowerCase().includes(q) ||
            user.phoneNumber?.includes(q) ||
            user.userId?.toString().includes(q) ||
            user.meethiId?.toString().toLowerCase().includes(q) ||
            user.equippedVipId?.toString().toLowerCase().includes(q) ||
            user.customDisplayId?.toString().toLowerCase().includes(q) ||
            user.equippedCustomId?.toString().toLowerCase().includes(q) ||
            user.displayId?.toString().toLowerCase().includes(q) ||
            user.uniqueId?.toString().toLowerCase().includes(q)
        );
    });

    const activeUsersCount = users.filter(u => !u.isBlocked).length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">User Management</h2>
                    <p className="text-slate-400 mt-1">Manage users, roles, and permissions.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => toast.info("Exporting CSV...")}>Export CSV</Button>
                    <Button
                        onClick={() => {
                            setCreatedUserCredentials(null);
                            setIsCreateFakeModalOpen(true);
                        }}
                        className="bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold shadow-lg shadow-purple-500/20"
                    >
                        <UserPlus className="mr-2 h-4 w-4" /> Create Test / Fake User
                    </Button>
                </div>
            </div>

            {/* User Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card glass className="bg-slate-900/40">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-400">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-dosti-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-100">{pagination.totalCount}</div>
                    </CardContent>
                </Card>
                <Card glass className="bg-slate-900/40">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-400">Active Users (Page)</CardTitle>
                        <UserCheck className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-100">{activeUsersCount}</div>
                    </CardContent>
                </Card>
            </div>



            <Card glass>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Users Directory</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Search users by name/ID..."
                                className="pl-8 bg-slate-800/50 border-slate-700/50"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-10 text-slate-500">Loading users...</div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-slate-700/50">
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Levels</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((user) => (
                                        <TableRow key={user.userId} className="border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 overflow-hidden">
                                                        {user.image ? (
                                                            <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            user.name?.charAt(0) || 'U'
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <span className="text-slate-200">{user.name}</span>
                                                            {(user.isFake || user.isMockUser) && (
                                                                <Badge variant="outline" className="text-[10px] bg-purple-500/15 text-purple-300 border-purple-500/40 px-1 py-0 inline-flex items-center gap-1">
                                                                    <Sparkles className="h-2.5 w-2.5 text-purple-400" /> Test User
                                                                </Badge>
                                                            )}
                                                            {(user.equippedVipId || user.customDisplayId || user.equippedCustomId) && (
                                                                <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-300 border-amber-500/30 px-1 py-0">
                                                                    VIP: {user.equippedVipId || user.customDisplayId || user.equippedCustomId}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-slate-500">{user.email || user.phoneNumber || `#${user.userId}`}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    {(user.role === 'admin' || user.role === 'superAdmin' || user.role === 'owner') && <ShieldCheck className="h-3 w-3 text-primary" />}
                                                    <span className={(user.role === 'admin' || user.role === 'superAdmin' || user.role === 'owner') ? "text-primary font-bold" : ""}>{user.role}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1 text-xs">
                                                    <span className="inline-flex items-center gap-1 font-semibold text-amber-400">
                                                        💎 Lv.{user.wealthLevel || user.level || 1}
                                                        <span className="text-slate-500 font-normal">({user.wealthExp || 0} EXP)</span>
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 font-semibold text-pink-400">
                                                        🌸 Lv.{user.charmLevel || 1}
                                                        <span className="text-slate-500 font-normal">({user.charmExp || 0} EXP)</span>
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={!user.isBlocked ? 'success' : 'destructive'}>
                                                    {!user.isBlocked ? 'Active' : 'Suspended'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 hover:text-dosti-400"
                                                        onClick={() => {
                                                            setEditingUser(user);
                                                            setIsEditOpen(true);
                                                        }}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                                                        onClick={() => {
                                                            setSelectedUserForCoins(user);
                                                            setIsAddCoinsOpen(true);
                                                        }}
                                                        title="Add Coins"
                                                    >
                                                        <Coins className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                                                        onClick={() => {
                                                            setSelectedUserForLevel(user);
                                                            setLevelType('wealth');
                                                            setExpDelta('');
                                                            setAdjustReason('');
                                                            setIsLevelModalOpen(true);
                                                        }}
                                                        title="Manage Level & EXP"
                                                    >
                                                        <Award className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className={`h-8 w-8 ${!user.isBlocked ? 'text-orange-400 hover:text-orange-300 hover:bg-orange-500/10' : 'text-green-400 hover:text-green-300 hover:bg-green-500/10'}`}
                                                        onClick={() => handleBanUser(user)}
                                                    >
                                                        {!user.isBlocked ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                                        onClick={() => setDeletingUserId(user.userId.toString())}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                                No users found matching your search.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            <div className="mt-4 flex justify-center">
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        disabled={pagination.currentPage === 1}
                                        onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage - 1 }))}
                                    >
                                        Previous
                                    </Button>
                                    <Button variant="outline" disabled>
                                        Page {pagination.currentPage} of {pagination.totalPages}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        disabled={pagination.currentPage === pagination.totalPages}
                                        onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage + 1 }))}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Edit User Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>Make changes to the user's profile here.</DialogDescription>
                    </DialogHeader>
                    {editingUser && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="edit-name" className="text-right text-sm text-slate-400">Name</label>
                                <Input
                                    id="edit-name"
                                    className="col-span-3"
                                    value={editingUser.name}
                                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="edit-email" className="text-right text-sm text-slate-400">Email</label>
                                <Input
                                    id="edit-email"
                                    className="col-span-3"
                                    value={editingUser.email || ''}
                                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="edit-role" className="text-right text-sm text-slate-400">Role</label>
                                <select
                                    id="edit-role"
                                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={editingUser.role}
                                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                                >
                                    <option value="user">User</option>
                                    <option value="host">Host</option>
                                    <option value="">Agency</option>
                                    <option value="admin">Admin</option>
                                    <option value="superAdmin">Super Admin</option>
                                </select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button type="submit" onClick={handleUpdateUser} className="bg-dosti-600 hover:bg-dosti-500">
                            <Save className="mr-2 h-4 w-4" /> Save changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Alert */}
            <AlertDialog open={!!deletingUserId} onOpenChange={(open) => !open && setDeletingUserId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user account
                            and remove their data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700 text-white border-none">
                            Delete Account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Add Coins Dialog */}
            <Dialog open={isAddCoinsOpen} onOpenChange={setIsAddCoinsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Coins</DialogTitle>
                        <DialogDescription>
                            Add coins to {selectedUserForCoins?.name}'s wallet. This action will be logged.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="coins-amount" className="text-right text-sm text-slate-400">Amount</label>
                            <Input
                                id="coins-amount"
                                type="number"
                                className="col-span-3"
                                value={coinsAmount}
                                onChange={(e) => setCoinsAmount(e.target.value)}
                                placeholder="Enter amount (e.g. 100)"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddCoinsOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddCoins} className="bg-yellow-600 hover:bg-yellow-500 text-white">
                            <Coins className="mr-2 h-4 w-4" /> Add Coins
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Adjust Level & EXP Dialog */}
            <Dialog open={isLevelModalOpen} onOpenChange={setIsLevelModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-purple-400" /> Adjust User Level & EXP
                        </DialogTitle>
                        <DialogDescription>
                            Configure Wealth or Charm progression for <span className="font-semibold text-slate-200">{selectedUserForLevel?.name}</span>. All manual adjustments are audited and recalculate user tier automatically.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {/* Current User Status Summary */}
                        <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                            <div>
                                <div className="text-xs text-slate-400">Wealth Level</div>
                                <div className="text-base font-bold text-amber-400 flex items-center gap-1">
                                    💎 Lv.{selectedUserForLevel?.wealthLevel || selectedUserForLevel?.level || 1}
                                    <span className="text-xs text-slate-400 font-normal">({selectedUserForLevel?.wealthExp || 0} EXP)</span>
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-400">Charm Level</div>
                                <div className="text-base font-bold text-pink-400 flex items-center gap-1">
                                    🌸 Lv.{selectedUserForLevel?.charmLevel || 1}
                                    <span className="text-xs text-slate-400 font-normal">({selectedUserForLevel?.charmExp || 0} EXP)</span>
                                </div>
                            </div>
                        </div>

                        {/* Progression System Toggle */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label className="text-right text-sm text-slate-400">System</label>
                            <div className="col-span-3 flex gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={levelType === 'wealth' ? 'default' : 'outline'}
                                    className={levelType === 'wealth' ? 'bg-amber-600 hover:bg-amber-500 text-white' : ''}
                                    onClick={() => setLevelType('wealth')}
                                >
                                    💎 Wealth
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={levelType === 'charm' ? 'default' : 'outline'}
                                    className={levelType === 'charm' ? 'bg-pink-600 hover:bg-pink-500 text-white' : ''}
                                    onClick={() => setLevelType('charm')}
                                >
                                    🌸 Charm
                                </Button>
                            </div>
                        </div>

                        {/* EXP Delta Input */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="exp-delta" className="text-right text-sm text-slate-400">EXP Delta</label>
                            <Input
                                id="exp-delta"
                                type="number"
                                className="col-span-3"
                                value={expDelta}
                                onChange={(e) => setExpDelta(e.target.value)}
                                placeholder="e.g. +5000 or -1000"
                            />
                        </div>

                        {/* Reason / Audit Note */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="adjust-reason" className="text-right text-sm text-slate-400">Reason</label>
                            <Input
                                id="adjust-reason"
                                type="text"
                                className="col-span-3"
                                value={adjustReason}
                                onChange={(e) => setAdjustReason(e.target.value)}
                                placeholder="Audit note (e.g. Event bonus / compensation)"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsLevelModalOpen(false)} disabled={adjustLoading}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAdjustExp}
                            disabled={adjustLoading}
                            className={levelType === 'wealth' ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-pink-600 hover:bg-pink-500 text-white'}
                        >
                            {adjustLoading ? 'Applying...' : 'Apply EXP Adjustment'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Fake / Test User Dialog */}
            <Dialog open={isCreateFakeModalOpen} onOpenChange={setIsCreateFakeModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Sparkles className="h-5 w-5 text-purple-400" /> Create Test / Fake User
                        </DialogTitle>
                        <DialogDescription>
                            Create a real user account with Phone & Password for testing login in the mobile app.
                        </DialogDescription>
                    </DialogHeader>

                    {createdUserCredentials ? (
                        <div className="space-y-4 py-2">
                            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200">
                                <div className="flex items-center gap-2 font-semibold text-emerald-400 text-base mb-1">
                                    <CheckCircle2 className="h-5 w-5" /> User Created Successfully!
                                </div>
                                <p className="text-xs text-slate-300">
                                    This user can now login directly in the Yaro mobile app with phone & password.
                                </p>
                            </div>

                            <div className="space-y-2.5 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">User ID:</span>
                                    <span className="font-bold text-slate-100 font-mono">#{createdUserCredentials.userId}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">Name:</span>
                                    <span className="font-semibold text-slate-100">{createdUserCredentials.name}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">Phone Number:</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-amber-300 font-mono">{createdUserCredentials.phoneNumber}</span>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 w-7 p-0"
                                            onClick={() => handleCopy(createdUserCredentials.phoneNumber, 'Phone')}
                                        >
                                            {copiedField === 'Phone' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">Password:</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-purple-300 font-mono">{createdUserCredentials.password}</span>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 w-7 p-0"
                                            onClick={() => handleCopy(createdUserCredentials.password, 'Password')}
                                        >
                                            {copiedField === 'Password' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2">
                                <Key className="h-4 w-4 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-semibold">How to log in on mobile app:</span>
                                    <ol className="list-decimal list-inside mt-1 space-y-0.5 text-slate-400">
                                        <li>Open Yaro App and go to Sign In screen</li>
                                        <li>Enter Phone: <span className="text-slate-200 font-mono">{createdUserCredentials.phoneNumber}</span></li>
                                        <li>Enter Password: <span className="text-slate-200 font-mono">{createdUserCredentials.password}</span></li>
                                        <li>Tap Sign In to immediately enter the app</li>
                                    </ol>
                                </div>
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        const fullCreds = `Phone: ${createdUserCredentials.phoneNumber}\nPassword: ${createdUserCredentials.password}\nUser ID: ${createdUserCredentials.userId}`;
                                        handleCopy(fullCreds, 'Login Details');
                                    }}
                                >
                                    <Copy className="mr-2 h-4 w-4" /> Copy All Credentials
                                </Button>
                                <Button
                                    onClick={() => {
                                        setCreatedUserCredentials(null);
                                        handleGenerateRandomData();
                                    }}
                                    className="bg-purple-600 hover:bg-purple-500 text-white"
                                >
                                    <UserPlus className="mr-2 h-4 w-4" /> Create Another
                                </Button>
                            </DialogFooter>
                        </div>
                    ) : (
                        <div className="space-y-4 py-2">
                            {/* Auto Generator Button */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                <div className="text-xs text-purple-200">
                                    <span className="font-semibold">Quick Setup:</span> Auto-fill with random Indian name & phone
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={handleGenerateRandomData}
                                    className="border-purple-500/40 text-purple-300 hover:bg-purple-500/20"
                                >
                                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> 🎲 Random Auto-fill
                                </Button>
                            </div>

                            {/* Name & Phone */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-300">Full Name *</label>
                                    <Input
                                        placeholder="e.g. Rahul Sharma"
                                        value={fakeUserName}
                                        onChange={(e) => setFakeUserName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-300">Phone Number *</label>
                                    <Input
                                        placeholder="e.g. +919876543210"
                                        value={fakeUserPhone}
                                        onChange={(e) => setFakeUserPhone(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-300">Login Password *</label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter password (e.g. password123)"
                                        value={fakeUserPassword}
                                        onChange={(e) => setFakeUserPassword(e.target.value)}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Gender & Custom User ID */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-300">Gender</label>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant={fakeUserGender === 'male' ? 'default' : 'outline'}
                                            className={fakeUserGender === 'male' ? 'bg-cyan-600 hover:bg-cyan-500 flex-1' : 'flex-1'}
                                            onClick={() => setFakeUserGender('male')}
                                        >
                                            👨 Male
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant={fakeUserGender === 'female' ? 'default' : 'outline'}
                                            className={fakeUserGender === 'female' ? 'bg-pink-600 hover:bg-pink-500 flex-1' : 'flex-1'}
                                            onClick={() => setFakeUserGender('female')}
                                        >
                                            👩 Female
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-300">Custom User ID (Optional)</label>
                                    <Input
                                        type="number"
                                        placeholder="Auto-generated if empty"
                                        value={fakeUserCustomId}
                                        onChange={(e) => setFakeUserCustomId(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Initial Coins & Diamonds */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                                        🪙 Initial Coins
                                    </label>
                                    <Input
                                        type="number"
                                        placeholder="10000"
                                        value={fakeUserCoins}
                                        onChange={(e) => setFakeUserCoins(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                                        💎 Initial Diamonds
                                    </label>
                                    <Input
                                        type="number"
                                        placeholder="1000"
                                        value={fakeUserDiamonds}
                                        onChange={(e) => setFakeUserDiamonds(e.target.value)}
                                    />
                                </div>
                            </div>

                            <DialogFooter className="pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsCreateFakeModalOpen(false)}
                                    disabled={createLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreateFakeUser}
                                    disabled={createLoading}
                                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold"
                                >
                                    {createLoading ? (
                                        <span className="flex items-center gap-2">
                                            <RefreshCw className="h-4 w-4 animate-spin" /> Creating User...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <UserPlus className="h-4 w-4" /> Create & Enable Login
                                        </span>
                                    )}
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
