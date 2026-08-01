'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Bell, Flame } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

export default function ActivityMessagesPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState('all');
  const [rewardCoins, setRewardCoins] = useState('0');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.post('/api/admin/events/broadcast', {
        title, body: content, audience, rewardCoins: Number(rewardCoins) || 0,
      });
      toast.success(res.message);
      setTitle(''); setContent(''); setRewardCoins('0');
    } catch (error: any) {
      toast.error(error?.message || 'Activity message send nahi hua');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Activity Message</h2>
        <p className="text-muted-foreground mt-1">Send a persistent message to the selected users&apos; Activity feed and push notifications.</p>
      </div>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Flame className="h-5 w-5 text-primary" />Broadcast Activity Notification</CardTitle>
          <CardDescription>The message is stored in each recipient&apos;s Activity history.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendMessage} className="space-y-4">
            <Input placeholder="Activity heading" maxLength={120} required value={title} onChange={e => setTitle(e.target.value)} />
            <Textarea placeholder="Event details, timings and rules…" maxLength={2000} required rows={6} value={content} onChange={e => setContent(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={audience} onChange={e => setAudience(e.target.value)}>
                <option value="all">All users</option><option value="users">Viewers only</option>
                <option value="hosts">Hosts only</option><option value="verified">Verified only</option>
              </select>
              <Input type="number" min="0" placeholder="Reward coins" value={rewardCoins} onChange={e => setRewardCoins(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              <Bell className="h-4 w-4 mr-2" />{loading ? 'Sending…' : 'Broadcast Announcement'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
