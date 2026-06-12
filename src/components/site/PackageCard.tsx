import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";

interface PackageCardProps {
  package: {
    id: string;
    slug: string;
    title: string;
    subtitle?: string | null;
    coverImage?: string | null;
    durationDays: number;
    durationNights: number;
    priceFrom: number;
    currency: string;
    destinationName: string;
    tripTypeNames: string[];
  };
  variant?: "grid" | "featured";
}

export function PackageCard({ package: pkg, variant = "grid" }: PackageCardProps) {
  const price = (pkg.priceFrom / 100).toLocaleString();

  return (
    <Link href={`/packages/${pkg.slug}`} className="group block rounded-xl overflow-hidden border bg-card hover:shadow-md transition-shadow">
      <div className={`relative overflow-hidden bg-muted ${variant === "featured" ? "h-52" : "h-44"}`}>
        {pkg.coverImage ? (
          <Image
            src={pkg.coverImage}
            alt={pkg.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes={variant === "featured" ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
        )}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {pkg.tripTypeNames.slice(0, 2).map((name) => (
            <Badge key={name} variant="secondary" className="text-xs bg-background/80 backdrop-blur-sm">{name}</Badge>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">{pkg.title}</h3>
          <span className="shrink-0 text-sm font-bold text-primary">
            {pkg.currency} {price}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{pkg.destinationName}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{pkg.durationDays}D/{pkg.durationNights}N</span>
        </div>
      </div>
    </Link>
  );
}
