'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Check, X, RefreshCw, Eye, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import Image from 'next/image';

interface AvatarRequestItem {
  _id: string;
  hostId: number;
  currentAvatar: string;
  requestedAvatar: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectReason?: string;
  createdAt: string;
  hostUserObjId?: {
    name?: string;
    email?: string;
    phoneNumber?: string;
    userId?: number;
  };
}

export default function AvatarRequestsPage() {
  const [requests, setRequests] = useState<AvatarRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const statusQuery = statusFilter === 'all' ? '' : `?status=${statusFilter}`;
      const res = await apiClient.get<any>(`/api/v1/avatar-requests${statusQuery}`);
      const data = (res as any)?.data?.requests || (res as any)?.data || (res as any)?.requests || [];
      setRequests(data);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load avatar verification requests');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const handleApprove = async (id: string) => {
    try {
      const res = await apiClient.put(`/api/v1/avatar-requests/${id}/approve`, {});
      toast.success(res.message || 'Avatar request approved successfully');
      await loadRequests();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to approve avatar request');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await apiClient.put(`/api/v1/avatar-requests/${id}/reject`, { reason: rejectReason });
      toast.success(res.message || 'Avatar request rejected');
      setRejectingId(null);
      setRejectReason('');
      await loadRequests();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to reject avatar request');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Avatar Verification Requests
          </h2>
          <p className="text-slate-400 mt-1">Review and approve custom avatar uploads from verified hosts.</p>
        </div>
        <Button variant="outline" onClick={() => void loadRequests()}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((filter) => (
          <Button
            key={filter}
            variant={statusFilter === filter ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(filter)}
            className="capitalize"
          >
            {filter}
          </Button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {loading ? (
          <Card glass><CardContent className="p-8 text-center text-slate-400">Loading requests...</CardContent></Card>
        ) : requests.length === 0 ? (
          <Card glass><CardContent className="p-8 text-center text-slate-400">No avatar requests found for this filter.</CardContent></Card>
        ) : (
          requests.map((req) => (
            <Card key={req._id} glass className="border border-slate-800">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  {/* Host Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg text-slate-100">
                        {req.hostUserObjId?.name || `Host #${req.hostId}`}
                      </span>
                      <Badge variant={req.status === 'approved' ? 'success' : req.status === 'rejected' ? 'destructive' : 'secondary'}>
                        {req.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400">Host ID: <code className="text-pink-400">{req.hostId}</code></p>
                    <p className="text-xs text-slate-500">Submitted: {new Date(req.createdAt).toLocaleString()}</p>
                    {req.rejectReason && (
                      <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> Reject Reason: {req.rejectReason}
                      </p>
                    )}
                  </div>

                  {/* Image Comparison */}
                  <div className="flex items-center gap-6">
                    {/* Current Avatar */}
                    <div className="text-center">
                      <p className="text-xs text-slate-400 mb-1">Current Avatar</p>
                      <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-slate-700 bg-slate-800">
                        {req.currentAvatar ? (
                          <Image src={req.currentAvatar} alt="Current" fill className="object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">No Avatar</div>
                        )}
                      </div>
                    </div>

                    <span className="text-slate-500 font-bold">→</span>

                    {/* Requested Avatar */}
                    <div className="text-center">
                      <p className="text-xs font-semibold text-purple-400 mb-1">Requested Avatar</p>
                      <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-purple-500 bg-slate-800 shadow-lg shadow-purple-500/20">
                        <Image src={req.requestedAvatar} alt="Requested" fill className="object-cover" unoptimized />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {req.status === 'pending' && (
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                      {rejectingId === req._id ? (
                        <div className="space-y-2">
                          <Input
                            placeholder="Enter rejection reason..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="text-xs"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" variant="destructive" onClick={() => void handleReject(req._id)}>
                              Confirm Reject
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setRejectingId(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500" onClick={() => void handleApprove(req._id)}>
                            <Check className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => { setRejectingId(req._id); setRejectReason(''); }}>
                            <X className="h-4 w-4 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
