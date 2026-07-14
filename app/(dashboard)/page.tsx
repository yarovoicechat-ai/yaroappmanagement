'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Users, UserPlus, Heart, AlertTriangle, TrendingUp, Activity, LucideIcon, Coins, Briefcase, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { RevenueChart, EarningsChart, CallChart, DistributionChart } from "@/components/dashboard/Charts";
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';
import { toast } from 'sonner';

export type StatsCardProps = {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  trend: 'up' | 'down' | 'neutral';
  alert?: boolean;
};

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState([]);
  const [earningsData, setEarningsData] = useState([]);
  const [callData, setCallData] = useState([]);
  const [distributionData, setDistributionData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, revenueRes, earningsRes, callsRes, distRes, historyRes] = await Promise.all([
          apiClient.get(API_ENDPOINTS.DASHBOARD.STATS),
          apiClient.get(API_ENDPOINTS.DASHBOARD.REVENUE_CHART, { days: 7 }),
          apiClient.get(API_ENDPOINTS.DASHBOARD.EARNINGS_CHART, { days: 7 }),
          apiClient.get(API_ENDPOINTS.DASHBOARD.CALL_TRENDS, { days: 7 }),
          apiClient.get(API_ENDPOINTS.DASHBOARD.COIN_DISTRIBUTION),
          apiClient.get(API_ENDPOINTS.CALLS.HISTORY, { limit: 5 })
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (revenueRes.success) setRevenueData(revenueRes.data as any);
        if (earningsRes.success) setEarningsData(earningsRes.data as any);
        if (callsRes.success) setCallData(callsRes.data as any);
        if (distRes.success) setDistributionData(distRes.data as any);
        if (historyRes.success) setRecentActivity((historyRes.data as any).calls || []);

      } catch (error) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-slate-400">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Dashboard</h2>
          <p className="text-muted-foreground mt-1">Overview of Dosti app activity</p>
        </div>
        <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-lg border border-border">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">System Healthy</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Row 1: Key Financials (Daily) */}
        <StatsCard
          title="Today's Minutes"
          value={`${stats?.stats?.minutesToday || 0} mins`}
          change="Daily stats"
          icon={Activity}
          trend="neutral"
        />
        <StatsCard
          title="Coins Spent Today"
          value={(stats?.stats?.coinsSpentToday || 0).toLocaleString()}
          change="Daily usage"
          icon={Coins}
          trend="neutral"
        />
        <StatsCard
          title="Host Earnings Today"
          value={`$${stats?.stats?.hostEarningsToday || 0}`}
          change="Verified payouts"
          icon={Briefcase}
          trend="neutral"
        />
        <StatsCard
          title="Today's Revenue"
          value={`$${stats?.stats?.revenueToday || 0}`}
          change="Gross revenue"
          icon={DollarSign}
          trend="neutral"
        />

        {/* Row 2: User Base Stats */}
        <StatsCard
          title="Total Users"
          value={(stats?.totalUsers || 0).toLocaleString()}
          change={`${stats?.activeUsers || 0} active`}
          icon={Users}
          trend="up"
        />
        <StatsCard
          title="Total Hosts"
          value={(stats?.totalHosts || 0).toLocaleString()}
          change={`${stats?.activeHosts || 0} approved`}
          icon={UserPlus}
          trend="up"
        />
        <StatsCard
          title="Active Hosts"
          value={(stats?.activeCalls || 0).toString()}
          change="Busy in calls"
          icon={Heart}
          trend="up"
        />
        <StatsCard
          title="Reports Pending"
          value={(stats?.reportsPending || 0).toString()}
          change="Needs attention"
          icon={AlertTriangle}
          trend="down"
          alert={stats?.reportsPending > 0}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Revenue Analytics (7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <RevenueChart data={revenueData} />
            </div>
          </CardContent>
        </Card>

        {/* Earnings Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Host Earnings (7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <EarningsChart data={earningsData} />
            </div>
          </CardContent>
        </Card>

        {/* Call Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Call Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <CallChart data={callData} />
            </div>
          </CardContent>
        </Card>

        {/* Distribution Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Coin Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <DistributionChart data={distributionData} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Recent Calls Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentActivity activities={recentActivity} />
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCard({ title, value, change, icon: Icon, trend, alert }: StatsCardProps) {
  return (
    <Card glass className="relative overflow-hidden group">
      <div className="absolute right-0 top-0 h-24 w-24 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full transition-transform group-hover:scale-110" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded-lg bg-secondary/50 border border-border group-hover:border-primary/30 transition-colors", alert ? "text-destructive" : "text-primary")}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <p className={cn("text-xs flex items-center mt-1",
          trend === 'up' ? "text-emerald-600 dark:text-emerald-400" :
            trend === 'down' ? "text-rose-600 dark:text-rose-400" : "text-slate-500")}>
          {trend === 'up' && <TrendingUp className="mr-1 h-3 w-3" />}
          {trend === 'down' && <Activity className="mr-1 h-3 w-3" />}
          {change}
        </p>
      </CardContent>
    </Card>
  )
}

function RecentActivity({ activities }: { activities: any[] }) {
  if (!activities || activities.length === 0) return <div className="text-slate-500 text-sm">No recent activity.</div>;

  return (
    <div className="space-y-8">
      {activities.map((item, i) => (
        <div key={i} className="flex items-center">
          <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
            <Activity className="h-4 w-4 text-dosti-400" />
          </div>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none text-slate-200">
              {item.callerName} called {item.hostName}
            </p>
            <p className="text-sm text-slate-500">
              {item.duration ? `${item.duration} duration` : 'Missed Call'} • {new Date(item.date).toLocaleString()}
            </p>
          </div>
          <div className="ml-auto font-medium text-slate-200">
            {item.voice > 0 ? `-${item.voice} coins` : '0 coins'}
          </div>
        </div>
      ))}
    </div>
  )
}
