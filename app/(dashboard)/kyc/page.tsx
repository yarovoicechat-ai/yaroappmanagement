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
import { CheckSquare, ShieldAlert, Award, FileText, CheckCircle, XCircle } from "lucide-react";
import { toast } from 'sonner';

export default function KycPage() {
    // Mock KYC Submissions
    const [kycList, setKycList] = useState<any[]>([
        { id: '1', name: 'Alina Dsouza', docType: 'Passport', docNumber: 'L8891023', fileUrl: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&w=150&q=80', status: 'pending' },
        { id: '2', name: 'Kiara Advani', docType: 'National ID Card', docNumber: '3902-1182-9011', fileUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80', status: 'pending' },
        { id: '3', name: 'Sonam Kapoor', docType: 'Driver License', docNumber: 'DL-9938012A', fileUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80', status: 'approved' }
    ]);

    const handleKycReview = (id: string, action: 'approved' | 'rejected') => {
        setKycList(prev => prev.map(k => {
            if (k.id === id) {
                toast.success(`KYC Submission for ${k.name} was ${action}`);
                return { ...k, status: action };
            }
            return k;
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Identity Verifications (KYC)</h2>
                    <p className="text-muted-foreground mt-1 font-medium font-sans">Approve national identity papers and business files uploaded by hosts</p>
                </div>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-200">
                        <CheckSquare size={20} className="text-primary animate-pulse" />
                        Host KYC Validation Queue
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-bold text-slate-300">Applicant Name</TableHead>
                                <TableHead className="font-bold text-slate-300">Identity Document Type</TableHead>
                                <TableHead className="font-bold text-slate-300">Document ID Number</TableHead>
                                <TableHead className="font-bold text-slate-300">Document Scan File</TableHead>
                                <TableHead className="font-bold text-slate-300">KYC Status</TableHead>
                                <TableHead className="text-right font-bold text-slate-300">Action Queue</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {kycList.map((kyc) => (
                                <TableRow key={kyc.id} className="hover:bg-muted/30">
                                    <TableCell className="font-bold text-slate-200">{kyc.name}</TableCell>
                                    <TableCell className="font-semibold text-slate-300 capitalize">{kyc.docType}</TableCell>
                                    <TableCell className="font-mono text-xs text-primary font-bold">{kyc.docNumber}</TableCell>
                                    <TableCell>
                                        <div className="h-10 w-16 rounded overflow-hidden bg-slate-800 border border-slate-700">
                                            <img src={kyc.fileUrl} alt="doc scan" className="h-full w-full object-cover" />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={kyc.status === 'approved' ? 'success' : kyc.status === 'pending' ? 'secondary' : 'destructive'} className="font-semibold capitalize">
                                            {kyc.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {kyc.status === 'pending' ? (
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleKycReview(kyc.id, 'approved')}
                                                    className="flex items-center gap-1 font-bold text-xs hover:bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                                >
                                                    <CheckCircle size={12} />
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleKycReview(kyc.id, 'rejected')}
                                                    className="flex items-center gap-1 font-bold text-xs"
                                                >
                                                    <XCircle size={12} />
                                                    Reject
                                                </Button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground font-semibold uppercase">{kyc.status}</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
