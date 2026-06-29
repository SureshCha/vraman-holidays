"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Heart, MountainSnow } from "lucide-react";
import { MobileNav } from "./MobileNav";
import { HeaderNav, type HeaderNavItem } from "./HeaderNav";
import { HeaderPreferences } from "./HeaderPreferences";

interface Props {
  navItems: HeaderNavItem[];
  brandName: string;
  logoUrl?: string;
}

/**
 * Scroll-aware header. On the homepage at the top it's a transparent overlay
 * (white text) sitting over the hero image, with a subtle top scrim for
 * legibility; once scrolled — and on every other page — it's a solid white bar.
 */
export function HeaderBar({ navItems, brandName, logoUrl }: Props) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const overlay = isHome && !scrolled;
  const [first, ...rest] = brandName.split(" ");

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors duration-300 ${
        overlay
          ? "bg-gradient-to-b from-black/55 via-black/25 to-transparent text-white"
          : "border-b bg-background/95 backdrop-blur text-foreground"
      }`}
    >
      <div className="mx-auto max-w-[1320px] flex h-16 items-center justify-between gap-3 px-4">
        <Link href="/" className="group flex items-center gap-2.5 shrink-0" aria-label={brandName}>
          {logoUrl ? (
            <Image src={logoUrl} alt={brandName} width={150} height={44} className="h-9 w-auto object-contain" />
          ) : (
            <>
              {/* Brand mark — gradient mountain badge */}
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-sm ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                <MountainSnow className="h-5 w-5" strokeWidth={2.25} />
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-logo text-[1.4rem] sm:text-[1.7rem] leading-none tracking-[-0.01em]">
                  <span className={`font-semibold ${overlay ? "text-white" : "text-foreground"}`}>{first}</span>
                  {rest.length > 0 && (
                    <span className={`font-medium italic ${overlay ? "text-white/85" : "text-primary"}`}> {rest.join(" ")}</span>
                  )}
                </span>
                <span className={`text-[0.6rem] font-medium uppercase tracking-[0.22em] mt-1 ${overlay ? "text-white/70" : "text-muted-foreground"}`}>
                  Propose Your Destination
                </span>
              </span>
            </>
          )}
        </Link>

        {/* Desktop nav (with dropdowns) */}
        <HeaderNav items={navItems} overlay={overlay} />

        {/* Right-side utilities */}
        <div className="hidden min-[1180px]:flex items-center gap-1 shrink-0">
          <HeaderPreferences overlay={overlay} />
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
              overlay ? "text-white hover:bg-white/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Heart className="h-[1.1rem] w-[1.1rem]" />
          </Link>
        </div>

        {/* Mobile nav */}
        <MobileNav navItems={navItems} brandName={brandName} overlay={overlay} />
      </div>
    </header>
  );
}
