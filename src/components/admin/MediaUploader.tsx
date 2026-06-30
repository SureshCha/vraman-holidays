"use client";

import { CldUploadWidget, type CloudinaryUploadWidgetResults } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface UploadResult {
  public_id: string;
  secure_url: string;
  resource_type: string; // "image" | "video"
  format: string;
  width: number;
  height: number;
  bytes: number;
  duration?: number; // seconds, videos only
  folder: string;
  tags: string[];
}

interface MediaUploaderProps {
  onUploadComplete?: (asset: UploadResult) => void;
  buttonLabel?: string;
}

export function MediaUploader({
  onUploadComplete,
  buttonLabel = "Upload Media",
}: MediaUploaderProps) {
  async function handleSuccess(results: CloudinaryUploadWidgetResults) {
    const info = results.info as UploadResult;
    const isVideo = info.resource_type === "video";

    try {
      await fetch("/api/media/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicId: info.public_id,
          url: info.secure_url,
          resourceType: info.resource_type,
          format: info.format,
          width: info.width,
          height: info.height,
          bytes: info.bytes,
          duration: info.duration,
          folder: info.folder,
          tags: info.tags ?? [],
        }),
      });

      toast.success(`${isVideo ? "Video" : "Image"} uploaded successfully`);
      onUploadComplete?.(info);
    } catch {
      toast.error("Failed to save to media library");
    }
  }

  return (
    <CldUploadWidget
      uploadPreset="vraman_uploads"
      options={{
        folder: "vraman-holidays",
        // "auto" lets a single uploader accept both images and videos.
        resourceType: "auto",
        maxFileSize: 104857600, // 100MB (videos are larger than images)
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "gif", "mp4", "webm", "mov"],
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
