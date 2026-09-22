'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard, Settings, Menu, X, LogOut, Award, Gift,
    Layers, Crown, Users, FileText, Terminal, ChevronDown, ChevronRight,
    MessageCircle, Download, ShieldCheck, Share2, Smartphone, Sparkles, Sliders,
    type LucideIcon
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';

interface SubmenuItem {
    name: string;
    href: string;
}

interface SidebarItem {
    name: string;
    href?: string;
    icon: LucideIcon;
    submenu?: SubmenuItem[];
}

interface SidebarSection {
    title: string;
    items: SidebarItem[];
}

const sidebarSections: SidebarSection[] = [
    {
        title: 'Core Console',
        items: [
            { name: 'Dashboard', href: '/', icon: LayoutDashboard },
            { name: 'App Releases (APK)', href: '/app-releases', icon: Download },
            { name: 'Screen Security & Code', href: '/screen-security', icon: ShieldCheck },
            { name: 'App Settings', href: '/settings', icon: Settings },
            { name: 'System Logs', href: '/logs', icon: Terminal }
        ]
    },
    {
        title: 'Referral Management',
        items: [
            { name: 'User Refer & Earn', href: '/referrals', icon: Share2 },
            { name: 'Admin & Staff Referrals', href: '/referrals/links', icon: Users }
        ]
    },
    {
        title: 'Device & Security Control',
        items: [
            { name: 'Device Limits & Bans', href: '/bans/device', icon: Smartphone },
            { name: 'ID & Account Bans', href: '/bans/id', icon: ShieldCheck }
        ]
    },
    {
        title: 'App Content & Economy',
        items: [
            { name: 'CMS Editor', href: '/cms', icon: FileText },
            { name: 'Banners', href: '/banners', icon: Layers },
            { name: 'Ads', href: '/ads', icon: Layers },
            { name: 'VIP Program', href: '/vip', icon: Crown },
            { name: 'Levels', href: '/levels', icon: Award },
            { name: 'Gifts', href: '/gifts', icon: Gift },
            { name: 'Frames', href: '/frames', icon: Sliders },
            { name: 'Avatars', href: '/avatars', icon: Award },
            { name: 'Content Moderation', href: '/moderation', icon: Settings }
        ]
    },
    {
        title: 'Events & Messaging',
        items: [
            { name: 'Events', href: '/events', icon: FileText },
            { name: 'System Messages', href: '/messages/system', icon: MessageCircle },
            { name: 'Activity Messages', href: '/messages/activity', icon: MessageCircle }
        ]
    }
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth < 768) setIsOpen(false);
            else setIsOpen(true);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const toggleMenu = (name: string) => {
        setExpandedMenus(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-slate-900/90 text-white md:hidden hover:bg-slate-800 transition-all shadow-xl border border-white/10 backdrop-blur-xl"
                aria-label="Toggle Sidebar"
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && isMobile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-30 bg-black/80 backdrop-blur-md md:hidden"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-40 flex h-screen w-72 flex-col border-r border-white/10 bg-[#070a13]/95 backdrop-blur-2xl transition-transform duration-300 md:relative md:translate-x-0 shadow-2xl shadow-black/80",
                    !isOpen && isMobile ? "-translate-x-full" : "translate-x-0"
                )}
            >
                {/* Brand Header */}
                <div className="p-5 border-b border-white/10">
                    <div className="flex items-center gap-3.5">
                        <div className="relative">
                            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-500 p-[1.5px] shadow-lg shadow-cyan-500/25">
                                <div className="h-full w-full rounded-[14px] bg-[#0c101d] flex items-center justify-center">
                                    <Smartphone className="h-5 w-5 text-cyan-400" />
                                </div>
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#070a13] shadow-sm animate-pulse" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                                App Studio
                            </h1>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                                <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-cyan-400/90">
                                    Management Console
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Sections */}
                <nav className="flex-1 space-y-5 overflow-y-auto px-3.5 py-4 custom-scrollbar">
                    {sidebarSections.map((section, idx) => (
                        <div key={idx} className="space-y-1">
                            <h3 className="px-3 text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">
                                {section.title}
                            </h3>
                            <div className="space-y-1 pt-1">
                                {section.items.map((item) => {
                                    const hasSubmenu = !!item.submenu;
                                    const isExpanded = !!expandedMenus[item.name];
                                    const isActive = item.href ? (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))) : false;

                                    if (hasSubmenu) {
                                        return (
                                            <div key={item.name} className="space-y-0.5">
                                                <button
                                                    onClick={() => toggleMenu(item.name)}
                                                    className={cn(
                                                        "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium",
                                                        isExpanded
                                                            ? "text-white bg-white/[0.06] shadow-sm"
                                                            : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <item.icon size={18} className={cn(isExpanded ? "text-cyan-400" : "text-slate-500")} />
                                                        <span>{item.name}</span>
                                                    </div>
                                                    {isExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-500" />}
                                                </button>

                                                <AnimatePresence initial={false}>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="overflow-hidden pl-7 pr-1 space-y-1 pt-1 border-l border-white/5 ml-4"
                                                        >
                                                            {item.submenu?.map((sub) => {
                                                                const isSubActive = pathname === sub.href;
                                                                return (
                                                                    <Link
                                                                        key={sub.href}
                                                                        href={sub.href}
                                                                        onClick={() => {
                                                                            if (window.innerWidth < 768) setIsOpen(false);
                                                                        }}
                                                                        className={cn(
                                                                            "block px-3 py-2 text-xs font-medium rounded-lg transition-all",
                                                                            isSubActive
                                                                                ? "text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 shadow-sm shadow-cyan-500/10"
                                                                                : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                                                                        )}
                                                                    >
                                                                        {sub.name}
                                                                    </Link>
                                                                );
                                                            })}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href!}
                                            onClick={() => {
                                                if (window.innerWidth < 768) setIsOpen(false);
                                            }}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium",
                                                isActive
                                                    ? "text-white bg-gradient-to-r from-cyan-500/20 via-indigo-600/20 to-transparent border-l-2 border-cyan-400 shadow-md shadow-cyan-950/30"
                                                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                                            )}
                                        >
                                            <item.icon size={18} className={cn(isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300 transition-colors")} />
                                            <span>{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Footer User Profile & Theme */}
                <div className="p-3.5 mt-auto border-t border-white/10 bg-black/20 space-y-2.5">
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-2.5 backdrop-blur-xl transition-all">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="h-9 w-9 rounded-xl border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center text-xs font-bold text-cyan-300 shrink-0 shadow-inner">
                                {user?.name?.[0]?.toUpperCase() || 'M'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[9px] font-black uppercase tracking-wider text-cyan-400">
                                    Manager
                                </p>
                                <p className="text-xs font-bold text-white truncate max-w-[100px]">
                                    {user?.name || 'Manager'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <ThemeToggle />
                            <button
                                onClick={logout}
                                title="Sign Out"
                                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
