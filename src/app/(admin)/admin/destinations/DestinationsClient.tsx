"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { SortableList } from "@/components/admin/SortableList";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { deleteDestination, reorderDestinations } from "./actions";
import { DestinationDialog } from "./DestinationDialog";
import { ContentStatus } from "@/generated/prisma/enums";

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

export function DestinationsClient({ destinations: initial }: { destinations: DestinationRow[] }) {
  const [destinations, setDestinations] = useState(initial);
  const [editTarget, setEditTarget] = useState<DestinationRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleReorder(reordered: DestinationRow[]) {
    const previous = destinations;
    setDestinations(reordered);
    startTransition(async () => {
      const result = await reorderDestinations(reordered.map((d) => d.id));
      if (!result.success) {
        setDestinations(previous);
        toast.error(result.error ?? "Failed to reorder destinations");
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteDestination(id);
      if (result.success) {
        setDestinations((prev) => prev.filter((d) => d.id !== id));
        toast.success("Destination deleted");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleSaved(dest: DestinationRow) {
    setDestinations((prev) => {
      const idx = prev.findIndex((d) => d.id === dest.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = dest;
        return next;
      }
      return [...prev, dest];
    });
    setDialogOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            setEditTarget(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Destination
        </Button>
      </div>

      {destinations.length === 0 ? (
        <div className="border rounded-lg p-12 text-center text-muted-foreground">
          <MapPin className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No destinations yet. Add your first one!</p>
        </div>
      ) : (
        <SortableList
          items={destinations}
          onReorder={handleReorder}
          renderItem={(dest) => (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="h-12 w-16 rounded overflow-hidden bg-muted shrink-0">
                {dest.imageUrl ? (
                  <Image
                    src={dest.imageUrl}
                    alt={dest.name}
                    width={64}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{dest.name}</p>
                <p className="text-xs text-muted-foreground">{dest.country} · {dest.packageCount} package{dest.packageCount !== 1 ? "s" : ""}</p>
              </div>
              <Badge variant={dest.status === "PUBLISHED" ? "default" : "secondary"} className="shrink-0 text-xs">
                {dest.status}
              </Badge>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => {
                    setEditTarget(dest);
                    setDialogOpen(true);
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <ConfirmDialog
                  trigger={
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  }
                  title={`Delete "${dest.name}"?`}
                  description="This cannot be undone. Packages must be moved first."
                  onConfirm={() => handleDelete(dest.id)}
                />
              </div>
            </div>
          )}
        />
      )}

      <DestinationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        destination={editTarget ?? undefined}
        onSaved={handleSaved}
      />
    </div>
  );
}
