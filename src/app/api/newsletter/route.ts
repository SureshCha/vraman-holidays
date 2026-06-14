import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod/v4";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const schema = z.object({ email: z.email() });

export async function POST(req: NextRequest) {
  if (!checkRateLimit(`newsletter:${clientIp(req)}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }

  const { email } = parsed.data;

  // Check if already subscribed
  const existing = await db.newsletterSubscriber.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ message: "You are already subscribed!" });
  }

  await db.newsletterSubscriber.create({ data: { email } });
  return NextResponse.json({ message: "Successfully subscribed!" }, { status: 201 });
}
