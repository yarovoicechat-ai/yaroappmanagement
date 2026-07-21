'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import { UserX, CheckCircle, XCircle } from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

export default function DeletionsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/api/admin/deletion-requests');
            if (res.data?.success) {
                setRequests(res.data.data || []);
            }
        } catch (error: any) {
            console.error('Error fetching deletion requests:', error);
            toast.error('Failed to load deletion requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleProcessRequest = async (id: string, action: 'approve' | 'reject') => {
        setProcessingId(id);
        try {
            const res = await apiClient.post(`/api/admin/deletion-requests/${id}/process`, {
                action
            });
            if (res.data?.success) {
                toast.success(`Successfully ${action}d deletion request.`);
                fetchRequests();
            } else {
                toast.error(res.data?.message || 'Processing failed');
            }
        } catch (error: any) {
            console.error('Error processing deletion request:', error);
            toast.error(error.response?.data?.message || 'Error communicating with server');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Account Deletions Review</h2>
                    <p className="text-muted-foreground mt-1 font-medium font-sans">Audit and approve user and host account deletion requests</p>
                </div>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-200">
                        <UserX size={20} className="text-destructive animate-pulse" />
                        Pending Deletion Requests
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400 font-semibold flex items-center justify-center gap-2">
                            <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                            Loading requests...
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 font-semibold">
                            No account deletion requests pending review
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-bold text-slate-300">User ID</TableHead>
                                    <TableHead className="font-bold text-slate-300">Profile Name</TableHead>
                                    <TableHead className="font-bold text-slate-300">Role</TableHead>
                                    <TableHead className="font-bold text-slate-300">Phone</TableHead>
                                    <TableHead className="font-bold text-slate-300">Reason</TableHead>
                                    <TableHead className="font-bold text-slate-300">Status</TableHead>
                                    <TableHead className="text-right font-bold text-slate-300">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.map((req) => {
                                    const isPending = req.status === 'pending';
                                    const isApproved = req.status === 'approved';
                                    return (
                                        <TableRow key={req._id} className="hover:bg-muted/30">
                                            <TableCell className="font-mono text-xs font-bold text-primary">User {req.meethiId}</TableCell>
                                            <TableCell className="font-semibold text-slate-200">{req.name}</TableCell>
                                            <TableCell className="capitalize font-semibold text-slate-300">
                                                <Badge variant={req.role === 'host' ? 'secondary' : 'outline'}>
                                                    {req.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-slate-400 font-semibold">{req.phoneNumber || 'N/A'}</TableCell>
                                            <TableCell className="text-xs text-slate-300 font-sans font-medium max-w-xs break-words">{req.reason}</TableCell>
                                            <TableCell>
                                                <Badge variant={isApproved ? 'success' : req.status === 'rejected' ? 'destructive' : 'secondary'}>
                                                    {req.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {isPending ? (
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleProcessRequest(req._id, 'reject')}
                                                            disabled={processingId !== null}
                                                            className="hover:bg-destructive/10 border-destructive/20 text-destructive font-bold text-xs flex items-center gap-1"
                                                        >
                                                            <XCircle size={12} />
                                                            Reject
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleProcessRequest(req._id, 'approve')}
                                                            disabled={processingId !== null}
                                                            className="hover:bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center gap-1"
                                                            variant="outline"
                                                        >
                                                            <CheckCircle size={12} />
                                                            Approve Delete
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground font-semibold uppercase">{req.status}</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
