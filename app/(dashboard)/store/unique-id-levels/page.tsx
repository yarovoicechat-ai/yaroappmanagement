'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BadgeCheck, Layers, Pencil, Plus, RefreshCw, Trash2, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { suggestAssetName } from '@/lib/aiAssetName';

type UniqueIdLevel = {
  _id: string;
  name: string;
  description?: string;
  status: string;
  config?: { levelNumber?: number; vipLevel?: number; badgeName?: string; badgeIconUrl?: string; animationType?: string };
};

const emptyForm = { name: '', levelNumber: 1, badgeName: 'VIP ID', badgeIconUrl: '', animationType: 'svga', description: '' };
const allowedAsset = /\.(svga|png|jpe?g|webp|gif)(?:\?.*)?$/i;

const getAssetType = (url: string) => {
  const match = url.toLowerCase().match(/\.(svga|png|jpe?g|webp|gif)(?:\?.*)?$/);
  if (!match) return 'static';
  return match[1] === 'jpg' || match[1] === 'jpeg' || match[1] === 'png' ? 'static' : match[1];
};

function BadgePreview({ url, name, levelNumber, animationType }: { url: string; name: string; levelNumber: number; animationType: string }) {
  const imagePreview = url && !/\.svga(?:\?.*)?$/i.test(url);
  return (
    <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/60">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.16),transparent_65%)]" />
      {imagePreview ? <img src={url} alt={`${name} badge preview`} className="relative max-h-32 max-w-32 object-contain drop-shadow-[0_0_18px_rgba(34,211,238,0.35)]" /> : (
        <div className="relative flex h-28 w-28 animate-pulse flex-col items-center justify-center rounded-full border-4 border-amber-300/70 bg-gradient-to-br from-amber-300 via-amber-600 to-yellow-950 text-center shadow-[0_0_28px_rgba(251,191,36,0.4)]">
          <BadgeCheck className="h-7 w-7 text-white" />
          <span className="mt-1 text-[10px] font-black uppercase text-white">{animationType}</span>
        </div>
      )}
      <div className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-slate-950/75 px-3 py-1 text-xs font-semibold text-white">Level {levelNumber} · {name || 'Preview'}</div>
    </div>
  );
}

export default function UniqueIdLevelsPage() {
  const [levels, setLevels] = useState<UniqueIdLevel[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadLevels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<any>('/api/identity/admin/unique-id-levels');
      setLevels(res.data?.levels || []);
    } catch (error: any) {
      toast.error(error?.message || 'Could not load Unique ID levels');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadLevels(); }, [loadLevels]);

  const sortedLevels = useMemo(() => [...levels].sort((a, b) => Number(a.config?.levelNumber || 0) - Number(b.config?.levelNumber || 0)), [levels]);

  const uploadBadge = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!allowedAsset.test(file.name)) {
      toast.error('Choose an SVGA, PNG, JPEG, WebP, or GIF badge');
      event.target.value = '';
      return;
    }
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await apiClient.uploadFile<any>('/api/upload/file', body);
      const url = res.data?.url || res.data?.data?.url;
      if (!url) throw new Error('Upload did not return a file URL');
      const suggestedName = await suggestAssetName(file, 'Unique ID level badge');
      setForm((current) => ({
        ...current,
        name: current.name.trim() ? current.name : (suggestedName || current.name),
        badgeIconUrl: url,
        animationType: getAssetType(file.name),
      }));
      toast.success('Level badge uploaded');
    } catch (error: any) {
      toast.error(error?.message || 'Badge upload failed');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const saveLevel = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.badgeIconUrl) {
      toast.error('Level name and badge file are required');
      return;
    }
    setLoading(true);
    try {
      const request = editingId
        ? apiClient.put(`/api/identity/admin/unique-id-levels/${editingId}`, form)
        : apiClient.post('/api/identity/admin/unique-id-levels', form);
      await request;
      toast.success(editingId ? 'Unique ID level updated' : 'Unique ID level created');
      setForm(emptyForm);
      setEditingId(null);
      await loadLevels();
    } catch (error: any) {
      toast.error(error?.message || 'Could not save level');
    } finally {
      setLoading(false);
    }
  };

  const editLevel = (level: UniqueIdLevel) => {
    setEditingId(level._id);
    setForm({
      name: level.name || '',
      levelNumber: Number(level.config?.levelNumber || level.config?.vipLevel || 1),
      badgeName: level.config?.badgeName || 'VIP ID',
      badgeIconUrl: level.config?.badgeIconUrl || '',
      animationType: level.config?.animationType || 'svga',
      description: level.description || '',
    });
  };

  const deleteLevel = async (level: UniqueIdLevel) => {
    if (!confirm(`Delete level ${level.name}? Existing user items keep their saved badge.`)) return;
    try {
      await apiClient.delete(`/api/identity/admin/unique-id-levels/${level._id}`);
      toast.success('Unique ID level deleted');
      if (editingId === level._id) { setEditingId(null); setForm(emptyForm); }
      await loadLevels();
    } catch (error: any) {
      toast.error(error?.message || 'Could not delete level');
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold">
            <Layers className="h-7 w-7 text-cyan-400" />
            Unique ID Levels
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create badge levels used by every Unique ID. Upload the animation or image once here.
          </p>
        </div>
        <Button variant="outline" onClick={() => void loadLevels()} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Level' : 'Create Level'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveLevel} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1 text-xs text-muted-foreground">
                  Level name
                  <Input value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} placeholder="Official" maxLength={40} required />
                </label>
                <label className="space-y-1 text-xs text-muted-foreground">
                  Level number
                  <Input type="number" min={1} value={form.levelNumber} onChange={(e) => setForm((current) => ({ ...current, levelNumber: Number(e.target.value) }))} required />
                </label>
              </div>
              <label className="block space-y-1 text-xs text-muted-foreground">
                Badge name
                <Input value={form.badgeName} onChange={(e) => setForm((current) => ({ ...current, badgeName: e.target.value }))} placeholder="VIP ID" maxLength={40} required />
              </label>
              <label className="block space-y-1 text-xs text-muted-foreground">
                Badge file (SVGA, PNG, JPEG, WebP, GIF)
                <Input type="file" accept=".svga,.png,.jpg,.jpeg,.webp,.gif" onChange={uploadBadge} disabled={uploading} />
              </label>
              {uploading && <p className="text-xs text-cyan-300">Uploading badge...</p>}
              {form.badgeIconUrl && <BadgePreview url={form.badgeIconUrl} name={form.badgeName} levelNumber={form.levelNumber} animationType={form.animationType} />}
              <label className="block space-y-1 text-xs text-muted-foreground">
                Description
                <Input value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} placeholder="Optional" maxLength={160} />
              </label>
              <div className="flex gap-2">
                <Button className="flex-1" disabled={loading || uploading || !form.badgeIconUrl}>
                  <UploadCloud className="mr-2 h-4 w-4" />
                  {editingId ? 'Save Level' : 'Create Level'}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid content-start gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {sortedLevels.length === 0 ? (
            <Card className="md:col-span-2 2xl:col-span-3">
              <CardContent className="p-10 text-center text-sm text-muted-foreground">
                No levels yet. Create the first level to use it when creating Unique IDs.
              </CardContent>
            </Card>
          ) : (
            sortedLevels.map((level) => {
              const url = level.config?.badgeIconUrl || '';
              const type = level.config?.animationType || getAssetType(url);
              return (
                <Card key={level._id} className="overflow-hidden">
                  <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-slate-950 to-cyan-950/50">
                    {url && !/\.svga(?:\?.*)?$/i.test(url) ? (
                      <img src={url} alt={level.config?.badgeName || level.name} className="max-h-28 max-w-28 object-contain" />
                    ) : (
                      <div className="flex h-24 w-24 animate-pulse flex-col items-center justify-center rounded-full border-4 border-amber-300 bg-gradient-to-br from-amber-300 to-amber-800 text-[10px] font-black text-white">
                        LEVEL {level.config?.levelNumber || level.config?.vipLevel}
                        <span>{type.toUpperCase()}</span>
                      </div>
                    )}
                    <Badge className="absolute right-3 top-3">{level.status}</Badge>
                  </div>
                  <CardContent className="space-y-3 p-4">
                    <div>
                      <div className="font-semibold">Level {level.config?.levelNumber || level.config?.vipLevel} · {level.name}</div>
                      <div className="text-xs text-muted-foreground">{level.config?.badgeName || 'VIP ID'} · {type.toUpperCase()}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => editLevel(level)}>
                        <Pencil className="mr-2 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => void deleteLevel(level)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
