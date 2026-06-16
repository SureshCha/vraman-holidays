import { Shield, RotateCcw, Headphones, BadgeCheck } from "lucide-react";

const badges = [
  { icon: Shield, label: "Secure Payment", description: "100% encrypted" },
  { icon: RotateCcw, label: "Free Cancellation", description: "Up to 48h before" },
  { icon: Headphones, label: "24/7 Support", description: "Always available" },
  { icon: BadgeCheck, label: "Best Price Guarantee", description: "We match any price" },
];

export function TrustBadges({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {badges.map((b) => (
          <div key={b.label} className="flex items-center gap-2 text-xs text-muted-foreground">
            <b.icon className="h-4 w-4 text-primary shrink-0" />
            <span>{b.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {badges.map((b) => (
        <div
          key={b.label}
          className="flex flex-col items-center text-center gap-2 p-4 rounded-xl border bg-card"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <b.icon className="h-5 w-5 text-primary" />
          </div>
          <p className="font-semibold text-sm">{b.label}</p>
          <p className="text-xs text-muted-foreground">{b.description}</p>
        </div>
      ))}
    </div>
  );
}
