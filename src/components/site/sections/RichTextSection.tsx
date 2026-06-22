import { sanitizeHtml } from "@/lib/sanitize";
import { getSettings } from "@/lib/settings";
import { resolveTokens } from "@/lib/tokens";

interface RichTextData {
  content?: string;
  align?: string; // "center" to center the block (e.g. intros)
}

export async function RichTextSection({ data }: { data: RichTextData }) {
  if (!data.content) return null;
  const settings = await getSettings();
  const html = sanitizeHtml(resolveTokens(data.content, settings));
  const centered = data.align === "center";

  return (
    <section className="container mx-auto px-4 py-16">
      <div
        className={`prose prose-base sm:prose-lg max-w-3xl mx-auto prose-headings:font-heading prose-headings:tracking-tight ${centered ? "text-center" : ""}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}
