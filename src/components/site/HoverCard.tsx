"use client";

import { motion } from "framer-motion";

interface Props {
  children: React.ReactNode;
  className?: string;
  /** Scale factor on hover (default 1.03) */
  scale?: number;
  /** Lift in pixels on hover (default -4) */
  lift?: number;
}

/**
 * Wraps any element with a subtle hover micro-interaction:
 * slight scale-up + lift + shadow deepening.
 */
export function HoverCard({ children, className, scale = 1.03, lift = -4 }: Props) {
  return (
    <motion.div
      className={className}
      whileHover={{ scale, y: lift }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}
