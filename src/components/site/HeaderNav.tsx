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
    <nav className="hidden lg:flex items-center gap-5 text-sm font-medium">
      {items.map((item) =>
        item.children.length > 0 ? (
          <DropdownMenu key={item.id}>
            <DropdownMenuTrigger className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap outline-none data-[popup-open]:text-foreground">
              {item.label}
              <ChevronDown className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {item.children.map((child) => (
                <DropdownMenuItem
                  key={child.id}
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
            className="text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
          >
            {item.label}
          </Link>
        )
      )}
    </nav>
  );
}
