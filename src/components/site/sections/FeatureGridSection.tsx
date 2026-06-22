import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { resolveTokens } from "@/lib/tokens";
import { resolveIcon } from "./icons";

interface FeatureItem {
  icon?: string;
  value?: string;
  title?: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}

interface FeatureGridData {
  heading?: string;
  subheading?: string;
  lead?: string;
  columns?: number;
  variant?: "feature" | "stat" | "journey";
  items?: FeatureItem[];
  ctaLabel?: string;
  ctaHref?: string;
  footnote?: string;
  muted?: boolean;
}

// Static column-class maps (Tailwind can't JIT dynamic class names).
const LG_COLS: Record<number, string> = {
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
};

export async function FeatureGridSection({ data }: { data: FeatureGridData }) {
  const items = data.items ?? [];
  if (items.length === 0) return null;

  const settings = await getSettings();
  const t = (s?: string) => resolveTokens(s, settings);

  const variant = data.variant ?? "feature";
  const cols = LG_COLS[data.columns ?? 4] ?? LG_COLS[4];
  const gridClass =
    variant === "journey"
      ? "grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto"
      : `grid grid-cols-1 sm:grid-cols-2 ${cols} gap-6 max-w-6xl mx-auto`;

  return (
    <section className={data.muted ? "bg-muted/40 py-20" : "py-20"}>
      <div className="container mx-auto px-4">
        {(data.heading || data.subheading || data.lead) && (
          <div className="text-center mb-12 max-w-2xl mx-auto">
            {data.subheading && (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">
                {t(data.subheading)}
              </p>
            )}
            {data.heading && (
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance">{t(data.heading)}</h2>
            )}
            {data.heading && <div className="mx-auto mt-5 h-px w-12 bg-accent/60" />}
            {data.lead && <p className="text-muted-foreground mt-5 leading-relaxed">{t(data.lead)}</p>}
          </div>
        )}

        <div className={gridClass}>
          {items.map((item, i) => {
            if (variant === "stat") {
              const Icon = resolveIcon(item.icon);
              return (
                <div
                  key={i}
                  className="rounded-2xl border bg-card p-8 text-center space-y-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Icon className="h-6 w-6" />
                  </div>
                  {item.value && (
                    <p className="font-heading text-4xl font-bold text-primary">{item.value}</p>
                  )}
                  {item.title && <h3 className="font-semibold">{t(item.title)}</h3>}
                  {item.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{t(item.description)}</p>
                  )}
                </div>
              );
            }

            if (variant === "journey") {
              const href = item.href || `/propose?journey=${encodeURIComponent(item.title ?? "")}`;
              return (
                <Link
                  key={i}
                  href={href}
                  className="group rounded-2xl border bg-card p-8 flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-accent/40"
                >
                  {item.title && (
                    <h3 className="font-heading text-2xl font-semibold tracking-tight">{t(item.title)}</h3>
                  )}
                  <div className="mt-2 h-px w-10 bg-accent/50 transition-all duration-300 group-hover:w-16" />
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-4 flex-1 leading-relaxed">{t(item.description)}</p>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary mt-5">
                    {item.linkLabel ?? "Enquire about this journey"}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            }

            // feature
            const Icon = resolveIcon(item.icon);
            return (
              <div
                key={i}
                className="group rounded-2xl border bg-card p-7 space-y-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30"
              >
                {item.icon && (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-6 w-6" />
                  </div>
                )}
                {item.title && <h3 className="font-semibold text-lg">{t(item.title)}</h3>}
                {item.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(item.description)}</p>
                )}
              </div>
            );
          })}
        </div>

        {data.footnote && (
          <p className="text-center text-xs text-muted-foreground mt-8">{t(data.footnote)}</p>
        )}

        {data.ctaLabel && data.ctaHref && (
          <div className="text-center mt-14">
            <Link
              href={data.ctaHref}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-primary-foreground font-medium shadow-sm hover:bg-primary/90 hover:shadow-md transition-all"
            >
              {t(data.ctaLabel)}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
