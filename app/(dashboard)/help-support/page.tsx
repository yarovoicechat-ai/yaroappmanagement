'use client';

import { useState, useEffect } from 'react';
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
import { MessageCircle, Search, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

export default function HelpSupportPage() {
    const [search, setSearch] = useState('');
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Reply Modal States
    const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/api/admin/help', { search });
            if (res.success || res.data) {
                const ticketData = Array.isArray(res.data) ? res.data : (res.data?.tickets || res.data?.data || []);
                setTickets(ticketData);
            }
        } catch (error: any) {
            console.error('Error fetching tickets:', error);
            toast.error('Failed to load support tickets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [search]);

    const handleOpenReplyModal = (ticket: any) => {
        setSelectedTicket(ticket);
        setReplyText(ticket.adminReply || '');
    };

    const handleResolveTicket = async () => {
        if (!selectedTicket || !replyText.trim()) {
            toast.error('Please enter a response for the user');
            return;
        }

        setSubmitting(true);
        try {
            const res = await apiClient.patch(`/api/admin/help/${selectedTicket._id}/reply`, {
                reply: replyText
            });
            if (res.data?.success) {
                toast.success(`Successfully resolved ticket & sent response.`);
                setSelectedTicket(null);
                setReplyText('');
                fetchTickets();
            } else {
                toast.error(res.data?.message || 'Failed to update ticket');
            }
        } catch (error: any) {
            console.error('Error resolving ticket:', error);
            toast.error(error.response?.data?.message || 'Error communicating with backend');
        } finally {
            setSubmitting(false);
        }
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
                <Button onClick={fetchTickets} variant="outline" size="sm">Refresh</Button>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-200">
                        <MessageCircle size={20} className="text-primary animate-pulse" />
                        Active Support Tickets List
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400 font-semibold flex items-center justify-center gap-2">
                            <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                            Loading active tickets...
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 font-semibold">
                            No support tickets found
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-bold text-slate-300">Ticket #</TableHead>
                                    <TableHead className="font-bold text-slate-300">User ID</TableHead>
                                    <TableHead className="font-bold text-slate-300">Category</TableHead>
                                    <TableHead className="font-bold text-slate-300">Description</TableHead>
                                    <TableHead className="font-bold text-slate-300">Created At</TableHead>
                                    <TableHead className="font-bold text-slate-300">Status</TableHead>
                                    <TableHead className="text-right font-bold text-slate-300">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tickets.map((ticket) => {
                                    const isResolved = ticket.status === 'resolved';
                                    return (
                                        <TableRow key={ticket._id} className="hover:bg-muted/30">
                                            <TableCell className="font-mono text-xs text-slate-300 font-bold">{ticket.ticketNumber || '-'}</TableCell>
                                            <TableCell className="font-mono text-xs text-primary font-bold">User {ticket.userId}</TableCell>
                                            <TableCell className="font-semibold text-slate-300">{ticket.reason}</TableCell>
                                            <TableCell className="text-xs text-slate-400 font-medium max-w-xs truncate" title={ticket.message}>{ticket.message}</TableCell>
                                            <TableCell className="text-xs text-slate-500">{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Badge variant={isResolved ? 'success' : 'destructive'} className="font-semibold">
                                                    {isResolved ? 'Resolved' : 'Pending'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleOpenReplyModal(ticket)}
                                                    className={`font-bold text-xs flex items-center gap-1 border-slate-800 ${isResolved ? 'text-slate-400 hover:text-slate-200' : 'hover:bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}
                                                    variant="outline"
                                                >
                                                    <CheckCircle2 size={12} />
                                                    {isResolved ? 'View Reply' : 'Resolve / Reply'}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Reply Modal Dialog Overlay */}
            {selectedTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4">
                        <div className="flex items-center gap-2 text-slate-200 font-bold text-lg">
                            <AlertCircle size={20} className="text-primary" />
                            <h3>Respond to Support Ticket</h3>
                        </div>
                        
                        <div className="space-y-1">
                            <p className="text-xs text-slate-400">Ticket #: <span className="font-mono text-slate-200 font-semibold">{selectedTicket.ticketNumber || '-'}</span></p>
                            <p className="text-xs text-slate-400">User ID: <span className="font-mono text-primary font-semibold">{selectedTicket.userId}</span></p>
                            <p className="text-xs text-slate-400">Reason: <span className="text-slate-200 font-semibold">{selectedTicket.reason}</span></p>
                        </div>
                        
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 max-h-48 overflow-y-auto space-y-3">
                            <div className="flex flex-col gap-1 items-start">
                                <span className="text-[10px] text-slate-500 font-bold">User</span>
                                <div className="bg-slate-800 text-slate-200 text-xs p-2 rounded-lg rounded-tl-none inline-block">
                                    {selectedTicket.message}
                                </div>
                            </div>
                            
                            {selectedTicket.replies?.map((reply: any, idx: number) => (
                                <div key={idx} className={`flex flex-col gap-1 ${reply.sender === 'admin' ? 'items-end' : 'items-start'}`}>
                                    <span className="text-[10px] text-slate-500 font-bold">
                                        {reply.sender === 'admin' ? 'Admin' : 'User'}
                                    </span>
                                    <div className={`text-xs p-2 rounded-lg inline-block ${reply.sender === 'admin' ? 'bg-primary/20 text-primary border border-primary/30 rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'}`}>
                                        {reply.message}
                                    </div>
                                </div>
                            ))}
                            {/* Legacy Admin Reply Support */}
                            {selectedTicket.adminReply && !selectedTicket.replies?.length && (
                                <div className="flex flex-col gap-1 items-end">
                                    <span className="text-[10px] text-slate-500 font-bold">Admin</span>
                                    <div className="bg-primary/20 text-primary border border-primary/30 text-xs p-2 rounded-lg rounded-tr-none inline-block">
                                        {selectedTicket.adminReply}
                                    </div>
                                </div>
                            )}
                        </div>

                        {selectedTicket.image && (
                          <div className="border border-slate-800 rounded-lg overflow-hidden">
                            <img src={selectedTicket.image} className="w-full h-32 object-contain bg-black" alt="Attachment" />
                          </div>
                        )}

                        {selectedTicket.status !== 'resolved' && (
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400">Response message to User</label>
                                <textarea
                                    className="w-full h-24 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-primary resize-none font-sans"
                                    placeholder="Type answer/instructions for the user..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" size="sm" onClick={() => setSelectedTicket(null)}>Close</Button>
                            {selectedTicket.status !== 'resolved' && (
                                <Button size="sm" onClick={handleResolveTicket} disabled={submitting}>
                                    {submitting ? 'Resolving...' : 'Resolve & Reply'}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
