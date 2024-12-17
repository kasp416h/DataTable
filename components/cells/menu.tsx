import React from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useRouter } from "next/navigation";
import { EllipsisIcon } from "lucide-react";

export interface MenuProps {
  label?: string;
  menuItems: {
    name: string;
    link: string;
    active: boolean;
    icon?: React.JSX.Element;
  }[];
}

export function Menu({ value }: { value: MenuProps }) {
  const router = useRouter();

  const goTo = (link: string) => {
    router.push(link);
  };

  return (
    <Popover>
      <PopoverTrigger className="flex items-center">
        <EllipsisIcon />
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        className="w-fit min-w-32 items-center px-1 py-1"
      >
        {value.menuItems.map((item) => (
          <Button
            key={item.name}
            type="button"
            variant={"ghost"}
            className="flex w-full justify-start outline-none focus:border-none focus-visible:ring-0"
            disabled={!item.active}
            onClick={() => goTo(item.link)}
          >
            {item.icon}
            {item.name}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
