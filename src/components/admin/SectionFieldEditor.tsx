"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  type: string;
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

// ── Field helpers ────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label className="text-xs font-medium">{label}</Label>{children}</div>;
}

function TextInput({
  data, field, onChange, placeholder,
}: { data: Record<string, unknown>; field: string; onChange: Props["onChange"]; placeholder?: string }) {
  return (
    <Input
      value={(data[field] as string) ?? ""}
      onChange={(e) => onChange({ ...data, [field]: e.currentTarget.value })}
      placeholder={placeholder}
    />
  );
}

function NumberInput({
  data, field, onChange, placeholder,
}: { data: Record<string, unknown>; field: string; onChange: Props["onChange"]; placeholder?: string }) {
  return (
    <Input
      type="number"
      value={(data[field] as number) ?? ""}
      onChange={(e) => onChange({ ...data, [field]: e.currentTarget.value ? Number(e.currentTarget.value) : undefined })}
      placeholder={placeholder}
    />
  );
}

// ── Stats editor (repeating label + value) ───────────────────────────────────

function StatsEditor({ data, onChange }: { data: Record<string, unknown>; onChange: Props["onChange"] }) {
  const stats = (data.stats as Array<{ label?: string; value?: string }>) ?? [];
  const update = (i: number, key: string, val: string) => {
    const next = [...stats];
    next[i] = { ...next[i], [key]: val };
    onChange({ ...data, stats: next });
  };
  const add = () => onChange({ ...data, stats: [...stats, { label: "", value: "" }] });
  const remove = (i: number) => onChange({ ...data, stats: stats.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium">Stats</Label>
      {stats.map((s, i) => (
        <div key={i} className="flex gap-2 items-end">
          <div className="flex-1 space-y-1">
            <Input placeholder="Value (e.g. 5000+)" value={s.value ?? ""} onChange={(e) => update(i, "value", e.currentTarget.value)} />
          </div>
          <div className="flex-1 space-y-1">
            <Input placeholder="Label (e.g. Happy Travellers)" value={s.label ?? ""} onChange={(e) => update(i, "label", e.currentTarget.value)} />
          </div>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive shrink-0" onClick={() => remove(i)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add}><Plus className="h-3.5 w-3.5 mr-1" /> Add Stat</Button>
    </div>
  );
}

// ── Hero slides editor ───────────────────────────────────────────────────────

function SlidesEditor({ data, onChange }: { data: Record<string, unknown>; onChange: Props["onChange"] }) {
  const slides: Array<{ imageUrl: string; headline?: string; subheadline?: string }> = ((data.slides as unknown[]) ?? []).map((s) => {
    const item = s as Record<string, unknown>;
    return { imageUrl: (item.imageUrl as string) ?? "", headline: item.headline as string | undefined, subheadline: item.subheadline as string | undefined };
  });
  const update = (i: number, key: string, val: string) => {
    const next = [...slides];
    next[i] = { ...next[i], [key]: val } as (typeof slides)[number];
    onChange({ ...data, slides: next });
  };
  const add = () => onChange({ ...data, slides: [...slides, { imageUrl: "" as string, headline: "", subheadline: "" }] });
  const remove = (i: number) => onChange({ ...data, slides: slides.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-3">
      <Label className="text-xs font-medium">Carousel Slides (optional — adds a hero carousel)</Label>
      {slides.map((s, i) => (
        <div key={i} className="border rounded-lg p-3 space-y-2 bg-muted/20">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-muted-foreground">Slide {i + 1}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(i)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Image</Label>
            <div className="flex items-center gap-2">
              <MediaPicker onSelect={(url: string) => update(i, "imageUrl", url)} trigger={<Button variant="outline" size="sm" type="button">{s.imageUrl ? "Change" : "Select Image"}</Button>} />
              {s.imageUrl && <span className="text-xs text-muted-foreground truncate max-w-[200px]">{s.imageUrl.split("/").pop()}</span>}
            </div>
          </div>
          <Input placeholder="Headline (optional)" value={s.headline ?? ""} onChange={(e) => update(i, "headline", e.currentTarget.value)} />
          <Input placeholder="Subheadline (optional)" value={s.subheadline ?? ""} onChange={(e) => update(i, "subheadline", e.currentTarget.value)} />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add}><Plus className="h-3.5 w-3.5 mr-1" /> Add Slide</Button>
    </div>
  );
}

// ── Main section field editor ────────────────────────────────────────────────

export function SectionFieldEditor({ type, data, onChange }: Props) {
  // Fallback: if we don't have a typed editor for this section, show JSON
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState(JSON.stringify(data, null, 2));

  if (jsonMode) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-xs">Raw JSON</Label>
          <Button variant="ghost" size="sm" onClick={() => {
            try { onChange(JSON.parse(jsonText)); setJsonMode(false); } catch { /* invalid JSON */ }
          }}>
            Switch to Fields
          </Button>
        </div>
        <Textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          rows={12}
          className="font-mono text-xs"
        />
      </div>
    );
  }

  const jsonToggle = (
    <div className="pt-2 border-t">
      <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => {
        setJsonText(JSON.stringify(data, null, 2));
        setJsonMode(true);
      }}>
        Edit as JSON (advanced)
      </Button>
    </div>
  );

  switch (type) {
    case "HERO":
      return (
        <div className="space-y-3">
          <Field label="Headline"><TextInput data={data} field="headline" onChange={onChange} placeholder="Propose Your Destination" /></Field>
          <Field label="Subheadline"><TextInput data={data} field="subheadline" onChange={onChange} placeholder="Boutique travel experiences..." /></Field>
          <Field label="CTA Button Label"><TextInput data={data} field="ctaLabel" onChange={onChange} placeholder="Explore Packages" /></Field>
          <Field label="CTA Link"><TextInput data={data} field="ctaHref" onChange={onChange} placeholder="/packages" /></Field>
          <Field label="Background Image">
            <div className="flex items-center gap-2">
              <MediaPicker onSelect={(url: string) => onChange({ ...data, imageUrl: url })} trigger={<Button variant="outline" size="sm" type="button">{String(data.imageUrl || "") ? "Change Image" : "Select Image"}</Button>} />
              {String(data.imageUrl || "") && <span className="text-xs text-muted-foreground truncate max-w-[200px]">{String(data.imageUrl).split("/").pop()}</span>}
            </div>
          </Field>
          <SlidesEditor data={data} onChange={onChange} />
          {jsonToggle}
        </div>
      );

    case "SEARCH":
      return (
        <div className="space-y-3">
          <Field label="Title"><TextInput data={data} field="title" onChange={onChange} placeholder="Looking for the perfect trip?" /></Field>
          <Field label="Subtitle"><TextInput data={data} field="subtitle" onChange={onChange} placeholder="Search by destination..." /></Field>
          <Field label="Placeholder"><TextInput data={data} field="placeholder" onChange={onChange} placeholder="Where do you want to go?" /></Field>
          {jsonToggle}
        </div>
      );

    case "FEATURED_PACKAGES":
      return (
        <div className="space-y-3">
          <Field label="Title"><TextInput data={data} field="title" onChange={onChange} placeholder="Featured Packages" /></Field>
          <Field label="Subtitle"><TextInput data={data} field="subtitle" onChange={onChange} placeholder="Handpicked journeys..." /></Field>
          <Field label="Max packages to show"><NumberInput data={data} field="limit" onChange={onChange} placeholder="6" /></Field>
          {jsonToggle}
        </div>
      );

    case "DESTINATIONS":
      return (
        <div className="space-y-3">
          <Field label="Title"><TextInput data={data} field="title" onChange={onChange} placeholder="Explore Destinations" /></Field>
          <Field label="Subtitle"><TextInput data={data} field="subtitle" onChange={onChange} placeholder="8 countries, endless adventures" /></Field>
          {jsonToggle}
        </div>
      );

    case "TESTIMONIALS":
      return (
        <div className="space-y-3">
          <Field label="Title"><TextInput data={data} field="title" onChange={onChange} placeholder="What Our Travellers Say" /></Field>
          <Field label="Max testimonials to show"><NumberInput data={data} field="limit" onChange={onChange} placeholder="6" /></Field>
          {jsonToggle}
        </div>
      );

    case "BLOG_PREVIEW":
      return (
        <div className="space-y-3">
          <Field label="Title"><TextInput data={data} field="title" onChange={onChange} placeholder="Travel Stories" /></Field>
          <Field label="Subtitle"><TextInput data={data} field="subtitle" onChange={onChange} placeholder="Inspiration from the road" /></Field>
          <Field label="Max posts to show"><NumberInput data={data} field="limit" onChange={onChange} placeholder="3" /></Field>
          {jsonToggle}
        </div>
      );

    case "CTA":
      return (
        <div className="space-y-3">
          <Field label="Title"><TextInput data={data} field="title" onChange={onChange} placeholder="Can't find what you're looking for?" /></Field>
          <Field label="Subtitle"><TextInput data={data} field="subtitle" onChange={onChange} placeholder="Tell us your dream destination..." /></Field>
          <Field label="Button Label"><TextInput data={data} field="ctaLabel" onChange={onChange} placeholder="Propose Your Trip" /></Field>
          <Field label="Button Link"><TextInput data={data} field="ctaHref" onChange={onChange} placeholder="/propose" /></Field>
          <Field label="Social Proof (optional)"><TextInput data={data} field="socialProof" onChange={onChange} placeholder="Trusted by 5,000+ travellers" /></Field>
          {jsonToggle}
        </div>
      );

    case "RICH_TEXT":
      return (
        <div className="space-y-3">
          <Field label="Content">
            <RichTextEditor
              value={(data.content as string) ?? ""}
              onChange={(v) => onChange({ ...data, content: v })}
            />
          </Field>
          {jsonToggle}
        </div>
      );

    case "STATS":
      return (
        <div className="space-y-3">
          <StatsEditor data={data} onChange={onChange} />
          {jsonToggle}
        </div>
      );

    case "GALLERY":
      return (
        <div className="space-y-3">
          <Field label="Title"><TextInput data={data} field="title" onChange={onChange} placeholder="Gallery" /></Field>
          {/* TODO: multi-image picker for gallery images */}
          {jsonToggle}
        </div>
      );

    case "CONTACT_FORM":
      return (
        <div className="space-y-3">
          <Field label="Title"><TextInput data={data} field="title" onChange={onChange} placeholder="Get in Touch" /></Field>
          <Field label="Subtitle"><TextInput data={data} field="subtitle" onChange={onChange} placeholder="We'd love to hear from you" /></Field>
          {jsonToggle}
        </div>
      );

    default:
      // Unknown type — show JSON editor
      return (
        <div className="space-y-2">
          <Label className="text-xs">Section Data (JSON)</Label>
          <Textarea
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              try { onChange(JSON.parse(e.target.value)); } catch { /* wait for valid JSON */ }
            }}
            rows={10}
            className="font-mono text-xs"
          />
        </div>
      );
  }
}
