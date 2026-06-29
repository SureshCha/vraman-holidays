import { cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { HeaderBar } from "./HeaderBar";
import type { HeaderNavItem } from "./HeaderNav";

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

  return <HeaderBar navItems={navItems} brandName={settings.brand.name} logoUrl={settings.brand.logoUrl} />;
}
