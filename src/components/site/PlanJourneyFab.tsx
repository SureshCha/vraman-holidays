import Link from "next/link";
import { Compass } from "lucide-react";

/**
 * Floating "Let's Plan Your Journey" call-to-action — fixed top-right, just
 * below the header so it clears the menu icons. Hidden on the smallest screens,
 * where the mobile menu already carries the CTA.
 */
export function PlanJourneyFab() {
  return (
    <Link
      href="/contact"
      className="fixed top-20 right-5 z-40 hidden sm:inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg ring-1 ring-black/5 transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl"
    >
      <Compass className="h-4 w-4" />
      Let&apos;s Plan Your Journey
    </Link>
  );
}
