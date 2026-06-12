"use client";

import { CldUploadWidget, type CloudinaryUploadWidgetResults } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface UploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  folder: string;
  tags: string[];
}

interface MediaUploaderProps {
  onUploadComplete?: (asset: UploadResult) => void;
  buttonLabel?: string;
}

export function MediaUploader({
  onUploadComplete,
  buttonLabel = "Upload Image",
}: MediaUploaderProps) {
  async function handleSuccess(results: CloudinaryUploadWidgetResults) {
    const info = results.info as UploadResult;

    try {
      await fetch("/api/media/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicId: info.public_id,
          url: info.secure_url,
          format: info.format,
          width: info.width,
          height: info.height,
          bytes: info.bytes,
          folder: info.folder,
          tags: info.tags ?? [],
        }),
      });

      toast.success("Image uploaded successfully");
      onUploadComplete?.(info);
    } catch {
      toast.error("Failed to save image to library");
    }
  }

  return (
    <CldUploadWidget
      uploadPreset="vraman_uploads"
      options={{
        folder: "vraman-holidays",
        resourceType: "image",
        maxFileSize: 10000000, // 10MB
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "gif"],
        multiple: false,
      }}
      onSuccess={handleSuccess}
    >
      {({ open }) => (
        <Button type="button" onClick={() => open()} variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          {buttonLabel}
        </Button>
      )}
    </CldUploadWidget>
  );
}
