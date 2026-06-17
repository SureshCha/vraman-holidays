import Link from "next/link";
import { cacheTag } from "next/cache";
import Image from "next/image";
import { Heart } from "lucide-react";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { MobileNav } from "./MobileNav";
import { ThemeToggle } from "./ThemeToggle";
import { CurrencySelector } from "./CurrencySelector";

async function getHeaderNav() {
  "use cache";
  cacheTag("navigation");
  return db.navigation.findMany({ where: { location: "header", parentId: null }, orderBy: { order: "asc" } });
}

export async function SiteHeader() {
  const [settings, navItems] = await Promise.all([getSettings(), getHeaderNav()]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          {settings.brand.logoUrl ? (
            <Image src={settings.brand.logoUrl} alt={settings.brand.name} width={120} height={40} className="h-8 w-auto object-contain" />
          ) : (
            <span>{settings.brand.name}</span>
          )}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link key={item.id} href={item.href} target={item.openInNew ? "_blank" : undefined} className="text-muted-foreground hover:text-foreground transition-colors">
              {item.label}
            </Link>
          ))}
          <CurrencySelector />
          <ThemeToggle />
          <Link href="/wishlist" aria-label="Wishlist" className="text-muted-foreground hover:text-foreground transition-colors">
            <Heart className="h-5 w-5" />
          </Link>
          <Link href="/propose" className="rounded-full bg-primary px-4 py-1.5 text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Propose a Trip
          </Link>
        </nav>

        {/* Mobile nav */}
        <MobileNav navItems={navItems.map((i) => ({ id: i.id, label: i.label, href: i.href, openInNew: i.openInNew }))} brandName={settings.brand.name} />
      </div>
    </header>
  );
}
