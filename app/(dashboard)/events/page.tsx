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
import { Calendar, Plus, Trash2, Award, Clock, Users } from "lucide-react";
import { toast } from 'sonner';

export default function EventsPage() {
    const [title, setTitle] = useState('');
    const [prizeCoins, setPrizeCoins] = useState('10000');
    const [date, setDate] = useState('');
    
    // Mock Events Data
    const [events, setEvents] = useState<any[]>([
        { id: '1', title: 'Top Star Host Weekly Contest', reward: 100000, target: 'Verified Hosts', date: '2026-07-15', isActive: true },
        { id: '2', title: 'Lucky Giver Weekend Event', reward: 50000, target: 'All Viewers', date: '2026-07-18', isActive: true },
        { id: '3', title: 'Newbie Broadcaster Challenge', reward: 25000, target: 'New Hosts', date: '2026-07-22', isActive: false }
    ]);

    const handleCreateEvent = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !date) return;

        const newEvent = {
            id: Date.now().toString(),
            title,
            reward: parseInt(prizeCoins),
            target: 'All Users',
            date,
            isActive: true
        };

        setEvents([newEvent, ...events]);
        toast.success(`Event Contest "${title}" scheduled`);
        setTitle('');
        setPrizeCoins('10000');
        setDate('');
    };

    const handleDeleteEvent = (id: string) => {
        setEvents(prev => prev.filter(e => e.id !== id));
        toast.success('Event Contest removed');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Event Contests</h2>
                    <p className="text-muted-foreground mt-1 font-medium font-sans">Design in-app contests, rewards packages, and scheduled user events</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Create Form */}
                <Card className="glass-card md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <Plus size={20} />
                            Schedule Event
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateEvent} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Contest Title</label>
                                <Input
                                    placeholder="e.g. Host PK Championship"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Reward Coins Pool</label>
                                <Input
                                    type="number"
                                    value={prizeCoins}
                                    onChange={(e) => setPrizeCoins(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Start Date</label>
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full font-bold">Schedule Event</Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Events list */}
                <Card className="glass-card md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <Calendar size={20} className="text-primary animate-pulse" />
                            Live Contest Events
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-bold text-slate-300">Event Title</TableHead>
                                    <TableHead className="font-bold text-slate-300">Coins Prize</TableHead>
                                    <TableHead className="font-bold text-slate-300">Target Group</TableHead>
                                    <TableHead className="font-bold text-slate-300">Schedule Date</TableHead>
                                    <TableHead className="font-bold text-slate-300">Status</TableHead>
                                    <TableHead className="text-right font-bold text-slate-300">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {events.map((ev) => (
                                    <TableRow key={ev.id} className="hover:bg-muted/30">
                                        <TableCell className="font-bold text-slate-200">{ev.title}</TableCell>
                                        <TableCell className="font-bold text-yellow-500">
                                            <div className="flex items-center gap-1">
                                                <Award size={14} />
                                                <span>{ev.reward.toLocaleString()} coins</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-semibold text-slate-300">
                                            <div className="flex items-center gap-1">
                                                <Users size={14} className="text-muted-foreground" />
                                                <span>{ev.target}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-semibold text-slate-400 text-xs">
                                            <div className="flex items-center gap-1">
                                                <Clock size={12} />
                                                <span>{ev.date}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={ev.isActive ? "success" : "secondary"}>
                                                {ev.isActive ? 'Upcoming/Active' : 'Closed'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDeleteEvent(ev.id)}
                                            >
                                                <Trash2 size={16} />
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
