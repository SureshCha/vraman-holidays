"use client";

import { useCompare } from "@/lib/hooks/useCompare";
import { Button } from "@/components/ui/button";
import { PlusCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  packageId: string;
  packageTitle: string;
}

export function CompareButton({ packageId, packageTitle }: Props) {
  const { has, add, remove } = useCompare();
  const inCompare = has(packageId);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (inCompare) {
      remove(packageId);
      toast.info("Removed from comparison");
    } else {
      const ok = add(packageId, packageTitle);
      if (!ok) {
        toast.error("You can compare up to 3 packages at a time");
      } else {
        toast.success("Added to comparison");
      }
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={inCompare ? "Remove from compare" : "Add to compare"}
      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border backdrop-blur-sm transition-colors ${
        inCompare
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background/80 text-foreground border-border hover:bg-muted"
      }`}
    >
      {inCompare ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : (
        <PlusCircle className="h-3 w-3" />
      )}
      {inCompare ? "Added" : "Compare"}
    </button>
  );
}
