import { connection } from "next/server";
import { MediaLibrary } from "@/components/admin/MediaLibrary";

export default async function MediaPage() {
  await connection();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Media Library</h1>
        <p className="text-muted-foreground text-sm">
          Upload and manage images for packages, blog posts, and more.
        </p>
      </div>
      <MediaLibrary />
    </div>
  );
}
