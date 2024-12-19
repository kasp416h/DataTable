"use client";

import React, { useMemo, useState } from "react";

import { usePathname } from "next/navigation";

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

type TableProps<T> = {
  data?: T[];
  visibleProperties?: (keyof T)[];
  fieldMapping: Partial<FieldMapping<T>>;
  customColumns?: ColumnDef<T>[];
  filterableColumns?: (keyof T)[];
  filterPlaceholder?: string;
  pagination?: boolean;
  paginationOptions?: { pageSize: number };
  loading?: boolean;
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
  loading = false,
}: TableProps<T>) {
  const pathname = usePathname();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState<string>("");

  const autoColumns = useMemo(
    () => autoGenerateColumns(data, pathname, visibleProperties, fieldMapping),
    [data, visibleProperties, pathname, fieldMapping]
  );
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

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center py-4">
          <Skeleton className="h-8 w-96 max-w-sm" />
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

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder={filterPlaceholder}
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>

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
                <TableRow key={row.id}>
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
