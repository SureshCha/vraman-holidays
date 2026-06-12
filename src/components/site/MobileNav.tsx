"use client";

import { useState } from "react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

interface NavItem { id: string; label: string; href: string; openInNew: boolean }

export function MobileNav({ navItems, brandName }: { navItems: NavItem[]; brandName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open menu" />}>
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="right" className="w-72">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between py-4 border-b">
              <span className="font-bold">{brandName}</span>
            </div>
            <nav className="flex flex-col gap-1 py-4">
              {navItems.map((item) => (
                <Link key={item.id} href={item.href} target={item.openInNew ? "_blank" : undefined} onClick={() => setOpen(false)} className="px-2 py-2.5 rounded-md text-sm hover:bg-muted transition-colors">
                  {item.label}
                </Link>
              ))}
              <Link href="/propose" onClick={() => setOpen(false)} className="mt-2 rounded-full bg-primary px-4 py-2 text-center text-primary-foreground text-sm font-medium">
                Propose a Trip
              </Link>
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
