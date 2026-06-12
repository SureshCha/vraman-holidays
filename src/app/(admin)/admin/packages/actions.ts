"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";
import { ContentStatus } from "@/generated/prisma/enums";
import {
  packageDetailsSchema,
  packageSeoSchema,
  itineraryDaySchema,
  departureSchema,
} from "@/lib/validators/package";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

async function requireEditor() {
  const session = await auth();
  if (!session) return null;
  return session;
}

async function requireAdmin() {
  const session = await auth();
  if (!session) return null;
  if (session.user.role === "EDITOR") return null;
  return session;
}

// ─── Package CRUD ─────────────────────────────────────────────────────────────

export async function createPackage(input: unknown): Promise<ActionResult<{ id: string; slug: string }>> {
  const session = await requireEditor();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = packageDetailsSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid" };

  const existing = await db.package.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return { success: false, error: "Slug already in use" };

  const { tripTypeIds, ...rest } = parsed.data;
  const pkg = await db.package.create({
    data: {
      ...rest,
      tripTypes: { connect: tripTypeIds.map((id) => ({ id })) },
    },
  });

  revalidateTag("packages", "max");
  return { success: true, data: { id: pkg.id, slug: pkg.slug } };
}

export async function updatePackageDetails(id: string, input: unknown): Promise<ActionResult> {
  const session = await requireEditor();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = packageDetailsSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid" };

  const slugConflict = await db.package.findFirst({ where: { slug: parsed.data.slug, NOT: { id } } });
  if (slugConflict) return { success: false, error: "Slug already in use" };

  const { tripTypeIds, ...rest } = parsed.data;
  const pkg = await db.package.update({
    where: { id },
    data: {
      ...rest,
      tripTypes: { set: tripTypeIds.map((tid) => ({ id: tid })) },
    },
  });

  revalidateTag("packages", "max");
  revalidatePath(`/packages/${pkg.slug}`, "page");
  return { success: true, data: undefined };
}

export async function updatePackageSeo(id: string, input: unknown): Promise<ActionResult> {
  const session = await requireEditor();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = packageSeoSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid" };

  const pkg = await db.package.update({ where: { id }, data: parsed.data });

  revalidateTag("packages", "max");
  revalidatePath(`/packages/${pkg.slug}`, "page");
  revalidatePath("/destinations", "page");
  return { success: true, data: undefined };
}

export async function deletePackage(id: string): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Unauthorized" };

  const pkg = await db.package.findUnique({ where: { id } });
  if (!pkg) return { success: false, error: "Not found" };

  await db.package.delete({ where: { id } });
  revalidateTag("packages", "max");
  revalidatePath(`/packages/${pkg.slug}`, "page");
  return { success: true, data: undefined };
}

// ─── Itinerary ────────────────────────────────────────────────────────────────

export async function upsertItineraryDay(packageId: string, input: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await requireEditor();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = itineraryDaySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid" };

  const { id, ...data } = parsed.data;

  const day = id
    ? await db.itineraryDay.update({ where: { id }, data })
    : await db.itineraryDay.create({ data: { ...data, packageId } });

  revalidateTag("packages", "max");
  return { success: true, data: { id: day.id } };
}

export async function deleteItineraryDay(id: string): Promise<ActionResult> {
  const session = await requireEditor();
  if (!session) return { success: false, error: "Unauthorized" };

  await db.itineraryDay.delete({ where: { id } });
  revalidateTag("packages", "max");
  return { success: true, data: undefined };
}

export async function reorderItineraryDays(packageId: string, dayIds: string[]): Promise<ActionResult> {
  const session = await requireEditor();
  if (!session) return { success: false, error: "Unauthorized" };

  await Promise.all(
    dayIds.map((id, index) =>
      db.itineraryDay.update({ where: { id }, data: { dayNumber: index + 1 } })
    )
  );
  revalidateTag("packages", "max");
  return { success: true, data: undefined };
}

// ─── Departures ───────────────────────────────────────────────────────────────

export async function upsertDeparture(packageId: string, input: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await requireEditor();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = departureSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid" };

  const { id, departureDate, returnDate, ...rest } = parsed.data;

  const data = {
    ...rest,
    departureDate: new Date(departureDate),
    returnDate: new Date(returnDate),
  };

  const dep = id
    ? await db.packageDeparture.update({ where: { id }, data })
    : await db.packageDeparture.create({ data: { ...data, packageId } });

  revalidateTag("packages", "max");
  return { success: true, data: { id: dep.id } };
}

export async function deleteDeparture(id: string): Promise<ActionResult> {
  const session = await requireEditor();
  if (!session) return { success: false, error: "Unauthorized" };

  await db.packageDeparture.delete({ where: { id } });
  revalidateTag("packages", "max");
  return { success: true, data: undefined };
}
