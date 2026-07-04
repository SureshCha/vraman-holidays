"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface Props {
  children: React.ReactNode[];
  className?: string;
  /** Delay between each child animation in seconds */
  staggerDelay?: number;
}

/**
 * Wraps children in a staggered reveal animation — each child fades in
 * and slides up one after another as the container scrolls into view.
 */
export function StaggeredGrid({ children, className, staggerDelay = 0.08 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div ref={ref} className={className}>
      {children.map((child, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.4, delay: i * staggerDelay, ease: "easeOut" }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}
