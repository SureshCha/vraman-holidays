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
      <div className="mx-auto max-w-[1320px] flex h-16 items-center justify-between gap-3 px-4">
        <Link href="/" className="flex items-center shrink-0" aria-label={settings.brand.name}>
          {settings.brand.logoUrl ? (
            <Image src={settings.brand.logoUrl} alt={settings.brand.name} width={140} height={44} className="h-9 w-auto object-contain" />
          ) : (
            (() => {
              const [first, ...rest] = settings.brand.name.split(" ");
              return (
                <span className="font-heading text-xl sm:text-2xl font-bold tracking-tight leading-none">
                  <span className="text-primary">{first}</span>
                  {rest.length > 0 && <span className="text-foreground"> {rest.join(" ")}</span>}
                </span>
              );
            })()
          )}
        </Link>

        {/* Desktop nav (with dropdowns) */}
        <HeaderNav items={navItems} />

        {/* Right-side utilities */}
        <div className="hidden min-[1180px]:flex items-center gap-1 shrink-0">
          <HeaderPreferences />
          <Link href="/wishlist" aria-label="Wishlist" className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Heart className="h-[1.1rem] w-[1.1rem]" />
          </Link>
        </div>

        {/* Mobile nav */}
        <MobileNav navItems={navItems} brandName={settings.brand.name} />
      </div>
    </header>
  );
}
