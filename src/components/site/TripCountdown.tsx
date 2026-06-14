"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface Props {
  departureDate: string;
}

function getTimeLeft(target: Date) {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  return { days, hours, minutes };
}

export function TripCountdown({ departureDate }: Props) {
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeLeft>>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const target = new Date(departureDate);
    setTimeLeft(getTimeLeft(target));

    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(target));
    }, 60000); // update every minute

    return () => clearInterval(interval);
  }, [departureDate]);

  if (!mounted || !timeLeft) return null;

  return (
    <div className="rounded-lg border bg-primary/5 p-4 space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Clock className="h-4 w-4 text-primary" />
        <span>Countdown to Your Trip</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-md bg-background p-2">
          <p className="text-2xl font-bold text-primary">{timeLeft.days}</p>
          <p className="text-xs text-muted-foreground">Days</p>
        </div>
        <div className="rounded-md bg-background p-2">
          <p className="text-2xl font-bold text-primary">{timeLeft.hours}</p>
          <p className="text-xs text-muted-foreground">Hours</p>
        </div>
        <div className="rounded-md bg-background p-2">
          <p className="text-2xl font-bold text-primary">{timeLeft.minutes}</p>
          <p className="text-xs text-muted-foreground">Minutes</p>
        </div>
      </div>
    </div>
  );
}
