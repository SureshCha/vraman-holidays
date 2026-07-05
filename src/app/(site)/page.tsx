import { cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { SectionRenderer } from "@/components/site/sections";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: settings.brand.name,
    description: settings.seoDefaults.defaultDescription || settings.brand.tagline,
    openGraph: settings.seoDefaults.defaultOgImage
      ? { images: [settings.seoDefaults.defaultOgImage] }
      : undefined,
  };
}
import { HomeBackdrop } from "@/components/site/HomeBackdrop";
import { safeMediaUrl } from "@/lib/media";

async function getHomeSections() {
  "use cache";
  cacheTag("home-sections");
  return db.homeSection.findMany({ where: { visible: true }, orderBy: { order: "asc" } });
}

export default async function HomePage() {
  const sections = await getHomeSections();
  // When the page leads with a hero, pull it up under the transparent overlay header.
  const leadsWithHero = sections[0]?.type === "HERO";

  // Continuous-banner mode: if the lead hero has a single image/video, render it
  // fixed behind the whole page and let every section sit transparently over it.
  const heroData = leadsWithHero ? (sections[0]!.data as Record<string, unknown>) : null;
  const heroImage = heroData?.imageUrl as string | undefined;
  const heroVideo = heroData?.videoUrl as string | undefined;
  const heroPoster = heroData?.posterUrl as string | undefined;
  const immersive = !!(safeMediaUrl(heroVideo) || safeMediaUrl(heroImage));

  return (
    <>
      {immersive && (
        <HomeBackdrop imageUrl={heroImage} videoUrl={heroVideo} posterUrl={heroPoster} />
      )}
      <main className={`${leadsWithHero ? "-mt-16" : ""} ${immersive ? "relative z-10" : ""}`}>
        {sections.map((section) => (
          <SectionRenderer
            key={section.id}
            immersive={immersive}
            section={{
              id: section.id,
              type: section.type,
              order: section.order,
              data: section.data as Record<string, unknown>,
            }}
          />
        ))}
      </main>
    </>
  );
}
