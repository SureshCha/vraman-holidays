"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { toast } from "sonner";
import { updateLegalPage } from "./actions";

interface Props {
  slug: string;
  initialTitle: string;
  initialContent: string;
}

export function LegalPageEditor({ slug, initialTitle, initialContent }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await updateLegalPage(slug, { title, content });
      if (result.success) {
        toast.success("Legal page updated");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="space-y-1">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <Label>Content</Label>
        <RichTextEditor value={content} onChange={setContent} />
      </div>

      <Button onClick={handleSave} disabled={isPending}>
        {isPending ? "Saving…" : "Save Changes"}
      </Button>
    </div>
  );
}
