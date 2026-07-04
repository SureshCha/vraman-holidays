import Link from "next/link";
import { BlogEditor } from "../BlogEditor";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewBlogPostPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/blog">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">New Blog Post</h1>
      </div>
      <BlogEditor />
    </div>
  );
}
