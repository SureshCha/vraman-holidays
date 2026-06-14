import { NextResponse } from "next/server";
import { connection } from "next/server";
import { db } from "@/lib/db";

// TEMPORARY debug endpoint — remove after diagnosing the blank homepage.
export async function GET() {
  await connection();

  const dbHost = (() => {
    try {
      return new URL(process.env.DATABASE_URL ?? "").host;
    } catch {
      return "unparseable";
    }
  })();

  const [homeTotal, homeVisible, destinations] = await Promise.all([
    db.homeSection.count(),
    db.homeSection.count({ where: { visible: true } }),
    db.destination.count(),
  ]);

  return NextResponse.json({
    dbHost,
    homeSectionTotal: homeTotal,
    homeSectionVisible: homeVisible,
    destinationCount: destinations,
    now: new Date().toISOString(),
  });
}
