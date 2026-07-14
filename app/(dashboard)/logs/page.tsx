'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Terminal, RefreshCw, AlertTriangle, ShieldCheck, Database, Cpu, Wifi } from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

export default function LogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/api/admin/security/system-logs');
            if (response.success && response.data) {
                setLogs(response.data || []);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch system logs');
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log => {
        if (filter === 'ALL') return true;
        return log.level === filter;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">System Logs</h2>
                    <p className="text-muted-foreground mt-1 font-medium font-sans">Monitor live Express server actions, Redis channels, and DB transactions</p>
                </div>
                <Button onClick={fetchLogs} className="flex items-center gap-1.5 font-bold">
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    Refresh
                </Button>
            </div>

            {/* Microservice health indicators */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs font-bold text-slate-400">Database Status</CardTitle>
                        <Database className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-1.5 mt-1">
                            <Badge variant="success" className="font-semibold text-xs py-0.5">MongoDB Connected</Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs font-bold text-slate-400">Cache Server</CardTitle>
                        <Cpu className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-1.5 mt-1">
                            <Badge variant="success" className="font-semibold text-xs py-0.5">Redis Listening</Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs font-bold text-slate-400">Socket.IO State</CardTitle>
                        <Wifi className="h-4 w-4 text-emerald-500 animate-pulse" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-1.5 mt-1">
                            <Badge variant="success" className="font-semibold text-xs py-0.5">Sockets Healthy</Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs font-bold text-slate-400">FCM Services</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-1.5 mt-1">
                            <Badge variant="outline" className="font-semibold text-xs py-0.5">FCM Offline Mode</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Console Log Area */}
            <Card className="glass-card bg-slate-950 border border-slate-800">
                <CardHeader className="border-b border-slate-800 flex flex-row items-center justify-between pb-3">
                    <CardTitle className="flex items-center gap-2 text-slate-300 font-mono text-sm">
                        <Terminal size={18} />
                        Console Output
                    </CardTitle>
                    <div className="flex items-center gap-1.5">
                        <Button size="sm" variant={filter === 'ALL' ? 'secondary' : 'ghost'} onClick={() => setFilter('ALL')} className="font-bold text-xs py-1 px-2.5">ALL</Button>
                        <Button size="sm" variant={filter === 'INFO' ? 'secondary' : 'ghost'} onClick={() => setFilter('INFO')} className="font-bold text-xs py-1 px-2.5 text-emerald-400">INFO</Button>
                        <Button size="sm" variant={filter === 'WARN' ? 'secondary' : 'ghost'} onClick={() => setFilter('WARN')} className="font-bold text-xs py-1 px-2.5 text-yellow-500">WARN</Button>
                        <Button size="sm" variant={filter === 'ERROR' ? 'secondary' : 'ghost'} onClick={() => setFilter('ERROR')} className="font-bold text-xs py-1 px-2.5 text-rose-500">ERROR</Button>
                    </div>
                </CardHeader>
                <CardContent className="p-4 font-mono text-xs text-slate-300 space-y-2 max-h-[450px] overflow-y-auto">
                    {loading ? (
                        <p className="text-slate-500">Tapping system logs stream...</p>
                    ) : filteredLogs.length === 0 ? (
                        <p className="text-slate-500">No logs matching filter level</p>
                    ) : (
                        filteredLogs.map((log, index) => (
                            <div key={index} className="flex gap-2 py-0.5 hover:bg-slate-900 px-1 rounded transition-colors">
                                <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                <span className={
                                    log.level === 'ERROR' ? 'text-rose-500 font-black' :
                                    log.level === 'WARN' ? 'text-yellow-500 font-bold' : 'text-emerald-400'
                                }>[{log.level}]</span>
                                <span className="text-slate-300">{log.message}</span>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
