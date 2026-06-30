"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MediaLibrary } from "./MediaLibrary";
import { QueryProvider } from "@/providers/QueryProvider";

interface MediaPickerProps {
  onSelect: (url: string) => void;
  trigger: React.ReactNode;
  /** Restrict the library to one media kind (e.g. "video" for a video field). */
  accept?: "image" | "video" | "any";
}

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

export function MediaPicker({ onSelect, trigger, accept = "any" }: MediaPickerProps) {
  const [open, setOpen] = useState(false);

  function handleSelect(url: string, _asset: MediaAsset) {
    onSelect(url);
    setOpen(false);
  }

  const title = accept === "video" ? "Select Video" : accept === "image" ? "Select Image" : "Select Media";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <QueryProvider>
          <MediaLibrary selectable onSelect={handleSelect} accept={accept} />
        </QueryProvider>
      </DialogContent>
    </Dialog>
  );
}
