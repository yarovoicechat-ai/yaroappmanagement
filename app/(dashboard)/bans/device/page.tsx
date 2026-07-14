'use client';

import { useState } from 'react';
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
import { Ban, Search, Monitor, Trash2, Calendar, ShieldAlert } from "lucide-react";
import { toast } from 'sonner';

export default function DeviceBansPage() {
    const [search, setSearch] = useState('');
    const [deviceIdInput, setDeviceIdInput] = useState('');
    const [reasonInput, setReasonInput] = useState('');
    
    // Mock Banned Devices Data
    const [bans, setBans] = useState<any[]>([
        { id: '1', deviceId: 'f002-390a-1123-bc99', brand: 'Samsung SM-G998B', reason: 'Multiple fake account registrations', date: '2026-07-01' },
        { id: '2', deviceId: 'ca98-33bc-11a2-ff81', brand: 'OnePlus HD1901', reason: 'Spam script execution detected', date: '2026-07-04' }
    ]);

    const handleBanDevice = (e: React.FormEvent) => {
        e.preventDefault();
        if (!deviceIdInput) return;

        const newBan = {
            id: Date.now().toString(),
            deviceId: deviceIdInput,
            brand: 'Generic Mobile Device',
            reason: reasonInput || 'Automated abuse detection',
            date: new Date().toISOString().split('T')[0]
        };

        setBans([newBan, ...bans]);
        toast.success(`Device identifier successfully banned`);
        setDeviceIdInput('');
        setReasonInput('');
    };

    const handleRemoveBan = (id: string) => {
        setBans(prev => prev.filter(b => b.id !== id));
        toast.success('Device identifier whitelisted');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Device Blocklist</h2>
                    <p className="text-muted-foreground mt-1 font-medium font-sans">Block hardware device signatures to permanently stop malicious signups</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Ban Form */}
                <Card className="glass-card md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <Ban size={20} />
                            Ban Hardware Signature
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleBanDevice} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Device UUID / ID</label>
                                <Input
                                    placeholder="e.g. f002-390a-1123-bc99"
                                    value={deviceIdInput}
                                    onChange={(e) => setDeviceIdInput(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Reason for block</label>
                                <Input
                                    placeholder="Botting, spam accounts..."
                                    value={reasonInput}
                                    onChange={(e) => setReasonInput(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="w-full font-bold">Ban Device</Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Bans List */}
                <Card className="glass-card md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <ShieldAlert size={20} className="text-primary animate-pulse" />
                            Hardware Blocklist Queue
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-bold text-slate-300">Device ID Signature</TableHead>
                                    <TableHead className="font-bold text-slate-300">Device Model Brand</TableHead>
                                    <TableHead className="font-bold text-slate-300">Banned Reason</TableHead>
                                    <TableHead className="font-bold text-slate-300">Ban Date</TableHead>
                                    <TableHead className="text-right font-bold text-slate-300">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bans.filter(b => b.deviceId.toLowerCase().includes(search.toLowerCase()) || b.brand.toLowerCase().includes(search.toLowerCase())).map((ban) => (
                                    <TableRow key={ban.id} className="hover:bg-muted/30">
                                        <TableCell className="font-mono text-xs text-primary font-bold">{ban.deviceId}</TableCell>
                                        <TableCell className="font-semibold text-slate-200">
                                            <div className="flex items-center gap-2">
                                                <Monitor size={14} className="text-muted-foreground" />
                                                <span>{ban.brand}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-300 text-xs font-semibold">{ban.reason}</TableCell>
                                        <TableCell className="font-semibold text-slate-400 text-xs">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                <span>{ban.date}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleRemoveBan(ban.id)}
                                                className="font-bold text-xs hover:bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                            >
                                                Whitelist
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
