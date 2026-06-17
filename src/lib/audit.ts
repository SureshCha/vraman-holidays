import { db } from "@/lib/db";

/**
 * Log an admin action for auditing. Fire-and-forget — never throws.
 */
export function logAction(
  userId: string | null,
  action: string,
  entity: string,
  entityId?: string,
  details?: Record<string, unknown>
): void {
  db.auditLog
    .create({
      data: {
        userId,
        action,
        entity,
        entityId: entityId ?? null,
        details: details as never ?? null,
      },
    })
    .catch((e) => console.error("Audit log failed:", e));
}
