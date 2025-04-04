"use client";

import React, { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TableBody,
  TableCell,
  Table as TableComponent,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  autoGenerateColumns,
  FieldMapping,
} from "./components/auto-generate-columns";
import { PaginationControls } from "./components/pagination-controls";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircleIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MassAction<T> {
  label: string;
  action: (tabel: T[]) => void;
}

type TableProps<T> = {
  data?: T[];
  visibleProperties?: (keyof T)[];
  fieldMapping: Partial<FieldMapping<T>>;
  customColumns?: ColumnDef<T>[];
  filterableColumns?: (keyof T)[];
  filterPlaceholder?: string;
  pagination?: boolean;
  paginationOptions?: { pageSize: number };
  massActions?: MassAction<T>[];
  loading?: boolean;
  actions?: React.JSX.Element;
  rowCellClassName?: string;
  errorMessage?: string;
};

export function Table<T>({
  data = [],
  visibleProperties,
  fieldMapping = {},
  customColumns = [],
  filterableColumns = [],
  filterPlaceholder = "Filter...",
  pagination = false,
  paginationOptions = { pageSize: 10 },
  massActions = [],
  loading = false,
  actions,
  rowCellClassName,
  errorMessage,
}: TableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [massAction, setMassAction] = useState<string | null>(null);

  const autoColumns = useMemo(() => {
    const baseColumns = autoGenerateColumns(
      data,
      visibleProperties,
      fieldMapping
    );

    if (massActions.length > 0) {
      const selectionColumn: ColumnDef<T> = {
        accessorKey: "selection",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
      };

      return [selectionColumn, ...baseColumns];
    }

    return baseColumns;
  }, [data, visibleProperties, fieldMapping, massActions]);

  const columns = useMemo(
    () => (customColumns.length > 0 ? customColumns : autoColumns),
    [autoColumns, customColumns]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(pagination && {
      getPaginationRowModel: getPaginationRowModel(),
      initialState: { pagination: { pageSize: paginationOptions.pageSize } },
    }),
    globalFilterFn: (row, columnId, filterValue) => {
      if (filterableColumns.includes(columnId as keyof T)) {
        const cellValue = row.getValue(columnId)?.toString()?.toLowerCase();
        return cellValue?.includes(filterValue.toLowerCase()) ?? false;
      }
      return false;
    },
  });

  const handleApplyMassAction = () => {
    if (!massAction) return;
    const action = massActions.find((action) => action.label === massAction);
    if (action) {
      const selectedRows = table
        .getSelectedRowModel()
        .rows.map((row) => row.original);

      action.action(selectedRows);
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between py-4">
          <Skeleton className="h-8 w-96 max-w-sm" />

          {massActions.length > 0 && <Skeleton className="h-8 w-56" />}
        </div>

        <div className="rounded-md border">
          <TableComponent>
            <TableHeader>
              <TableRow>
                {visibleProperties?.map((visibleProperty, index) => {
                  const fieldConfig = fieldMapping[visibleProperty] || {};

                  const header =
                    fieldConfig.header ||
                    (visibleProperty as string).charAt(0).toUpperCase() +
                      (visibleProperty as string).slice(1);

                  const className = fieldConfig.headerClassName || "";

                  return (
                    <TableHead key={index} className={className}>
                      <span>{header}</span>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(10)].map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {visibleProperties?.map((visibleproperty, cellIndex) => {
                    const fieldConfig = fieldMapping[visibleproperty] || {};
                    const className = fieldConfig.className || "";
                    return (
                      <TableCell key={cellIndex} className={className}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </TableComponent>
        </div>

        {pagination && <Skeleton className="mt-10 h-8 w-64 max-w-sm" />}
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between py-4">
          {filterableColumns.length > 0 && (
            <Input
              placeholder={filterPlaceholder}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              disabled
              className="max-w-sm"
            />
          )}
        </div>

        <div className="border-destructive rounded-lg border">
          <TableComponent>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-destructive">
                  {headerGroup.headers.map((header) => {
                    const fieldConfig =
                      fieldMapping[header.column.id as keyof T] || {};
                    const className = fieldConfig.headerClassName || "";
                    return (
                      <TableHead key={header.id} className={className}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  <div className="text-destructive flex flex-col items-center justify-center gap-4 py-12">
                    <AlertCircleIcon className="size-7" />
                    <p>{errorMessage}</p>

                    <Button
                      onClick={() => window.location.reload()}
                      variant="destructive"
                      className="mt-2 px-6 py-3"
                    >
                      <RefreshCwIcon className="mr-2 size-4" />
                      Reload
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </TableComponent>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        {filterableColumns.length > 0 && (
          <Input
            placeholder={filterPlaceholder}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
        )}
      </div>

      {actions ? actions : null}

      {massActions.length > 0 && (
        <div className="hidden gap-x-2 sm:flex">
          <div>
            <Select onValueChange={setMassAction}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Mass actions</SelectLabel>
                  {massActions &&
                    massActions.map((action, index) => (
                      <SelectItem key={index} value={action.label}>
                        {action.label.charAt(0).toUpperCase() +
                          action.label.slice(1)}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <Button disabled={!massAction} onClick={handleApplyMassAction}>
            Apply
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <TableComponent>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const fieldConfig =
                    fieldMapping[header.column.id as keyof T] || {};
                  const className = fieldConfig.headerClassName || "";
                  return (
                    <TableHead key={header.id} className={className}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className={rowCellClassName}>
                  {row.getVisibleCells().map((cell) => {
                    const fieldConfig =
                      fieldMapping[cell.column.id as keyof T] || {};
                    const className = fieldConfig.className || "";
                    return (
                      <TableCell key={cell.id} className={className}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </TableComponent>
      </div>

      {pagination && <PaginationControls table={table} />}
    </div>
  );
}
