"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import slugify from "slugify";
import type { Resolver } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { toast } from "sonner";
import { ContentStatus } from "@/generated/prisma/enums";
import { destinationSchema, type DestinationInput } from "@/lib/validators/destination";
import { createDestination, updateDestination } from "./actions";

interface DestinationRow {
  id: string;
  slug: string;
  name: string;
  country: string;
  tagline: string;
  region: "NEPAL" | "WORLD";
  description: string;
  imageUrl: string;
  order: number;
  status: ContentStatus;
  packageCount: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  destination?: DestinationRow;
  onSaved: (dest: DestinationRow) => void;
}

export function DestinationDialog({ open, onOpenChange, destination, onSaved }: Props) {
  const isEdit = !!destination;
  const [isPending, startTransition] = useTransition();

  const form = useForm<DestinationInput>({
    resolver: zodResolver(destinationSchema) as Resolver<DestinationInput>,
    defaultValues: {
      name: "",
      country: "",
      slug: "",
      tagline: "",
      region: "WORLD",
      description: "",
      imageUrl: "",
      order: 0,
      status: ContentStatus.DRAFT,
    },
  });

  useEffect(() => {
    if (destination) {
      form.reset({
        name: destination.name,
        country: destination.country,
        slug: destination.slug,
        tagline: destination.tagline,
        region: destination.region,
        description: destination.description,
        imageUrl: destination.imageUrl,
        order: destination.order,
        status: destination.status,
      });
    } else {
      form.reset({ name: "", country: "", slug: "", tagline: "", region: "WORLD", description: "", imageUrl: "", order: 0, status: ContentStatus.DRAFT });
    }
  }, [destination, form, open]);

  // Auto-generate slug from name
  const nameValue = form.watch("name");
  useEffect(() => {
    if (!isEdit && nameValue) {
      form.setValue("slug", slugify(nameValue, { lower: true, strict: true }));
    }
  }, [nameValue, isEdit, form]);

  function handleSubmit(data: DestinationInput) {
    startTransition(async () => {
      const result = isEdit
        ? await updateDestination(destination.id, data)
        : await createDestination(data);

      if (result.success) {
        toast.success(isEdit ? "Destination updated" : "Destination created");
        const id = isEdit ? destination.id : (result as { success: true; data: { id: string } }).data.id;
        onSaved({
          id,
          slug: data.slug,
          name: data.name,
          country: data.country,
          tagline: data.tagline ?? "",
          region: data.region,
          description: data.description ?? "",
          imageUrl: data.imageUrl ?? "",
          order: data.order,
          status: data.status,
          packageCount: destination?.packageCount ?? 0,
        });
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Destination" : "Add Destination"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Name *</Label>
              <Input {...form.register("name")} placeholder="Nepal" />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Country *</Label>
              <Input {...form.register("country")} placeholder="Nepal" />
              {form.formState.errors.country && (
                <p className="text-xs text-destructive">{form.formState.errors.country.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label>Slug *</Label>
            <Input {...form.register("slug")} placeholder="kathmandu" />
            {form.formState.errors.slug && (
              <p className="text-xs text-destructive">{form.formState.errors.slug.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Tagline</Label>
              <Input {...form.register("tagline")} placeholder="The Gateway to Sacred Nepal" />
            </div>
            <div className="space-y-1">
              <Label>Region</Label>
              <Select
                value={form.watch("region")}
                onValueChange={(v) => form.setValue("region", (v ?? "WORLD") as "NEPAL" | "WORLD")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEPAL">Discover Nepal</SelectItem>
                  <SelectItem value="WORLD">Discover the World</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Description</Label>
            <RichTextEditor
              value={form.watch("description") ?? ""}
              onChange={(v) => form.setValue("description", v)}
              placeholder="Describe this destination…"
            />
          </div>

          <div className="space-y-1">
            <Label>Cover Image</Label>
            <div className="flex gap-2 items-center">
              <Input
                {...form.register("imageUrl")}
                placeholder="https://…"
                className="flex-1"
              />
              <MediaPicker
                onSelect={(url) => form.setValue("imageUrl", url)}
                trigger={<Button type="button" variant="outline" size="sm">Pick</Button>}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Status</Label>
            <Select
              value={form.watch("status")}
              onValueChange={(v) => form.setValue("status", (v ?? ContentStatus.DRAFT) as ContentStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : isEdit ? "Save Changes" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
