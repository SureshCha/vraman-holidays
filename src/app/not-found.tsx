import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/"><Button>Back to Home</Button></Link>
        <Link href="/destinations"><Button variant="outline">Browse Destinations</Button></Link>
      </div>
    </main>
  );
}
