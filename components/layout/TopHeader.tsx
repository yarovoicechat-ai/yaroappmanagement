'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Search, Terminal, Settings, Download, User, LogOut, Smartphone, Command, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function TopHeader() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    toast.info(`Filtering console for "${searchQuery}"...`);
  };

  const userName = user?.name || 'App Manager';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/10 bg-[#070a13]/85 px-4 md:px-6 backdrop-blur-2xl">
      {/* Left Section: Search & Quick Scope */}
      <div className="flex items-center gap-3 md:gap-5 flex-1 max-w-xl">
        <div className="flex items-center gap-2 md:hidden">
          <div className="h-9 w-9 rounded-xl p-[1px] bg-gradient-to-tr from-pink-500 to-purple-600 shadow-md">
            <img src="/logo.png" alt="Yaro" className="h-full w-full rounded-[10px] object-cover" />
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div className="relative flex items-center group">
            <Search className="absolute left-3.5 h-4 w-4 text-slate-500 group-focus-within:text-pink-400 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search store items, assets, virtual goods, economy..."
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 pl-10 pr-16 py-2 text-xs text-slate-200 placeholder-slate-500 backdrop-blur-md shadow-inner transition-all focus:border-pink-500/50 focus:bg-slate-900/90 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
            />
            <div className="absolute right-2.5 hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-slate-400">
              <Command className="h-2.5 w-2.5" />
              <span>K</span>
            </div>
          </div>
        </form>
      </div>

      {/* Right Section: Quick Links & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Store Management Shortcut */}
        <Link
          href="/store"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-pink-500/30 bg-pink-500/10 text-pink-300 text-xs font-semibold hover:bg-pink-500/20 transition-all shadow-sm shadow-pink-500/10"
          title="Virtual Store Catalog"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-pink-400" />
          <span>Store</span>
        </Link>

        {/* App Releases Shortcut */}
        <Link
          href="/app-releases"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/20 transition-all shadow-sm shadow-emerald-500/10"
          title="App Releases"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>v0.0.2 Live</span>
        </Link>

        {/* System Logs Shortcut */}
        <Link
          href="/logs"
          className="p-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/[0.07] transition-all duration-200"
          title="Console System Logs"
        >
          <Terminal className="w-4 h-4" />
        </Link>

        {/* Settings Shortcut */}
        <Link
          href="/settings"
          className="p-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/[0.07] transition-all duration-200"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </Link>

        {/* Divider */}
        <div className="h-6 w-[1px] bg-white/10 mx-1 hidden sm:block" />

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1 sm:px-2 sm:py-1 rounded-xl border border-white/10 bg-white/[0.03] hover:border-cyan-500/40 hover:bg-white/[0.06] transition-all focus:outline-none"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1px] flex items-center justify-center shrink-0 shadow-md shadow-cyan-950/50">
              <div className="h-full w-full bg-slate-900 rounded-[7px] flex items-center justify-center font-bold text-xs text-white">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="hidden md:block text-left pr-1">
              <p className="text-xs font-semibold text-white leading-none truncate max-w-[110px]">{userName}</p>
              <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mt-1">Console</p>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-[#0c101d]/95 backdrop-blur-2xl p-2 shadow-2xl shadow-black/90 z-50 text-xs space-y-1 animate-in fade-in-0 zoom-in-95">
              <div className="px-3 py-2.5 border-b border-white/10 mb-1">
                <p className="font-bold text-white truncate">{userName}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-semibold text-cyan-300 uppercase tracking-wider">Manager Online</span>
                </div>
              </div>

              <Link
                href="/settings"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4 text-cyan-400" />
                <span>Console Settings</span>
              </Link>

              <div className="pt-1 mt-1 border-t border-white/10">
                <button
                  onClick={() => { setIsProfileOpen(false); logout(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-300 hover:bg-rose-500/15 hover:text-rose-200 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
