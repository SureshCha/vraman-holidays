import Link from "next/link";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { Suspense } from "react";
import { CurrentYear } from "./CurrentYear";

async function getFooterNav() {
  "use cache";
  return db.navigation.findMany({ where: { location: "footer" }, orderBy: { order: "asc" } });
}

export async function SiteFooter() {
  const [settings, footerNav] = await Promise.all([getSettings(), getFooterNav()]);

  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className="font-bold text-lg">{settings.brand.name}</p>
            <p className="text-sm text-muted-foreground mt-1">{settings.brand.tagline}</p>
            <p className="text-sm text-muted-foreground mt-3">{settings.contact.address}</p>
            <p className="text-sm text-muted-foreground">{settings.contact.phone}</p>
            <p className="text-sm text-muted-foreground">{settings.contact.email}</p>
          </div>

          <div>
            <p className="font-semibold text-sm mb-3">Quick Links</p>
            <ul className="space-y-2">
              {footerNav.map((item) => (
                <li key={item.id}>
                  <Link href={item.href} target={item.openInNew ? "_blank" : undefined} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-semibold text-sm mb-3">Follow Us</p>
            <div className="flex flex-wrap gap-3">
              {settings.social.facebook && <SocialLink href={settings.social.facebook} label="Facebook" />}
              {settings.social.instagram && <SocialLink href={settings.social.instagram} label="Instagram" />}
              {settings.social.youtube && <SocialLink href={settings.social.youtube} label="YouTube" />}
              {settings.social.tiktok && <SocialLink href={settings.social.tiktok} label="TikTok" />}
              {settings.social.twitter && <SocialLink href={settings.social.twitter} label="Twitter/X" />}
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center text-xs text-muted-foreground">
          © <Suspense fallback="2026"><CurrentYear /></Suspense> {settings.brand.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground border rounded px-2 py-1 transition-colors">
      {label}
    </a>
  );
}
