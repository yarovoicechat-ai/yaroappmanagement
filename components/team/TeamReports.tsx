'use client';
import { useCallback, useEffect, useState } from 'react';
import { apiClient, getApiBaseUrl } from '@/lib/apiClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';

type Channel = 'voice' | 'video' | 'room';
type Progress = { achieved: number; target: number | null; pending: number | null; enabled?: boolean; unassignedHosts?: number };
type Member = { id: string; name: string; userId: number; role: string; earnedBeans: number; targetRevision?: number; roomVolume?: Progress; channels: Record<Channel, Progress> };
type Report = { month: string; root: { id: string; name: string; role: string }; counts: Record<string, number>;
  summary: { hostCount: number; earnedBeans: number; giftVolumeBeans: number; roomVolume: Progress; channels: Record<Channel, Progress> };
  members: Member[]; pagination: { page: number; limit: number; total: number }; basis: string };
const channels: Channel[] = ['voice', 'video', 'room'];
const names: Record<Channel, string> = { voice: 'Voice calling', video: 'Video calling', room: 'Room hosting' };
const num = (n: number | null | undefined) => n == null ? 'Not assigned' : n.toLocaleString();
export default function TeamReports() {
  const [month, setMonth] = useState(new Date(Date.now() + 330 * 60000).toISOString().slice(0, 7));
  const [rootId, setRootId] = useState(''), [trail, setTrail] = useState<string[]>([]), [role, setRole] = useState('');
  const [page, setPage] = useState(1), [search, setSearch] = useState(''), [report, setReport] = useState<Report | null>(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [edit, setEdit] = useState<Member | null>(null), [values, setValues] = useState<Record<Channel, string>>({ voice: '', video: '', room: '' });
  const [enabled, setEnabled] = useState<Channel[]>([]), [reason, setReason] = useState('');
  const [roomVolume, setRoomVolume] = useState('');
  const load = useCallback(async () => {
    setBusy(true); setError('');
    try { const response = await apiClient.get<Report>('/api/team/report', { month, rootId: rootId || undefined, role: role || undefined, page, search });
      if (!response.data) throw new Error('Team report unavailable'); setReport(response.data);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not load team'); }
    finally { setBusy(false); }
  }, [month, rootId, role, page, search]);
  useEffect(() => { const timer = setTimeout(() => void load(), 250); return () => clearTimeout(timer); }, [load]);
  const open = (member: Member) => {
    if (member.role !== 'host') { setTrail(t => [...t, rootId]); setRootId(member.id); setRole(''); setPage(1); return; }
    setEdit(member); setReason(''); setRoomVolume(String(member.roomVolume?.target ?? '')); setEnabled(channels.filter(c => member.channels[c].enabled));
    setValues(Object.fromEntries(channels.map(c => [c, String(member.channels[c].target ?? '')])) as Record<Channel, string>);
  };
  const save = async () => {
    if (!edit) return; setBusy(true);
    try { await apiClient.put('/api/team/targets/' + edit.id, { month, channels: enabled, revision: edit.targetRevision || 0, reason, ...(enabled.includes('room') ? { roomVolume: roomVolume === '' ? null : Number(roomVolume) } : {}),
      ...Object.fromEntries(enabled.map(c => [c, Number(values[c])])) }); setEdit(null); toast.success('Separate hosting targets saved'); await load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Could not save target'); } finally { setBusy(false); }
  };
  const download = async () => {
    setBusy(true); try { const response = await apiClient.post<{ downloadPath: string }>('/api/team/exports', { month, rootId: rootId || undefined });
      if (!response.data?.downloadPath.startsWith('/api/team/exports/')) throw new Error('Invalid export response');
      window.location.assign(new URL(response.data.downloadPath, getApiBaseUrl()).href);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Export failed'); } finally { setBusy(false); }
  };
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-bold">Team & Hosting Targets</h1><p className="text-muted-foreground mt-2">{report?.root.name || 'My hierarchy'} · Beans revenue and independent hosting targets</p></div><Button disabled={busy} onClick={() => void download()}>Generate CSV sheet</Button></div>
    <div className="flex gap-3 flex-wrap"><Input aria-label="Report month" type="month" value={month} onChange={e => { setMonth(e.target.value); setPage(1); }} className="max-w-xs" /><Input placeholder="Search team name or YARO ID" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="max-w-sm" />
      {trail.length > 0 && <Button onClick={() => { setRootId(trail[trail.length - 1]); setTrail(t => t.slice(0, -1)); setRole(''); setPage(1); }}>Up one level</Button>}</div>
    {error && <p className="text-red-500">{error}</p>}{busy && <p className="text-muted-foreground">Loading...</p>}
    {report && <>
      <div className="rounded-xl border p-5"><h2 className="font-semibold">All {report.summary.hostCount} hosts: {num(report.summary.earnedBeans)} earned Beans</h2><p className="text-sm text-muted-foreground mt-2">Room gift volume: {num(report.summary.giftVolumeBeans)} Beans reporting reference</p></div>
      <div className="grid gap-4 md:grid-cols-3">{channels.map(c => <div key={c} className="border rounded-xl p-5"><h3 className="font-semibold">{names[c]}</h3><p className="mt-3">Achieved: {num(report.summary.channels[c].achieved)} Beans</p><p>Target: {num(report.summary.channels[c].target)} Beans</p><p>Pending: {num(report.summary.channels[c].pending)} Beans</p><p className="text-sm text-muted-foreground mt-2">{report.summary.channels[c].unassignedHosts || 0} hosts without assigned targets</p></div>)}</div>
      <div className="border rounded-xl p-5"><h3 className="font-semibold">Room gift-volume target (Beans reference)</h3><p>Achieved {num(report.summary.roomVolume.achieved)} / Target {num(report.summary.roomVolume.target)} / Pending {num(report.summary.roomVolume.pending)}</p></div>
      <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => { setRole(''); setPage(1); }}>All members</Button>{Object.entries(report.counts).filter(([, n]) => n > 0).map(([r, n]) => <Button key={r} variant={r === role ? 'default' : 'outline'} onClick={() => { setRole(r); setPage(1); }}>{r}: {n}</Button>)}</div>
      <div className="border rounded-xl overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left border-b"><th className="p-4">Member</th><th className="p-4">Role</th><th className="p-4">Total earned Beans</th>{channels.map(c => <th className="p-4" key={c}>{names[c]}<br /><span className="font-normal">Achieved / target / pending Beans</span></th>)}<th className="p-4">Action</th></tr></thead><tbody>
        {report.members.map(m => <tr className="border-b" key={m.id}><td className="p-4">{m.name}<span className="block text-muted-foreground">YARO {m.userId}</span></td><td className="p-4">{m.role}</td><td className="p-4">{num(m.earnedBeans)}</td>{channels.map(c => <td className="p-4" key={c}>{num(m.channels[c].achieved)} / {m.channels[c].enabled === false ? 'N/A' : num(m.channels[c].target)} / {num(m.channels[c].pending)}</td>)}<td className="p-4"><Button variant="outline" onClick={() => open(m)}>{m.role === 'host' ? 'Host targets' : 'Open team'}</Button></td></tr>)}
      </tbody></table>{!report.members.length && <p className="p-5 text-muted-foreground">No team members match this selection.</p>}</div>
      <div className="flex gap-4 items-center"><Button variant="outline" disabled={page <= 1 || busy} onClick={() => setPage(p => p - 1)}>Previous</Button><span>Page {page}</span><Button variant="outline" disabled={page * report.pagination.limit >= report.pagination.total || busy} onClick={() => setPage(p => p + 1)}>Next</Button></div>
      <p className="text-xs text-muted-foreground">{report.basis} Pending targets are summed host by host; one host&apos;s surplus does not complete another host&apos;s target.</p>
    </>}
    {edit && <section className="border rounded-xl p-6 space-y-4"><h2 className="font-semibold">{edit.name} · {month}: independent targets</h2><p className="text-sm text-muted-foreground">Target applicability does not grant or change hosting permissions.</p>
      <div className="grid gap-4 md:grid-cols-3">{channels.map(c => <label key={c} className="grid gap-3"><span><input type="checkbox" checked={enabled.includes(c)} onChange={e => setEnabled(old => e.target.checked ? [...old, c] : old.filter(v => v !== c))} /> {names[c]}</span><Input type="number" min="0" step="1" value={values[c]} disabled={!enabled.includes(c)} onChange={e => setValues(v => ({ ...v, [c]: e.target.value }))} placeholder="Monthly earned Beans target" /></label>)}</div>
      {enabled.includes('room') && <label className="grid gap-2">Room gift-volume target (Beans reporting reference, optional)<Input type="number" min="0" step="1" value={roomVolume} onChange={e => setRoomVolume(e.target.value)} /></label>}
      <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for target assignment/change" /><div className="flex gap-3"><Button disabled={busy} onClick={() => void save()}>Save targets</Button><Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button></div>
    </section>}
  </div>;
}
