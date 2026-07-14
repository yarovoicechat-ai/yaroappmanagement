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
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/Dialog";
import { CheckCircle, XCircle, Search, FileText, ExternalLink, UserPlus, Users } from "lucide-react";
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/Pagination';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';
import type { Host } from '@/types/models';

export default function HostsPage() {
    const [hosts, setHosts] = useState<Host[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [viewingDocs, setViewingDocs] = useState<Host | null>(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 10
    });
    const [globalStats, setGlobalStats] = useState({
        totalHosts: 0,
        activeHosts: 0
    });

    useEffect(() => {
        fetchHosts(pagination.currentPage);
        fetchGlobalStats();
    }, [pagination.currentPage]);

    const fetchGlobalStats = async () => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.DASHBOARD.STATS);
            if (response.success && response.data) {
                setGlobalStats({
                    totalHosts: response.data.totalHosts || 0,
                    activeHosts: response.data.activeHosts || 0
                });
            }
        } catch (error) {
            console.error("Failed to fetch global stats", error);
        }
    };

    const fetchHosts = async (page: number) => {
        try {
            setLoading(true);
            const response = await apiClient.get(API_ENDPOINTS.HOSTS.LIST, { page, limit: pagination.limit });
            if (response.success && response.data) {
                // Response structure from getHosts: { total, page, limit, data: [] }
                const data = response.data as any;
                setHosts(data.data || []);
                setPagination({
                    currentPage: data.page,
                    totalPages: Math.ceil(data.total / data.limit),
                    totalCount: data.total,
                    limit: data.limit
                });
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch hosts');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveHost = async (hostId: string) => {
        try {
            const response = await apiClient.post(API_ENDPOINTS.HOSTS.APPROVE(hostId));
            if (response.success) {
                toast.success("Host approved successfully");
                fetchHosts(pagination.currentPage);
                fetchGlobalStats(); // Refresh stats
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to approve host');
        }
    };

    const handleRejectHost = async (hostId: string) => {
        try {
            // Using Block as Reject/Delete for now as per available APIs
            const response = await apiClient.patch(API_ENDPOINTS.HOSTS.BLOCK(hostId));
            if (response.success) {
                toast.success("Host rejected/blocked successfully");
                fetchHosts(pagination.currentPage);
                fetchGlobalStats(); // Refresh stats
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to reject host');
        }
    };

    const filteredHosts = hosts.filter(host =>
        host.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        host.emailId?.toLowerCase().includes(search.toLowerCase())
    );

    // const activeHostsCount = hosts.filter(h => h.isApproved).length;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-200 to-purple-400 bg-clip-text text-transparent">Host Management</h2>
                <p className="text-slate-400 mt-1">Review host applications and verify documents.</p>
            </div>
            <div className="flex items-center gap-2">
                <Button onClick={() => toast.info("Host creation not supported via Admin API yet.")}>
                    <UserPlus className="mr-2 h-4 w-4" /> Add Host
                </Button>
            </div>

            {/* Host Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card glass className="bg-slate-900/40">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-400">Total Hosts</CardTitle>
                        <UserPlus className="h-4 w-4 text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-100">{globalStats.totalHosts}</div>
                    </CardContent>
                </Card>
                <Card glass className="bg-slate-900/40">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-400">Active Hosts</CardTitle>
                        <Users className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-100">{globalStats.activeHosts}</div>
                    </CardContent>
                </Card>
            </div>

            <Card glass>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Applications</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Search applicants..."
                                className="pl-8 bg-slate-800/50 border-slate-700/50"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <div className="flex gap-2">
                                {/* Button moved to top */}
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-10 text-slate-500">Loading hosts...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-slate-700/50">
                                    <TableHead>Applicant</TableHead>
                                    <TableHead>Applied Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Documents</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredHosts.map((host) => (
                                    <TableRow key={host.hostId} className="border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                        <TableCell className="font-medium">
                                            <div>
                                                <div className="text-slate-200">{host.fullName}</div>
                                                <div className="text-xs text-slate-500">{host.emailId}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{new Date(host.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={host.isApproved ? 'success' : 'secondary'}>
                                                {host.isApproved ? 'Approved' : 'Pending'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" onClick={() => setViewingDocs(host)} className="text-blue-400 hover:text-blue-300">
                                                <FileText className="mr-2 h-3 w-3" /> View Docs
                                            </Button>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {!host.isApproved && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-500 text-white border-none h-8"
                                                            onClick={() => handleApproveHost(host.hostId.toString())}
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            className="h-8"
                                                            onClick={() => handleRejectHost(host.hostId.toString())}
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                                {host.isApproved && (
                                                    <span className="text-xs text-slate-500 italic">Approved</span>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredHosts.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                            No hosts found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* View Docs Modal */}
            <Dialog open={!!viewingDocs} onOpenChange={(open) => !open && setViewingDocs(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Verification Documents</DialogTitle>
                        <DialogDescription>
                            Reviewing items for {viewingDocs?.fullName}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 py-4">
                        {viewingDocs && [
                            { name: 'Profile Photo', url: viewingDocs.profilePhoto },
                            { name: 'ID Proof', url: viewingDocs.idProof },
                            { name: 'Address Proof', url: viewingDocs.addressProof }
                        ].filter(d => d.url).map((doc, idx) => (
                            <div key={idx} className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700 relative group overflow-hidden">
                                <div className="text-slate-500 flex flex-col items-center">
                                    <FileText className="h-8 w-8 mb-2" />
                                    <span className="text-xs">{doc.name}</span>
                                </div>
                                {doc.url && (
                                    <>
                                        <img src={doc.url} alt={doc.name} className="absolute inset-0 w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                                <Button variant="secondary" size="sm">
                                                    <ExternalLink className="mr-2 h-4 w-4" /> Open Full
                                                </Button>
                                            </a>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                        {viewingDocs && !viewingDocs.profilePhoto && !viewingDocs.idProof && !viewingDocs.addressProof && (
                            <div className="col-span-2 py-8 text-center text-slate-500">
                                No documents uploaded.
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
