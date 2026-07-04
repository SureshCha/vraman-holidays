"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface Props {
  children: React.ReactNode;
  /** How much slower the background moves (0 = no parallax, 0.5 = half speed) */
  speed?: number;
  className?: string;
}

/**
 * Scroll-linked parallax wrapper — the background content moves slower
 * than the foreground as the user scrolls, creating depth.
 * Disabled on mobile (< 768px) and when prefers-reduced-motion is set.
 */
export function ParallaxHero({ children, speed = 0.3, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isDesktop = window.innerWidth >= 768;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(isDesktop && !prefersReduced);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 100}%`]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className ?? ""}`}>
      {enabled ? (
        <motion.div className="absolute inset-0" style={{ y }}>
          {children}
        </motion.div>
      ) : (
        <div className="absolute inset-0">{children}</div>
      )}
    </div>
  );
}
