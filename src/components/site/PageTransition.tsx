"use client";

import { motion } from "framer-motion";

/**
 * Subtle enter fade for page content. Triggers once on mount — each
 * route renders a fresh instance of the site layout so this fires on
 * every navigation. Avoids usePathname() which conflicts with Next.js 16
 * Cache Components when used outside <Suspense>.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
