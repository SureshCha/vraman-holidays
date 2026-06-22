import { getSettings } from "@/lib/settings";
import { resolveTokens } from "@/lib/tokens";

interface PageHeaderData {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  lead?: string;
}

export async function PageHeaderSection({ data }: { data: PageHeaderData }) {
  if (!data.title) return null;
  const settings = await getSettings();
  const t = (s?: string) => resolveTokens(s, settings);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/[0.06] to-background py-24 sm:py-28">
      <div className="container relative mx-auto px-4 text-center max-w-3xl">
        {data.eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent mb-5">
            {t(data.eyebrow)}
          </p>
        )}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-balance">
          {t(data.title)}
        </h1>
        <div className="mx-auto mt-6 h-px w-16 bg-accent/60" />
        {data.subtitle && (
          <p className="text-lg sm:text-xl font-medium text-primary mt-6 text-balance">{t(data.subtitle)}</p>
        )}
        {data.lead && (
          <p className="text-base sm:text-lg text-muted-foreground mt-4 leading-relaxed">{t(data.lead)}</p>
        )}
      </div>
    </section>
  );
}
