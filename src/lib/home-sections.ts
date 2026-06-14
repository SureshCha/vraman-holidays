import "server-only";
import { db } from "@/lib/db";

/**
 * Homepage sections, read live from the DB.
 *
 * Deliberately NOT wrapped in `"use cache"`: the home page renders dynamically
 * (`await connection()`), and a cached result here previously got stuck serving
 * an empty list in production — the entry was cached before any sections
 * existed and then survived redeploys via Vercel's restored build cache. A
 * direct read keeps the public homepage in sync with the admin editor.
 */
export async function getHomeSections() {
  return db.homeSection.findMany({
    where: { visible: true },
    orderBy: { order: "asc" },
  });
}
