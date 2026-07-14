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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/Dialog";
import { UserCheck, ShieldAlert, Plus, Search, DollarSign, Award, ArrowUpRight } from "lucide-react";
import { toast } from 'sonner';

export default function SellersPage() {
    const [search, setSearch] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [coinsLimit, setCoinsLimit] = useState('100000');
    
    // Mock Sellers Data
    const [sellers, setSellers] = useState<any[]>([
        { _id: '1', name: 'Alibaba Coin Distributor', email: 'alibaba@coins.com', code: 'SEL881', coinsSold: 4500000, balance: 1250000, status: 'active', verified: true },
        { _id: '2', name: 'Global Recharge Hub', email: 'hub@recharge.com', code: 'SEL292', coinsSold: 8900000, balance: 54000, status: 'active', verified: true },
        { _id: '3', name: 'Mico Agent Delhi', email: 'mico.delhi@gmail.com', code: 'SEL901', coinsSold: 1200000, balance: 8000, status: 'blocked', verified: false }
    ]);

    const handleCreateSeller = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email) return;

        const newSeller = {
            _id: Date.now().toString(),
            name,
            email,
            code: `SEL${Math.floor(100 + Math.random() * 900)}`,
            coinsSold: 0,
            balance: parseInt(coinsLimit),
            status: 'active',
            verified: true
        };

        setSellers([newSeller, ...sellers]);
        toast.success(`Coin Seller ${name} registered successfully`);
        setIsAddOpen(false);
        setName('');
        setEmail('');
        setCoinsLimit('100000');
    };

    const handleToggleStatus = (id: string) => {
        setSellers(prev => prev.map(s => {
            if (s._id === id) {
                const nextStatus = s.status === 'active' ? 'blocked' : 'active';
                toast.success(`Seller code ${s.code} is now ${nextStatus}`);
                return { ...s, status: nextStatus };
            }
            return s;
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Coin Sellers</h2>
                    <p className="text-muted-foreground mt-1 font-medium">Manage default coin distribution agencies, credit limits, and sellers status</p>
                </div>
                <Button onClick={() => setIsAddOpen(true)} className="flex items-center gap-1.5 font-bold">
                    <Plus size={16} />
                    Add Seller
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search coin sellers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <Card className="glass-card">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-bold text-slate-300">Seller Agency</TableHead>
                                <TableHead className="font-bold text-slate-300">Seller Code</TableHead>
                                <TableHead className="font-bold text-slate-300">Email</TableHead>
                                <TableHead className="font-bold text-slate-300">Total Coins Sold</TableHead>
                                <TableHead className="font-bold text-slate-300">Current Credit Limit</TableHead>
                                <TableHead className="font-bold text-slate-300">Status</TableHead>
                                <TableHead className="text-right font-bold text-slate-300">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sellers.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map((seller) => (
                                <TableRow key={seller._id} className="hover:bg-muted/30">
                                    <TableCell className="font-bold text-slate-200">
                                        <div className="flex items-center gap-2">
                                            <Award size={16} className="text-primary" />
                                            <span>{seller.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-primary font-semibold">{seller.code}</TableCell>
                                    <TableCell className="text-slate-300">{seller.email}</TableCell>
                                    <TableCell className="font-bold text-slate-200">{seller.coinsSold.toLocaleString()}</TableCell>
                                    <TableCell className="font-bold text-emerald-400">{seller.balance.toLocaleString()} coins</TableCell>
                                    <TableCell>
                                        <Badge variant={seller.status === 'active' ? 'success' : 'destructive'} className="font-semibold">
                                            {seller.status === 'active' ? 'Active' : 'Blocked'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleToggleStatus(seller._id)}
                                                className="font-bold text-xs"
                                            >
                                                {seller.status === 'active' ? 'Block' : 'Activate'}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Add Seller Modal */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Register Coin Seller</DialogTitle>
                        <DialogDescription>
                            Create a default coin distributor with pre-allocated credit balance.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSeller} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Seller Agency Name</label>
                            <Input
                                placeholder="e.g. Asia Payouts Hub"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Email Address</label>
                            <Input
                                type="email"
                                placeholder="seller@domain.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Credit Coins Allocation</label>
                            <Input
                                type="number"
                                value={coinsLimit}
                                onChange={(e) => setCoinsLimit(e.target.value)}
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="font-semibold">Cancel</Button>
                            <Button type="submit" className="font-bold">Register Seller</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
