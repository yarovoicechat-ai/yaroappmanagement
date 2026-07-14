'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PlusCircle, User, Video, ShieldCheck, Layers, BarChart, ShieldAlert } from "lucide-react";
import { toast } from 'sonner';

export default function AddNewEntityPage() {
    const [entityType, setEntityType] = useState<'user' | 'host' | 'seller' | 'banner' | 'ad' | 'vip'>('user');
    
    // Form fields state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Mock submission
            setTimeout(() => {
                toast.success(`New ${entityType} "${name}" created successfully`);
                setName('');
                setEmail('');
                setPhone('');
                setLoading(false);
            }, 1000);
        } catch (err) {
            toast.error("Failed to register entity");
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Quick Creation Center</h2>
                <p className="text-muted-foreground mt-1 font-medium font-sans">Quickly register or configure a new app component from a single window</p>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="text-slate-200">Select Entity Type</CardTitle>
                    <CardDescription>Choose what kind of entity or service config you want to add</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-2 pb-6">
                    <Button variant={entityType === 'user' ? 'default' : 'outline'} onClick={() => setEntityType('user')} className="font-bold flex items-center gap-1.5 py-6">
                        <User size={16} />
                        User
                    </Button>
                    <Button variant={entityType === 'host' ? 'default' : 'outline'} onClick={() => setEntityType('host')} className="font-bold flex items-center gap-1.5 py-6">
                        <Video size={16} />
                        Host
                    </Button>
                    <Button variant={entityType === 'seller' ? 'default' : 'outline'} onClick={() => setEntityType('seller')} className="font-bold flex items-center gap-1.5 py-6">
                        <ShieldAlert size={16} />
                        Seller
                    </Button>
                    <Button variant={entityType === 'banner' ? 'default' : 'outline'} onClick={() => setEntityType('banner')} className="font-bold flex items-center gap-1.5 py-6">
                        <Layers size={16} />
                        Banner
                    </Button>
                    <Button variant={entityType === 'ad' ? 'default' : 'outline'} onClick={() => setEntityType('ad')} className="font-bold flex items-center gap-1.5 py-6">
                        <BarChart size={16} />
                        Ad Config
                    </Button>
                    <Button variant={entityType === 'vip' ? 'default' : 'outline'} onClick={() => setEntityType('vip')} className="font-bold flex items-center gap-1.5 py-6">
                        <ShieldCheck size={16} />
                        VIP Tier
                    </Button>
                </CardContent>
            </Card>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-200 capitalize">
                        <PlusCircle size={20} className="text-primary animate-pulse" />
                        Create New {entityType}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Name / Title</label>
                            <Input
                                placeholder={`Enter ${entityType} name`}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        
                        {(entityType === 'user' || entityType === 'host' || entityType === 'seller') && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300">Email Address</label>
                                    <Input
                                        type="email"
                                        placeholder="e.g. testing@mithichat.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300">Phone Number (Optional)</label>
                                    <Input
                                        placeholder="e.g. +91 99999 99999"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        {entityType === 'banner' && (
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Image Asset URL</label>
                                <Input
                                    placeholder="https://image-host.com/carousel-slide.jpg"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        {entityType === 'ad' && (
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">AdMob SDK Unit ID</label>
                                <Input
                                    placeholder="ca-app-pub-3940256099942544/6300978111"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        {entityType === 'vip' && (
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">VIP Price (USD)</label>
                                <Input
                                    type="number"
                                    placeholder="9.99"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <Button type="submit" className="w-full font-bold" disabled={loading}>
                            {loading ? 'Submitting...' : `Register ${entityType}`}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
