import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { MediaLibrary } from "@/components/admin/MediaLibrary";

export default async function MediaPage() {
  await connection();
  const session = await auth();
  if (!session) notFound();
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
