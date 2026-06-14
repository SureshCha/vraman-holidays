import "server-only";
import { cacheTag } from "next/cache";
import { db } from "@/lib/db";

export async function getHomeSections() {
  "use cache";
  cacheTag("home-sections");
  return db.homeSection.findMany({
    where: { visible: true },
    orderBy: { order: "asc" },
  });
}
