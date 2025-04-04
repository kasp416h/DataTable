import Link from "next/link";

import { ColumnDef } from "@tanstack/react-table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDownIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IMenu, Menu } from "./cells/menu";
import { BooleanCell } from "./cells/boolean";

export type FieldConfig<T> = {
  linkKey?: string;
  header?: string;
  type?: "menu";
  charLimit?: number;
  visableCharacters?: number;
  headerClassName?: string;
  sortable?: boolean;
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cell?: React.ComponentType<{ value: any; item: T } & any>;
  customCellProps?: Record<string, unknown>;
  filterable?: {
    label: string;
    filterValue: string | number | boolean;
  }[];
};

export type FieldMapping<T> = Record<keyof T, FieldConfig<T>>;

export function autoGenerateColumns<T>(
  data: T[],
  visibleProperties?: (keyof T)[],
  fieldMapping: Partial<FieldMapping<T>> = {}
): ColumnDef<T>[] {
  if (!data || data.length === 0) return [];

  const firstRow = data[0];
  const keys =
    visibleProperties ||
    (firstRow ? (Object.keys(firstRow) as (keyof T)[]) : []);

  return keys.map((key) => {
    const fieldConfig = fieldMapping[key] || {};
    const linkTemplate = fieldConfig.linkKey;
    const header =
      fieldConfig.header ||
      (key as string).charAt(0).toUpperCase() + (key as string).slice(1);

    const truncate = (value: string | number) => {
      if (typeof value === "string" && value.length > 50) {
        return `${value.slice(0, 50)}...`;
      } else {
        return value;
      }
    };

    return {
      accessorKey: key,
      header: ({ column, table }) => {
        const filterOptions = fieldConfig.filterable;

        if (filterOptions) {
          return (
            <Select
              value={
                (table.getColumn(key as string)?.getFilterValue() as string) ||
                ""
              }
              onValueChange={(value) => {
                table
                  .getColumn(key as string)
                  ?.setFilterValue(value === "all" ? undefined : value);
              }}
            >
              <SelectTrigger className="h-8 w-fit space-x-3">
                <SelectValue placeholder={header} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{header}</SelectItem>
                {filterOptions.map((opt, i) => (
                  <SelectItem key={i} value={String(opt.filterValue)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        } else if (fieldConfig.sortable) {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {header}
              <ArrowUpDownIcon />
            </Button>
          );
        } else {
          return header;
        }
      },
      cell: ({ row }) => {
        const value = row.getValue(key as string);

        if (linkTemplate) {
          const linkValue = linkTemplate.replace(
            /\[([^\]]+)\]/g,
            (_, match) => row.original[match as keyof T] as string
          );
          return (
            <Tooltip delayDuration={700}>
              <TooltipTrigger asChild>
                <Link href={`${linkValue}`} className="text-primary p-0">
                  {truncate(value as string)}
                </Link>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="bg-background pointer-events-none border"
              >
                <p className="text-foreground text-sm">Edit</p>
              </TooltipContent>
            </Tooltip>
          );
        }

        if (fieldConfig.cell) {
          const CustomCell = fieldConfig.cell;
          return (
            <CustomCell
              value={value}
              item={row.original}
              {...fieldConfig.customCellProps}
            />
          );
        }

        if (fieldConfig.type === "menu" && Array.isArray(value)) {
          return <Menu value={value as IMenu<T>[]} item={row.original} />;
        }

        if (typeof value === "boolean") {
          return <BooleanCell value={value as boolean} />;
        }

        if (Array.isArray(value)) {
          return (
            <span>
              {value.length} {value.length === 1 ? "Item" : "Items"}
            </span>
          );
        }

        return <span>{truncate(value as string)}</span>;
      },

      filterFn: fieldConfig.filterable
        ? (row, columnId, filterValue) => {
            const cellValue = row.getValue(columnId);
            return String(cellValue) === filterValue;
          }
        : undefined,
    };
  });
}
