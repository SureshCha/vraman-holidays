import { BlogEditor } from "../BlogEditor";

export default function NewBlogPostPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">New Blog Post</h1>
      <BlogEditor />
    </div>
  );
}
