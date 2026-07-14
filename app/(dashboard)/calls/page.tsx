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
import { Search, Phone, Clock, Coins, PhoneMissed, PhoneIncoming, Video, Mic, Gift } from "lucide-react";
import { toast } from 'sonner';
import { Pagination } from "@/components/ui/Pagination";
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';

type Call = {
    id: string;
    callerName: string;
    hostName: string;
    type: string;
    voice: number;
    gift: number;
    hostEarning: number;
    duration: string | null;
    callStart: string;
    callEnd: string;
    date: string;
};

export default function CallsPage() {
    const [calls, setCalls] = useState<Call[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeCallsCount, setActiveCallsCount] = useState(0);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 10
    });

    useEffect(() => {
        fetchCalls(pagination.currentPage);
        fetchStats();
    }, [pagination.currentPage]);

    const fetchCalls = async (page: number) => {
        try {
            setLoading(true);
            const response = await apiClient.get(API_ENDPOINTS.CALLS.HISTORY, { page, limit: pagination.limit });
            if (response.success && response.data) {
                const data = response.data as any;
                setCalls(data.calls || []);
                setPagination({
                    currentPage: data.page,
                    totalPages: data.totalPages,
                    totalCount: data.total,
                    limit: data.limit
                });
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch call logs');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.DASHBOARD.STATS);
            if (response.success && response.data) {
                const data = response.data as any;
                if (data.calls) {
                    setActiveCallsCount(data.calls.active || 0);
                }
            }
        } catch (error) {
            console.error("Failed to fetch dashboard stats");
        }
    };

    const filteredCalls = calls.filter(call =>
        (call.hostName || '').toLowerCase().includes(search.toLowerCase()) ||
        (call.callerName || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-200 to-teal-400 bg-clip-text text-transparent">Call Logs</h2>
                <p className="text-slate-400 mt-1">Track call history, duration, and coin usage.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card glass className="bg-gradient-to-br from-teal-900/20 to-slate-900/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
                        <Clock className="h-4 w-4 text-teal-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pagination.totalCount}</div>
                        <p className="text-xs text-slate-400">Total records</p>
                    </CardContent>
                </Card>
                <Card glass className="bg-gradient-to-br from-amber-900/20 to-slate-900/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                        <Coins className="h-4 w-4 text-amber-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--</div>
                        <p className="text-xs text-slate-400">Total coins spent</p>
                    </CardContent>
                </Card>
                <Card glass>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Active Calls</CardTitle>
                        <PhoneIncoming className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeCallsCount}</div>
                        <p className="text-xs text-green-400">Live now</p>
                    </CardContent>
                </Card>
            </div>

            <Card glass>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Recent Calls</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Search by host or caller..."
                                className="pl-8 bg-slate-800/50 border-slate-700/50"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-10 text-slate-500">Loading call logs...</div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-slate-700/50">
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Host</TableHead>
                                        <TableHead>Caller</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead>Coins</TableHead>
                                        <TableHead className="text-right">Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCalls.map((call) => (
                                        <TableRow key={call.id} className="border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {call.type === 'voice_call' || call.type === 'VIDEO_CALL' ? (
                                                        <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-purple-500/20">
                                                            <Mic className="h-3 w-3 mr-1" /> Audio
                                                        </Badge>
                                                    ) : call.type === 'gift' ? (
                                                        <Badge variant="secondary" className="bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 border-pink-500/20">
                                                            <Gift className="h-3 w-3 mr-1" /> Gift
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20">
                                                            <Video className="h-3 w-3 mr-1" /> Call
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {call.duration && call.duration !== "00:00:00" ? (
                                                    <div className="flex items-center text-teal-400 text-xs font-medium">
                                                        <Phone className="h-3 w-3 mr-1" />
                                                        Success
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center text-red-400 text-xs font-medium">
                                                        <PhoneMissed className="h-3 w-3 mr-1" />
                                                        Missed
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium text-slate-200">{call.hostName}</TableCell>
                                            <TableCell className="text-slate-400">{call.callerName}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-slate-300">
                                                    <Clock className="h-3 w-3 mr-1 text-slate-500" />
                                                    {call.duration || '0s'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-amber-300 font-mono">
                                                    <Coins className="h-3 w-3 mr-1 text-amber-500" />
                                                    {Math.max(call.voice, call.gift)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right text-xs text-slate-500">
                                                {new Date(call.date).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredCalls.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                                No call logs found.
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
        </div>
    );
}
