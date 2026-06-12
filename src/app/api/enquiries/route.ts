import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactSchema, proposeSchema } from "@/lib/validators/enquiry";
import { sendEnquiryAck, sendAdminNotification } from "@/lib/email/send";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json();
  const type = body.type === "PROPOSE" ? "PROPOSE" : "CONTACT";
  const schema = type === "PROPOSE" ? proposeSchema : contactSchema;
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid" }, { status: 400 });
  }

  const enquiry = await db.enquiry.create({
    data: {
      type,
      ...parsed.data,
    },
  });

  sendEnquiryAck(enquiry.id).catch(() => {});
  sendAdminNotification("enquiry", enquiry.id).catch(() => {});

  return NextResponse.json({ success: true }, { status: 201 });
}
