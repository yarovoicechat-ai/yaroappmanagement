'use client';

import {
    LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface ChartProps {
    data?: any[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

export function RevenueChart({ data = [] }: ChartProps) {
    if (!data || data.length === 0) return <div className="flex items-center justify-center h-full text-slate-500">No data available</div>;
    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: any) => `$${value}`} />
                <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9' }}
                    itemStyle={{ color: '#f1f5f9' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8884d8" fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
        </ResponsiveContainer>
    );
}

export function EarningsChart({ data = [] }: ChartProps) {
    if (!data || data.length === 0) return <div className="flex items-center justify-center h-full text-slate-500">No data available</div>;
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: any) => `$${value}`} />
                <Tooltip
                    cursor={{ fill: '#334155', opacity: 0.4 }}
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9' }}
                />
                <Bar dataKey="earnings" fill="#82ca9d" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}

export function CallChart({ data = [] }: ChartProps) {
    if (!data || data.length === 0) return <div className="flex items-center justify-center h-full text-slate-500">No data available</div>;
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9' }}
                />
                <Line type="monotone" dataKey="calls" stroke="#ffc658" strokeWidth={2} dot={{ r: 4, fill: '#ffc658' }} name="Calls" />
                <Line type="monotone" dataKey="duration" stroke="#82ca9d" strokeWidth={2} dot={{ r: 4, fill: '#82ca9d' }} name="Duration (min)" />
            </LineChart>
        </ResponsiveContainer>
    );
}

export function DistributionChart({ data = [] }: ChartProps) {
    if (!data || data.length === 0) return <div className="flex items-center justify-center h-full text-slate-500">No data available</div>;
    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="type"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9' }}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}
