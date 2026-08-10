'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard, Settings, Menu, X, LogOut, User, Award, Gift,
    Layers, Crown, Users, FileText, Terminal, ChevronDown, ChevronRight, MessageCircle, Download, ShieldCheck, type LucideIcon
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

// Configured specifically for app-management: configuration, logs, and assets
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
        title: 'App Content & Economy',
        items: [
            { name: 'CMS Editor', href: '/cms', icon: FileText },
            { name: 'Banners', href: '/banners', icon: Layers },
            { name: 'Ads', href: '/ads', icon: Layers },
            { name: 'Referrals', href: '/referrals', icon: Users },
            { name: 'VIP Program', href: '/vip', icon: Crown },
            { name: 'Levels', href: '/levels', icon: Award },
            { name: 'Gifts', href: '/gifts', icon: Gift },
            { name: 'Frames', href: '/frames', icon: Award },
            { name: 'Avatars', href: '/avatars', icon: User },
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
                className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-800 text-slate-100 md:hidden hover:bg-slate-700 transition-colors shadow-lg border border-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                aria-label="Toggle Sidebar"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && isMobile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-40 w-64 glass-panel flex flex-col pt-20 md:pt-8 transition-transform duration-300 md:translate-x-0 md:relative h-screen bg-slate-900 border-r border-slate-800",
                    !isOpen && isMobile ? "-translate-x-full" : "translate-x-0"
                )}
            >
                <div className="px-6 mb-6 mt-4 md:mt-0 flex items-center justify-between">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        App Management Panel
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-4 overflow-y-auto pb-6">
                    {sidebarSections.map((section, idx) => (
                        <div key={idx} className="space-y-1">
                            <h3 className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                {section.title}
                            </h3>
                            <div className="space-y-0.5">
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
                                                        "w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 text-sm font-semibold"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <item.icon size={18} className="text-slate-500" />
                                                        <span>{item.name}</span>
                                                    </div>
                                                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                </button>

                                                <AnimatePresence initial={false}>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="overflow-hidden pl-9 space-y-0.5"
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
                                                                            "block px-4 py-2 text-xs font-semibold rounded-lg transition-colors",
                                                                            isSubActive
                                                                                ? "text-primary bg-primary/10 border border-primary/20"
                                                                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
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
                                                "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group text-sm font-semibold",
                                                isActive
                                                    ? "text-primary bg-primary/10 border border-primary/20"
                                                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                                            )}
                                        >
                                            <item.icon size={18} className={cn(isActive ? "text-primary" : "text-slate-500 group-hover:text-slate-400")} />
                                            <span>{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="p-4 mt-auto border-t border-slate-800 space-y-4">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors group text-sm font-semibold"
                    >
                        <LogOut size={18} className="text-slate-500 group-hover:text-rose-400" />
                        <span>Sign Out</span>
                    </button>

                    <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 flex items-center gap-3 justify-between shadow-inner">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
                                {user?.name?.[0]?.toUpperCase() || 'A'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[10px] text-slate-500 font-bold truncate">Logged in as</p>
                                <p className="text-xs font-bold text-slate-200 truncate w-24">{user?.name || 'Admin'}</p>
                            </div>
                        </div>
                        <ThemeToggle />
                    </div>
                </div>
            </aside>
        </>
    );
}
