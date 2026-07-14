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
import { FileCheck, Search, ShieldCheck, Mail, Phone, Award } from "lucide-react";
import { toast } from 'sonner';

export default function VerificationPage() {
    const [search, setSearch] = useState('');
    
    // Mock Verifications Data
    const [verifications, setVerifications] = useState<any[]>([
        { id: '1', userId: 10009, name: 'Sufiyan Ali', email: 'sufiyan@gmail.com', phone: '+91 99881 12345', emailVerified: true, phoneVerified: false },
        { id: '2', userId: 10015, name: 'Kavita Roy', email: 'kavita@yahoo.com', phone: '+91 88771 98765', emailVerified: false, phoneVerified: true },
        { id: '3', userId: 10029, name: 'Amit Trivedi', email: 'amit@music.in', phone: '+91 77661 54321', emailVerified: true, phoneVerified: true }
    ]);

    const handleManualVerify = (id: string, type: 'email' | 'phone') => {
        setVerifications(prev => prev.map(v => {
            if (v.id === id) {
                const updatedVal = type === 'email' ? { emailVerified: true } : { phoneVerified: true };
                toast.success(`User ${v.name} manually verified for ${type}`);
                return { ...v, ...updatedVal };
            }
            return v;
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Manual Verification</h2>
                    <p className="text-muted-foreground mt-1 font-medium font-sans">Verify user phone numbers and email verification requests list</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search verification queues..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-200">
                        <FileCheck size={20} className="text-primary animate-pulse" />
                        Verification Log Pipeline
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-bold text-slate-300">User Profile Name</TableHead>
                                <TableHead className="font-bold text-slate-300">System ID</TableHead>
                                <TableHead className="font-bold text-slate-300">Email Address</TableHead>
                                <TableHead className="font-bold text-slate-300">Phone Mobile Number</TableHead>
                                <TableHead className="font-bold text-slate-300">Email Verified</TableHead>
                                <TableHead className="font-bold text-slate-300">Phone Verified</TableHead>
                                <TableHead className="text-right font-bold text-slate-300">Action Queue</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {verifications.filter(v => v.name.toLowerCase().includes(search.toLowerCase())).map((ver) => (
                                <TableRow key={ver.id} className="hover:bg-muted/30">
                                    <TableCell className="font-bold text-slate-200">{ver.name}</TableCell>
                                    <TableCell className="font-mono text-xs text-slate-400">{ver.userId}</TableCell>
                                    <TableCell className="text-slate-300 font-semibold">{ver.email}</TableCell>
                                    <TableCell className="text-slate-300 font-semibold">{ver.phone}</TableCell>
                                    <TableCell>
                                        <Badge variant={ver.emailVerified ? 'success' : 'secondary'} className="font-semibold">
                                            {ver.emailVerified ? 'Verified' : 'Unverified'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={ver.phoneVerified ? 'success' : 'secondary'} className="font-semibold">
                                            {ver.phoneVerified ? 'Verified' : 'Unverified'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {!ver.emailVerified && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleManualVerify(ver.id, 'email')}
                                                    className="font-bold text-xs"
                                                >
                                                    Verify Email
                                                </Button>
                                            )}
                                            {!ver.phoneVerified && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleManualVerify(ver.id, 'phone')}
                                                    className="font-bold text-xs"
                                                >
                                                    Verify Phone
                                                </Button>
                                            )}
                                            {ver.emailVerified && ver.phoneVerified && (
                                                <span className="text-xs text-emerald-400 font-bold flex items-center justify-end gap-1">
                                                    <ShieldCheck size={12} />
                                                    Cleared
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
