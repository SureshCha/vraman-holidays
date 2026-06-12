"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@/generated/prisma/enums";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.nativeEnum(Role),
});

export async function createUser(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (session?.user.role !== "OWNER") {
    return { success: false, error: "Only Owners can create users" };
  }

  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { success: false, error: "Email already in use" };

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role,
    },
  });

  revalidatePath("/admin/users");
  return { success: true, data: { id: user.id } };
}

export async function updateUserRole(
  id: string,
  role: Role
): Promise<ActionResult> {
  const session = await auth();
  if (session?.user.role !== "OWNER") {
    return { success: false, error: "Only Owners can change roles" };
  }
  if (session.user.id === id) {
    return { success: false, error: "You cannot change your own role" };
  }

  await db.user.update({ where: { id }, data: { role } });
  revalidatePath("/admin/users");
  return { success: true, data: undefined };
}

export async function deleteUser(id: string): Promise<ActionResult> {
  const session = await auth();
  if (session?.user.role !== "OWNER") {
    return { success: false, error: "Only Owners can delete users" };
  }
  if (session.user.id === id) {
    return { success: false, error: "You cannot delete yourself" };
  }

  await db.user.delete({ where: { id } });
  revalidatePath("/admin/users");
  return { success: true, data: undefined };
}
