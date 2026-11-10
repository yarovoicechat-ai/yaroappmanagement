'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiClient, getApiBaseUrl } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';

type Media = { id: string; name: string; imageUrl: string; animationUrl: string; isActive: boolean };
type Level = { level: number; frame: Media; entry: Media };
type Kind = 'frame' | 'entry';
type Field = 'imageUrl' | 'animationUrl';

export default function VipAssetsPage() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const load = async () => {
    setLoading(true);
    setFailed(false);
    try {
      const response = await apiClient.get<{ levels: Level[] }>('/api/vip/admin/assets');
      if (!response.data?.levels) throw new Error('VIP assets were not returned');
      setLevels(response.data.levels);
    } catch (error) {
      setFailed(true);
      toast.error(error instanceof Error ? error.message : 'Could not load VIP assets');
    } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const edit = (level: number, kind: Kind, patch: Partial<Media>) => {
    setLevels(previous => previous.map(item => item.level === level
      ? { ...item, [kind]: { ...item[kind], ...patch } } : item));
  };
  const upload = async (level: number, kind: Kind, field: Field, file?: File) => {
    if (!file) return;
    const extension = field === 'imageUrl' ? 'png' : 'svga';
    if (!file.name.toLowerCase().endsWith(`.${extension}`)) {
      toast.error(`Choose a .${extension} file`); return;
    }
    setBusy(`upload-${level}-${kind}-${field}`);
    try {
      const body = new FormData();
      body.append('file', file);
      const response = await apiClient.uploadFile<{ url: string }>(API_ENDPOINTS.UPLOAD.FILE, body);
      if (!response.data?.url) throw new Error('Upload URL was not returned');
      edit(level, kind, { [field]: response.data.url });
      toast.success('Uploaded. Save this VIP level to apply the change.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally { setBusy(null); }
  };
  const save = async (item: Level) => {
    setBusy(`save-${item.level}`);
    try {
      await apiClient.put(`/api/vip/admin/assets/${item.level}`, { frame: item.frame, entry: item.entry });
      toast.success(`VIP ${item.level} entries and frames saved`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Save failed');
    } finally { setBusy(null); }
  };
  const mediaUrl = (url: string) => /^https?:\/\//i.test(url) ? url : `${getApiBaseUrl()}${url}`;
  const inputClass = 'w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white';

  return <div className="space-y-6 p-6 text-slate-100">
    <div>
      <h1 className="text-2xl font-bold">VIP Entries &amp; Frames</h1>
      <p className="mt-2 text-sm text-slate-400">Manage the entry animation and avatar frame for VIP levels 1–5. Upload a PNG cover and its matching SVGA, then save the level.</p>
    </div>
    {loading && <p role="status">Loading VIP assets…</p>}
    {failed && <button onClick={() => void load()} className="rounded-lg bg-slate-700 px-4 py-2">Retry loading</button>}
    {!loading && !failed && levels.map(item => <section key={item.level} className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <h2 className="mb-4 text-xl font-semibold">VIP {item.level}</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        {(['entry', 'frame'] as Kind[]).map(kind => <fieldset key={kind} disabled={busy !== null} className="min-w-0 space-y-4 rounded-xl border border-slate-800 p-4 disabled:opacity-60">
          <legend className="px-2 font-semibold capitalize">{kind}</legend>
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mediaUrl(item[kind].imageUrl)} alt={`VIP ${item.level} ${kind} preview`} className="h-32 w-32 rounded-lg bg-slate-950 object-contain" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={item[kind].isActive} onChange={event => edit(item.level, kind, { isActive: event.target.checked })} /> Enabled
            </label>
          </div>
          <label className="block space-y-1 text-sm"><span>Name</span>
            <input className={inputClass} value={item[kind].name} maxLength={100} onChange={event => edit(item.level, kind, { name: event.target.value })} />
          </label>
          {(['imageUrl', 'animationUrl'] as Field[]).map(field => <div key={field} className="space-y-2">
            <label className="block space-y-1 text-sm"><span>{field === 'imageUrl' ? 'PNG preview URL' : 'SVGA animation URL'}</span>
              <input className={inputClass} value={item[kind][field]} onChange={event => edit(item.level, kind, { [field]: event.target.value })} />
            </label>
            <label className="block text-sm text-slate-400"><span>Upload {field === 'imageUrl' ? 'PNG preview' : 'SVGA animation'}</span>
              <input aria-label={`Upload VIP ${item.level} ${kind} ${field === 'imageUrl' ? 'PNG' : 'SVGA'}`} className="mt-1 block w-full text-xs" type="file" accept={field === 'imageUrl' ? '.png' : '.svga'} onChange={event => { void upload(item.level, kind, field, event.target.files?.[0]); event.target.value = ''; }} />
            </label>
          </div>)}
        </fieldset>)}
      </div>
      <button disabled={busy !== null} onClick={() => void save(item)} className="mt-5 rounded-lg bg-violet-600 px-5 py-2 font-semibold hover:bg-violet-500 disabled:opacity-50">
        {busy === `save-${item.level}` ? 'Saving…' : `Save VIP ${item.level}`}
      </button>
    </section>)}
    {busy?.startsWith('upload-') && <p role="status" className="text-sm text-violet-300">Uploading asset…</p>}
  </div>;
}
