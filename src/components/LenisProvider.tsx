"use client";

import { useEffect } from "react";

/**
 * Lenis smooth scrolling provider. Wraps the app to give buttery-smooth,
 * momentum-based scrolling. Automatically disabled when the user prefers
 * reduced motion.
 */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf: number;
    let lenis: InstanceType<typeof import("lenis").default> | null = null;

    import("lenis").then(({ default: Lenis }) => {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => 1 - Math.pow(1 - t, 4), // easeOutQuart
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
      });

      function animate(time: number) {
        lenis?.raf(time);
        raf = requestAnimationFrame(animate);
      }
      raf = requestAnimationFrame(animate);
    });

    return () => {
      cancelAnimationFrame(raf);
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
}
