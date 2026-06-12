import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cloudinary } from "@/lib/cloudinary";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "24"));
  const folder = searchParams.get("folder") ?? undefined;

  const [assets, total] = await Promise.all([
    db.mediaAsset.findMany({
      where: folder ? { folder } : undefined,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.mediaAsset.count({
      where: folder ? { folder } : undefined,
    }),
  ]);

  return NextResponse.json({ assets, total, page, limit });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;
  if (role !== "OWNER" && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { publicId } = (await req.json()) as { publicId: string };
  if (!publicId) return NextResponse.json({ error: "publicId required" }, { status: 400 });

  await cloudinary.uploader.destroy(publicId);
  await db.mediaAsset.delete({ where: { publicId } });

  return NextResponse.json({ success: true });
}
