'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Gamepad2,
  Eye,
  EyeOff,
  Radio,
  Mic,
  Sparkles,
  RefreshCw,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Flame,
  Layers,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import { gameManagementService, GameStatus } from '@/lib/services/gameService';
import { toast } from 'sonner';

export default function GamesManagementPage() {
  const [games, setGames] = useState<GameStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const data = await gameManagementService.getAdminGames();
      setGames(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch games');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const greedyKing = games.find((g) => g.gameId === 'greedy-king') || {
    gameId: 'greedy-king',
    title: 'Greedy King',
    subtitle: 'King Fruit Wheel & Royal 50x Multiplier',
    description: 'Cocos Creator HTML5 Greedy King with instant royal coin rewards & multiplayer live wheel!',
    category: 'Wheel',
    icon: 'crown',
    gameUrl: 'https://games.yaroapp.in/greedy-king/',
    isActive: true,
    isHidden: false,
    showInVoiceRoom: true,
    showInLiveRoom: true,
    showFloatingBanner: true,
    engineVersion: 'Cocos Creator 3.8.x',
  };

  const handleToggle = async (
    key: 'isActive' | 'isHidden' | 'showInVoiceRoom' | 'showInLiveRoom' | 'showFloatingBanner',
    currentValue: boolean
  ) => {
    const nextValue = !currentValue;
    const gameId = greedyKing.gameId;

    // Optimistic UI update
    setGames((prev) =>
      prev.map((g) => (g.gameId === gameId ? { ...g, [key]: nextValue } : g))
    );

    setUpdating(key);
    try {
      const res = await gameManagementService.updateGameStatus(gameId, {
        [key]: nextValue,
      });
      if (res.success) {
        toast.success(`Updated ${key} successfully`, {
          description: `Greedy King is now ${
            key === 'isHidden'
              ? nextValue
                ? 'HIDDEN from room users'
                : 'VISIBLE in rooms'
              : nextValue
              ? 'ENABLED'
              : 'DISABLED'
          }`,
        });
      }
    } catch (err: any) {
      // Revert optimistic update
      setGames((prev) =>
        prev.map((g) => (g.gameId === gameId ? { ...g, [key]: currentValue } : g))
      );
      toast.error(err.message || 'Failed to update game status');
    } finally {
      setUpdating(null);
    }
  };

  const handleEmergencyKillSwitch = async () => {
    const confirm = window.confirm(
      'Are you sure you want to trigger the Emergency Kill Switch? This will instantly hide and disable Greedy King for all mobile users.'
    );
    if (!confirm) return;

    try {
      setUpdating('kill-switch');
      await gameManagementService.updateGameStatus('greedy-king', {
        isActive: false,
        isHidden: true,
        showInVoiceRoom: false,
        showInLiveRoom: false,
        showFloatingBanner: false,
      });

      setGames((prev) =>
        prev.map((g) =>
          g.gameId === 'greedy-king'
            ? {
                ...g,
                isActive: false,
                isHidden: true,
                showInVoiceRoom: false,
                showInLiveRoom: false,
                showFloatingBanner: false,
              }
            : g
        )
      );

      toast.success('Emergency Kill Switch triggered! All games hidden from users.');
    } catch (err: any) {
      toast.error(err.message || 'Emergency kill switch failed');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Gamepad2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Games Management
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                  Active System
                </Badge>
              </h1>
              <p className="text-sm text-slate-400">
                Control in-app mini games, toggle Greedy King hide/show in live and voice rooms, and manage floating banners.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchGames}
            disabled={loading}
            className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleEmergencyKillSwitch}
            disabled={updating !== null}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
          >
            <ShieldAlert className="w-4 h-4 mr-2" />
            Emergency Hide
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Master Game State</p>
              <h3 className="text-xl font-bold text-white mt-1">
                {greedyKing.isActive ? 'Active' : 'Disabled'}
              </h3>
            </div>
            <div className={`p-3 rounded-xl ${greedyKing.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Room Visibility</p>
              <h3 className="text-xl font-bold text-white mt-1">
                {greedyKing.isHidden ? 'Hidden' : 'Visible'}
              </h3>
            </div>
            <div className={`p-3 rounded-xl ${!greedyKing.isHidden ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'}`}>
              {!greedyKing.isHidden ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Voice Rooms (8/12 seat)</p>
              <h3 className="text-xl font-bold text-white mt-1">
                {greedyKing.showInVoiceRoom && !greedyKing.isHidden ? 'Enabled' : 'Hidden'}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <Mic className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Live Video Stream</p>
              <h3 className="text-xl font-bold text-white mt-1">
                {greedyKing.showInLiveRoom && !greedyKing.isHidden ? 'Enabled' : 'Hidden'}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-pink-500/10 text-pink-400">
              <Radio className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Game Card: Greedy King */}
      <Card className="bg-slate-900/70 border-slate-800 overflow-hidden shadow-xl">
        <div className="bg-gradient-to-r from-amber-600/20 via-purple-600/10 to-transparent p-6 border-b border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-lg shadow-amber-500/20 flex-shrink-0 bg-slate-950">
                <Image
                  src="/icons/greedy_king_badge.png"
                  alt="Greedy King Badge"
                  fill
                  className="object-cover"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-amber-300">Yaro Greedy King</h2>
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold">
                    ROYAL 50x
                  </Badge>
                  {greedyKing.isHidden && (
                    <Badge variant="destructive" className="bg-red-500/20 text-red-300 border-red-500/30">
                      HIDDEN IN ROOMS
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-300 mt-1">
                  Cocos Creator 3.8.x Web Mobile interactive game with server-authoritative payouts.
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    Currency: <strong className="text-amber-300">Diamonds (Coins) Only</strong>
                  </span>
                  <span>•</span>
                  <span>Category: <strong>Wheel Game</strong></span>
                  <span>•</span>
                  <span>Multiplayer: <strong>Live WebSocket</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://games.yaroapp.in/greedy-king/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs text-slate-300 border border-slate-700 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Launch Web URL
              </a>
            </div>
          </div>
        </div>

        {/* Toggle Controls Grid */}
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Control 1: Hide Game System (User Request Primary Feature) */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
              <div className="space-y-1 pr-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">Hide from All Rooms</span>
                  {greedyKing.isHidden && (
                    <Badge variant="destructive" className="text-[10px] py-0 px-1.5">
                      ACTIVE HIDE
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  Completely hide Greedy King from voice rooms, live rooms, and room menu dialogs.
                </p>
              </div>
              <Switch
                checked={greedyKing.isHidden}
                onCheckedChange={() => handleToggle('isHidden', greedyKing.isHidden)}
                disabled={updating === 'isHidden'}
              />
            </div>

            {/* Control 2: Master Game Activation */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
              <div className="space-y-1 pr-4">
                <span className="font-semibold text-white">Game Server Enabled</span>
                <p className="text-xs text-slate-400">
                  Enable or disable game session tickets and wallet betting transactions.
                </p>
              </div>
              <Switch
                checked={greedyKing.isActive}
                onCheckedChange={() => handleToggle('isActive', greedyKing.isActive)}
                disabled={updating === 'isActive'}
              />
            </div>

            {/* Control 3: Show in Voice Rooms */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
              <div className="space-y-1 pr-4">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-purple-400" />
                  <span className="font-semibold text-white">Display in Voice Chat Rooms</span>
                </div>
                <p className="text-xs text-slate-400">
                  Show the Greedy King banner and menu option inside 8-seater & 12-seater voice rooms.
                </p>
              </div>
              <Switch
                checked={greedyKing.showInVoiceRoom}
                onCheckedChange={() => handleToggle('showInVoiceRoom', greedyKing.showInVoiceRoom)}
                disabled={updating === 'showInVoiceRoom'}
              />
            </div>

            {/* Control 4: Show in Live Streaming */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
              <div className="space-y-1 pr-4">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-pink-400" />
                  <span className="font-semibold text-white">Display in Live Video Rooms</span>
                </div>
                <p className="text-xs text-slate-400">
                  Show the Greedy King banner and catalog option during live video broadcasts.
                </p>
              </div>
              <Switch
                checked={greedyKing.showInLiveRoom}
                onCheckedChange={() => handleToggle('showInLiveRoom', greedyKing.showInLiveRoom)}
                disabled={updating === 'showInLiveRoom'}
              />
            </div>

            {/* Control 5: Floating Game Banner */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between md:col-span-2">
              <div className="space-y-1 pr-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-white">Floating Game Badge Banner</span>
                </div>
                <p className="text-xs text-slate-400">
                  Show the official crowned cat badge as a floating widget on the right side of room screens.
                </p>
              </div>
              <Switch
                checked={greedyKing.showFloatingBanner}
                onCheckedChange={() => handleToggle('showFloatingBanner', greedyKing.showFloatingBanner)}
                disabled={updating === 'showFloatingBanner'}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
