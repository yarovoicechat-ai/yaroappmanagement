'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileText, Save, Info, AlertTriangle } from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

export default function CmsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<any>({
        privacyPolicy: '',
        termsAndConditions: ''
    });

    useEffect(() => {
        fetchCmsData();
    }, []);

    const fetchCmsData = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/api/admin/settings');
            if (response.success && response.data) {
                setSettings({
                    privacyPolicy: response.data.privacyPolicy || '',
                    termsAndConditions: response.data.termsAndConditions || ''
                });
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch legal notices');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCms = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            const response = await apiClient.patch('/api/admin/settings', settings);
            if (response.success) {
                toast.success('CMS content saved successfully');
                fetchCmsData();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to save CMS settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="text-center py-10 text-slate-400 font-sans font-medium">Loading CMS structures...</div>;
    }

    return (
        <form onSubmit={handleSaveCms} className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">CMS Editor</h2>
                    <p className="text-muted-foreground mt-1 font-medium font-sans">Manage privacy policy disclosures, user guidelines, and FAQs</p>
                </div>
                <Button type="submit" disabled={saving} className="flex items-center gap-1.5 font-bold">
                    <Save size={16} />
                    {saving ? 'Publishing...' : 'Publish Content'}
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Privacy Policy Editor */}
                <Card className="glass-card flex flex-col h-[600px]">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-slate-200 text-base">
                            <FileText size={18} className="text-primary" />
                            Privacy Policy (HTML Format)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col p-4 pt-0">
                        <textarea
                            className="flex-1 w-full p-3 bg-slate-900 border border-input rounded-md font-mono text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            value={settings.privacyPolicy}
                            onChange={(e) => setSettings({ ...settings, privacyPolicy: e.target.value })}
                            required
                        />
                    </CardContent>
                </Card>

                {/* Terms and Conditions Editor */}
                <Card className="glass-card flex flex-col h-[600px]">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-slate-200 text-base">
                            <FileText size={18} className="text-primary" />
                            Terms & Conditions (HTML Format)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col p-4 pt-0">
                        <textarea
                            className="flex-1 w-full p-3 bg-slate-900 border border-input rounded-md font-mono text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            value={settings.termsAndConditions}
                            onChange={(e) => setSettings({ ...settings, termsAndConditions: e.target.value })}
                            required
                        />
                    </CardContent>
                </Card>
            </div>
        </form>
    );
}
