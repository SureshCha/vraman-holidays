"use client";

import { useState, useTransition } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import slugify from "slugify";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RichTextEditor } from "./RichTextEditor";
import { SortableList } from "./SortableList";
import { MediaPicker } from "./MediaPicker";
import { ConfirmDialog } from "./ConfirmDialog";
import { ContentStatus } from "@/generated/prisma/enums";
import {
  packageDetailsSchema, packageSeoSchema, itineraryDaySchema, departureSchema,
  type PackageDetailsInput, type PackageSeoInput, type ItineraryDayInput, type DepartureInput,
} from "@/lib/validators/package";
import {
  createPackage, updatePackageDetails, updatePackageSeo,
  upsertItineraryDay, deleteItineraryDay, reorderItineraryDays,
  upsertDeparture, deleteDeparture,
} from "@/app/(admin)/admin/packages/actions";
import { toast } from "sonner";
import { Plus, Trash2, ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";

interface ItineraryDay {
  id: string; dayNumber: number; title: string; subtitle?: string; summaryStrip?: string;
  description: string; meals: { breakfast: boolean; lunch: boolean; dinner: boolean } | null;
  accommodation: string; imageUrl: string; images?: string[]; alert?: string;
  latitude?: number | null; longitude?: number | null; elevation?: number | null;
}

interface Departure {
  id: string; departureDate: string; returnDate: string;
  maxSeats: number; bookedSeats: number; priceOverride?: number; currency: string;
}

interface PackageEditorProps {
  destinations: { id: string; name: string }[];
  tripTypes: { id: string; name: string }[];
  package?: {
    id: string; slug: string; title: string; subtitle: string; destinationId: string;
    tripTypeIds: string[]; durationDays: number; durationNights: number; priceFrom: number;
    currency: string; departureCity: string; priceBasis: string; minGroupSize: number | null;
    validUntil: string; terms: string;
    description: string; highlights: string[]; inclusions: string[];
    exclusions: string[]; galleryImages: string[]; coverImage: string; metaTitle: string;
    metaDescription: string; featured: boolean; status: ContentStatus;
    itinerary: ItineraryDay[]; departures: Departure[];
  };
}

export function PackageEditor({ destinations, tripTypes, package: pkg }: PackageEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [packageId, setPackageId] = useState<string | null>(pkg?.id ?? null);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>(pkg?.itinerary ?? []);
  const [departures, setDepartures] = useState<Departure[]>(pkg?.departures ?? []);
  const [galleryImages, setGalleryImages] = useState<string[]>(pkg?.galleryImages ?? []);
  const [newDeparture, setNewDeparture] = useState<Partial<DepartureInput>>({});
  const [showDepartureForm, setShowDepartureForm] = useState(false);

  // ─── Details form ───────────────────────────────────────────────────────────
  const detailsForm = useForm<PackageDetailsInput>({
    resolver: zodResolver(packageDetailsSchema) as Resolver<PackageDetailsInput>,
    defaultValues: {
      title: pkg?.title ?? "",
      slug: pkg?.slug ?? "",
      subtitle: pkg?.subtitle ?? "",
      destinationId: pkg?.destinationId ?? "",
      tripTypeIds: pkg?.tripTypeIds ?? [],
      durationDays: pkg?.durationDays ?? 1,
      durationNights: pkg?.durationNights ?? 0,
      priceFrom: pkg?.priceFrom ?? 0,
      currency: pkg?.currency ?? "NPR",
      departureCity: pkg?.departureCity ?? "",
      priceBasis: pkg?.priceBasis ?? "",
      minGroupSize: pkg?.minGroupSize ?? undefined,
      validUntil: pkg?.validUntil ?? "",
      description: pkg?.description ?? "",
      highlights: pkg?.highlights ?? [],
      inclusions: pkg?.inclusions ?? [],
      exclusions: pkg?.exclusions ?? [],
      terms: pkg?.terms ?? "",
    },
  });

  const titleVal = detailsForm.watch("title");
  const [slugEdited, setSlugEdited] = useState(!!pkg);

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    detailsForm.setValue("title", e.target.value);
    if (!slugEdited) {
      detailsForm.setValue("slug", slugify(e.target.value, { lower: true, strict: true }));
    }
  }

  function saveDetails(data: PackageDetailsInput) {
    startTransition(async () => {
      if (!packageId) {
        const result = await createPackage(data);
        if (result.success) {
          setPackageId(result.data.id);
          toast.success("Package created");
          router.replace(`/admin/packages/${result.data.id}/edit`);
        } else toast.error(result.error);
      } else {
        const result = await updatePackageDetails(packageId, data);
        if (result.success) toast.success("Details saved");
        else toast.error(result.error);
      }
    });
  }

  // ─── SEO form ───────────────────────────────────────────────────────────────
  const seoForm = useForm<PackageSeoInput>({
    resolver: zodResolver(packageSeoSchema) as Resolver<PackageSeoInput>,
    defaultValues: {
      metaTitle: pkg?.metaTitle ?? "",
      metaDescription: pkg?.metaDescription ?? "",
      coverImage: pkg?.coverImage ?? "",
      galleryImages: pkg?.galleryImages ?? [],
      featured: pkg?.featured ?? false,
      status: pkg?.status ?? ContentStatus.DRAFT,
    },
  });

  function savePublish(data: PackageSeoInput) {
    if (!packageId) { toast.error("Save details first"); return; }
    startTransition(async () => {
      const result = await updatePackageSeo(packageId, { ...data, galleryImages });
      if (result.success) toast.success("Published settings saved");
      else toast.error(result.error);
    });
  }

  // ─── Itinerary ───────────────────────────────────────────────────────────────
  function addDay() {
    if (!packageId) { toast.error("Save details first"); return; }
    const nextDay = itinerary.length + 1;
    const tempId = `new-${Date.now()}`;
    setItinerary((prev) => [...prev, { id: tempId, dayNumber: nextDay, title: `Day ${nextDay}`, subtitle: "", summaryStrip: "", description: "", meals: null, accommodation: "", imageUrl: "", images: [], alert: "" }]);
  }

  async function saveDay(day: ItineraryDay) {
    const pid = packageId;
    if (!pid) return;
    const isTemp = day.id.startsWith("new-");
    const result = await upsertItineraryDay(pid, {
      id: isTemp ? undefined : day.id,
      dayNumber: day.dayNumber, title: day.title, subtitle: day.subtitle, summaryStrip: day.summaryStrip,
      description: day.description, meals: day.meals ?? undefined, accommodation: day.accommodation,
      imageUrl: day.imageUrl, images: day.images ?? [], alert: day.alert,
    });
    if (result.success && isTemp) {
      setItinerary((prev) => prev.map((d) => d.id === day.id ? { ...d, id: result.data.id } : d));
    }
    return result.success;
  }

  function handleReorderDays(reordered: ItineraryDay[]) {
    const previous = itinerary;
    const renumbered = reordered.map((d, i) => ({ ...d, dayNumber: i + 1 }));
    setItinerary(renumbered);
    const pid = packageId;
    if (pid) startTransition(async () => {
      const result = await reorderItineraryDays(pid, renumbered.map((d) => d.id));
      if (!result.success) {
        setItinerary(previous);
        toast.error(result.error ?? "Failed to reorder days");
      }
    });
  }

  function handleDeleteDay(id: string) {
    startTransition(async () => {
      if (!id.startsWith("new-")) await deleteItineraryDay(id);
      setItinerary((prev) => prev.filter((d) => d.id !== id).map((d, i) => ({ ...d, dayNumber: i + 1 })));
      toast.success("Day removed");
    });
  }

  // ─── Departures ───────────────────────────────────────────────────────────────
  function handleAddDeparture() {
    if (!packageId) { toast.error("Save details first"); return; }
    const parsed = departureSchema.safeParse(newDeparture);
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Invalid"); return; }
    startTransition(async () => {
      const result = await upsertDeparture(packageId, parsed.data);
      if (result.success) {
        setDepartures((prev) => [...prev, { id: result.data.id, ...parsed.data, bookedSeats: 0 }]);
        setNewDeparture({});
        setShowDepartureForm(false);
        toast.success("Departure added");
      } else toast.error(result.error);
    });
  }

  function handleDeleteDeparture(id: string) {
    startTransition(async () => {
      await deleteDeparture(id);
      setDepartures((prev) => prev.filter((d) => d.id !== id));
      toast.success("Departure removed");
    });
  }

  // ─── String array helpers ───────────────────────────────────────────────────
  function StringArrayField({ label, name }: { label: string; name: "highlights" | "inclusions" | "exclusions" }) {
    const values = detailsForm.watch(name) as string[];
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        {values.map((val, i) => (
          <div key={i} className="flex gap-2">
            <Input value={val} onChange={(e) => { const arr = [...values]; arr[i] = e.target.value; detailsForm.setValue(name, arr); }} className="flex-1 h-8 text-sm" />
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => detailsForm.setValue(name, values.filter((_, j) => j !== i))}><X className="h-3.5 w-3.5" /></Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => detailsForm.setValue(name, [...values, ""])}><Plus className="h-3.5 w-3.5 mr-1" />Add</Button>
      </div>
    );
  }

  return (
    <Tabs defaultValue="details" className="space-y-4">
      <TabsList className="flex-wrap h-auto gap-1">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
        <TabsTrigger value="gallery">Gallery</TabsTrigger>
        <TabsTrigger value="departures">Departures</TabsTrigger>
        <TabsTrigger value="seo">SEO & Publish</TabsTrigger>
      </TabsList>

      {/* ── DETAILS ── */}
      <TabsContent value="details">
        <form onSubmit={detailsForm.handleSubmit(saveDetails)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input {...detailsForm.register("title")} onChange={handleTitleChange} placeholder="Annapurna Base Camp Trek" />
              {detailsForm.formState.errors.title && <p className="text-xs text-destructive">{detailsForm.formState.errors.title.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Slug *</Label>
              <Input {...detailsForm.register("slug")} onFocus={() => setSlugEdited(true)} placeholder="annapurna-base-camp-trek" />
              {detailsForm.formState.errors.slug && <p className="text-xs text-destructive">{detailsForm.formState.errors.slug.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <Label>Subtitle</Label>
            <Input {...detailsForm.register("subtitle")} placeholder="A brief enticing description" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Destination *</Label>
              <Select value={detailsForm.watch("destinationId") ?? ""} onValueChange={(v) => detailsForm.setValue("destinationId", v ?? "")}>
                <SelectTrigger><SelectValue placeholder="Select destination" /></SelectTrigger>
                <SelectContent>{destinations.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
              {detailsForm.formState.errors.destinationId && <p className="text-xs text-destructive">{detailsForm.formState.errors.destinationId.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Currency</Label>
              <Select value={detailsForm.watch("currency") ?? "NPR"} onValueChange={(v) => detailsForm.setValue("currency", v ?? "NPR")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["NPR", "USD", "GBP", "EUR", "AUD", "INR"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Trip Types</Label>
            <div className="flex flex-wrap gap-3">
              {tripTypes.map((tt) => {
                const checked = (detailsForm.watch("tripTypeIds") as string[]).includes(tt.id);
                return (
                  <label key={tt.id} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={checked} onCheckedChange={(v) => {
                      const curr = detailsForm.watch("tripTypeIds") as string[];
                      detailsForm.setValue("tripTypeIds", v ? [...curr, tt.id] : curr.filter((id) => id !== tt.id));
                    }} />
                    <span className="text-sm">{tt.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>Days *</Label>
              <Input type="number" min={1} {...detailsForm.register("durationDays")} />
            </div>
            <div className="space-y-1">
              <Label>Nights</Label>
              <Input type="number" min={0} {...detailsForm.register("durationNights")} />
            </div>
            <div className="space-y-1">
              <Label>Price From (minor units) *</Label>
              <Input type="number" min={0} {...detailsForm.register("priceFrom")} placeholder="e.g. 150000 = NPR 1500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Departure City</Label>
              <Input {...detailsForm.register("departureCity")} placeholder="e.g. Kathmandu" />
            </div>
            <div className="space-y-1">
              <Label>Price Basis</Label>
              <Input {...detailsForm.register("priceBasis")} placeholder="e.g. Per person, double sharing" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Min Group Size</Label>
              <Input type="number" min={1} {...detailsForm.register("minGroupSize")} placeholder="e.g. 5" />
            </div>
            <div className="space-y-1">
              <Label>Valid Until</Label>
              <Input type="date" {...detailsForm.register("validUntil")} />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Description</Label>
            <RichTextEditor value={detailsForm.watch("description") ?? ""} onChange={(v) => detailsForm.setValue("description", v)} placeholder="Describe this package…" />
          </div>

          <StringArrayField label="Highlights" name="highlights" />
          <StringArrayField label="Inclusions" name="inclusions" />
          <StringArrayField label="Exclusions" name="exclusions" />

          <div className="space-y-1">
            <Label>Terms & Conditions</Label>
            <RichTextEditor value={detailsForm.watch("terms") ?? ""} onChange={(v) => detailsForm.setValue("terms", v)} placeholder="Package-specific T&C…" />
          </div>

          <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : packageId ? "Save Details" : "Create Package"}</Button>
        </form>
      </TabsContent>

      {/* ── ITINERARY ── */}
      <TabsContent value="itinerary">
        <div className="space-y-4">
          {!packageId && <p className="text-sm text-muted-foreground">Save the Details tab first to enable itinerary editing.</p>}
          <SortableList
            items={itinerary}
            onReorder={handleReorderDays}
            renderItem={(day) => (
              <ItineraryDayCard day={day} onChange={(updated) => setItinerary((prev) => prev.map((d) => d.id === day.id ? updated : d))} onSave={saveDay} onDelete={handleDeleteDay} isPending={isPending} />
            )}
          />
          <Button type="button" variant="outline" size="sm" onClick={addDay} disabled={!packageId || isPending}>
            <Plus className="h-4 w-4 mr-2" />Add Day
          </Button>
        </div>
      </TabsContent>

      {/* ── GALLERY ── */}
      <TabsContent value="gallery">
        <div className="space-y-4">
          {!packageId && <p className="text-sm text-muted-foreground">Save the Details tab first.</p>}
          <div className="space-y-2">
            <Label>Cover Image</Label>
            <div className="flex gap-2 items-center">
              <Input value={seoForm.watch("coverImage") ?? ""} onChange={(e) => seoForm.setValue("coverImage", e.target.value)} placeholder="URL" className="flex-1 h-8 text-sm" />
              <MediaPicker onSelect={(url) => seoForm.setValue("coverImage", url)} trigger={<Button type="button" variant="outline" size="sm">Pick</Button>} />
              {seoForm.watch("coverImage") && (
                <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive h-8" onClick={() => seoForm.setValue("coverImage", "")}>
                  <X className="h-3.5 w-3.5 mr-1" />Clear
                </Button>
              )}
            </div>
            {seoForm.watch("coverImage") && (
              <div className="relative w-40 h-24 rounded overflow-hidden bg-muted">
                <Image src={seoForm.watch("coverImage")!} alt="Cover preview" fill className="object-cover" sizes="160px" />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Gallery Images ({galleryImages.length})</Label>
              <MediaPicker onSelect={(url) => setGalleryImages((prev) => [...prev, url])} trigger={<Button type="button" variant="outline" size="sm"><Plus className="h-3.5 w-3.5 mr-1" />Add Image</Button>} />
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {galleryImages.map((url, i) => (
                <div key={i} className="relative group aspect-square rounded overflow-hidden bg-muted">
                  <Image src={url} alt="" fill className="object-cover" sizes="100px" />
                  <button type="button" onClick={() => setGalleryImages((prev) => prev.filter((_, j) => j !== i))} className="absolute top-1 right-1 rounded-full bg-destructive text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={() => savePublish(seoForm.getValues())} disabled={!packageId || isPending}>{isPending ? "Saving…" : "Save Gallery"}</Button>
        </div>
      </TabsContent>

      {/* ── DEPARTURES ── */}
      <TabsContent value="departures">
        <div className="space-y-4">
          {!packageId && <p className="text-sm text-muted-foreground">Save the Details tab first.</p>}
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50"><tr><th className="text-left px-4 py-2 font-medium">Departure</th><th className="text-left px-4 py-2 font-medium">Return</th><th className="text-left px-4 py-2 font-medium">Seats</th><th className="text-left px-4 py-2 font-medium">Price Override</th><th /></tr></thead>
              <tbody className="divide-y">
                {departures.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-muted-foreground text-xs">No departures yet.</td></tr>}
                {departures.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/20">
                    <td className="px-4 py-2">{format(new Date(d.departureDate), "dd MMM yyyy")}</td>
                    <td className="px-4 py-2">{format(new Date(d.returnDate), "dd MMM yyyy")}</td>
                    <td className="px-4 py-2">{d.bookedSeats}/{d.maxSeats}</td>
                    <td className="px-4 py-2">{d.priceOverride ? `${d.currency} ${(d.priceOverride / 100).toLocaleString()}` : "—"}</td>
                    <td className="px-4 py-2 text-right">
                      <ConfirmDialog trigger={<Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>} title="Remove departure?" onConfirm={() => handleDeleteDeparture(d.id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showDepartureForm ? (
            <Card><CardContent className="pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Departure Date *</Label><Input type="date" value={newDeparture.departureDate ?? ""} onChange={(e) => setNewDeparture((p) => ({ ...p, departureDate: e.target.value }))} /></div>
                <div className="space-y-1"><Label>Return Date *</Label><Input type="date" value={newDeparture.returnDate ?? ""} onChange={(e) => setNewDeparture((p) => ({ ...p, returnDate: e.target.value }))} /></div>
                <div className="space-y-1"><Label>Max Seats *</Label><Input type="number" min={1} value={newDeparture.maxSeats ?? ""} onChange={(e) => setNewDeparture((p) => ({ ...p, maxSeats: Number(e.target.value) }))} /></div>
                <div className="space-y-1"><Label>Price Override (minor units)</Label><Input type="number" min={0} value={newDeparture.priceOverride ?? ""} onChange={(e) => setNewDeparture((p) => ({ ...p, priceOverride: e.target.value ? Number(e.target.value) : undefined }))} placeholder="Leave blank to use package price" /></div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddDeparture} disabled={isPending}>Add</Button>
                <Button size="sm" variant="outline" onClick={() => { setShowDepartureForm(false); setNewDeparture({}); }}>Cancel</Button>
              </div>
            </CardContent></Card>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setShowDepartureForm(true)} disabled={!packageId}><Plus className="h-4 w-4 mr-2" />Add Departure</Button>
          )}
        </div>
      </TabsContent>

      {/* ── SEO & PUBLISH ── */}
      <TabsContent value="seo">
        <form onSubmit={seoForm.handleSubmit(savePublish)} className="space-y-5">
          {!packageId && <p className="text-sm text-muted-foreground">Save the Details tab first.</p>}
          <div className="space-y-1">
            <Label>Meta Title <span className="text-muted-foreground text-xs">({(seoForm.watch("metaTitle") ?? "").length}/60)</span></Label>
            <Input {...seoForm.register("metaTitle")} maxLength={60} />
          </div>
          <div className="space-y-1">
            <Label>Meta Description <span className="text-muted-foreground text-xs">({(seoForm.watch("metaDescription") ?? "").length}/160)</span></Label>
            <Textarea {...seoForm.register("metaDescription")} rows={3} maxLength={160} />
          </div>

          <div className="flex items-center gap-3">
            <Checkbox checked={seoForm.watch("featured")} onCheckedChange={(v) => seoForm.setValue("featured", !!v)} id="featured" />
            <Label htmlFor="featured">Featured package (shown on home page)</Label>
          </div>

          <div className="space-y-1">
            <Label>Status</Label>
            <Select value={seoForm.watch("status") ?? ContentStatus.DRAFT} onValueChange={(v) => seoForm.setValue("status", (v ?? ContentStatus.DRAFT) as ContentStatus)}>
              <SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={!packageId || isPending}>{isPending ? "Saving…" : "Save & Publish"}</Button>
        </form>
      </TabsContent>
    </Tabs>
  );
}

// ─── Itinerary Day Card (inline editor) ──────────────────────────────────────

function ItineraryDayCard({ day, onChange, onSave, onDelete, isPending }: {
  day: ItineraryDay;
  onChange: (d: ItineraryDay) => void;
  onSave: (d: ItineraryDay) => Promise<boolean | undefined>;
  onDelete: (id: string) => void;
  isPending: boolean;
}) {
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(day);
    setSaving(false);
    toast.success(`Day ${day.dayNumber} saved`);
  }

  return (
    <div className="space-y-3 flex-1">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="shrink-0">Day {day.dayNumber}</Badge>
        <Input value={day.title} onChange={(e) => onChange({ ...day, title: e.target.value })} placeholder="Day title" className="flex-1 h-8 text-sm" />
        <ConfirmDialog trigger={<Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive shrink-0"><Trash2 className="h-3.5 w-3.5" /></Button>} title={`Remove Day ${day.dayNumber}?`} onConfirm={() => onDelete(day.id)} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Input value={day.subtitle ?? ""} onChange={(e) => onChange({ ...day, subtitle: e.target.value })} placeholder="Subtitle — e.g. A Vibrant Seaside Escape" className="h-7 text-xs" />
        <Input value={day.summaryStrip ?? ""} onChange={(e) => onChange({ ...day, summaryStrip: e.target.value })} placeholder="Summary — e.g. Airport → Hotel → Show" className="h-7 text-xs" />
      </div>
      <RichTextEditor value={day.description} onChange={(v) => onChange({ ...day, description: v })} placeholder="Day description — add text, images, lists…" />
      <Input value={day.alert ?? ""} onChange={(e) => onChange({ ...day, alert: e.target.value })} placeholder="⚠ Alert note — e.g. Safari World closed every Monday" className="h-7 text-xs border-amber-300" />
      <div className="flex flex-wrap items-center gap-4 text-sm">
        {(["breakfast", "lunch", "dinner"] as const).map((meal) => (
          <label key={meal} className="flex items-center gap-1.5 cursor-pointer">
            <Checkbox checked={day.meals?.[meal] ?? false} onCheckedChange={(v) => onChange({ ...day, meals: { ...(day.meals ?? { breakfast: false, lunch: false, dinner: false }), [meal]: !!v } })} />
            <span className="capitalize">{meal}</span>
          </label>
        ))}
        <Input value={day.accommodation} onChange={(e) => onChange({ ...day, accommodation: e.target.value })} placeholder="Accommodation" className="h-7 text-xs w-40" />
        <MediaPicker onSelect={(url) => onChange({ ...day, imageUrl: url })} trigger={<Button type="button" variant="outline" size="sm" className="h-7 text-xs"><ImageIcon className="h-3 w-3 mr-1" />{day.imageUrl ? "Change Image" : "Add Image"}</Button>} />
        {day.imageUrl && (
          <Button type="button" variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => onChange({ ...day, imageUrl: "" })}>
            <X className="h-3 w-3 mr-1" />Remove
          </Button>
        )}
      </div>
      {/* Day images (multiple) */}
      {((day.images && day.images.length > 0) || day.imageUrl) && (
        <div className="flex flex-wrap gap-2">
          {day.imageUrl && (
            <div className="relative group w-20 h-14 rounded overflow-hidden bg-muted">
              <Image src={day.imageUrl} alt="Main" fill className="object-cover" sizes="80px" />
              <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] text-center py-0.5">Main</span>
            </div>
          )}
          {(day.images ?? []).map((url, i) => (
            <div key={i} className="relative group w-20 h-14 rounded overflow-hidden bg-muted">
              <Image src={url} alt="" fill className="object-cover" sizes="80px" />
              <button type="button" onClick={() => onChange({ ...day, images: (day.images ?? []).filter((_, j) => j !== i) })} className="absolute top-0.5 right-0.5 rounded-full bg-destructive text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}
          <MediaPicker onSelect={(url) => onChange({ ...day, images: [...(day.images ?? []), url] })} trigger={
            <button type="button" className="w-20 h-14 rounded border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              <Plus className="h-3.5 w-3.5" />
              <span className="text-[9px] mt-0.5">More</span>
            </button>
          } />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground shrink-0">📍 Map:</span>
        <Input type="number" step="any" value={day.latitude ?? ""} onChange={(e) => onChange({ ...day, latitude: e.target.value ? Number(e.target.value) : undefined })} placeholder="Latitude" className="h-7 text-xs w-28" />
        <Input type="number" step="any" value={day.longitude ?? ""} onChange={(e) => onChange({ ...day, longitude: e.target.value ? Number(e.target.value) : undefined })} placeholder="Longitude" className="h-7 text-xs w-28" />
        <Input type="number" value={day.elevation ?? ""} onChange={(e) => onChange({ ...day, elevation: e.target.value ? Number(e.target.value) : undefined })} placeholder="Elevation (m)" className="h-7 text-xs w-28" />
      </div>
      <Button type="button" size="sm" variant="secondary" onClick={handleSave} disabled={saving || isPending}>{saving ? "Saving…" : "Save Day"}</Button>
    </div>
  );
}
