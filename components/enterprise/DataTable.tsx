'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  SlidersHorizontal,
  Search,
  CheckSquare,
  Square,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export interface ColumnDef<T> {
  key: string;
  header: string;
  accessor?: (row: T) => any;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
  defaultVisible?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  searchKey?: string;
  searchPlaceholder?: string;
  isLoading?: boolean;
  loading?: boolean;
  totalCount?: number;
  pageSize?: number;
  onRefresh?: () => void;
  bulkActions?: {
    label: string;
    icon?: any;
    variant?: 'default' | 'destructive' | 'outline';
    onClick: (selectedRows: T[]) => void;
  }[];
  exportFilename?: string;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  data = [],
  columns,
  searchKey,
  searchPlaceholder = 'Search records...',
  isLoading = false,
  loading = false,
  pageSize = 15,
  onRefresh,
  bulkActions = [],
  exportFilename = 'export.csv',
  emptyMessage = 'No matching records found'
}: DataTableProps<T>) {
  const isCurrentlyLoading = isLoading || loading;
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [density, setDensity] = useState<'compact' | 'standard' | 'comfortable'>('compact');
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    columns.forEach(col => {
      init[col.key] = col.defaultVisible !== false;
    });
    return init;
  });
  const [showColumnPicker, setShowColumnPicker] = useState(false);

  // Filter
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(row => {
      if (searchKey) {
        const val = row[searchKey];
        return val != null && String(val).toLowerCase().includes(term);
      }
      return Object.values(row).some(v => v != null && String(v).toLowerCase().includes(term));
    });
  }, [data, searchTerm, searchKey]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const col = columns.find(c => c.key === sortKey);
      const valA = col?.accessor ? col.accessor(a) : a[sortKey];
      const valB = col?.accessor ? col.accessor(b) : b[sortKey];

      if (valA == null) return 1;
      if (valB == null) return -1;
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return sortOrder === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredData, sortKey, sortOrder, columns]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else {
        setSortKey(null);
        setSortOrder('asc');
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedIndices.size === paginatedData.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(paginatedData.map((_, i) => i)));
    }
  };

  const handleSelectRow = (index: number) => {
    const next = new Set(selectedIndices);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelectedIndices(next);
  };

  const exportCSV = () => {
    const activeCols = columns.filter(c => visibleColumns[c.key]);
    const headers = activeCols.map(c => `"${c.header.replace(/"/g, '""')}"`).join(',');
    const rows = sortedData.map(row => {
      return activeCols
        .map(c => {
          const val = c.accessor ? c.accessor(row) : row[c.key];
          return `"${String(val ?? '').replace(/"/g, '""')}"`;
        })
        .join(',');
    });
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', exportFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const densityPadding = {
    compact: 'py-2 px-3 text-xs',
    standard: 'py-3 px-4 text-xs sm:text-sm',
    comfortable: 'py-4 px-5 text-sm'
  }[density];

  const activeCols = columns.filter(c => visibleColumns[c.key]);

  return (
    <div className="space-y-3 font-sans">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0d1222]/80 border border-white/10 p-3 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full bg-slate-950/70 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isCurrentlyLoading}
              title="Refresh Data"
              className="p-2 rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all disabled:opacity-50"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isCurrentlyLoading && "animate-spin")} />
            </button>
          )}

          <div className="flex items-center border border-white/10 rounded-xl bg-white/[0.03] p-0.5 text-xs">
            <button
              onClick={() => setDensity('compact')}
              className={cn("px-2 py-1 rounded-lg transition-all", density === 'compact' ? "bg-white/10 text-white font-bold" : "text-slate-400 hover:text-white")}
              title="Compact View"
            >
              XS
            </button>
            <button
              onClick={() => setDensity('standard')}
              className={cn("px-2 py-1 rounded-lg transition-all", density === 'standard' ? "bg-white/10 text-white font-bold" : "text-slate-400 hover:text-white")}
              title="Standard View"
            >
              MD
            </button>
            <button
              onClick={() => setDensity('comfortable')}
              className={cn("px-2 py-1 rounded-lg transition-all", density === 'comfortable' ? "bg-white/10 text-white font-bold" : "text-slate-400 hover:text-white")}
              title="Comfortable View"
            >
              LG
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowColumnPicker(!showColumnPicker)}
              title="Toggle Columns"
              className="p-2 rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all flex items-center gap-1.5 text-xs"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Columns</span>
            </button>

            {showColumnPicker && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-white/10 bg-[#0c101d]/95 backdrop-blur-2xl p-3 shadow-2xl z-50 text-xs space-y-2 animate-in fade-in-0">
                <p className="font-bold text-white text-[11px] uppercase tracking-wider">Visible Columns</p>
                <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                  {columns.map(col => (
                    <label key={col.key} className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={visibleColumns[col.key]}
                        onChange={e => {
                          setVisibleColumns(prev => ({ ...prev, [col.key]: e.target.checked }));
                        }}
                        className="rounded border-white/20 bg-slate-900 text-cyan-500 focus:ring-0"
                      />
                      <span className="truncate">{col.header}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={exportCSV}
            title="Export CSV"
            className="p-2 rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all flex items-center gap-1.5 text-xs font-semibold"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {selectedIndices.size > 0 && bulkActions.length > 0 && (
        <div className="flex items-center justify-between gap-3 p-2.5 px-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-xs animate-in fade-in-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-cyan-300">{selectedIndices.size} selected</span>
            <button
              onClick={() => setSelectedIndices(new Set())}
              className="text-slate-400 hover:text-white underline text-[11px]"
            >
              Clear selection
            </button>
          </div>
          <div className="flex items-center gap-2">
            {bulkActions.map((action, idx) => (
              <Button
                key={idx}
                size="sm"
                variant={action.variant || 'default'}
                onClick={() => {
                  const selectedRows = Array.from(selectedIndices).map(i => paginatedData[i]);
                  action.onClick(selectedRows);
                }}
                className="h-7 text-xs"
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Main Table Grid */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl shadow-black/40">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse text-left">
            <thead className="border-b border-white/10 bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 select-none">
              <tr>
                {bulkActions.length > 0 && (
                  <th className="w-10 px-3 py-3 text-center">
                    <button onClick={handleSelectAll} className="text-slate-400 hover:text-white">
                      {selectedIndices.size === paginatedData.length && paginatedData.length > 0 ? (
                        <CheckSquare className="h-4 w-4 text-cyan-400" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                )}
                {activeCols.map(col => {
                  const isSorted = sortKey === col.key;
                  return (
                    <th
                      key={col.key}
                      onClick={() => col.sortable !== false && handleSort(col.key)}
                      className={cn(
                        densityPadding,
                        col.sortable !== false && "cursor-pointer hover:text-white transition-colors",
                        col.align === 'right' ? "text-right" : col.align === 'center' ? "text-center" : "text-left",
                        col.className
                      )}
                    >
                      <div className={cn("inline-flex items-center gap-1.5", col.align === 'right' && "flex-row-reverse")}>
                        <span>{col.header}</span>
                        {col.sortable !== false && (
                          <span className="text-slate-500">
                            {isSorted ? (
                              sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-cyan-400" /> : <ArrowDown className="h-3 w-3 text-cyan-400" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-100" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {isCurrentlyLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {bulkActions.length > 0 && <td className="p-3 text-center"><div className="h-4 w-4 rounded bg-white/10 mx-auto" /></td>}
                    {activeCols.map((c, j) => (
                      <td key={j} className={densityPadding}>
                        <div className="h-4 rounded bg-white/10 w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={activeCols.length + (bulkActions.length > 0 ? 1 : 0)} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="h-6 w-6 text-slate-600" />
                      <p className="text-sm font-medium">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => {
                  const isSelected = selectedIndices.has(idx);
                  return (
                    <tr
                      key={idx}
                      className={cn(
                        "hover:bg-white/[0.04] transition-colors",
                        isSelected && "bg-cyan-500/[0.08]"
                      )}
                    >
                      {bulkActions.length > 0 && (
                        <td className="px-3 py-2 text-center">
                          <button onClick={() => handleSelectRow(idx)} className="text-slate-400 hover:text-white">
                            {isSelected ? (
                              <CheckSquare className="h-4 w-4 text-cyan-400" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                      )}
                      {activeCols.map(col => {
                        const cellContent = col.render
                          ? col.render(row, idx)
                          : col.accessor
                          ? col.accessor(row)
                          : row[col.key];

                        return (
                          <td
                            key={col.key}
                            className={cn(
                              densityPadding,
                              col.align === 'right' ? "text-right" : col.align === 'center' ? "text-center" : "text-left",
                              col.className
                            )}
                          >
                            {cellContent ?? '—'}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10 bg-slate-950/60 p-3 px-4 text-xs text-slate-400">
          <div>
            Showing <span className="font-bold text-white">{sortedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to{' '}
            <span className="font-bold text-white">{Math.min(currentPage * pageSize, sortedData.length)}</span> of{' '}
            <span className="font-bold text-white">{sortedData.length}</span> entries
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isLoading}
              className="p-1.5 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:text-white disabled:opacity-40 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 font-medium">
              Page <span className="text-white font-bold">{currentPage}</span> of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || isLoading}
              className="p-1.5 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:text-white disabled:opacity-40 transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
