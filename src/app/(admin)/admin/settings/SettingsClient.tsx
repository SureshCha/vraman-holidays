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
            value={data[tab.key] ?? {}}
            onChange={(v) => setData((prev) => ({ ...prev, [tab.key]: v }))}
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
