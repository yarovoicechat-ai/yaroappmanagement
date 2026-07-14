'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Flag, CheckCircle, XCircle, AlertTriangle, Eye, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';

type Report = {
    _id: string;
    reportId: string;
    reporterId: { name: string; email: string };
    reportedUserId: { name: string; email: string };
    reason: string;
    description: string;
    status: string;
    severity: string;
    createdAt: string;
};

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNext: false,
        hasPrev: false
    });

    useEffect(() => {
        fetchReports(pagination.currentPage);
    }, [pagination.currentPage]);

    const fetchReports = async (page: number) => {
        try {
            setLoading(true);
            const response = await apiClient.get(API_ENDPOINTS.REPORTS.LIST, { page, limit: 9, status: 'pending' });
            if (response.success && response.data) {
                const data = response.data as any;
                setReports(data.reports || []);
                setPagination(data.pagination);
            }
        } catch (error) {
            toast.error("Failed to load reports");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: 'resolve' | 'dismiss') => {
        try {
            const endpoint = action === 'resolve'
                ? API_ENDPOINTS.REPORTS.RESOLVE(id)
                : API_ENDPOINTS.REPORTS.DISMISS(id);

            const response = await apiClient.post(endpoint, {});

            if (response.success) {
                setReports(reports.filter(r => r._id !== id));
                if (action === 'resolve') {
                    toast.success("Report resolved successfully");
                } else {
                    toast.info("Report dismissed");
                }
                // Refresh if empty to get next page items
                if (reports.length === 1 && pagination.currentPage > 1) {
                    setPagination(p => ({ ...p, currentPage: p.currentPage - 1 }));
                } else if (reports.length === 1) {
                    fetchReports(1);
                }
            }
        } catch (error: any) {
            toast.error(error.message || `Failed to ${action} report`);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-red-200 to-red-400 bg-clip-text text-transparent">Content Moderation</h2>
                <p className="text-slate-400 mt-1">Review and manage reported content.</p>
            </div>

            {loading && <div className="text-center py-10 text-slate-500">Loading pending reports...</div>}

            {!loading && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {reports.map((report) => (
                        <Card key={report._id} glass className="border-l-4 border-l-red-500/50 flex flex-col">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <Badge variant="outline" className="border-red-500/50 text-red-400">
                                        {report.reason}
                                    </Badge>
                                    <span className="text-xs text-slate-500">
                                        {new Date(report.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <CardTitle className="text-base mt-2 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                                    {report.reportedUserId?.name || "Unknown User"}
                                </CardTitle>
                                <CardDescription>Reported by {report.reporterId?.name || "Anonymous"}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-4 text-sm text-slate-400 bg-slate-800/50 p-2 rounded">
                                    <span>Status: <span className="text-slate-200 capitalize">{report.status}</span></span>
                                    <span>Severity: <span className={report.severity === 'high' ? 'text-red-400 font-bold' : report.severity === 'medium' ? 'text-amber-400' : 'text-slate-200 capitalize'}>{report.severity}</span></span>
                                </div>

                                <div className="mb-4 bg-slate-900/50 p-3 rounded text-sm italic text-slate-400 border border-slate-800 break-words">
                                    "{report.description}"
                                </div>

                                <div className="flex gap-2 mt-auto">
                                    <Button variant="outline" className="flex-1 border-green-500/20 hover:bg-green-500/10 hover:text-green-400" onClick={() => handleAction(report._id, 'resolve')}>
                                        <CheckCircle className="mr-2 h-4 w-4" /> Resolve
                                    </Button>
                                    <Button variant="ghost" className="flex-1 hover:bg-slate-800" onClick={() => handleAction(report._id, 'dismiss')}>
                                        <XCircle className="mr-2 h-4 w-4" /> Dismiss
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {reports.length === 0 && (
                        <div className="col-span-full text-center py-12 text-slate-500 bg-slate-900/10 rounded-xl border border-dashed border-slate-800">
                            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500/50" />
                            <h3 className="text-lg font-medium text-slate-300">All caught up!</h3>
                            <p>No pending reports to review.</p>
                        </div>
                    )}
                </div>
            )}

            {!loading && reports.length > 0 && (
                <div className="flex justify-center gap-2 mt-6">
                    <Button
                        variant="outline"
                        disabled={!pagination.hasPrev}
                        onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage - 1 }))}
                    >
                        <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                    </Button>
                    <Button variant="ghost" disabled>
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </Button>
                    <Button
                        variant="outline"
                        disabled={!pagination.hasNext}
                        onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage + 1 }))}
                    >
                        Next <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            )}
        </div>
    );
}
