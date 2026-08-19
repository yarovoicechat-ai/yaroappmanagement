'use client';

import React, { useState, useEffect } from 'react';
import {
    Share2, Copy, Check, Search, Users, Gift, Calendar, RefreshCw, Trophy
} from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

interface TopReferrer {
    userId: number;
    name: string;
    email?: string;
    role: string;
    image?: string;
    referralCode?: string;
    totalReferrals: number;
    diamonds: number;
}

interface ReferralLog {
    _id: string;
    referrer: {
        userId: number;
        name: string;
        email?: string;
        referralCode?: string;
    };
    referee: {
        userId: number;
        name: string;
        email?: string;
        createdAt?: string;
    };
    referralCode: string;
    referrerReward: number;
    refereeReward: number;
    status: string;
    claimedAt: string;
}

export default function ReferralAnalyticsPage() {
    const [loading, setLoading] = useState<boolean>(true);
    const [totalReferrals, setTotalReferrals] = useState<number>(0);
    const [totalDiamondsGranted, setTotalDiamondsGranted] = useState<number>(0);
    const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([]);
    const [referralLogs, setReferralLogs] = useState<ReferralLog[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');

    const fetchReferralData = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get<any>('/api/admin/referrals');
            if (res && res.success && res.data) {
                setTotalReferrals(res.data.totalReferrals || 0);
                setTotalDiamondsGranted(res.data.totalDiamondsGranted || 0);
                setTopReferrers(res.data.topReferrers || []);
                setReferralLogs(res.data.referralLogs || []);
            }
        } catch (error) {
            console.error('Failed to load management referral analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReferralData();
    }, []);

    const filteredLogs = referralLogs.filter(log => {
        const term = searchTerm.toLowerCase();
        return (
            log.referralCode?.toLowerCase().includes(term) ||
            log.referrer?.name?.toLowerCase().includes(term) ||
            log.referee?.name?.toLowerCase().includes(term) ||
            String(log.referrer?.userId || '').includes(term) ||
            String(log.referee?.userId || '').includes(term)
        );
    });

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Share2 className="w-7 h-7 text-amber-500" />
                        Referral Rewards & Analytics
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Track who invited whom, total invites count, and total diamonds earned per user
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchReferralData}
                        className="px-3 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg text-sm flex items-center gap-2 transition"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-slate-900/80 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400 flex items-center justify-between uppercase font-semibold">
                        Total Successful Referrals <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-3xl font-bold text-white mt-2">{totalReferrals}</div>
                </div>

                <div className="p-5 bg-slate-900/80 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400 flex items-center justify-between uppercase font-semibold">
                        Total Diamonds Awarded <Gift className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="text-3xl font-bold text-amber-400 mt-2">{totalDiamondsGranted} 💎</div>
                </div>
            </div>

            {/* Top Referrers Leaderboard */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    Top Inviter Leaderboard
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-950 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
                            <tr>
                                <th className="p-3">Rank</th>
                                <th className="p-3">User ID</th>
                                <th className="p-3">User Name</th>
                                <th className="p-3">Referral Code</th>
                                <th className="p-3">Role</th>
                                <th className="p-3 text-right">Total Invites</th>
                                <th className="p-3 text-right">Current Diamonds</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-500">
                                        Loading leaderboard...
                                    </td>
                                </tr>
                            ) : topReferrers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-500">
                                        No active referrers found.
                                    </td>
                                </tr>
                            ) : (
                                topReferrers.map((user, idx) => (
                                    <tr key={user.userId} className="hover:bg-slate-800/40 transition">
                                        <td className="p-3 font-bold text-amber-400">#{idx + 1}</td>
                                        <td className="p-3 font-mono text-xs">{user.userId}</td>
                                        <td className="p-3 font-semibold text-white">{user.name || 'User'}</td>
                                        <td className="p-3 font-mono font-bold text-cyan-400">{user.referralCode || `MC${user.userId}`}</td>
                                        <td className="p-3 capitalize text-slate-400">{user.role}</td>
                                        <td className="p-3 text-right font-bold text-emerald-400">{user.totalReferrals}</td>
                                        <td className="p-3 text-right font-bold text-amber-400">{user.diamonds} 💎</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detailed Referral Claims Log Table */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-cyan-400" />
                        Referral Claims Activity Log
                    </h3>
                    <div className="relative max-w-sm w-full">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search code, inviter name, referee..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-950 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
                            <tr>
                                <th className="p-3">Referrer (Inviter)</th>
                                <th className="p-3">Referee (New User)</th>
                                <th className="p-3">Referral Code</th>
                                <th className="p-3 text-right">Referrer Reward</th>
                                <th className="p-3 text-right">Claimed Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        Loading referral activity...
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        No referral logs found.
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log._id} className="hover:bg-slate-800/40 transition">
                                        <td className="p-3">
                                            <div className="font-semibold text-white">{log.referrer?.name || 'User'}</div>
                                            <div className="text-xs text-slate-500 font-mono">ID: {log.referrer?.userId}</div>
                                        </td>
                                        <td className="p-3">
                                            <div className="font-semibold text-emerald-400">{log.referee?.name || 'New User'}</div>
                                            <div className="text-xs text-slate-500 font-mono">ID: {log.referee?.userId}</div>
                                        </td>
                                        <td className="p-3 font-mono font-bold text-amber-400">{log.referralCode}</td>
                                        <td className="p-3 text-right font-bold text-emerald-400">+{log.referrerReward || 50} 💎</td>
                                        <td className="p-3 text-right text-xs text-slate-400">
                                            {log.claimedAt ? new Date(log.claimedAt).toLocaleString() : 'N/A'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
