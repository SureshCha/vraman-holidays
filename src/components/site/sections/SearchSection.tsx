"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchData {
  placeholder?: string;
}

export function SearchSection({ data }: { data: SearchData }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/destinations?q=${encodeURIComponent(q)}`);
  }

  return (
    <section className="container mx-auto px-4 py-10">
      <form onSubmit={handleSubmit} className="mx-auto max-w-xl flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={data.placeholder ?? "Where do you want to go?"}
          className="flex-1"
        />
        <Button type="submit" size="icon" aria-label="Search">
          <Search className="h-4 w-4" />
        </Button>
      </form>
    </section>
  );
}
