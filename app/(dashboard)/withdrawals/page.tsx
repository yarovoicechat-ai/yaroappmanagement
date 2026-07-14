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
import { CheckCircle, XCircle, Search, DollarSign, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';
import type { Withdrawal } from '@/types/models';
import { Textarea } from '@/components/ui/Textarea';

export default function WithdrawalsPage() {
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Dialog States
    const [approveDialog, setApproveDialog] = useState<{ open: boolean; item: Withdrawal | null }>({ open: false, item: null });
    const [rejectDialog, setRejectDialog] = useState<{ open: boolean; item: Withdrawal | null }>({ open: false, item: null });

    // Form States
    const [transactionId, setTransactionId] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const fetchWithdrawals = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(API_ENDPOINTS.WITHDRAWALS.PENDING);
            if (response.success && response.data) {
                setWithdrawals(response.data as Withdrawal[]);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch withdrawals');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!approveDialog.item || !transactionId) {
            toast.error("Please enter specific transaction ID");
            return;
        }

        try {
            const response = await apiClient.post(API_ENDPOINTS.WITHDRAWALS.PROCESS, {
                withdrawalId: approveDialog.item._id,
                status: 'approved',
                transactionId
            });

            if (response.success) {
                toast.success("Withdrawal approved successfully");
                setApproveDialog({ open: false, item: null });
                setTransactionId('');
                fetchWithdrawals();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to approve');
        }
    };

    const handleReject = async () => {
        if (!rejectDialog.item || !rejectionReason) {
            toast.error("Please enter rejection reason");
            return;
        }

        try {
            const response = await apiClient.post(API_ENDPOINTS.WITHDRAWALS.PROCESS, {
                withdrawalId: rejectDialog.item._id,
                status: 'rejected',
                rejectionReason
            });

            if (response.success) {
                toast.success("Withdrawal rejected successfully");
                setRejectDialog({ open: false, item: null });
                setRejectionReason('');
                fetchWithdrawals();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to reject');
        }
    };

    const filteredWithdrawals = withdrawals.filter(w =>
        w.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        w.userId.toString().includes(search)
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-200 to-emerald-400 bg-clip-text text-transparent">Withdrawals</h2>
                    <p className="text-slate-400 mt-1">Manage pending payout requests from hosts.</p>
                </div>
                <Button onClick={fetchWithdrawals} variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                </Button>
            </div>

            <Card glass>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-slate-200 border-l-4 border-emerald-500 pl-3">Pending Requests</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Search by name or ID..."
                                className="pl-8 bg-slate-800/50 border-slate-700/50 text-slate-200 focus:border-emerald-500/50"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-10 text-slate-500 animate-pulse">Loading requests...</div>
                    ) : (
                        <div className="rounded-md border border-slate-800 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-900/50">
                                    <TableRow className="hover:bg-transparent border-slate-800">
                                        <TableHead className="text-slate-400">Host</TableHead>
                                        <TableHead className="text-slate-400">Amount</TableHead>
                                        <TableHead className="text-slate-400">Method</TableHead>
                                        <TableHead className="text-slate-400">Details</TableHead>
                                        <TableHead className="text-slate-400">Date</TableHead>
                                        <TableHead className="text-right text-slate-400">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredWithdrawals.map((w) => (
                                        <TableRow key={w._id} className="border-slate-800 hover:bg-slate-800/30 transition-colors group">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 bg-slate-800 rounded-full flex items-center justify-center text-slate-300 font-bold border border-slate-700">
                                                        {w.user?.name?.[0] || 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-slate-200">{w.user?.name || `ID: ${w.userId}`}</div>
                                                        <div className="text-xs text-slate-500">{w.user?.meethiId ? `@${w.user.meethiId}` : `User: ${w.userId}`}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-emerald-400 font-medium">
                                                    <DollarSign className="h-3 w-3 mr-1" />
                                                    {w.amount}
                                                </div>
                                                <div className="text-xs text-slate-500">{w.coinsDeducted} coins</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize border-slate-700 text-slate-300">
                                                    {w.method}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-xs">
                                                <div className="text-xs text-slate-400 space-y-1">
                                                    {w.method === 'bank' ? (
                                                        <>
                                                            <div className="font-medium text-slate-300">{w.details.bankName}</div>
                                                            <div>{w.details.accountNumber}</div>
                                                            <div>{w.details.ifscCode}</div>
                                                        </>
                                                    ) : (
                                                        <div className="font-medium text-slate-300">{w.details.upiId}</div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-400 text-sm">
                                                {new Date(w.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        size="sm"
                                                        className="bg-emerald-600 hover:bg-emerald-500 text-white h-8 w-8 p-0 rounded-full shadow-lg shadow-emerald-900/20"
                                                        onClick={() => setApproveDialog({ open: true, item: w })}
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="h-8 w-8 p-0 rounded-full shadow-lg shadow-red-900/20"
                                                        onClick={() => setRejectDialog({ open: true, item: w })}
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredWithdrawals.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="h-12 w-12 rounded-full bg-slate-800/50 flex items-center justify-center">
                                                        <CheckCircle className="h-6 w-6 text-slate-600" />
                                                    </div>
                                                    <p>No pending withdrawals found.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Approve Dialog */}
            <Dialog open={approveDialog.open} onOpenChange={(open) => setApproveDialog({ open, item: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve Withdrawal</DialogTitle>
                        <DialogDescription>
                            Confirm payment for {approveDialog.item?.user?.name || approveDialog.item?.userId}.
                            Please ensure you have transferred ₹{approveDialog.item?.amount}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Bank Transaction ID / Ref No.</Label>
                            <Input
                                placeholder="e.g. UPI123456789"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setApproveDialog({ open: false, item: null })}>Cancel</Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={handleApprove}>Confirm Approval</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, item: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-500">Reject Withdrawal</DialogTitle>
                        <DialogDescription>
                            This will reverse the coin deduction for the user.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Rejection Reason</Label>
                            <Textarea
                                placeholder="e.g. Invalid bank details..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDialog({ open: false, item: null })}>Cancel</Button>
                        <Button variant="destructive" onClick={handleReject}>Reject Request</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
