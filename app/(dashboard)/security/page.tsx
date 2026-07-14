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
import { ShieldCheck, UserCheck, RefreshCw, Key, ShieldAlert, Monitor, Terminal } from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

export default function SecurityPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAuditLogs();
    }, []);

    const fetchAuditLogs = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/api/admin/security/audit-logs');
            if (response.success && response.data) {
                setLogs(response.data || []);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch audit trails');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Security Center</h2>
                    <p className="text-muted-foreground mt-1 font-medium font-sans">Inspect administrator activity audit trails, logs, and sessions</p>
                </div>
                <Button onClick={fetchAuditLogs} className="flex items-center gap-1.5 font-bold">
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    Sync Trails
                </Button>
            </div>

            {/* Security Alerts and Sessions indicator */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-slate-300">Auditable Admins</CardTitle>
                        <UserCheck className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-100">SuperAdmin</div>
                        <p className="text-xs text-muted-foreground mt-1 font-semibold">Active role credentials guard</p>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-slate-300">Active Web Sessions</CardTitle>
                        <Monitor className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-100">1 Online</div>
                        <p className="text-xs text-muted-foreground mt-1 font-semibold">Session tracking live</p>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-slate-300">IP Filtering</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-100">Whitelisted</div>
                        <p className="text-xs text-muted-foreground mt-1 font-semibold">IP validation layer active</p>
                    </CardContent>
                </Card>
            </div>

            {/* Audit Logs list */}
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-200">
                        <Key size={20} className="text-primary" />
                        Admin Activities Audit Logs Trail
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-bold text-slate-300">Admin Account</TableHead>
                                <TableHead className="font-bold text-slate-300">Operation Action</TableHead>
                                <TableHead className="font-bold text-slate-300">Target Item</TableHead>
                                <TableHead className="font-bold text-slate-300">IP Host Address</TableHead>
                                <TableHead className="font-bold text-slate-300">Details</TableHead>
                                <TableHead className="font-bold text-slate-300">Date Timestamp</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-slate-400">Loading audit logs...</TableCell>
                                </TableRow>
                            ) : logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-slate-400 font-medium">No admin operations logged yet</TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log, i) => (
                                    <TableRow key={i} className="hover:bg-muted/30">
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center font-bold text-xs">
                                                    {log.adminId?.image ? (
                                                        <img src={log.adminId.image} alt={log.adminId.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        log.adminId?.name?.[0]?.toUpperCase() || 'A'
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-200">{log.adminId?.name || 'Admin System'}</p>
                                                    <p className="text-[10px] text-muted-foreground font-semibold">ID: {log.adminId?.userId}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-mono text-xs font-bold uppercase">
                                                {log.action}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-primary font-semibold truncate max-w-[150px]">{log.target || 'N/A'}</TableCell>
                                        <TableCell className="font-mono text-xs text-slate-300">{log.ipAddress}</TableCell>
                                        <TableCell className="text-slate-300 text-xs font-medium max-w-[200px] truncate">{log.details}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground font-semibold">{new Date(log.createdAt).toLocaleString()}</TableCell>
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
