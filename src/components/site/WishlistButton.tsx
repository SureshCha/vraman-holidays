"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/hooks/useWishlist";
import { toast } from "sonner";

interface Props {
  packageId: string;
  packageTitle?: string;
  className?: string;
}

export function WishlistButton({ packageId, packageTitle, className = "" }: Props) {
  const { has, add, remove } = useWishlist();
  const saved = has(packageId);

  function toggle(e: React.MouseEvent) {
    e.preventDefault(); // Don't navigate when inside a Link
    e.stopPropagation();
    if (saved) {
      remove(packageId);
      toast.success("Removed from wishlist");
    } else {
      add(packageId);
      toast.success(`${packageTitle ? `"${packageTitle}" saved` : "Saved"} to wishlist`);
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      className={`flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background transition-all ${className}`}
    >
      <Heart
        className={`h-4 w-4 transition-colors ${
          saved ? "fill-red-500 text-red-500" : "text-muted-foreground"
        }`}
      />
    </button>
  );
}
