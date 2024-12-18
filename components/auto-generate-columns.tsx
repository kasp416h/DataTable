import Link from "next/link";

import { ColumnDef } from "@tanstack/react-table";

import { BooleanCell } from "./cells/boolean";
import { Menu, MenuProps } from "./cells/menu";

export type FieldConfig = {
  linkKey?: string;
  header?: string;
  type?: "menu";
  charLimit?: number;
  visableCharacters?: number;
  headerClassName?: string;
  className?: string;
};

export type FieldMapping<T> = Record<keyof T, FieldConfig>;

export function autoGenerateColumns<T>(
  data: T[],
  pathname: string,
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

    if (linkTemplate) {
      return {
        accessorKey: key,
        header,
        cell: ({ row }) => {
          const value = row.getValue(key as string) as string;
          const linkValue = linkTemplate.replace(
            /\[([^\]]+)\]/g,
            (_, match) => row.original[match as keyof T] as string
          );
          return (
            <Link
              href={`${pathname}${linkValue}`}
              className="p-0 font-bold text-primary"
            >
              {truncate(value)}
            </Link>
          );
        },
      };
    }

    if (fieldConfig.type === "menu") {
      return {
        accessorKey: key,
        header,
        cell: ({ row }) => {
          return <Menu value={row.getValue(key as string) as MenuProps} />;
        },
      };
    }

    if (typeof firstRow[key] === "boolean") {
      return {
        accessorKey: key,
        header,
        cell: ({ row }) => (
          <BooleanCell value={row.getValue(key as string) as boolean} />
        ),
      };
    }

    if (Array.isArray(firstRow[key])) {
      return {
        accessorKey: key,
        header,
        cell: ({ row }) => {
          const value = row.getValue(key as string) as unknown[];
          return <span>{value.length} item(s)</span>;
        },
      };
    }

    return {
      accessorKey: key,
      header,
      cell: ({ row }) => {
        const value = row.getValue(key as string) as string;
        return <span>{truncate(value)}</span>;
      },
    };
  });
}
