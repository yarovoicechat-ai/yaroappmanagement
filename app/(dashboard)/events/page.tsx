'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Calendar, Plus, Send, StopCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

type EventStatus = 'draft' | 'published' | 'closed';
interface ActivityEvent {
  _id: string; title: string; description: string; audience: string;
  rewardCoins: number; startAt: string; endAt?: string;
  status: EventStatus; recipientCount: number;
}

const initialForm = {
  title: '', description: '', audience: 'all', rewardCoins: '0',
  startAt: '', endAt: '', imageUrl: '', actionUrl: '', publishNow: true,
};

export default function EventsPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<ActivityEvent[]>('/api/admin/events');
      setEvents(res.data || []);
    } catch (error: any) {
      toast.error(error?.message || 'Events load nahi ho paye');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadEvents(); }, [loadEvents]);

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiClient.post<ActivityEvent>('/api/admin/events', {
        ...form,
        rewardCoins: Number(form.rewardCoins) || 0,
        startAt: new Date(form.startAt).toISOString(),
        endAt: form.endAt ? new Date(form.endAt).toISOString() : undefined,
      });
      toast.success(res.message);
      setForm(initialForm);
      await loadEvents();
    } catch (error: any) {
      toast.error(error?.message || 'Event save nahi hua');
    } finally {
      setSaving(false);
    }
  };

  const publish = async (id: string) => {
    try {
      const res = await apiClient.post(`/api/admin/events/${id}/publish`);
      toast.success(res.message);
      await loadEvents();
    } catch (error: any) { toast.error(error?.message || 'Publish failed'); }
  };

  const close = async (id: string) => {
    if (!confirm('Is event ko close karna hai?')) return;
    try {
      const res = await apiClient.patch(`/api/admin/events/${id}/close`);
      toast.success(res.message);
      await loadEvents();
    } catch (error: any) { toast.error(error?.message || 'Close failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Activity Events</h2>
          <p className="text-muted-foreground mt-1">Create, schedule and publish events to the app Activity feed.</p>
        </div>
        <Button variant="outline" onClick={() => void loadEvents()}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card className="glass-card h-fit">
          <CardHeader><CardTitle className="flex gap-2"><Plus className="h-5 w-5" />Create Event</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={createEvent} className="space-y-3">
              <Input placeholder="Event title" maxLength={120} required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <Textarea placeholder="Activity message / event details" maxLength={2000} rows={5} required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })}>
                  <option value="all">All users</option><option value="users">Viewers only</option>
                  <option value="hosts">Hosts only</option><option value="verified">Verified only</option>
                </select>
                <Input type="number" min="0" placeholder="Reward coins" value={form.rewardCoins} onChange={e => setForm({ ...form, rewardCoins: e.target.value })} />
              </div>
              <label className="block text-xs text-muted-foreground">Start date & time</label>
              <Input type="datetime-local" required value={form.startAt} onChange={e => setForm({ ...form, startAt: e.target.value })} />
              <label className="block text-xs text-muted-foreground">End date & time (optional)</label>
              <Input type="datetime-local" value={form.endAt} onChange={e => setForm({ ...form, endAt: e.target.value })} />
              <Input placeholder="Image URL (optional)" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
              <Input placeholder="Action URL (optional)" value={form.actionUrl} onChange={e => setForm({ ...form, actionUrl: e.target.value })} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.publishNow} onChange={e => setForm({ ...form, publishNow: e.target.checked })} />
                Publish now and send Activity message
              </label>
              <Button className="w-full" disabled={saving}>{saving ? 'Saving…' : form.publishNow ? 'Create & Publish' : 'Save Draft'}</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {loading ? <Card><CardContent className="p-8 text-center">Loading events…</CardContent></Card> :
            events.length === 0 ? <Card><CardContent className="p-8 text-center text-muted-foreground">No events created yet.</CardContent></Card> :
            events.map(event => (
              <Card key={event._id} className="glass-card">
                <CardContent className="p-5">
                  <div className="flex justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-lg">{event.title}</h3>
                        <Badge variant={event.status === 'published' ? 'success' : event.status === 'closed' ? 'secondary' : 'default'}>{event.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{event.description}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>Audience: {event.audience}</span><span>Reward: {event.rewardCoins.toLocaleString()} coins</span>
                        <span>Recipients: {event.recipientCount || 0}</span>
                        <span><Calendar className="inline h-3 w-3 mr-1" />{new Date(event.startAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 h-fit">
                      {event.status === 'draft' && <Button size="sm" onClick={() => void publish(event._id)}><Send className="h-4 w-4 mr-1" />Publish</Button>}
                      {event.status !== 'closed' && <Button size="sm" variant="outline" onClick={() => void close(event._id)}><StopCircle className="h-4 w-4 mr-1" />Close</Button>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
