'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import { ListTodo, Plus, Trash2, Coins, Calendar, CheckSquare } from "lucide-react";
import { toast } from 'sonner';

export default function TasksPage() {
    const [title, setTitle] = useState('');
    const [rewardCoins, setRewardCoins] = useState('50');
    const [targetCount, setTargetCount] = useState('3');
    
    // Mock User Tasks Data
    const [tasks, setTasks] = useState<any[]>([
        { id: '1', title: 'Complete a 5-minute Live Stream', reward: 150, target: 1, type: 'daily', isActive: true },
        { id: '2', title: 'Gift 5 different hosts in a single day', reward: 250, target: 5, type: 'daily', isActive: true },
        { id: '3', title: 'Login 7 consecutive days', reward: 500, target: 7, type: 'weekly', isActive: true }
    ]);

    const handleCreateTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;

        const newTask = {
            id: Date.now().toString(),
            title,
            reward: parseInt(rewardCoins),
            target: parseInt(targetCount),
            type: 'daily',
            isActive: true
        };

        setTasks([...tasks, newTask]);
        toast.success(`Task "${title}" created successfully`);
        setTitle('');
        setRewardCoins('50');
        setTargetCount('3');
    };

    const handleDeleteTask = (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
        toast.success('Task configuration removed');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Daily Achievements</h2>
                    <p className="text-muted-foreground mt-1 font-medium font-sans">Manage user rewards tasks, activity challenges, and coin reward pools</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Create Form */}
                <Card className="glass-card md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <Plus size={20} />
                            Add Reward Task
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateTask} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Task Objective Title</label>
                                <Input
                                    placeholder="e.g. Chat with 3 hosts"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Coins Reward Value</label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={rewardCoins}
                                        onChange={(e) => setRewardCoins(e.target.value)}
                                        required
                                    />
                                    <Coins className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Target Goal Count</label>
                                <Input
                                    type="number"
                                    value={targetCount}
                                    onChange={(e) => setTargetCount(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full font-bold">Create Task</Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Tasks List */}
                <Card className="glass-card md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <ListTodo size={20} className="text-primary animate-pulse" />
                            Achievements Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-bold text-slate-300">Objective</TableHead>
                                    <TableHead className="font-bold text-slate-300">Reward</TableHead>
                                    <TableHead className="font-bold text-slate-300">Target Goal</TableHead>
                                    <TableHead className="font-bold text-slate-300">Frequency</TableHead>
                                    <TableHead className="font-bold text-slate-300">Status</TableHead>
                                    <TableHead className="text-right font-bold text-slate-300">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tasks.map((task) => (
                                    <TableRow key={task.id} className="hover:bg-muted/30">
                                        <TableCell className="font-bold text-slate-200">{task.title}</TableCell>
                                        <TableCell className="font-bold text-yellow-500">
                                            <div className="flex items-center gap-1">
                                                <Coins size={14} />
                                                <span>{task.reward} coins</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-semibold text-slate-300">
                                            <div className="flex items-center gap-1.5">
                                                <CheckSquare size={14} className="text-muted-foreground" />
                                                <span>{task.target} counts</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="capitalize text-slate-300 font-semibold">{task.type}</TableCell>
                                        <TableCell>
                                            <Badge variant={task.isActive ? "success" : "secondary"}>
                                                {task.isActive ? 'Active' : 'Disabled'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDeleteTask(task.id)}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
