import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="h-8 w-8 p-0"
            >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous</span>
            </Button>
            <div className="text-sm text-slate-400">
                Page {currentPage} of {totalPages}
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="h-8 w-8 p-0"
            >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next</span>
            </Button>
        </div>
    );
}
