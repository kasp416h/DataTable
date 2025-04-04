import { Button } from "@/components/ui/button";

import { Table } from "@tanstack/react-table";

interface PaginationControlsProps<I> {
  table: Table<I>;
}

export const PaginationControls = <I,>({
  table,
}: PaginationControlsProps<I>) => {
  return (
    <div className="mt-10 flex items-center">
      <div className="space-x-2">
        <Button
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
      <div className="ml-6 text-sm">
        Showing {table.getState().pagination.pageIndex + 1} of{" "}
        {table.getPageCount()}
      </div>
    </div>
  );
};
