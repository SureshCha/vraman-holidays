import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const saveSchema = z.object({
  publicId: z.string(),
  url: z.string().url(),
  format: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  bytes: z.number().optional(),
  folder: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const asset = await db.mediaAsset.upsert({
    where: { publicId: parsed.data.publicId },
    update: {},
    create: {
      publicId: parsed.data.publicId,
      url: parsed.data.url,
      format: parsed.data.format,
      width: parsed.data.width,
      height: parsed.data.height,
      bytes: parsed.data.bytes,
      folder: parsed.data.folder,
      tags: parsed.data.tags ?? [],
      uploadedById: session.user.id,
    },
  });

  return NextResponse.json(asset, { status: 201 });
}
