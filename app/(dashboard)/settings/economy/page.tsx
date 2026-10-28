'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { toast } from 'sonner';

type Rules = {
  beansPerInr: number; giftBeansPerDiamond: number; calendarOffsetMinutes: number;
  voice: Record<string, number>; video: Record<string, number>; gift: Record<string, number>;
  salary: { minDays: number; minHostingMinutes: number; minDayMinutes: number; slabs: { diamonds: number; bps: number }[] };
  withdrawal: Record<string, number>;
};
type State = { defaults: Rules; versions: { version: string; effectiveAt: string; digest: string; rules: Rules }[];
  rollout: { enabled: boolean; version?: string; revision: number }; production: boolean; stagingAllowed: boolean };
export default function EconomySettingsPage() {
  const { user, isLoading } = useAuth();
  const [data, setData] = useState<State | null>(null);
  const [rules, setRules] = useState<Rules | null>(null);
  const [version, setVersion] = useState('economy-v2');
  const [effectiveAt, setEffectiveAt] = useState('');
  const [selected, setSelected] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<Record<string, unknown> | null>(null);
  const load = async () => {
    const res = await apiClient.get<State>('/api/economy/settings');
    if (!res.data) throw new Error('Settings unavailable');
    setData(res.data); setRules(current => current || structuredClone(res.data!.defaults));
    setSelected(current => current || res.data!.rollout.version || res.data!.versions[0]?.version || '');
  };
  useEffect(() => { if (user?.role === 'owner') void load().catch(e => toast.error(e.message)); }, [user?.role]);
  const run = async (fn: () => Promise<void>) => { setBusy(true); try { await fn(); } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Operation failed'); } finally { setBusy(false); } };
  if (isLoading) return <p>Loading owner session...</p>;
  if (user?.role !== 'owner') return <p>Economy release controls require the Owner role.</p>;
  if (!data || !rules) return <p>Loading economy versions...</p>;
  const set = (section: keyof Rules | '', key: string, value: string) => {
    const next = structuredClone(rules) as unknown as Record<string, unknown>;
    if (section) (next[section] as Record<string, number>)[key] = Number(value);
    else next[key] = Number(value);
    setRules(next as unknown as Rules);
  };
  const field = (label: string, section: keyof Rules | '', key: string, value: number) => <label className="grid gap-1 text-sm" key={`${section}-${key}`}>
    {label}<Input type="number" min="0" step="1" value={value} onChange={e => set(section, key, e.target.value)} />
  </label>;
  const create = () => run(async () => {
    if (!effectiveAt || !reason.trim()) throw new Error('Choose an effective date and give a reason');
    await apiClient.post('/api/economy/versions', { version, effectiveAt: new Date(effectiveAt).toISOString(), reason, rules });
    toast.success('Immutable version saved. Current economy remains active.'); await load();
  });
  const toggle = (enabled: boolean) => run(async () => {
    if (!reason.trim()) throw new Error('A release or rollback reason is required');
    await apiClient.post('/api/economy/rollout', { version: selected, enabled, revision: data.rollout.revision, reason });
    toast.success(enabled ? 'Staging flag enabled. Effective date still applies.' : 'New activity uses the current economy. Pinned transactions retain their original version.');
    await load();
  });
  return <div className="space-y-6">
    <div><h1 className="text-3xl font-bold">Economy versions</h1><p className="text-muted-foreground mt-2">Current mode: {data.rollout.enabled ? `${data.rollout.version} scheduled/enabled` : 'Legacy economy'}. Existing wallet balances keep their original basis.</p></div>
    <Card><CardHeader><CardTitle>Create a future version</CardTitle></CardHeader><CardContent className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2"><label>Version ID<Input value={version} onChange={e => setVersion(e.target.value)} /></label>
        <label>Effective date (your local time)<Input type="datetime-local" value={effectiveAt} onChange={e => setEffectiveAt(e.target.value)} /></label>
        {field('Beans per INR (new earnings only)', '', 'beansPerInr', rules.beansPerInr)}
        {field('Gift accounting Beans per Diamond', '', 'giftBeansPerDiamond', rules.giftBeansPerDiamond)}</div>
      <p className="text-sm text-muted-foreground">One Diamond is 100 Diamond Units. Percentages use basis points: 4,500 = 45%. Purchased Diamonds have no direct Beans withdrawal conversion.</p>
      {(['voice', 'video'] as const).map(kind => <div key={kind}><h3 className="font-semibold capitalize mb-2">{kind} calling</h3><div className="grid gap-4 sm:grid-cols-3">
        {field('Diamond Units per started minute', kind, 'diamondUnitsPerMinute', rules[kind].diamondUnitsPerMinute)}
        {field('Host Beans per billable minute', kind, 'hostBeansPerMinute', rules[kind].hostBeansPerMinute)}
        {field('Reference INR paise per minute', kind, 'referencePaisePerMinute', rules[kind].referencePaisePerMinute)}</div></div>)}
      <div className="grid gap-4 sm:grid-cols-2">{field('Host instant share (basis points; cap 4,500)', 'gift', 'instantBps', rules.gift.instantBps)}
        {field('Salary reserve cap (basis points; cap 1,500)', 'gift', 'salaryMaxBps', rules.gift.salaryMaxBps)}
        {field('Agency commission cap (basis points; cap 1,000)', 'gift', 'agencyMaxBps', rules.gift.agencyMaxBps)}
        {field('Platform minimum (basis points; at least 3,000)', 'gift', 'platformMinBps', rules.gift.platformMinBps)}</div>
      <h3 className="font-semibold">Monthly salary eligibility</h3><div className="grid gap-4 sm:grid-cols-3">
        {field('Minimum active days', 'salary', 'minDays', rules.salary.minDays)}
        {field('Minimum valid hosting minutes', 'salary', 'minHostingMinutes', rules.salary.minHostingMinutes)}
        {field('Minimum minutes per active day', 'salary', 'minDayMinutes', rules.salary.minDayMinutes)}</div>
      <div className="grid gap-3">{rules.salary.slabs.map((slab, index) => <div className="grid grid-cols-2 gap-4" key={index}>
        <label>Minimum monthly Diamonds<Input type="number" min="0" value={slab.diamonds} onChange={e => { const next = structuredClone(rules); next.salary.slabs[index].diamonds = Number(e.target.value); setRules(next); }} /></label>
        <label>Salary basis points<Input type="number" min="0" max="1500" value={slab.bps} onChange={e => { const next = structuredClone(rules); next.salary.slabs[index].bps = Number(e.target.value); setRules(next); }} /></label></div>)}</div>
      <div className="grid gap-4 sm:grid-cols-2">{field('Withdrawal minimum in paise', 'withdrawal', 'minimumPaise', rules.withdrawal.minimumPaise)}
        {field('Withdrawal fee in basis points', 'withdrawal', 'feeBps', rules.withdrawal.feeBps)}</div>
      <label className="grid gap-1">Change/release reason<Input value={reason} onChange={e => setReason(e.target.value)} /></label>
      <Button onClick={() => void create()} disabled={busy}>Save version without activation</Button>
    </CardContent></Card>
    <Card><CardHeader><CardTitle>Rollout and reconciliation</CardTitle></CardHeader><CardContent className="space-y-4">
      <select className="bg-background border rounded p-2 w-full" aria-label="Economy version" value={selected} onChange={e => setSelected(e.target.value)}>
        <option value="">Choose a version</option>{data.versions.map(v => <option key={v.version} value={v.version}>{v.version} — {new Date(v.effectiveAt).toLocaleString()}</option>)}</select>
      <p className="text-sm">Production activation requires finance reconciliation, staging evidence and a separately installed release decision. This page cannot manufacture that approval.</p>
      <div className="flex gap-3 flex-wrap"><Button disabled={busy || !selected || data.production || !data.stagingAllowed} onClick={() => void toggle(true)}>Enable for staging</Button>
        <Button disabled={busy || !data.rollout.enabled} onClick={() => void toggle(false)}>Disable for new activity</Button>
        <Button disabled={busy} onClick={() => void run(async () => { const res = await apiClient.get<Record<string, unknown>>('/api/economy/reconciliation'); setReport(res.data || null); })}>Generate read-only reconciliation</Button></div>
      {report && <pre className="text-xs overflow-auto max-h-96 bg-muted rounded p-4">{JSON.stringify(report, null, 2)}</pre>}
      <div className="space-y-2">{data.versions.map(v => <details key={v.version} className="border rounded p-3"><summary>{v.version} · {new Date(v.effectiveAt).toLocaleString()}</summary><pre className="text-xs overflow-auto">{JSON.stringify({ digest: v.digest, rules: v.rules }, null, 2)}</pre></details>)}</div>
    </CardContent></Card>
  </div>;
}
