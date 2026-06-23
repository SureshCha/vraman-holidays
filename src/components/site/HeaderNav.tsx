"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export interface HeaderNavChild {
  id: string;
  label: string;
  href: string;
  openInNew: boolean;
}

export interface HeaderNavItem extends HeaderNavChild {
  children: HeaderNavChild[];
}

export function HeaderNav({ items }: { items: HeaderNavItem[] }) {
  return (
    <nav className="hidden min-[1180px]:flex items-center gap-0.5 text-sm font-medium">
      {items.map((item) =>
        item.children.length > 0 ? (
          <DropdownMenu key={item.id}>
            <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-md px-2 py-2 text-muted-foreground transition-colors whitespace-nowrap outline-none hover:bg-primary/10 hover:text-primary data-[popup-open]:bg-primary/10 data-[popup-open]:text-primary">
              {item.label}
              <ChevronDown className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {item.children.map((child) => (
                <DropdownMenuItem
                  key={child.id}
                  className="cursor-pointer rounded-md focus:bg-primary/10 focus:text-primary data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary"
                  render={
                    <Link href={child.href} target={child.openInNew ? "_blank" : undefined} />
                  }
                >
                  {child.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link
            key={item.id}
            href={item.href}
            target={item.openInNew ? "_blank" : undefined}
            className="rounded-md px-2 py-2 text-muted-foreground transition-colors whitespace-nowrap hover:bg-primary/10 hover:text-primary"
          >
            {item.label}
          </Link>
        )
      )}
    </nav>
  );
}
