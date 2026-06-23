"use client";

import { useState } from "react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import type { HeaderNavItem } from "./HeaderNav";
import { HeaderPreferences } from "./HeaderPreferences";

export function MobileNav({ navItems, brandName }: { navItems: HeaderNavItem[]; brandName: string }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="min-[1180px]:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open menu" />}>
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="right" className="w-72 overflow-y-auto">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between py-4 border-b">
              <span className="font-bold">{brandName}</span>
              <HeaderPreferences />
            </div>
            <nav className="flex flex-col gap-1 py-4">
              {navItems.map((item) =>
                item.children.length > 0 ? (
                  <div key={item.id} className="mt-2">
                    <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {item.label}
                    </p>
                    {item.children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.href}
                        target={child.openInNew ? "_blank" : undefined}
                        onClick={close}
                        className="block pl-4 pr-2 py-2 rounded-md text-sm hover:bg-muted transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={item.id}
                    href={item.href}
                    target={item.openInNew ? "_blank" : undefined}
                    onClick={close}
                    className="px-2 py-2.5 rounded-md text-sm hover:bg-muted transition-colors"
                  >
                    {item.label}
                  </Link>
                )
              )}
              <Link
                href="/contact"
                onClick={close}
                className="mt-4 rounded-full bg-primary px-4 py-2 text-center text-primary-foreground text-sm font-medium"
              >
                Let&apos;s Plan Your Journey
              </Link>
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
