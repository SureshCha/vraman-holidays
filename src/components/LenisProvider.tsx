"use client";

import { useEffect } from "react";

/**
 * Lenis smooth scrolling provider. Automatically recalculates scroll
 * height when the page content changes (image loads, accordion opens,
 * dynamic content). Disabled when the user prefers reduced motion.
 */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf: number;
    let lenis: InstanceType<typeof import("lenis").default> | null = null;
    let observer: ResizeObserver | null = null;

    import("lenis").then(({ default: Lenis }) => {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => 1 - Math.pow(1 - t, 4),
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
        prevent: (node: Element) =>
          node.hasAttribute("data-lenis-prevent") ||
          node.closest("[data-lenis-prevent]") !== null,
      });

      function animate(time: number) {
        lenis?.raf(time);
        raf = requestAnimationFrame(animate);
      }
      raf = requestAnimationFrame(animate);

      // Recalculate scroll height whenever body size changes
      // (image loads, accordion opens, dynamic content appears)
      observer = new ResizeObserver(() => lenis?.resize());
      observer.observe(document.body);

      // Safety net: recalculate after all resources finish loading
      window.addEventListener("load", () => lenis?.resize());
    });

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
}
