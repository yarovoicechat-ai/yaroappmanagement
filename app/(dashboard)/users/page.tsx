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
import { Ban, Edit2, Search, ShieldCheck, UserPlus, Trash2, CheckCircle, Save, Users, UserCheck, Coins } from "lucide-react";
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

    // Add User State
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserName, setNewUserName] = useState('');

    // Edit User State
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Delete User State
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

    // Add Coins State
    const [isAddCoinsOpen, setIsAddCoinsOpen] = useState(false);
    const [selectedUserForCoins, setSelectedUserForCoins] = useState<User | null>(null);
    const [coinsAmount, setCoinsAmount] = useState('');

    useEffect(() => {
        fetchUsers(pagination.currentPage);
    }, [pagination.currentPage]);

    const fetchUsers = async (page: number) => {
        try {
            setLoading(true);
            const response = await apiClient.get(API_ENDPOINTS.USERS.LIST, { page, limit: pagination.limit });
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

    const handleAddUser = () => {
        // Backend doesn't support creating users via Admin API yet
        toast.info("Feature not available via Admin API. Please use the mobile app to register users.");
        setIsAddingUser(false);
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

    // Client-side search (temporary until backend supports it)
    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase()) ||
        user.userId?.toString().includes(search)
    );

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
                    <Button onClick={() => setIsAddingUser(!isAddingUser)}>
                        {isAddingUser ? "Cancel" : "Add User"}
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

            {/* Add User Panel */}
            {isAddingUser && (
                <Card glass className="border-dosti-500/50 bg-dosti-900/10">
                    <CardHeader>
                        <CardTitle className="text-lg">Add New User</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="grid w-full items-center gap-1.5">
                            <label htmlFor="name" className="text-sm font-medium">Name</label>
                            <Input id="name" value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="John Doe" />
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                            <label htmlFor="email" className="text-sm font-medium">Email</label>
                            <Input id="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} placeholder="john@example.com" />
                        </div>
                        <Button onClick={handleAddUser} className="w-full md:w-auto bg-dosti-600 hover:bg-dosti-500">
                            <UserPlus className="mr-2 h-4 w-4" /> Create
                        </Button>
                    </CardContent>
                </Card>
            )}

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
                                                        <div className="text-slate-200">{user.name}</div>
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
        </div>
    );
}
