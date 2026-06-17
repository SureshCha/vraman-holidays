"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Star, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { updateTestimonialStatus, updateTestimonialImage, deleteTestimonial } from "./actions";
import { ContentStatus } from "@/generated/prisma/enums";

interface TestimonialRow {
  id: string;
  name: string;
  location: string;
  rating: number;
  content: string;
  imageUrl: string | null;
  status: ContentStatus;
  createdAt: string;
}

export function TestimonialsClient({ testimonials: initial }: { testimonials: TestimonialRow[] }) {
  const [items, setItems] = useState(initial);
  const [isPending, startTransition] = useTransition();

  function handleStatus(id: string, status: ContentStatus) {
    startTransition(async () => {
      const r = await updateTestimonialStatus(id, status);
      if (r.success) { setItems((p) => p.map((t) => t.id === id ? { ...t, status } : t)); toast.success("Updated"); }
      else toast.error(r.error);
    });
  }

  function handleImageSelect(id: string, url: string) {
    startTransition(async () => {
      const r = await updateTestimonialImage(id, url);
      if (r.success) { setItems((p) => p.map((t) => t.id === id ? { ...t, imageUrl: url } : t)); toast.success("Photo updated"); }
      else toast.error(r.error);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const r = await deleteTestimonial(id);
      if (r.success) { setItems((p) => p.filter((t) => t.id !== id)); toast.success("Deleted"); }
      else toast.error(r.error);
    });
  }

  const columns: ColumnDef<TestimonialRow>[] = [
    {
      accessorKey: "imageUrl",
      header: "Photo",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.imageUrl ? (
            <Image src={row.original.imageUrl} alt={row.original.name} width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
              {row.original.name[0]}
            </div>
          )}
          <MediaPicker
            onSelect={(url) => handleImageSelect(row.original.id, url)}
            trigger={
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <ImagePlus className="h-3 w-3" />
              </Button>
            }
          />
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.location}</p>
        </div>
      ),
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) => (
        <div className="flex">
          {Array.from({ length: row.original.rating }).map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
      ),
    },
    {
      accessorKey: "content",
      header: "Review",
      cell: ({ row }) => (
        <p className="text-sm text-muted-foreground line-clamp-2 max-w-xs">{row.original.content}</p>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Select
          value={row.original.status}
          onValueChange={(v) => v && handleStatus(row.original.id, (v ?? row.original.status) as ContentStatus)}
          disabled={isPending}
        >
          <SelectTrigger className="w-28 h-7 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.values(ContentStatus).map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <ConfirmDialog
          trigger={
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          }
          title={`Delete review from ${row.original.name}?`}
          onConfirm={() => handleDelete(row.original.id)}
        />
      ),
    },
  ];

  return <DataTable columns={columns} data={items} searchKey="name" searchPlaceholder="Search by name…" />;
}
