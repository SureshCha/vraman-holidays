"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Site error:", error);
  }, [error]);

  return (
    <main className="container mx-auto px-4 py-24 text-center max-w-lg space-y-6">
      <div className="flex justify-center">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
      </div>
      <div>
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground mt-2">
          We&apos;re sorry — an unexpected error occurred. Please try again or contact us if the problem persists.
        </p>
      </div>
      <div className="flex justify-center gap-3">
        <Button onClick={reset} variant="outline">Try Again</Button>
        <Link href="/"><Button>Back to Home</Button></Link>
      </div>
    </main>
  );
}
