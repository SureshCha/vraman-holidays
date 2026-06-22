"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  bio: string;
}

export function ExpandableBio({ bio }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [needsExpand, setNeedsExpand] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (el) {
      // Check if text is actually clamped (overflowing)
      setNeedsExpand(el.scrollHeight > el.clientHeight + 2);
    }
  }, [bio]);

  return (
    <div className="text-left">
      <p
        ref={textRef}
        className={`text-xs text-muted-foreground transition-all duration-300 ${
          expanded ? "" : "line-clamp-4"
        }`}
      >
        {bio}
      </p>
      {needsExpand && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-medium text-primary hover:underline mt-1"
        >
          {expanded ? "Read less ↑" : "Read more ↓"}
        </button>
      )}
    </div>
  );
}
