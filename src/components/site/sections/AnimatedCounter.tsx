"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

/**
 * Animates a number from 0 to the target when scrolled into view.
 * Accepts a string like "5000+", "98%", "150" — splits the numeric part
 * from the suffix and counts up over ~2 seconds.
 */
export function AnimatedCounter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState("0");

  // Parse: "5000+" → target=5000, suffix="+"
  const match = value.match(/^([\d,]+)(.*)/);
  const target = match?.[1] ? parseInt(match[1].replace(/,/g, ""), 10) : 0;
  const suffix = match?.[2] ?? value;

  useEffect(() => {
    if (!isInView || target === 0) {
      if (target === 0) setDisplay(value);
      return;
    }

    const duration = 2000; // ms
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(eased * target);
      setDisplay(current.toLocaleString() + suffix);
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [isInView, target, suffix, value]);

  return <span ref={ref}>{display}</span>;
}
