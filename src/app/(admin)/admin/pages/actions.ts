"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { revalidateTag, revalidatePath } from "next/cache";
import { SectionType, ContentStatus } from "@/generated/prisma/enums";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

const validTypes = new Set(Object.values(SectionType));

// ─── Page CRUD ───────────────────────────────────────────────────────────────

export async function createPage(data: {
  title: string;
  slug: string;
}): Promise<ActionResult<{ id: string }>> {
  if (!(await requireAdmin())) return { success: false, error: "Unauthorized" };

  if (!data.title.trim()) return { success: false, error: "Title is required" };
  if (!data.slug.trim()) return { success: false, error: "Slug is required" };

  const slug = data.slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const existing = await db.page.findUnique({ where: { slug } });
  if (existing) return { success: false, error: "A page with this slug already exists" };

  const page = await db.page.create({
    data: {
      title: data.title.trim(),
      slug,
      status: ContentStatus.DRAFT,
    },
  });

  revalidateTag("pages", "max");
  return { success: true, data: { id: page.id } };
}

export async function updatePage(
  id: string,
  data: {
    title: string;
    slug: string;
    status: ContentStatus;
    metaTitle?: string;
    metaDescription?: string;
  }
): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, error: "Unauthorized" };

  const page = await db.page.findUnique({ where: { id } });
  if (!page) return { success: false, error: "Page not found" };

  const slug = data.slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  // Check slug uniqueness if changed
  if (slug !== page.slug) {
    const existing = await db.page.findUnique({ where: { slug } });
    if (existing) return { success: false, error: "A page with this slug already exists" };
  }

  await db.page.update({
    where: { id },
    data: {
      title: data.title.trim(),
      slug,
      status: data.status,
      metaTitle: data.metaTitle?.trim() || null,
      metaDescription: data.metaDescription?.trim() || null,
    },
  });

  revalidateTag("pages", "max");
  revalidatePath(`/${page.slug}`);
  if (slug !== page.slug) revalidatePath(`/${slug}`);
  return { success: true, data: undefined };
}

export async function deletePage(id: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, error: "Unauthorized" };

  const page = await db.page.findUnique({ where: { id } });
  if (!page) return { success: false, error: "Page not found" };

  await db.page.delete({ where: { id } });

  revalidateTag("pages", "max");
  revalidatePath(`/${page.slug}`);
  return { success: true, data: undefined };
}

// ─── PageSection CRUD ────────────────────────────────────────────────────────

export async function upsertPageSection(
  pageId: string,
  sectionId: string | null,
  input: { type: string; data: Record<string, unknown>; visible: boolean }
): Promise<ActionResult<{ id: string }>> {
  if (!(await requireAdmin())) return { success: false, error: "Unauthorized" };

  if (!validTypes.has(input.type as SectionType)) {
    return { success: false, error: "Invalid section type" };
  }

  const page = await db.page.findUnique({ where: { id: pageId } });
  if (!page) return { success: false, error: "Page not found" };

  const prismaData = {
    type: input.type as SectionType,
    data: input.data as never,
    visible: input.visible,
  };

  let section;
  if (sectionId) {
    section = await db.pageSection.update({
      where: { id: sectionId },
      data: prismaData,
    });
  } else {
    const count = await db.pageSection.count({ where: { pageId } });
    section = await db.pageSection.create({
      data: { ...prismaData, pageId, order: count },
    });
  }

  revalidateTag("pages", "max");
  revalidatePath(`/${page.slug}`);
  return { success: true, data: { id: section.id } };
}

export async function deletePageSection(id: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, error: "Unauthorized" };

  const section = await db.pageSection.findUnique({
    where: { id },
    include: { page: { select: { slug: true } } },
  });
  if (!section) return { success: false, error: "Section not found" };

  await db.pageSection.delete({ where: { id } });

  revalidateTag("pages", "max");
  revalidatePath(`/${section.page.slug}`);
  return { success: true, data: undefined };
}

export async function reorderPageSections(
  pageId: string,
  ids: string[]
): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, error: "Unauthorized" };

  const page = await db.page.findUnique({ where: { id: pageId } });
  if (!page) return { success: false, error: "Page not found" };

  await Promise.all(
    ids.map((id, i) =>
      db.pageSection.update({ where: { id }, data: { order: i } })
    )
  );

  revalidateTag("pages", "max");
  revalidatePath(`/${page.slug}`);
  return { success: true, data: undefined };
}
