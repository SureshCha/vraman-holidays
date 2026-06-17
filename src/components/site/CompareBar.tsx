"use client";

import { useCompare } from "@/lib/hooks/useCompare";
import { getCompare } from "@/lib/compare";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function CompareBar() {
  const { ids, clear } = useCompare();
  const [titles, setTitles] = useState<string[]>([]);

  useEffect(() => {
    setTitles(getCompare().map((i) => i.title));
  }, [ids]);

  return (
    <AnimatePresence>
      {ids.length > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl mx-auto px-4"
        >
          <div className="rounded-2xl border bg-background/95 backdrop-blur shadow-2xl p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-medium mb-1">
                Comparing {ids.length} of 3
              </p>
              <p className="text-sm font-medium truncate">
                {titles.slice(0, 2).join(", ")}
                {titles.length > 2 && ` +${titles.length - 2} more`}
              </p>
            </div>
            <Link href="/compare">
              <Button size="sm" className="gap-1.5 shrink-0">
                Compare <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0 text-muted-foreground"
              onClick={clear}
              aria-label="Clear comparison"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
