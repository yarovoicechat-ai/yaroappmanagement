'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Clock3, FileCheck, RefreshCw, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';

type ApprovalRecord = { role?: string; approvedAt?: string; userName?: string };
type StaffRequest = {
  _id: string;
  role?: string;
  requestType?: string;
  status: string;
  data?: {
    role?: string;
    name?: string;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    mobile?: string;
    yaroId?: string;
    userId?: string | number;
    [key: string]: any;
  };
  approvedBy?: ApprovalRecord[];
  currentStepIndex?: number;
  workflowSteps?: string[];
  createdAt?: string;
};
type RequestListPayload = { data?: StaffRequest[]; pagination?: { totalPages?: number } };

const normalize = (value: unknown) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const isAdminOperatorRequest = (request: StaffRequest) => {
  const token = normalize(request.role || request.requestType);
  return token.includes('host') || token.includes('agency') || token.includes('admin') || token.includes('bd') || token.includes('operator') || token.includes('support') || token.includes('seller');
};

const getApprovalStage = (request: StaffRequest) => {
  if (request.workflowSteps && request.workflowSteps.length > 0) {
    const currentStep = request.currentStepIndex || 0;
    const label = request.workflowSteps[currentStep] || `Stage ${currentStep + 1} Review`;
    const stepLower = label.toLowerCase();
    let role = 'admin';
    if (stepLower.includes('agency')) role = 'agency';
    else if (stepLower.includes('bd leader') || stepLower.includes('bdleader')) role = 'bdLeader';
    else if (stepLower.includes('bd')) role = 'bd';
    else if (stepLower.includes('super admin') || stepLower.includes('superadmin')) role = 'superAdmin';
    else if (stepLower.includes('operator')) role = 'operator';
    else if (stepLower.includes('owner')) role = 'owner';
    return { role, label, index: currentStep };
  }
  const adminApproved = (request.approvedBy || []).some((approval) => normalize(approval.role) === 'admin');
  return adminApproved
    ? { role: 'operator', label: 'Stage 2 · Operator final approval', index: 1 }
    : { role: 'admin', label: 'Stage 1 · Admin review', index: 0 };
};

const isOpen = (status: string) => ['pending', 'under_review'].includes(normalize(status));

export default function StaffApprovalRequestsPage() {
  const { user } = useAuth();
  const actorRole = String(user?.role || '').toLowerCase();
  const [status, setStatus] = useState('pending');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [requests, setRequests] = useState<StaffRequest[]>([]);
  const [selected, setSelected] = useState<StaffRequest | null>(null);
  const [search, setSearch] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [comments, setComments] = useState('');
  const [enableAppAccess, setEnableAppAccess] = useState(true);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [loadError, setLoadError] = useState('');

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const response = await apiClient.get<StaffRequest[] | RequestListPayload>(`/api/ems/requests?status=${encodeURIComponent(status)}&page=${page}&limit=100`);
      const payload = response.data;
      const rows: StaffRequest[] = Array.isArray(payload) ? payload : payload?.data || [];
      setRequests(rows.filter(isAdminOperatorRequest));
      setTotalPages(Math.max(1, Number(Array.isArray(payload) ? 1 : payload?.pagination?.totalPages || 1)));
      setSelected((current) => current && rows.some((request) => request._id === current._id)
        ? rows.find((request) => request._id === current._id) || current
        : null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load staff applications.';
      setLoadError(message);
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => { void fetchRequests(); }, [fetchRequests]);

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return requests;
    return requests.filter((request) => [
      request.data?.name,
      request.data?.fullName,
      request.data?.email,
      request.role,
      request.requestType,
    ].some((value) => String(value || '').toLowerCase().includes(query)));
  }, [requests, search]);

  const selectedStage = selected ? getApprovalStage(selected) : null;
  const isDirectApprover = actorRole === 'owner' || actorRole === 'operator';
  const isStageMatched = Boolean(
    selectedStage && (
      actorRole === selectedStage.role ||
      normalize(actorRole) === normalize(selectedStage.role)
    )
  );
  const canAct = Boolean(selected && isOpen(selected.status) && (isDirectApprover || isStageMatched));

  const approve = async () => {
    if (!selected || !canAct) return;
    setProcessing(true);
    try {
      const response = await apiClient.post(`/api/ems/requests/${selected._id}/approve`, { comments, enableAppAccess });
      if (!response.success) throw new Error(response.message || 'Approval failed.');
      toast.success(response.message || 'Approval recorded.');
      setSelected(null);
      setComments('');
      await fetchRequests();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not approve this request.');
    } finally {
      setProcessing(false);
    }
  };

  const reject = async () => {
    if (!selected || !canAct) return;
    if (!rejectionReason.trim()) {
      toast.error('Add a reason before rejecting this request.');
      return;
    }
    setProcessing(true);
    try {
      const response = await apiClient.post(`/api/ems/requests/${selected._id}/reject`, { reason: rejectionReason.trim() });
      if (!response.success) throw new Error(response.message || 'Rejection failed.');
      toast.success(response.message || 'Request rejected.');
      setSelected(null);
      setRejectionReason('');
      await fetchRequests();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not reject this request.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Staff Approval Requests</h1>
          <p className="mt-1 text-sm text-slate-400">Hosting, Agency and Admin applications follow Admin review, then Operator final approval.</p>
        </div>
        <button onClick={() => void fetchRequests()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-50">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3">
        <div className="flex flex-wrap gap-2">
          {['pending', 'under_review', 'approved', 'rejected'].map((value) => (
            <button key={value} onClick={() => { setStatus(value); setPage(1); setSelected(null); }} className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize ${status === value ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800'}`}>
              {value.replace('_', ' ')}
            </button>
          ))}
        </div>
        <label className="flex min-w-56 items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-slate-400">
          <Search size={15} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find applicant" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
        </label>
      </div>

      {loadError ? (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          <span>{loadError}</span>
          <button onClick={() => void fetchRequests()} className="font-semibold underline">Retry</button>
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <section className="space-y-3">
          {loading ? <div className="rounded-xl border border-slate-800 p-8 text-center text-sm text-slate-400">Loading requests…</div> : null}
          {!loading && !filteredRequests.length ? <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">No staff applications in this queue.</div> : null}
          {filteredRequests.map((request) => {
            const stage = getApprovalStage(request);
            const applicant = request.data?.name || request.data?.fullName || 'Applicant';
            return (
              <button key={request._id} onClick={() => { setSelected(request); setRejectionReason(''); setComments(''); }} className={`w-full rounded-xl border p-4 text-left transition ${selected?._id === request._id ? 'border-cyan-400/70 bg-cyan-500/10' : 'border-slate-800 bg-slate-950/40 hover:border-slate-600'}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{applicant}</p>
                    <p className="mt-1 text-xs text-slate-400">{request.role || request.requestType} · {request.data?.email || 'No email provided'}</p>
                  </div>
                  <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300">{stage.label}</span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500"><Clock3 size={13} /> {request.createdAt ? new Date(request.createdAt).toLocaleString() : 'Date unavailable'} <span className="ml-auto capitalize">{request.status.replace('_', ' ')}</span></div>
              </button>
            );
          })}
          {totalPages > 1 ? (
            <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-slate-700 px-3 py-1.5 disabled:opacity-40">Previous</button>
                <button disabled={page >= totalPages || loading} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-slate-700 px-3 py-1.5 disabled:opacity-40">Next</button>
              </div>
            </div>
          ) : null}
        </section>

        <aside className="rounded-xl border border-slate-800 bg-slate-950/50 p-5">
          {!selected ? (
            <div className="flex min-h-52 flex-col items-center justify-center text-center text-sm text-slate-500"><FileCheck size={28} className="mb-3 text-slate-600" />Select an application to review its stages.</div>
          ) : (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Applicant</p>
                <h2 className="mt-1 text-xl font-bold text-white">{selected.data?.name || selected.data?.fullName || 'Applicant'}</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {selected.data?.email || 'No email'} · {selected.data?.phoneNumber || selected.data?.mobile || 'No phone'}
                  {(selected.data?.yaroId || selected.data?.userId) ? ` · Yaro ID: ${selected.data?.yaroId || selected.data?.userId}` : ''}
                </p>
              </div>
              <div className="space-y-2 rounded-lg border border-slate-800 p-4">
                {(selected.workflowSteps && selected.workflowSteps.length > 0
                  ? selected.workflowSteps
                  : ['Admin review', 'Operator final approval']
                ).map((step, index) => {
                  const currentIdx = selected.currentStepIndex || 0;
                  const isApproved = index < currentIdx || selected.status === 'approved';
                  const isCurrent = index === currentIdx && isOpen(selected.status);
                  return (
                    <div key={step} className="flex items-center gap-2 text-sm">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full ${isApproved ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                        {isApproved ? <Check size={14} /> : index + 1}
                      </span>
                      <span className={isApproved ? 'text-emerald-200' : 'text-slate-300'}>{step}</span>
                      {isCurrent ? <span className="ml-auto text-[10px] font-bold uppercase text-amber-300">Current</span> : null}
                    </div>
                  );
                })}
              </div>
              {canAct ? (
                <div className="space-y-3 border-t border-slate-800 pt-4">
                  <label className="block text-xs font-semibold text-slate-400">Review comments
                    <textarea value={comments} onChange={(event) => setComments(event.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm text-white outline-none focus:border-cyan-500" placeholder="Optional comments" />
                  </label>
                  <label className="flex items-center gap-2.5 rounded-lg border border-cyan-500/30 bg-cyan-950/20 p-2.5 text-xs font-medium text-cyan-200 cursor-pointer hover:bg-cyan-950/40 transition">
                    <input
                      type="checkbox"
                      checked={enableAppAccess}
                      onChange={(e) => setEnableAppAccess(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                    />
                    <span>App me Option / Role Portal unlock karein (Mobile App Access)</span>
                  </label>
                  <div className="flex gap-2">
                    <button disabled={processing} onClick={() => void approve()} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-3 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-50"><Check size={15} /> Approve stage</button>
                    <button disabled={processing} onClick={() => void reject()} className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-500/30 px-3 py-2.5 text-sm font-semibold text-rose-300 hover:bg-rose-500/10 disabled:opacity-50"><X size={15} /> Reject</button>
                  </div>
                  <label className="block text-xs text-slate-500">Rejection reason
                    <input value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm text-white outline-none focus:border-rose-500" placeholder="Required before rejecting" />
                  </label>
                </div>
              ) : (
                <p className="rounded-lg border border-slate-800 bg-slate-900/70 p-3 text-xs leading-relaxed text-slate-400">This request is at the {selectedStage?.role || 'next'} stage. Sign in with that role to take action. The server validates every approval and rejection.</p>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
