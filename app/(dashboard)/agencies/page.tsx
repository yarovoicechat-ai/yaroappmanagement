'use client';

import { useState, useEffect } from 'react';
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
import { Plus, Trash2, ShieldAlert, Award, UserCheck, Percent, DollarSign, Settings } from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

export default function AgenciesPage() {
    const [agencies, setAgencies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [name, setName] = useState('');
    const [ownerId, setOwnerId] = useState('');
    const [commissionRate, setCommissionRate] = useState('10');
    const [submitting, setSubmitting] = useState(false);

    // Assign Host states
    const [selectedAgency, setSelectedAgency] = useState<any | null>(null);
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [hostUserId, setHostUserId] = useState('');
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        fetchAgencies();
    }, []);

    const fetchAgencies = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/api/admin/agencies');
            if (response.success && response.data) {
                setAgencies(response.data || []);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch agencies list');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAgency = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !ownerId) {
            toast.error('Name and Owner MongoDB ID are required');
            return;
        }

        try {
            setSubmitting(true);
            const response = await apiClient.post('/api/admin/agencies', {
                name,
                ownerId,
                commissionRate
            });

            if (response.success) {
                toast.success('Agency created successfully');
                setName('');
                setOwnerId('');
                setCommissionRate('10');
                fetchAgencies();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to create agency');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (agencyId: string) => {
        try {
            const response = await apiClient.patch(`/api/admin/agencies/${agencyId}`);
            if (response.success) {
                toast.success(response.message || 'Agency status updated');
                fetchAgencies();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to toggle agency status');
        }
    };

    const handleAssignHost = async () => {
        if (!selectedAgency || !hostUserId) return;

        try {
            setAssigning(true);
            const response = await apiClient.post('/api/admin/agencies/assign-host', {
                agencyId: selectedAgency._id,
                hostUserId: parseInt(hostUserId)
            });

            if (response.success) {
                toast.success(`Successfully assigned host ${hostUserId} to ${selectedAgency.name}`);
                setIsAssignOpen(false);
                setHostUserId('');
                setSelectedAgency(null);
                fetchAgencies();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to assign host to agency');
        } finally {
            setAssigning(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Agencies</h2>
                <p className="text-muted-foreground mt-1 font-medium font-sans">Manage live streaming agencies, commissions, and host associations</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Create Form */}
                <Card className="glass-card md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <Plus size={20} />
                            Register Agency
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateAgency} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Agency Name</label>
                                <Input
                                    placeholder="e.g. Venus Agency Asia"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Owner User ID (MongoDB Object ID)</label>
                                <Input
                                    placeholder="65a7f28..."
                                    value={ownerId}
                                    onChange={(e) => setOwnerId(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Commission Rate (%)</label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        placeholder="10"
                                        value={commissionRate}
                                        onChange={(e) => setCommissionRate(e.target.value)}
                                    />
                                    <Percent className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                            <Button type="submit" className="w-full font-bold" disabled={submitting}>
                                {submitting ? 'Registering...' : 'Register Agency'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Agencies Table list */}
                <Card className="glass-card md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <Award size={20} className="text-primary animate-pulse" />
                            Registered Agencies Grid
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-bold text-slate-300">Agency</TableHead>
                                    <TableHead className="font-bold text-slate-300">Agency Code</TableHead>
                                    <TableHead className="font-bold text-slate-300">Owner (Admin)</TableHead>
                                    <TableHead className="font-bold text-slate-300">Commission</TableHead>
                                    <TableHead className="font-bold text-slate-300">Balance</TableHead>
                                    <TableHead className="font-bold text-slate-300">Status</TableHead>
                                    <TableHead className="text-right font-bold text-slate-300">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-slate-400">Loading agencies...</TableCell>
                                    </TableRow>
                                ) : agencies.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-slate-400 font-medium">No agencies found</TableCell>
                                    </TableRow>
                                ) : (
                                    agencies.map((agency) => (
                                        <TableRow key={agency._id} className="hover:bg-muted/30">
                                            <TableCell className="font-bold text-slate-200">{agency.name}</TableCell>
                                            <TableCell className="font-mono text-xs font-semibold text-primary">{agency.code}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center font-bold text-xs">
                                                        {agency.ownerId?.image ? (
                                                            <img src={agency.ownerId.image} alt={agency.ownerId.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            agency.ownerId?.name?.[0]?.toUpperCase() || 'O'
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-200">{agency.ownerId?.name || 'Owner Deleted'}</p>
                                                        <p className="text-[10px] text-muted-foreground font-semibold">ID: {agency.ownerId?.userId}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-semibold text-slate-300">{agency.commissionRate}%</TableCell>
                                            <TableCell className="font-bold text-slate-200">${agency.balance.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Badge variant={agency.status === 'active' ? 'success' : 'destructive'} className="font-semibold">
                                                    {agency.status === 'active' ? 'Active' : 'Blocked'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setSelectedAgency(agency);
                                                            setIsAssignOpen(true);
                                                        }}
                                                        title="Assign Host to Agency"
                                                    >
                                                        <UserCheck size={16} />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleToggleStatus(agency._id)}
                                                    >
                                                        {agency.status === 'active' ? <ToggleRight width={22} height={22} className="text-emerald-500" /> : <ToggleLeft width={22} height={22} className="text-muted-foreground" />}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Assign host modal */}
            <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Host to Agency: {selectedAgency?.name}</DialogTitle>
                        <DialogDescription>
                            Assign a user with the role of `host` to this agency. Entering their System ID will link their agency code.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Host User System ID</label>
                            <Input
                                placeholder="Enter Host ID (e.g. 10008)"
                                value={hostUserId}
                                onChange={(e) => setHostUserId(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAssignOpen(false)} className="font-semibold">Cancel</Button>
                        <Button onClick={handleAssignHost} disabled={assigning || !hostUserId} className="font-bold">
                            {assigning ? 'Assigning...' : 'Assign Host'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function ToggleRight(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="20" height="12" x="2" y="6" rx="6" ry="6" />
            <circle cx="16" cy="12" r="2" />
        </svg>
    );
}

function ToggleLeft(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="20" height="12" x="2" y="6" rx="6" ry="6" />
            <circle cx="8" cy="12" r="2" />
        </svg>
    );
}
