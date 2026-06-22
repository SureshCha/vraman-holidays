import Link from "next/link";
import { cacheTag } from "next/cache";
import Image from "next/image";
import { Heart } from "lucide-react";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { MobileNav } from "./MobileNav";
import { HeaderNav, type HeaderNavItem } from "./HeaderNav";
import { HeaderPreferences } from "./HeaderPreferences";

async function getHeaderNav() {
  "use cache";
  cacheTag("navigation");
  return db.navigation.findMany({
    where: { location: "header", parentId: null },
    orderBy: { order: "asc" },
    include: { children: { orderBy: { order: "asc" } } },
  });
}

export async function SiteHeader() {
  const [settings, navRows] = await Promise.all([getSettings(), getHeaderNav()]);

  const navItems: HeaderNavItem[] = navRows.map((item) => ({
    id: item.id,
    label: item.label,
    href: item.href,
    openInNew: item.openInNew,
    children: item.children.map((c) => ({
      id: c.id,
      label: c.label,
      href: c.href,
      openInNew: c.openInNew,
    })),
  }));

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
          {settings.brand.logoUrl ? (
            <Image src={settings.brand.logoUrl} alt={settings.brand.name} width={120} height={40} className="h-8 w-auto object-contain" />
          ) : (
            <span>{settings.brand.name}</span>
          )}
        </Link>

        {/* Desktop nav (with dropdowns) */}
        <HeaderNav items={navItems} />

        {/* Right-side utilities */}
        <div className="hidden lg:flex items-center gap-1 shrink-0">
          <HeaderPreferences />
          <Link href="/wishlist" aria-label="Wishlist" className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Heart className="h-[1.1rem] w-[1.1rem]" />
          </Link>
          <Link href="/contact" className="ml-1 rounded-full bg-primary px-4 py-1.5 text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors whitespace-nowrap">
            Plan Your Journey
          </Link>
        </div>

        {/* Mobile nav */}
        <MobileNav navItems={navItems} brandName={settings.brand.name} />
      </div>
    </header>
  );
}
