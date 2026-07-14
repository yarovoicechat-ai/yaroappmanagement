'use client';

import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
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
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/Dialog";
import { Shield, ShieldAlert, UserPlus, Lock, Unlock, Search, RefreshCw, Eye, EyeOff } from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';

export default function AdminsPage() {
    const [admins, setAdmins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Create Dialog
    const [createOpen, setCreateOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        meethiId: '',
        phoneNumber: '',
    });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(API_ENDPOINTS.ADMIN.LIST_ADMINS);
            if (response.success && response.data) {
                setAdmins(response.data as any[]);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch admins');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!formData.name || !formData.email || !formData.password || !formData.meethiId) {
            toast.error("Please fill all required fields");
            return;
        }

        try {
            const response = await apiClient.post(API_ENDPOINTS.ADMIN.CREATE_ADMIN, formData);
            if (response.success) {
                toast.success("Agency Admin created successfully");
                setCreateOpen(false);
                setFormData({ name: '', email: '', password: '', meethiId: '', phoneNumber: '' });
                fetchAdmins();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to create admin');
        }
    };

    const handleToggleBlock = async (adminId: string, currentStatus: boolean) => {
        try {
            const response = await apiClient.patch(API_ENDPOINTS.ADMIN.BLOCK_ADMIN(adminId));
            if (response.success) {
                toast.success(`Admin ${currentStatus ? 'Unblocked' : 'Blocked'} successfully`);
                fetchAdmins();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update status');
        }
    };

    const filteredAdmins = admins.filter(a =>
        a.name?.toLowerCase().includes(search.toLowerCase()) ||
        a.email?.toLowerCase().includes(search.toLowerCase()) ||
        a.meethiId?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-200 to-blue-400 bg-clip-text text-transparent">Manage Admins</h2>
                    <p className="text-slate-400 mt-1">Create and manage Agency Administrators.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={fetchAdmins} variant="outline" size="sm">
                        <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                    </Button>
                    <Button onClick={() => setCreateOpen(true)} className="bg-blue-600 hover:bg-blue-500">
                        <UserPlus className="mr-2 h-4 w-4" /> New Agency
                    </Button>
                </div>
            </div>

            <Card glass>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-slate-200">Registered Agencies</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Search agency..."
                                className="pl-8 bg-slate-800/50 border-slate-700/50 text-slate-200"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-10 text-slate-500 animate-pulse">Loading admins...</div>
                    ) : (
                        <div className="rounded-md border border-slate-800 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-900/50">
                                    <TableRow className="hover:bg-transparent border-slate-800">
                                        <TableHead className="text-slate-400">Name</TableHead>
                                        <TableHead className="text-slate-400">Meethi ID</TableHead>
                                        <TableHead className="text-slate-400">Contact</TableHead>
                                        <TableHead className="text-slate-400">Status</TableHead>
                                        <TableHead className="text-right text-slate-400">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAdmins.map((admin) => (
                                        <TableRow key={admin._id} className="border-slate-800 hover:bg-slate-800/30 transition-colors">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 bg-slate-800 rounded-full flex items-center justify-center text-slate-300 font-bold border border-slate-700">
                                                        {admin.name?.[0] || 'A'}
                                                    </div>
                                                    <div className="font-medium text-slate-200">{admin.name}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-blue-400 border-blue-900 bg-blue-900/10">
                                                    @{admin.meethiId}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-slate-300">{admin.email}</div>
                                                <div className="text-xs text-slate-500">{admin.phoneNumber}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={admin.isBlocked ? 'destructive' : 'success'}>
                                                    {admin.isBlocked ? 'Blocked' : 'Active'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    variant={admin.isBlocked ? "outline" : "destructive"}
                                                    className="h-8"
                                                    onClick={() => handleToggleBlock(admin._id, admin.isBlocked)}
                                                >
                                                    {admin.isBlocked ? <Unlock className="h-4 w-4 mr-1" /> : <Lock className="h-4 w-4 mr-1" />}
                                                    {admin.isBlocked ? 'Unblock' : 'Block'}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredAdmins.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                                No agencies found. Create one.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Admin Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Agency Admin</DialogTitle>
                        <DialogDescription>
                            Create a new admin account to manage hosts.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Full Name*</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Meethi ID (Agency ID)*</Label>
                                <Input
                                    value={formData.meethiId}
                                    placeholder="unique_id"
                                    onChange={(e) => setFormData({ ...formData, meethiId: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Email Address*</Label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Password*</Label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                        <Button className="bg-blue-600 hover:bg-blue-500" onClick={handleCreate}>Create Agency</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
