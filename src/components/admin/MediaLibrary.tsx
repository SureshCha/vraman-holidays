"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Image from "next/image";
import { MediaUploader } from "./MediaUploader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Trash2, Copy, Check, Video } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MediaAsset {
  id: string;
  publicId: string;
  url: string;
  resourceType: string | null;
  format: string | null;
  width: number | null;
  height: number | null;
  bytes: number | null;
  folder: string | null;
  createdAt: string;
}

interface MediaLibraryResponse {
  assets: MediaAsset[];
  total: number;
  page: number;
  limit: number;
}

interface MediaLibraryProps {
  selectable?: boolean;
  onSelect?: (url: string, asset: MediaAsset) => void;
  selectedUrl?: string;
  /** Restrict the grid to a single media kind (used by pickers). */
  accept?: "image" | "video" | "any";
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaLibrary({ selectable, onSelect, selectedUrl, accept = "any" }: MediaLibraryProps) {
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const limit = 24;

  const { data, isLoading } = useQuery<MediaLibraryResponse>({
    queryKey: ["media", page, accept],
    queryFn: () =>
      fetch(
        `/api/media?page=${page}&limit=${limit}${accept !== "any" ? `&resourceType=${accept}` : ""}`
      ).then((r) => r.json()),
  });

  // Filtering happens server-side (so pagination/counts stay correct); the grid
  // renders exactly what the query returned.
  const isVideo = (a: MediaAsset) => a.resourceType === "video";
  const assets = data?.assets ?? [];

  async function handleDelete(asset: MediaAsset) {
    if (!confirm(`Delete "${asset.publicId}"? This cannot be undone.`)) return;
    try {
      await fetch("/api/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: asset.publicId }),
      });
      toast.success("Image deleted");
      queryClient.invalidateQueries({ queryKey: ["media"] });
    } catch {
      toast.error("Failed to delete image");
    }
  }

  async function handleCopy(url: string, id: string) {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("URL copied");
    setTimeout(() => setCopiedId(null), 2000);
  }

  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {data ? `${data.total} item${data.total !== 1 ? "s" : ""}` : "Loading…"}
        </p>
        <MediaUploader
          onUploadComplete={() =>
            queryClient.invalidateQueries({ queryKey: ["media"] })
          }
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-sm">Nothing here yet. Upload your first file!</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className={cn(
                "group relative aspect-square rounded-lg overflow-hidden border bg-muted cursor-pointer",
                selectable && "hover:ring-2 hover:ring-primary",
                selectable && selectedUrl === asset.url && "ring-2 ring-primary"
              )}
              onClick={() => selectable && onSelect?.(asset.url, asset)}
            >
              {isVideo(asset) ? (
                <video
                  src={asset.url}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 h-full w-full object-cover"
                  onMouseEnter={(e) => void e.currentTarget.play().catch(() => {})}
                  onMouseLeave={(e) => e.currentTarget.pause()}
                />
              ) : (
                <Image
                  src={asset.url}
                  alt={asset.publicId}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, 16vw"
                />
              )}

              {/* Video indicator */}
              {isVideo(asset) && (
                <div className="absolute top-1 left-1 z-10">
                  <Badge variant="secondary" className="text-[0.6rem] px-1 py-0 gap-0.5">
                    <Video className="h-2.5 w-2.5" /> VIDEO
                  </Badge>
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                <div className="flex justify-end gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(asset.url, asset.id);
                    }}
                    className="rounded p-1 bg-white/10 hover:bg-white/20 text-white"
                    title="Copy URL"
                  >
                    {copiedId === asset.id ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                  {!selectable && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(asset);
                      }}
                      className="rounded p-1 bg-white/10 hover:bg-destructive/80 text-white"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <div>
                  {asset.format && (
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      {asset.format.toUpperCase()}
                    </Badge>
                  )}
                  <p className="text-white text-xs mt-0.5 truncate">
                    {formatBytes(asset.bytes)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
