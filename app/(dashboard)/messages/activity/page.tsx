'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Bell, Flame, HelpCircle } from "lucide-react";
import { toast } from 'sonner';

export default function ActivityMessagesPage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !content) return;

        setLoading(true);
        try {
            // Mock delivery
            setTimeout(() => {
                toast.success('Activity event message broadcasted successfully');
                setTitle('');
                setContent('');
                setLoading(false);
            }, 1200);
        } catch (err) {
            toast.error("Failed to transmit message");
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-xl mx-auto">
            <div>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Activity Message</h2>
                <p className="text-muted-foreground mt-1 font-medium font-sans">Send dynamic broad alerts for weekend challenges, PK events, and new achievements</p>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-200">
                        <Flame size={20} className="text-primary animate-pulse" />
                        Broadcast Event Notification
                    </CardTitle>
                    <CardDescription>Alert users to participate in active reward contests</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSendMessage} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Activity Heading</label>
                            <Input
                                placeholder="e.g. Host Championship Weekend Starts Now!"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Event Details</label>
                            <Textarea
                                placeholder="Type event timings, reward coin values, and contest rules..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                                rows={5}
                            />
                        </div>
                        <Button type="submit" className="w-full font-bold flex items-center justify-center gap-1.5" disabled={loading}>
                            <Bell size={16} />
                            {loading ? 'Dispatched Announcement...' : 'Broadcast Announcement'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
