import { Check } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { resolveTokens } from "@/lib/tokens";

interface ChecklistData {
  heading?: string;
  lead?: string;
  columns?: number;
  items?: string[];
  muted?: boolean;
}

const LG_COLS: Record<number, string> = {
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

export async function ChecklistSection({ data }: { data: ChecklistData }) {
  const items = data.items ?? [];
  if (items.length === 0) return null;

  const settings = await getSettings();
  const cols = LG_COLS[data.columns ?? 4] ?? LG_COLS[4];

  return (
    <section className={data.muted ? "bg-muted/40 py-20" : "py-20"}>
      <div className="container mx-auto px-4">
        {data.heading && (
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-center text-balance">
            {resolveTokens(data.heading, settings)}
          </h2>
        )}
        {data.heading && <div className="mx-auto mt-5 mb-8 h-px w-12 bg-accent/60" />}
        {data.lead && (
          <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
            {resolveTokens(data.lead, settings)}
          </p>
        )}
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${cols} gap-3 max-w-5xl mx-auto`}>
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3.5 transition-colors hover:border-accent/40"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/15 text-accent shrink-0">
                <Check className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm font-medium">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
