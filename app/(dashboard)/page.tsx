'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
    Gift, Layers, Award, User, Crown, FileText,
    Settings, TrendingUp, Activity, LucideIcon,
    Image, ToggleLeft, ToggleRight, CheckCircle, XCircle, ExternalLink,
    Coins, Clock, Phone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';
import { toast } from 'sonner';
import Link from 'next/link';

export type StatsCardProps = {
    title: string;
    value: string | number;
    subtitle: string;
    icon: LucideIcon;
    color: string;
    href: string;
};

type AssetItem = {
    name: string;
    status: boolean;
    image?: string;
    type?: string;
};

export default function Home() {
    const [loading, setLoading] = useState(true);
    const [gifts, setGifts] = useState<any[]>([]);
    const [banners, setBanners] = useState<any[]>([]);
    const [frames, setFrames] = useState<any[]>([]);
    const [maleAvatars, setMaleAvatars] = useState<any[]>([]);
    const [femaleAvatars, setFemaleAvatars] = useState<any[]>([]);
    const [levels, setLevels] = useState<any[]>([]);

    const [avatarRequests, setAvatarRequests] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [giftsRes, bannersRes, framesRes, maleRes, femaleRes, levelsRes, avatarReqRes] = await Promise.all([
                    apiClient.get(API_ENDPOINTS.GIFTS.LIST),
                    apiClient.get(API_ENDPOINTS.BANNERS.LIST),
                    apiClient.get(API_ENDPOINTS.FRAMES.LIST),
                    apiClient.get(API_ENDPOINTS.AVATARS.LIST('male')),
                    apiClient.get(API_ENDPOINTS.AVATARS.LIST('female')),
                    apiClient.get(API_ENDPOINTS.LEVELS_MGMT.LIST),
                    apiClient.get('/api/v1/avatar-requests?status=pending'),
                ]);

                if (giftsRes.success) setGifts((giftsRes.data as any) || []);
                if (bannersRes.success) setBanners((bannersRes.data as any) || []);
                if (framesRes.success) setFrames((framesRes.data as any) || []);
                if (maleRes.success) setMaleAvatars((maleRes.data as any) || []);
                if (femaleRes.success) setFemaleAvatars((femaleRes.data as any) || []);
                if (levelsRes.success) setLevels((levelsRes.data as any) || []);
                if (avatarReqRes.success) setAvatarRequests((avatarReqRes.data as any)?.requests || (avatarReqRes as any)?.data || []);

            } catch (error) {
                toast.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const activeGifts = gifts.filter((g: any) => g.isActive !== false).length;
    const activeBanners = banners.filter((b: any) => b.isActive !== false).length;
    const totalAvatars = maleAvatars.length + femaleAvatars.length;

    const permanentLevels = levels.filter((l: any) => !l.expiresAt);
    const promoLevels = levels.filter((l: any) => !!l.expiresAt);

    const statsCards: StatsCardProps[] = [
        {
            title: 'Host Levels',
            value: levels.length,
            subtitle: `${permanentLevels.length} permanent · ${promoLevels.length} promo`,
            icon: Award,
            color: 'text-purple-400',
            href: '/levels',
        },
        {
            title: 'Total Gifts',
            value: gifts.length,
            subtitle: `${activeGifts} active`,
            icon: Gift,
            color: 'text-rose-400',
            href: '/gifts',
        },
        {
            title: 'Total Banners',
            value: banners.length,
            subtitle: `${activeBanners} live`,
            icon: Layers,
            color: 'text-blue-400',
            href: '/banners',
        },
        {
            title: 'Total Frames',
            value: frames.length,
            subtitle: 'Profile frames',
            icon: Award,
            color: 'text-amber-400',
            href: '/frames',
        },
        {
            title: 'Total Avatars',
            value: totalAvatars,
            subtitle: `${maleAvatars.length} male · ${femaleAvatars.length} female`,
            icon: User,
            color: 'text-emerald-400',
            href: '/avatars',
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <p className="text-slate-400 text-sm">Loading config panel...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Config Dashboard
                    </h2>
                    <p className="text-muted-foreground mt-1">Manage engagement assets & app configuration</p>
                </div>
                <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-lg border border-border">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Assets Live</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {statsCards.map((card) => (
                    <StatsCard key={card.title} {...card} />
                ))}
            </div>

            {/* Quick Access Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                <QuickAccessCard
                    title="CMS Editor"
                    description="Edit app content & text strings"
                    icon={FileText}
                    href="/cms"
                    color="from-violet-500/20 to-violet-600/5"
                    iconColor="text-violet-400"
                />
                <QuickAccessCard
                    title="Settings"
                    description="Configure app-wide settings"
                    icon={Settings}
                    href="/settings"
                    color="from-slate-500/20 to-slate-600/5"
                    iconColor="text-slate-400"
                />
                <QuickAccessCard
                    title="VIP Program"
                    description="Manage VIP tiers & benefits"
                    icon={Crown}
                    href="/vip"
                    color="from-amber-500/20 to-amber-600/5"
                    iconColor="text-amber-400"
                />
            </div>

            {/* Asset Overview Section */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Host Levels Overview */}
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Award className="h-4 w-4 text-purple-400" />
                            Host Levels Overview
                        </CardTitle>
                        <Link href="/levels" className="text-xs text-primary hover:underline flex items-center gap-1">
                            Manage <ExternalLink className="h-3 w-3" />
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {levels.length === 0 ? (
                            <p className="text-sm text-slate-500 py-4 text-center">No levels configured yet.</p>
                        ) : (
                            <div className="space-y-2">
                                {levels.slice(0, 6).map((l: any, i: number) => (
                                    <div key={i} className="flex items-center gap-3 py-1.5 border-b border-slate-800/50 last:border-0">
                                        <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                            <Award className="h-4 w-4 text-purple-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-200 truncate">
                                                {l.expiresAt ? '⏳ ' : ''}{l.name}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <span className="flex items-center gap-0.5"><Phone className="h-3 w-3" /> {l.minCalls} calls</span>
                                                <span>·</span>
                                                <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {l.minMinutes} mins</span>
                                            </div>
                                        </div>
                                        <div className="shrink-0 flex items-center gap-1 text-xs font-bold text-yellow-500">
                                            <Coins className="h-3 w-3" />
                                            {l.coinPerMinute}/min
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Gifts */}
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Gift className="h-4 w-4 text-rose-400" />
                            Gifts Overview
                        </CardTitle>
                        <Link href="/gifts" className="text-xs text-primary hover:underline flex items-center gap-1">
                            Manage <ExternalLink className="h-3 w-3" />
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <AssetList
                            items={gifts.slice(0, 6).map((g: any) => ({
                                name: g.name || 'Gift',
                                status: g.isActive !== false,
                                image: g.image,
                                type: `${g.price || 0} coins`,
                            }))}
                            emptyText="No gifts found. Add one!"
                        />
                    </CardContent>
                </Card>

                {/* Recent Banners */}
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Layers className="h-4 w-4 text-blue-400" />
                            Banners Overview
                        </CardTitle>
                        <Link href="/banners" className="text-xs text-primary hover:underline flex items-center gap-1">
                            Manage <ExternalLink className="h-3 w-3" />
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <AssetList
                            items={banners.slice(0, 6).map((b: any) => ({
                                name: b.title || b.name || 'Banner',
                                status: b.isActive !== false,
                                image: b.image,
                                type: b.type || 'Banner',
                            }))}
                            emptyText="No banners found. Add one!"
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Frames & Avatars row */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Frames */}
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Award className="h-4 w-4 text-amber-400" />
                            Frames Overview
                        </CardTitle>
                        <Link href="/frames" className="text-xs text-primary hover:underline flex items-center gap-1">
                            Manage <ExternalLink className="h-3 w-3" />
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <AssetList
                            items={frames.slice(0, 6).map((f: any) => ({
                                name: f.name || f.level || 'Frame',
                                status: true,
                                image: f.image,
                                type: `Level ${f.level || '—'}`,
                            }))}
                            emptyText="No frames found. Add one!"
                        />
                    </CardContent>
                </Card>

                {/* Avatars */}
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <User className="h-4 w-4 text-emerald-400" />
                            Avatars Overview
                        </CardTitle>
                        <Link href="/avatars" className="text-xs text-primary hover:underline flex items-center gap-1">
                            Manage <ExternalLink className="h-3 w-3" />
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-6 py-2">
                            <div className="flex flex-col items-center gap-1">
                                <p className="text-2xl font-bold text-slate-200">{maleAvatars.length}</p>
                                <p className="text-xs text-slate-500 font-medium">Male Avatars</p>
                            </div>
                            <div className="h-10 w-px bg-slate-700" />
                            <div className="flex flex-col items-center gap-1">
                                <p className="text-2xl font-bold text-slate-200">{femaleAvatars.length}</p>
                                <p className="text-xs text-slate-500 font-medium">Female Avatars</p>
                            </div>
                            <div className="h-10 w-px bg-slate-700" />
                            <div className="flex flex-col items-center gap-1">
                                <p className="text-2xl font-bold text-primary">{totalAvatars}</p>
                                <p className="text-xs text-slate-500 font-medium">Total</p>
                            </div>
                        </div>
                        {totalAvatars === 0 && (
                            <p className="text-sm text-slate-500 py-4 text-center">No avatars found. Add some!</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Avatar Verification Requests Section */}
            <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <User className="h-4 w-4 text-purple-400" />
                        Pending Avatar Verification Requests
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                            {avatarRequests.length} Pending
                        </span>
                    </CardTitle>
                    <Link href="/avatar-requests" className="text-xs text-primary hover:underline flex items-center gap-1">
                        View All <ExternalLink className="h-3 w-3" />
                    </Link>
                </CardHeader>
                <CardContent>
                    {avatarRequests.length === 0 ? (
                        <p className="text-sm text-slate-500 py-4 text-center">No pending avatar requests from verified hosts.</p>
                    ) : (
                        <div className="space-y-3">
                            {avatarRequests.slice(0, 5).map((req: any) => (
                                <div key={req._id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 gap-4">
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-semibold text-slate-200">{req.hostUserObjId?.name || `Host #${req.hostId}`}</p>
                                        <p className="text-xs text-slate-400">Host ID: <code className="text-pink-400">{req.hostId}</code></p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-center">
                                            <p className="text-[10px] text-slate-400">Current</p>
                                            {req.currentAvatar ? (
                                                <img src={req.currentAvatar} alt="Current" className="h-10 w-10 rounded-full object-cover border border-slate-600" />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-slate-400">None</div>
                                            )}
                                        </div>
                                        <span className="text-slate-500 font-bold">→</span>
                                        <div className="text-center">
                                            <p className="text-[10px] text-purple-400 font-semibold">Requested</p>
                                            <img src={req.requestedAvatar} alt="Requested" className="h-10 w-10 rounded-full object-cover border-2 border-purple-500 shadow-md shadow-purple-500/20" />
                                        </div>
                                    </div>
                                    <Link href="/avatar-requests">
                                        <Button size="sm" variant="outline" className="text-xs">
                                            Review Request
                                        </Button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function StatsCard({ title, value, subtitle, icon: Icon, color, href }: StatsCardProps) {
    return (
        <Link href={href}>
            <Card glass className="relative overflow-hidden group cursor-pointer hover:border-primary/30 transition-all duration-200">
                <div className="absolute right-0 top-0 h-24 w-24 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full transition-transform group-hover:scale-110" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {title}
                    </CardTitle>
                    <div className={cn("p-2 rounded-lg bg-secondary/50 border border-border group-hover:border-primary/30 transition-colors", color)}>
                        <Icon className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground">{value}</div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {subtitle}
                    </p>
                </CardContent>
            </Card>
        </Link>
    );
}

function QuickAccessCard({
    title, description, icon: Icon, href, color, iconColor
}: {
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
    color: string;
    iconColor: string;
}) {
    return (
        <Link href={href}>
            <Card className={cn(
                "group cursor-pointer border border-border hover:border-primary/40 transition-all duration-200 overflow-hidden relative bg-gradient-to-br",
                color
            )}>
                <CardContent className="p-5 flex items-center gap-4">
                    <div className={cn("p-3 rounded-xl bg-slate-800/60 border border-slate-700/50", iconColor)}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{title}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{description}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-slate-600 group-hover:text-primary transition-colors shrink-0" />
                </CardContent>
            </Card>
        </Link>
    );
}

function AssetList({ items, emptyText }: { items: AssetItem[]; emptyText: string }) {
    if (!items || items.length === 0) {
        return <p className="text-sm text-slate-500 py-4 text-center">{emptyText}</p>;
    }

    return (
        <div className="space-y-2">
            {items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5 border-b border-slate-800/50 last:border-0">
                    {item.image ? (
                        <img
                            src={item.image}
                            alt={item.name}
                            className="h-8 w-8 rounded-lg object-cover border border-slate-700"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                            <Image className="h-4 w-4 text-slate-600" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{item.name}</p>
                        {item.type && <p className="text-xs text-slate-500">{item.type}</p>}
                    </div>
                    <div className="shrink-0">
                        {item.status ? (
                            <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                                <CheckCircle className="h-3 w-3" /> Active
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                                <XCircle className="h-3 w-3" /> Off
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
