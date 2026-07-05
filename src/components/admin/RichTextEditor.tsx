"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExt from "@tiptap/extension-link";
import ImageResize from "tiptap-extension-resize-image";
import Placeholder from "@tiptap/extension-placeholder";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { MediaPicker } from "./MediaPicker";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Link2,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  ImageIcon,
  Unlink,
  Palette,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo2,
  Redo2,
  RemoveFormatting,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

const TEXT_COLORS = [
  { color: "#000000", label: "Black" },
  { color: "#DC2626", label: "Red" },
  { color: "#2563EB", label: "Blue" },
  { color: "#16A34A", label: "Green" },
  { color: "#EA580C", label: "Orange" },
  { color: "#9333EA", label: "Purple" },
  { color: "#EC4899", label: "Pink" },
  { color: "#D97706", label: "Amber" },
  { color: "#0D9488", label: "Teal" },
  { color: "#6B7280", label: "Gray" },
];

const HIGHLIGHT_COLORS = [
  { color: "#FEF08A", label: "Yellow" },
  { color: "#BBF7D0", label: "Green" },
  { color: "#BFDBFE", label: "Blue" },
  { color: "#FECDD3", label: "Pink" },
  { color: "#FED7AA", label: "Orange" },
  { color: "#E9D5FF", label: "Purple" },
];

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write something…",
  className,
}: RichTextEditorProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExt.configure({ openOnClick: false }),
      ImageResize.configure({ inline: true, allowBase64: false }),
      Placeholder.configure({ placeholder }),
      TextStyle,
      Color,
      Underline,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  function openLinkDialog() {
    setLinkUrl(editor?.getAttributes("link").href ?? "");
    setLinkDialogOpen(true);
  }

  function applyLink() {
    if (linkUrl === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor?.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
    }
    setLinkDialogOpen(false);
    setLinkUrl("");
  }

  return (
    <div className={cn("border rounded-md overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b p-1.5 bg-muted/30">
        {/* Undo / Redo */}
        <ToolbarButton active={false} onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton active={false} onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>

        <Sep />

        {/* Text formatting */}
        <ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("subscript")} onClick={() => editor.chain().focus().toggleSubscript().run()} title="Subscript">
          <SubscriptIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("superscript")} onClick={() => editor.chain().focus().toggleSuperscript().run()} title="Superscript">
          <SuperscriptIcon className="h-4 w-4" />
        </ToolbarButton>

        <Sep />

        {/* Headings */}
        <ToolbarButton active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        {/* Lists & blocks */}
        <ToolbarButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list">
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote">
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider line">
          <Minus className="h-4 w-4" />
        </ToolbarButton>

        <Sep />

        {/* Link */}
        <ToolbarButton active={editor.isActive("link")} onClick={openLinkDialog} title="Add link">
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
        {editor.isActive("link") && (
          <ToolbarButton active={false} onClick={() => editor.chain().focus().unsetLink().run()} title="Remove link">
            <Unlink className="h-4 w-4" />
          </ToolbarButton>
        )}

        {/* Text color */}
        <DropdownMenu>
          <DropdownMenuTrigger className={cn("inline-flex items-center justify-center rounded p-1.5 text-sm transition-colors", editor.isActive("textStyle") ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground")}>
            <Palette className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="p-2 w-auto">
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Text color</p>
            <div className="grid grid-cols-5 gap-1.5">
              {TEXT_COLORS.map(({ color, label }) => (
                <button key={color} type="button" title={label} onClick={() => editor.chain().focus().setColor(color).run()} className="h-6 w-6 rounded-full border border-border hover:scale-110 transition-transform" style={{ backgroundColor: color }} />
              ))}
            </div>
            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t">
              <input type="color" defaultValue={editor.getAttributes("textStyle").color || "#000000"} onChange={(e) => editor.chain().focus().setColor(e.target.value).run()} className="h-6 w-6 rounded cursor-pointer border-0 p-0" title="Custom color" />
              <span className="text-xs text-muted-foreground flex-1">Custom</span>
              <button type="button" onClick={() => editor.chain().focus().unsetColor().run()} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Clear</button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Highlight */}
        <DropdownMenu>
          <DropdownMenuTrigger className={cn("inline-flex items-center justify-center rounded p-1.5 text-sm transition-colors", editor.isActive("highlight") ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground")}>
            <Highlighter className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="p-2 w-auto">
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Highlight</p>
            <div className="grid grid-cols-3 gap-1.5">
              {HIGHLIGHT_COLORS.map(({ color, label }) => (
                <button key={color} type="button" title={label} onClick={() => editor.chain().focus().toggleHighlight({ color }).run()} className="h-6 w-10 rounded border border-border hover:scale-105 transition-transform text-xs" style={{ backgroundColor: color }}>{label}</button>
              ))}
            </div>
            <button type="button" onClick={() => editor.chain().focus().unsetHighlight().run()} className="mt-2 w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center py-1 border-t">Clear highlight</button>
          </DropdownMenuContent>
        </DropdownMenu>

        <Sep />

        {/* Image alignment */}
        <ToolbarButton active={false} onClick={() => editor.chain().focus().updateAttributes("image", { style: "float: left; margin: 0 1rem 0.5rem 0; max-width: 50%;" }).run()} title="Image float left">
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton active={false} onClick={() => editor.chain().focus().updateAttributes("image", { style: "display: block; margin: 1rem auto; max-width: 100%;" }).run()} title="Image center">
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton active={false} onClick={() => editor.chain().focus().updateAttributes("image", { style: "float: right; margin: 0 0 0.5rem 1rem; max-width: 50%;" }).run()} title="Image float right">
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>

        {/* Image insert */}
        <MediaPicker
          onSelect={(url) => editor.chain().focus().setImage({ src: url }).run()}
          trigger={
            <button type="button" title="Insert image" className="inline-flex items-center justify-center rounded p-1.5 text-sm hover:bg-muted transition-colors">
              <ImageIcon className="h-4 w-4" />
            </button>
          }
        />

        <Sep />

        {/* Clear formatting */}
        <ToolbarButton active={false} onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear formatting">
          <RemoveFormatting className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Editor content */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-3 min-h-[150px] focus-within:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_img]:rounded-lg [&_.ProseMirror_img]:cursor-pointer [&_.ProseMirror_.image-resizer]:inline-block [&_.ProseMirror]:after:content-[''] [&_.ProseMirror]:after:table [&_.ProseMirror]:after:clear-both"
      />

      {/* Link URL Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{linkUrl ? "Edit Link" : "Add Link"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>URL</Label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                onKeyDown={(e) => e.key === "Enter" && applyLink()}
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={applyLink} className="flex-1">
                {linkUrl ? "Apply" : "Remove Link"}
              </Button>
              <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Vertical separator between toolbar groups */
function Sep() {
  return <span className="w-px h-5 bg-border mx-0.5 shrink-0" />;
}

function ToolbarButton({ children, active, onClick, title }: { children: React.ReactNode; active: boolean; onClick: () => void; title: string }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn("inline-flex items-center justify-center rounded p-1.5 text-sm transition-colors", active ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground")}
    >
      {children}
    </button>
  );
}
