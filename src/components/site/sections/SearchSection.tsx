"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Sparkles } from "lucide-react";

interface SearchData {
  placeholder?: string;
  title?: string;
  subtitle?: string;
}

export function SearchSection({ data }: { data: SearchData }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/packages?q=${encodeURIComponent(q)}`);
  }

  return (
    <section className="relative -mt-8 z-20 pb-8">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-6 sm:p-8 shadow-xl">
          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-primary mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              {data.title ?? "Looking for the perfect trip?"}
            </div>
            <p className="text-sm text-muted-foreground">
              {data.subtitle ?? "Search by destination, package name, or trip type"}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.currentTarget.value)}
                placeholder={data.placeholder ?? "Where do you want to go?"}
                className="pl-9 h-11"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-11 px-6 gap-2 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
