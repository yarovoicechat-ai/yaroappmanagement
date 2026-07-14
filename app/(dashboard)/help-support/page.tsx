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
import { MessageCircle, Search, HelpCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import { toast } from 'sonner';

export default function HelpSupportPage() {
    const [search, setSearch] = useState('');
    
    // Mock Tickets Data
    const [tickets, setTickets] = useState<any[]>([
        { id: '1', name: 'Kabir Dev', category: 'Payment Issue', desc: 'Charged twice during Google Play recharge package purchase.', status: 'open', severity: 'high' },
        { id: '2', name: 'Lisa Ray', category: 'Profile Access', desc: 'KYC photos keep uploading as blank or throwing upload failed error.', status: 'open', severity: 'medium' },
        { id: '3', name: 'Varun Dhawan', category: 'Call Quality', desc: 'Agora call latency makes call drop frequently.', status: 'resolved', severity: 'low' }
    ]);

    const handleResolveTicket = (id: string) => {
        setTickets(prev => prev.map(t => {
            if (t.id === id) {
                toast.success(`Ticket #${t.id} successfully marked as resolved`);
                return { ...t, status: 'resolved' };
            }
            return t;
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Help & Support</h2>
                    <p className="text-muted-foreground mt-1 font-medium font-sans">Resolve user queries, support requests, and service complaints</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search support tickets..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-200">
                        <MessageCircle size={20} className="text-primary animate-pulse" />
                        Active Support Tickets List
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-bold text-slate-300">User</TableHead>
                                <TableHead className="font-bold text-slate-300">Category</TableHead>
                                <TableHead className="font-bold text-slate-300">Description</TableHead>
                                <TableHead className="font-bold text-slate-300">Severity</TableHead>
                                <TableHead className="font-bold text-slate-300">Status</TableHead>
                                <TableHead className="text-right font-bold text-slate-300">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tickets.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase())).map((ticket) => (
                                <TableRow key={ticket.id} className="hover:bg-muted/30">
                                    <TableCell className="font-bold text-slate-200">{ticket.name}</TableCell>
                                    <TableCell className="font-semibold text-slate-300">{ticket.category}</TableCell>
                                    <TableCell className="text-xs text-slate-400 font-medium max-w-xs truncate" title={ticket.desc}>{ticket.desc}</TableCell>
                                    <TableCell>
                                        <Badge variant={ticket.severity === 'high' ? 'destructive' : ticket.severity === 'medium' ? 'secondary' : 'outline'} className="font-semibold capitalize">
                                            {ticket.severity}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={ticket.status === 'open' ? 'destructive' : 'success'} className="font-semibold">
                                            {ticket.status === 'open' ? 'Open' : 'Resolved'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {ticket.status === 'open' ? (
                                            <Button
                                                size="sm"
                                                onClick={() => handleResolveTicket(ticket.id)}
                                                className="font-bold text-xs flex items-center gap-1 hover:bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                                variant="outline"
                                            >
                                                <CheckCircle2 size={12} />
                                                Resolve
                                            </Button>
                                        ) : (
                                            <span className="text-xs text-muted-foreground font-semibold">Closed</span>
                                        )}
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
