'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { MessageSquare, Bell, Users, CheckCircle } from "lucide-react";
import { toast } from 'sonner';

export default function SystemMessagesPage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [targetGroup, setTargetGroup] = useState('all');
    const [loading, setLoading] = useState(false);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !content) return;

        setLoading(true);
        try {
            // Mock delivery
            setTimeout(() => {
                toast.success(`FCM push notification dispatched to target group "${targetGroup}"`);
                setTitle('');
                setContent('');
                setLoading(false);
            }, 1200);
        } catch (err) {
            toast.error("Failed to transmit notification");
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-xl mx-auto">
            <div>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">System Message</h2>
                <p className="text-muted-foreground mt-1 font-medium font-sans">Dispatch system announcements and push alerts to application users</p>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-200">
                        <MessageSquare size={20} className="text-primary animate-pulse" />
                        Compose System Notification
                    </CardTitle>
                    <CardDescription>Send instant alert reminders using Firebase Cloud Messaging</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSendMessage} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Message Title</label>
                            <Input
                                placeholder="e.g. Mithi Chat System Update"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Target Group Filter</label>
                            <select
                                value={targetGroup}
                                onChange={(e) => setTargetGroup(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                <option value="all">All Users</option>
                                <option value="hosts">Approved Hosts Only</option>
                                <option value="vip">VIP Premium Tier Subscribers</option>
                                <option value="sellers">Coin Sellers</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Detailed Message Body</label>
                            <Textarea
                                placeholder="Type your notification message content here..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                                rows={5}
                            />
                        </div>
                        <Button type="submit" className="w-full font-bold flex items-center justify-center gap-1.5" disabled={loading}>
                            <Bell size={16} />
                            {loading ? 'Transmitting Alert...' : 'Dispatch FCM Alert'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
