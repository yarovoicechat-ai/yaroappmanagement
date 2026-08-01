'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Edit2, MessageCircleHeart, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

interface DefaultBio {
  _id: string;
  text: string;
  isActive: boolean;
  sortOrder: number;
}

export default function DefaultBiosPage() {
  const [bios, setBios] = useState<DefaultBio[]>([]);
  const [newText, setNewText] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<DefaultBio[]>('/api/admin/default-bios');
      setBios(res.data || []);
    } catch (error: any) { toast.error(error?.message || 'Default bios load nahi hue'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const add = async () => {
    if (!newText.trim()) return;
    try {
      const res = await apiClient.post('/api/admin/default-bios', { text: newText, sortOrder: bios.length });
      toast.success(res.message); setNewText(''); await load();
    } catch (error: any) { toast.error(error?.message || 'Bio add nahi hua'); }
  };

  const save = async (bio: DefaultBio, update: Partial<DefaultBio>) => {
    try {
      const res = await apiClient.patch(`/api/admin/default-bios/${bio._id}`, update);
      toast.success(res.message); setEditId(null); await load();
    } catch (error: any) { toast.error(error?.message || 'Bio update nahi hua'); }
  };

  const remove = async (bio: DefaultBio) => {
    if (!confirm(`Delete this bio?\n\n${bio.text}`)) return;
    try {
      const res = await apiClient.delete(`/api/admin/default-bios/${bio._id}`);
      toast.success(res.message); await load();
    } catch (error: any) { toast.error(error?.message || 'Bio delete nahi hua'); }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">App Management · Default Bios</h2>
          <p className="text-muted-foreground mt-1">Hosts can only select from these approved bios on Edit Profile. Custom host bio typing is blocked. Maximum 10 bios.</p>
        </div>
        <Button variant="outline" onClick={() => void load()}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle className="flex gap-2"><Plus className="h-5 w-5" />Add Bio</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input maxLength={100} placeholder="Enter a friendly bio suggestion…" value={newText} onChange={e => setNewText(e.target.value)} />
            <Button onClick={() => void add()} disabled={!newText.trim()}>Add</Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{newText.length}/100 characters</p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {loading ? <Card><CardContent className="p-8 text-center">Loading…</CardContent></Card> :
          bios.map((bio, index) => (
            <Card key={bio._id} className="glass-card">
              <CardContent className="p-4 flex items-center gap-3">
                <MessageCircleHeart className="h-5 w-5 text-pink-400 shrink-0" />
                <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                {editId === bio._id ? (
                  <Input maxLength={100} value={editText} onChange={e => setEditText(e.target.value)} />
                ) : <p className="flex-1">{bio.text}</p>}
                <Badge variant={bio.isActive ? 'success' : 'secondary'}>{bio.isActive ? 'Active' : 'Hidden'}</Badge>
                {editId === bio._id ? (
                  <>
                    <Button size="sm" onClick={() => void save(bio, { text: editText })}><Save className="h-4 w-4" /></Button>
                    <Button size="sm" variant="outline" onClick={() => setEditId(null)}><X className="h-4 w-4" /></Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="outline" onClick={() => { setEditId(bio._id); setEditText(bio.text); }}><Edit2 className="h-4 w-4" /></Button>
                    <Button size="sm" variant="outline" onClick={() => void save(bio, { isActive: !bio.isActive })}>{bio.isActive ? 'Hide' : 'Show'}</Button>
                    <Button size="sm" variant="destructive" onClick={() => void remove(bio)}><Trash2 className="h-4 w-4" /></Button>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
