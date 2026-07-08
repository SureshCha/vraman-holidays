import Link from "next/link";
import { cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { formatWhatsAppNumber } from "@/lib/format";
import { Suspense } from "react";
import { CurrentYear } from "./CurrentYear";
import { NewsletterSignup } from "./NewsletterSignup";
import { MediaBackground } from "./sections/MediaBackground";
import { safeMediaUrl } from "@/lib/media";

async function getFooterNav() {
  "use cache";
  cacheTag("navigation");
  return db.navigation.findMany({ where: { location: "footer" }, orderBy: { order: "asc" } });
}

export async function SiteFooter() {
  const [settings, footerNav] = await Promise.all([getSettings(), getFooterNav()]);

  const footerMedia = settings.footer ?? {};
  const hasFooterMedia = !!(safeMediaUrl(footerMedia.videoUrl) || safeMediaUrl(footerMedia.imageUrl));

  return (
    // When a footer background image/video is set, render it behind the content
    // and add the `dark` class so all the text tokens flip to light over the scrim.
    <footer className={`relative z-10 mt-auto overflow-hidden border-t ${hasFooterMedia ? "dark" : "bg-background"}`}>
      {hasFooterMedia && (
        <MediaBackground
          imageUrl={footerMedia.imageUrl}
          videoUrl={footerMedia.videoUrl}
          posterUrl={footerMedia.posterUrl}
          overlayClassName="bg-black/70"
        />
      )}
      <div className="relative z-10 container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <p className="font-bold text-lg">{settings.brand.name}</p>
            <p className="text-sm text-muted-foreground mt-1">{settings.brand.tagline}</p>
            {settings.brand.philosophy && (
              <p className="text-sm font-medium text-primary mt-1">{settings.brand.philosophy}</p>
            )}
            <p className="text-sm text-muted-foreground mt-3">{settings.contact.address}</p>
            <p className="text-sm text-muted-foreground">{settings.contact.phone}</p>
            {settings.contact.phones?.map((p, i) => (
              <p key={i} className="text-sm text-muted-foreground">{p.name}: {p.number}</p>
            ))}
            <p className="text-sm text-muted-foreground">{settings.contact.email}</p>
            {settings.featureFlags.enableWhatsapp && settings.contact.whatsappNumber && (
              <p className="text-sm text-muted-foreground mt-1">
                WhatsApp:{" "}
                <a
                  href={`https://wa.me/${formatWhatsAppNumber(settings.contact.whatsappNumber)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  {settings.contact.whatsappNumber}
                </a>
              </p>
            )}
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

          <div>
            <p className="font-semibold text-sm mb-3">Newsletter</p>
            <p className="text-xs text-muted-foreground mb-3">Get travel deals and inspiration in your inbox.</p>
            <NewsletterSignup />
          </div>
        </div>

        {settings.brand.positioningStatement && (
          <p className="border-t mt-8 pt-6 text-sm text-muted-foreground leading-relaxed max-w-4xl mx-auto text-center">
            {settings.brand.positioningStatement}
          </p>
        )}

        <div className={`${settings.brand.positioningStatement ? "mt-6 pt-6 border-t" : "border-t mt-8 pt-6"} text-center text-xs text-muted-foreground`}>
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
