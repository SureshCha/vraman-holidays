import "server-only";
import { auth } from "@/lib/auth";

/**
 * Shared RBAC helpers for admin server actions, so authorization rules live in
 * one place. Each returns the session when the role is sufficient, else null.
 * Role hierarchy: OWNER > ADMIN > EDITOR.
 */

/** Any signed-in admin-panel user (EDITOR or above). */
export async function requireEditor() {
  const session = await auth();
  if (!session) return null;
  const role = session.user.role;
  if (role !== "OWNER" && role !== "ADMIN" && role !== "EDITOR") return null;
  return session;
}

/** OWNER or ADMIN (EDITORs excluded). */
export async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user.role !== "OWNER" && session.user.role !== "ADMIN")) {
    return null;
  }
  return session;
}

/** OWNER only. */
export async function requireOwner() {
  const session = await auth();
  if (!session || session.user.role !== "OWNER") return null;
  return session;
}
