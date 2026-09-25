'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
    Gift, Layers, Award, User, Crown, FileText,
    Settings, TrendingUp, LucideIcon,
    Image, CheckCircle, XCircle, ExternalLink,
    Coins, Clock, Phone, Sparkles, ArrowUpRight, ShoppingBag
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
    gradient: string;
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
            color: 'text-violet-400 border-violet-500/30 bg-violet-500/10',
            gradient: 'from-violet-500/15 to-transparent',
            href: '/levels',
        },
        {
            title: 'Total Gifts',
            value: gifts.length,
            subtitle: `${activeGifts} active catalogue`,
            icon: Gift,
            color: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
            gradient: 'from-rose-500/15 to-transparent',
            href: '/gifts',
        },
        {
            title: 'Total Banners',
            value: banners.length,
            subtitle: `${activeBanners} live campaigns`,
            icon: Layers,
            color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
            gradient: 'from-cyan-500/15 to-transparent',
            href: '/banners',
        },
        {
            title: 'Total Frames',
            value: frames.length,
            subtitle: 'Avatar overlay frames',
            icon: Award,
            color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
            gradient: 'from-amber-500/15 to-transparent',
            href: '/frames',
        },
        {
            title: 'Total Avatars',
            value: totalAvatars,
            subtitle: `${maleAvatars.length} male · ${femaleAvatars.length} female`,
            icon: User,
            color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
            gradient: 'from-emerald-500/15 to-transparent',
            href: '/avatars',
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[70vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Synchronizing Console...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-cyan-400" />
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                            Config Dashboard
                        </h1>
                    </div>
                    <p className="text-slate-400 text-xs sm:text-sm mt-1">
                        Live control center for economy assets, level progression, and content configuration.
                    </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 shadow-sm shadow-emerald-500/10 w-fit">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Asset Pipeline Active</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
                {statsCards.map((card) => (
                    <StatsCard key={card.title} {...card} />
                ))}
            </div>

            {/* Quick Access Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <QuickAccessCard
                    title="Store & Items"
                    description="Unique IDs, Bubbles, Themes, Tassels, Mic Waves, Frames, VIP"
                    icon={ShoppingBag}
                    href="/store"
                    color="from-pink-500/20 via-rose-500/10 to-transparent hover:border-pink-500/40"
                    iconColor="text-pink-400 bg-pink-500/10 border-pink-500/30 shadow-[0_0_12px_rgba(236,72,153,0.25)]"
                />
                <QuickAccessCard
                    title="CMS Editor"
                    description="Edit app policies, terms, FAQs & content strings"
                    icon={FileText}
                    href="/cms"
                    color="from-violet-500/15 to-indigo-500/5 hover:border-violet-500/40"
                    iconColor="text-violet-400 bg-violet-500/10 border-violet-500/30"
                />
                <QuickAccessCard
                    title="Console Settings"
                    description="Configure platform parameters and system toggles"
                    icon={Settings}
                    href="/settings"
                    color="from-cyan-500/15 to-blue-500/5 hover:border-cyan-500/40"
                    iconColor="text-cyan-400 bg-cyan-500/10 border-cyan-500/30"
                />
                <QuickAccessCard
                    title="VIP Program"
                    description="Configure exclusive privilege tiers & host perks"
                    icon={Crown}
                    href="/vip"
                    color="from-amber-500/15 to-orange-500/5 hover:border-amber-500/40"
                    iconColor="text-amber-400 bg-amber-500/10 border-amber-500/30"
                />
            </div>

            {/* Asset Overview Section */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Host Levels Overview */}
                <Card className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-xl shadow-black/40">
                    <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-white/5">
                        <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
                            <Award className="h-4 w-4 text-violet-400" />
                            Host Levels Overview
                        </CardTitle>
                        <Link href="/levels" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors">
                            Manage Levels <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {levels.length === 0 ? (
                            <p className="text-sm text-slate-500 py-6 text-center">No levels configured yet.</p>
                        ) : (
                            <div className="space-y-2.5">
                                {levels.slice(0, 6).map((l: any, i: number) => (
                                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                                        <div className="h-9 w-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                                            <Award className="h-4 w-4 text-violet-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm font-semibold text-slate-200 truncate">
                                                {l.expiresAt ? '⏳ ' : ''}{l.name}
                                            </p>
                                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                                <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-slate-500" /> {l.minCalls} calls</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-slate-500" /> {l.minMinutes} mins</span>
                                            </div>
                                        </div>
                                        <div className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs font-bold text-amber-400 shadow-sm">
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
                <Card className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-xl shadow-black/40">
                    <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-white/5">
                        <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
                            <Gift className="h-4 w-4 text-rose-400" />
                            Gifts Catalogue
                        </CardTitle>
                        <Link href="/gifts" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors">
                            Manage Gifts <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <AssetList
                            items={gifts.slice(0, 6).map((g: any) => ({
                                name: g.name || 'Gift',
                                status: g.isActive !== false,
                                image: g.image,
                                type: `${g.price || 0} coins`,
                            }))}
                            emptyText="No gifts found in catalogue."
                        />
                    </CardContent>
                </Card>

                {/* Recent Banners */}
                <Card className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-xl shadow-black/40">
                    <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-white/5">
                        <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
                            <Layers className="h-4 w-4 text-cyan-400" />
                            Marketing Banners
                        </CardTitle>
                        <Link href="/banners" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors">
                            Manage Banners <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <AssetList
                            items={banners.slice(0, 6).map((b: any) => ({
                                name: b.title || b.name || 'Banner',
                                status: b.isActive !== false,
                                image: b.image,
                                type: b.type || 'In-App Display',
                            }))}
                            emptyText="No banners active."
                        />
                    </CardContent>
                </Card>

                {/* Frames Overview */}
                <Card className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-xl shadow-black/40">
                    <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-white/5">
                        <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
                            <Award className="h-4 w-4 text-amber-400" />
                            Profile Frames
                        </CardTitle>
                        <Link href="/frames" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors">
                            Manage Frames <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <AssetList
                            items={frames.slice(0, 6).map((f: any) => ({
                                name: f.name || f.level || 'Frame',
                                status: true,
                                image: f.image,
                                type: `Level ${f.level || '—'}`,
                            }))}
                            emptyText="No frames registered."
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Avatar Verification Requests Section */}
            <Card className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl shadow-black/40">
                <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-white/5">
                    <div className="flex items-center gap-2.5">
                        <User className="h-4 w-4 text-violet-400" />
                        <CardTitle className="text-base font-bold text-white">
                            Pending Avatar Verification Requests
                        </CardTitle>
                        <span className="px-2.5 py-0.5 text-xs rounded-full bg-violet-500/20 text-violet-300 font-bold border border-violet-500/30">
                            {avatarRequests.length} Pending
                        </span>
                    </div>
                    <Link href="/avatar-requests" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors">
                        View All Requests <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                </CardHeader>
                <CardContent className="pt-4">
                    {avatarRequests.length === 0 ? (
                        <p className="text-sm text-slate-500 py-6 text-center">No pending avatar verification requests from hosts.</p>
                    ) : (
                        <div className="space-y-3">
                            {avatarRequests.slice(0, 5).map((req: any) => (
                                <div key={req._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 gap-4 transition-all">
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-semibold text-white">{req.hostUserObjId?.name || `Host #${req.hostId}`}</p>
                                        <p className="text-xs text-slate-400">Host ID: <code className="text-cyan-400 font-mono">{req.hostId}</code></p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-center">
                                            <p className="text-[10px] uppercase font-bold text-slate-500">Current</p>
                                            {req.currentAvatar ? (
                                                <img src={req.currentAvatar} alt="Current" className="h-11 w-11 rounded-full object-cover border border-white/10 mt-1" />
                                            ) : (
                                                <div className="h-11 w-11 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] text-slate-500 mt-1">None</div>
                                            )}
                                        </div>
                                        <span className="text-slate-600 font-bold">→</span>
                                        <div className="text-center">
                                            <p className="text-[10px] uppercase font-bold text-cyan-400">Requested</p>
                                            <img src={req.requestedAvatar} alt="Requested" className="h-11 w-11 rounded-full object-cover border-2 border-cyan-400 shadow-md shadow-cyan-500/20 mt-1" />
                                        </div>
                                    </div>
                                    <Link href="/avatar-requests">
                                        <Button size="sm" variant="outline" className="text-xs w-full sm:w-auto">
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

function StatsCard({ title, value, subtitle, icon: Icon, color, gradient, href }: StatsCardProps) {
    return (
        <Link href={href}>
            <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 bg-gradient-to-br ${gradient} p-4 backdrop-blur-xl shadow-xl shadow-black/30 hover:border-white/20 hover:scale-[1.02] transition-all duration-300 group cursor-pointer`}>
                <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
                    <div className={`p-2 rounded-xl border ${color} shadow-inner`}>
                        <Icon className="h-4 w-4" />
                    </div>
                </div>
                <div className="mt-3">
                    <p className="text-2xl font-black text-white tracking-tight">{value}</p>
                    <p className="text-[11px] font-medium text-slate-400 mt-1 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-cyan-400 shrink-0" />
                        <span className="truncate">{subtitle}</span>
                    </p>
                </div>
            </div>
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
            <div className={cn(
                "group cursor-pointer rounded-2xl border border-white/10 bg-slate-900/60 bg-gradient-to-br backdrop-blur-xl p-5 shadow-xl shadow-black/30 hover:scale-[1.01] transition-all duration-300 flex items-center gap-4",
                color
            )}>
                <div className={cn("p-3 rounded-xl border shadow-inner shrink-0", iconColor)}>
                    <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">{title}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{description}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-600 group-hover:text-cyan-400 transition-colors shrink-0" />
            </div>
        </Link>
    );
}

function AssetList({ items, emptyText }: { items: AssetItem[]; emptyText: string }) {
    if (!items || items.length === 0) {
        return <p className="text-sm text-slate-500 py-6 text-center">{emptyText}</p>;
    }

    return (
        <div className="space-y-2">
            {items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                    {item.image ? (
                        <img
                            src={item.image}
                            alt={item.name}
                            className="h-9 w-9 rounded-xl object-cover border border-white/10 shrink-0"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="h-9 w-9 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center shrink-0">
                            <Image className="h-4 w-4 text-slate-500" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-slate-200 truncate">{item.name}</p>
                        {item.type && <p className="text-[11px] text-slate-500 mt-0.5">{item.type}</p>}
                    </div>
                    <div className="shrink-0">
                        {item.status ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[11px] text-emerald-400 font-semibold">
                                <CheckCircle className="h-3 w-3" /> Active
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-[11px] text-slate-500 font-semibold">
                                <XCircle className="h-3 w-3" /> Off
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
