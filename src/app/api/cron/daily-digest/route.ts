import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { sendDailyDigest } from "@/lib/email/send";

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await sendDailyDigest();
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Daily digest failed:", e);
    return NextResponse.json({ error: "Failed to send digest" }, { status: 500 });
  }
}
