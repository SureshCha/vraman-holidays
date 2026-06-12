"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MediaLibrary } from "./MediaLibrary";
import { QueryProvider } from "@/providers/QueryProvider";

interface MediaPickerProps {
  onSelect: (url: string) => void;
  trigger: React.ReactNode;
}

interface MediaAsset {
  id: string;
  publicId: string;
  url: string;
  format: string | null;
  width: number | null;
  height: number | null;
  bytes: number | null;
  folder: string | null;
  createdAt: string;
}

export function MediaPicker({ onSelect, trigger }: MediaPickerProps) {
  const [open, setOpen] = useState(false);

  function handleSelect(url: string, _asset: MediaAsset) {
    onSelect(url);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Image</DialogTitle>
        </DialogHeader>
        <QueryProvider>
          <MediaLibrary selectable onSelect={handleSelect} />
        </QueryProvider>
      </DialogContent>
    </Dialog>
  );
}
