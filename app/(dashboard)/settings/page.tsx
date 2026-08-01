'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { Save, PhoneCall, Gift, Radio, ShieldCheck, WalletCards, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

interface AppSettings {
  commissionRate: number;
  giftCommissionPercent: number;
  withdrawalPlatformFeePercent: number;
  callRatePerMinute: number;
  chatMessageCost: number;
  coinPrice: number;
  minPayout: number;
  agoraAppId: string;
  agoraCertificateConfigured: boolean;
  maintenanceMode: boolean;
  emailAlerts: boolean;
  userNotifications: boolean;
  systemDigest: boolean;
}

const defaults: AppSettings = {
  commissionRate: 20,
  giftCommissionPercent: 20,
  withdrawalPlatformFeePercent: 5,
  callRatePerMinute: 100,
  chatMessageCost: 10,
  coinPrice: 0.1,
  minPayout: 50,
  agoraAppId: '',
  agoraCertificateConfigured: false,
  maintenanceMode: false,
  emailAlerts: true,
  userNotifications: true,
  systemDigest: true,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(defaults);
  const [agoraCertificate, setAgoraCertificate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiClient.get<AppSettings>('/api/admin/settings')
      .then(res => setSettings({ ...defaults, ...(res.data || {}) }))
      .catch((error: any) => toast.error(error?.message || 'Settings load nahi hue'))
      .finally(() => setLoading(false));
  }, []);

  const numberField = (key: keyof AppSettings, value: string) => {
    setSettings(current => ({ ...current, [key]: Number(value) }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload: any = { ...settings };
      delete payload.agoraCertificateConfigured;
      if (agoraCertificate.trim()) payload.agoraAppCertificate = agoraCertificate.trim();
      const res = await apiClient.patch<AppSettings>('/api/admin/settings', payload);
      setSettings({ ...defaults, ...(res.data || {}) });
      setAgoraCertificate('');
      toast.success('App configuration saved and active');
    } catch (error: any) {
      toast.error(error?.message || 'Settings save nahi hue');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-12 text-center text-muted-foreground">Loading app configuration…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">App Control Settings</h2>
          <p className="text-muted-foreground mt-1">Runtime calling, commission, economy, Agora and app behavior controls.</p>
        </div>
        <Button onClick={() => void save()} disabled={saving}><Save className="h-4 w-4 mr-2" />{saving ? 'Saving…' : 'Save All'}</Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="glass-card">
          <CardHeader><CardTitle className="flex gap-2"><PhoneCall className="h-5 w-5" />Calling & Platform Commission</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Caller rate (diamonds/min)" help="Caller must have at least this balance; each started minute costs this amount.">
              <Input type="number" min="1" value={settings.callRatePerMinute} onChange={e => numberField('callRatePerMinute', e.target.value)} />
            </Field>
            <Field label="Platform commission (%)" help="Recorded as the platform commission setting for call accounting.">
              <Input type="number" min="0" max="100" value={settings.commissionRate} onChange={e => numberField('commissionRate', e.target.value)} />
            </Field>
            <Field label="Chat message cost" help="Diamonds charged for configured paid chat messages.">
              <Input type="number" min="0" value={settings.chatMessageCost} onChange={e => numberField('chatMessageCost', e.target.value)} />
            </Field>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle className="flex gap-2"><Gift className="h-5 w-5" />Gift & Withdrawal Commission</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Gift commission (%)" help="Platform share from every gift; remaining coins go to the host.">
              <Input type="number" min="0" max="100" value={settings.giftCommissionPercent} onChange={e => numberField('giftCommissionPercent', e.target.value)} />
            </Field>
            <Field label="Withdrawal fee (%)" help="Platform fee deducted from each withdrawal payout.">
              <Input type="number" min="0" max="100" value={settings.withdrawalPlatformFeePercent} onChange={e => numberField('withdrawalPlatformFeePercent', e.target.value)} />
            </Field>
            <Field label="Coin price" help="Public coin price displayed by app services.">
              <Input type="number" min="0" step="0.01" value={settings.coinPrice} onChange={e => numberField('coinPrice', e.target.value)} />
            </Field>
            <Field label="Minimum payout" help="Configured operational payout threshold.">
              <Input type="number" min="0" value={settings.minPayout} onChange={e => numberField('minPayout', e.target.value)} />
            </Field>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle className="flex gap-2"><Radio className="h-5 w-5" />Agora Calling Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label="Agora App ID" help="32-character Agora project App ID. New calls use it immediately after save.">
              <Input maxLength={32} value={settings.agoraAppId} onChange={e => setSettings({ ...settings, agoraAppId: e.target.value.trim() })} />
            </Field>
            <Field label="Agora App Certificate" help={settings.agoraCertificateConfigured ? 'Certificate is configured. Leave blank to keep the existing encrypted value.' : 'Certificate is not configured.'}>
              <Input type="password" maxLength={32} autoComplete="new-password" placeholder={settings.agoraCertificateConfigured ? '••••••••••••••••••••••••••••••••' : 'Enter 32-character certificate'} value={agoraCertificate} onChange={e => setAgoraCertificate(e.target.value.trim())} />
            </Field>
            <div className="flex items-center gap-2 text-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="text-muted-foreground">Certificate encrypted hai aur API/panel me plaintext kabhi return nahi hota.</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle className="flex gap-2"><Settings className="h-5 w-5" />App Behavior</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <Toggle label="Maintenance mode" help="User-facing services ko maintenance state me mark karta hai." checked={settings.maintenanceMode} onChange={value => setSettings({ ...settings, maintenanceMode: value })} />
            <Toggle label="User notifications" help="Global user notification setting." checked={settings.userNotifications} onChange={value => setSettings({ ...settings, userNotifications: value })} />
            <Toggle label="Email alerts" help="Operational email alerts." checked={settings.emailAlerts} onChange={value => setSettings({ ...settings, emailAlerts: value })} />
            <Toggle label="System digest" help="Periodic system digest." checked={settings.systemDigest} onChange={value => setSettings({ ...settings, systemDigest: value })} />
          </CardContent>
        </Card>
      </div>

      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardContent className="p-4 flex gap-3 text-sm text-muted-foreground">
          <WalletCards className="h-5 w-5 text-amber-400 shrink-0" />
          <p>Host call earning level ke Coin/Min aur exact connected seconds se hi calculate hoti rahegi. Caller rate aur gift/withdrawal commissions yahan se runtime manage honge.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, help, children }: { label: string; help: string; children: React.ReactNode }) {
  return <div className="space-y-2"><label className="text-sm font-semibold">{label}</label>{children}<p className="text-xs text-muted-foreground">{help}</p></div>;
}

function Toggle({ label, help, checked, onChange }: { label: string; help: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <div className="flex items-center justify-between gap-4"><div><p className="text-sm font-semibold">{label}</p><p className="text-xs text-muted-foreground">{help}</p></div><Switch checked={checked} onCheckedChange={onChange} /></div>;
}
