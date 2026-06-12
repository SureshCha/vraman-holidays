import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Payment Failed" };

export default function FailedPage() {
  return (
    <main className="container mx-auto px-4 py-16 max-w-lg text-center space-y-6">
      <div className="flex justify-center">
        <XCircle className="h-16 w-16 text-destructive" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">Payment Failed</h1>
        <p className="text-muted-foreground mt-1">
          Your payment could not be processed. No charges have been made.
        </p>
      </div>
      <div className="flex justify-center gap-3">
        <Link href="/destinations"><Button variant="outline">Browse Packages</Button></Link>
        <Link href="/propose"><Button>Contact Us</Button></Link>
      </div>
    </main>
  );
}
