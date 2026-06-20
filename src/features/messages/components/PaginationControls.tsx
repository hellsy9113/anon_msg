import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-3 border-t pt-4">
      <p className="text-xs text-muted-foreground">
        Page {currentPage} of {totalPages}
      </p>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            onPageChange(
              Math.max(1, currentPage - 1),
            )
          }
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            onPageChange(
              Math.min(
                totalPages,
                currentPage + 1,
              ),
            )
          }
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
