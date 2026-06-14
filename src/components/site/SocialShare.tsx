"use client";

import { Share2, Mail, MessageCircle, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SocialShareProps {
  url: string;
  title: string;
}

export function SocialShare({ url, title }: SocialShareProps) {
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    { label: "WhatsApp", icon: MessageCircle, href: `https://wa.me/?text=${encodedTitle}%20${encoded}`, color: "hover:text-[#25D366]" },
    { label: "Facebook", icon: Globe, href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`, color: "hover:text-[#1877F2]" },
    { label: "Twitter", icon: Share2, href: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`, color: "hover:text-[#1DA1F2]" },
    { label: "Email", icon: Mail, href: `mailto:?subject=${encodedTitle}&body=${encoded}`, color: "hover:text-foreground" },
  ];

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-muted-foreground mr-1">Share:</span>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${link.label}`}
        >
          <Button variant="ghost" size="icon" className={`h-8 w-8 ${link.color}`}>
            <link.icon className="h-4 w-4" />
          </Button>
        </a>
      ))}
    </div>
  );
}
