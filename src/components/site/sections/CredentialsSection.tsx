import { BadgeCheck, ExternalLink } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { resolveTokens } from "@/lib/tokens";

interface CredentialItem {
  title?: string;
  detail?: string;
  description?: string;
  verifyLabel?: string;
  verifyUrl?: string;
}

interface CredentialGroup {
  title?: string;
  columns?: number;
  muted?: boolean;
  items?: CredentialItem[];
}

interface CredentialsData {
  heading?: string;
  intro?: string;
  groups?: CredentialGroup[];
  closingTitle?: string;
  closingText?: string;
}

function CredentialCard({ c }: { c: CredentialItem }) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex items-start gap-3">
        <BadgeCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          {c.title && <h3 className="font-semibold">{c.title}</h3>}
          {c.detail && <p className="text-sm font-medium text-primary">{c.detail}</p>}
          {c.description && <p className="text-sm text-muted-foreground">{c.description}</p>}
          {c.verifyUrl ? (
            <a
              href={c.verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline pt-1"
            >
              {c.verifyLabel ?? "Verify"}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            c.verifyLabel && <p className="text-sm text-muted-foreground pt-1">{c.verifyLabel}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export async function CredentialsSection({ data }: { data: CredentialsData }) {
  const groups = data.groups ?? [];
  if (groups.length === 0 && !data.heading) return null;

  const settings = await getSettings();
  const t = (s?: string) => resolveTokens(s, settings);

  return (
    <>
      {(data.heading || data.intro) && (
        <section className="container mx-auto px-4 pt-12 pb-2 max-w-3xl text-center">
          {data.heading && <h2 className="text-2xl font-bold">{t(data.heading)}</h2>}
          {data.intro && <p className="text-muted-foreground mt-3">{t(data.intro)}</p>}
        </section>
      )}

      {groups.map((group, gi) => (
        <section key={gi} className={group.muted ? "bg-muted/30" : undefined}>
          <div className="container mx-auto px-4 py-12 max-w-5xl">
            {group.title && <h3 className="text-xl font-bold mb-6">{t(group.title)}</h3>}
            <div className={`grid grid-cols-1 ${group.columns === 1 ? "" : "md:grid-cols-2"} gap-5`}>
              {(group.items ?? []).map((c, ci) => (
                <CredentialCard key={ci} c={c} />
              ))}
            </div>
          </div>
        </section>
      ))}

      {(data.closingTitle || data.closingText) && (
        <section className="container mx-auto px-4 py-16 max-w-3xl text-center space-y-4">
          {data.closingTitle && <h2 className="text-2xl font-bold">{t(data.closingTitle)}</h2>}
          {data.closingText && <p className="text-muted-foreground">{t(data.closingText)}</p>}
        </section>
      )}
    </>
  );
}
