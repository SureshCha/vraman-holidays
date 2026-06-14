import { sanitizeHtml } from "@/lib/sanitize";

interface RichTextData {
  content?: string;
}

export function RichTextSection({ data }: { data: RichTextData }) {
  if (!data.content) return null;

  return (
    <section className="container mx-auto px-4 py-14">
      <div
        className="prose prose-sm sm:prose max-w-3xl mx-auto"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.content) }}
      />
    </section>
  );
}
