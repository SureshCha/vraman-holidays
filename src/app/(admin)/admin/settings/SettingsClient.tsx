"use client";

import { useState, useTransition } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { updateSettings } from "./actions";

interface Props {
  settings: {
    brand: unknown; theme: unknown; contact: unknown; social: unknown;
    featureFlags: unknown; seoDefaults: unknown; emailTemplates: unknown; paymentConfig: unknown;
    footer?: unknown;
  };
}

function JsonEditor({ label, value, onChange }: { label: string; value: Record<string, unknown>; onChange: (v: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      {Object.entries(value).map(([key, val]) => (
        <div key={key} className="space-y-1">
          <Label className="capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</Label>
          {typeof val === "boolean" ? (
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={val} onCheckedChange={(v) => onChange({ ...value, [key]: !!v })} />
              <span className="text-sm">{val ? "Enabled" : "Disabled"}</span>
            </label>
          ) : typeof val === "string" && val.length > 100 ? (
            <Textarea value={val} onChange={(e) => onChange({ ...value, [key]: e.target.value })} rows={3} />
          ) : (
            <Input value={String(val ?? "")} onChange={(e) => onChange({ ...value, [key]: e.target.value })} />
          )}
        </div>
      ))}
    </div>
  );
}

const TABS = [
  { key: "brand", label: "Brand" },
  { key: "theme", label: "Theme" },
  { key: "contact", label: "Contact" },
  { key: "social", label: "Social" },
  { key: "featureFlags", label: "Features" },
  { key: "seoDefaults", label: "SEO" },
  { key: "emailTemplates", label: "Email" },
  { key: "paymentConfig", label: "Payments" },
  { key: "footer", label: "Footer" },
] as const;

export function SettingsClient({ settings: initial }: Props) {
  const [data, setData] = useState<Record<string, Record<string, unknown>>>(() => {
    const d: Record<string, Record<string, unknown>> = {};
    for (const tab of TABS) {
      d[tab.key] = (initial[tab.key] as Record<string, unknown>) ?? {};
    }
    return d;
  });
  const [isPending, startTransition] = useTransition();

  function save(key: string) {
    startTransition(async () => {
      const result = await updateSettings({ [key]: data[key] });
      if (result.success) toast.success("Settings saved");
      else toast.error(result.error);
    });
  }

  return (
    <Tabs defaultValue="brand">
      <TabsList className="flex-wrap h-auto gap-1">
        {TABS.map((t) => <TabsTrigger key={t.key} value={t.key}>{t.label}</TabsTrigger>)}
      </TabsList>

      {TABS.map((tab) => (
        <TabsContent key={tab.key} value={tab.key} className="space-y-4 max-w-lg">
          <JsonEditor
            label={tab.label}
            value={
              // The generic editor can't render a nested object (it would show
              // "[object Object]"), so connectIPS's non-secret fields are edited
              // via the dedicated block below and excluded from this view.
              tab.key === "paymentConfig"
                ? Object.fromEntries(Object.entries(data.paymentConfig ?? {}).filter(([k]) => k !== "ips"))
                : data[tab.key] ?? {}
            }
            onChange={(v) =>
              setData((prev) =>
                tab.key === "paymentConfig"
                  ? { ...prev, paymentConfig: { ...prev.paymentConfig, ...v } }
                  : { ...prev, [tab.key]: v }
              )
            }
          />

          {tab.key === "brand" && (
            <div className="space-y-1">
              <Label>Logo (pick from media)</Label>
              <MediaPicker
                onSelect={(url) => setData((prev) => ({ ...prev, brand: { ...prev["brand"]!, logoUrl: url } }))}
                trigger={<Button type="button" variant="outline" size="sm">Pick Logo</Button>}
              />
            </div>
          )}

          {tab.key === "contact" && (
            <div className="space-y-3 border-t pt-4 mt-4">
              <Label className="text-base font-semibold">Additional Phone Numbers</Label>
              <p className="text-xs text-muted-foreground">Add team members' contact numbers shown in the footer and about page.</p>
              {((data["contact"]?.phones as { name: string; number: string }[]) ?? []).map((p, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    value={p.name}
                    onChange={(e) => {
                      const phones = [...((data["contact"]?.phones as { name: string; number: string }[]) ?? [])];
                      phones[i] = { ...phones[i]!, name: e.target.value };
                      setData((prev) => ({ ...prev, contact: { ...prev["contact"]!, phones } }));
                    }}
                    placeholder="Name"
                    className="flex-1 h-8 text-sm"
                  />
                  <Input
                    value={p.number}
                    onChange={(e) => {
                      const phones = [...((data["contact"]?.phones as { name: string; number: string }[]) ?? [])];
                      phones[i] = { ...phones[i]!, number: e.target.value };
                      setData((prev) => ({ ...prev, contact: { ...prev["contact"]!, phones } }));
                    }}
                    placeholder="Phone number"
                    className="flex-1 h-8 text-sm"
                  />
                  <Button
                    type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0"
                    onClick={() => {
                      const phones = ((data["contact"]?.phones as { name: string; number: string }[]) ?? []).filter((_, j) => j !== i);
                      setData((prev) => ({ ...prev, contact: { ...prev["contact"]!, phones } }));
                    }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <Button
                type="button" variant="outline" size="sm"
                onClick={() => {
                  const phones = [...((data["contact"]?.phones as { name: string; number: string }[]) ?? []), { name: "", number: "" }];
                  setData((prev) => ({ ...prev, contact: { ...prev["contact"]!, phones } }));
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />Add Phone
              </Button>
            </div>
          )}

          {tab.key === "paymentConfig" && (
            <div className="space-y-3 border-t pt-4 mt-4">
              <Label className="text-base font-semibold">connectIPS — non-secret identifiers</Label>
              <p className="text-xs text-muted-foreground">
                The private key (.pfx file), its passphrase, and the connectIPS Basic Auth
                password are never stored in this database — they must be set as environment
                variables on the server (IPS_PFX_PATH or IPS_PFX_BASE64, IPS_PFX_PASSWORD,
                IPS_BASIC_AUTH_PASSWORD). Only the fields below can be changed here. Leave a
                field blank to keep using its environment-variable value.
              </p>
              {([
                ["merchantId", "Merchant ID"],
                ["appId", "App ID"],
                ["appName", "App Name"],
                ["gatewayUrl", "Gateway URL"],
                ["validationUrl", "Validation URL"],
              ] as const).map(([field, fieldLabel]) => (
                <div key={field} className="space-y-1">
                  <Label>{fieldLabel}</Label>
                  <Input
                    value={String(((data.paymentConfig?.ips as Record<string, string>) ?? {})[field] ?? "")}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        paymentConfig: {
                          ...prev.paymentConfig,
                          ips: { ...((prev.paymentConfig?.ips as object) ?? {}), [field]: e.target.value },
                        },
                      }))
                    }
                    placeholder="Leave blank to use the env var / PAYMENTS_MODE default"
                  />
                </div>
              ))}
            </div>
          )}

          {tab.key === "footer" && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Optional background image or video for the site footer. Leave empty for a plain footer.
                Footer <strong>links</strong> are managed in Admin → Navigation (Footer tab).
              </p>
              <div className="space-y-1">
                <Label>Footer background image</Label>
                <MediaPicker
                  accept="image"
                  onSelect={(url) => setData((prev) => ({ ...prev, footer: { ...prev["footer"]!, imageUrl: url } }))}
                  trigger={<Button type="button" variant="outline" size="sm">Pick Image</Button>}
                />
              </div>
              <div className="space-y-1">
                <Label>Footer background video (optional — overrides image)</Label>
                <MediaPicker
                  accept="video"
                  onSelect={(url) => setData((prev) => ({ ...prev, footer: { ...prev["footer"]!, videoUrl: url } }))}
                  trigger={<Button type="button" variant="outline" size="sm">Pick Video</Button>}
                />
              </div>
              <div className="space-y-1">
                <Label>Video poster (optional — mobile & while loading)</Label>
                <MediaPicker
                  accept="image"
                  onSelect={(url) => setData((prev) => ({ ...prev, footer: { ...prev["footer"]!, posterUrl: url } }))}
                  trigger={<Button type="button" variant="outline" size="sm">Pick Poster</Button>}
                />
              </div>
            </div>
          )}

          <Button onClick={() => save(tab.key)} disabled={isPending}>
            {isPending ? "Saving…" : "Save"}
          </Button>
        </TabsContent>
      ))}
    </Tabs>
  );
}
