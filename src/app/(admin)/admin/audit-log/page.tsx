import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default async function AuditLogPage() {
  await connection();
  const session = await auth();
  if (!session || session.user.role !== "OWNER") notFound();

  const logs = await db.auditLog.findMany({
    take: 200,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
        <p className="text-muted-foreground text-sm">Track admin actions across the system.</p>
      </div>

      {logs.length === 0 ? (
        <div className="border rounded-lg p-12 text-center text-muted-foreground">
          <p className="text-sm">No activity logged yet.</p>
        </div>
      ) : (
        <div className="border rounded-lg divide-y max-h-[70vh] overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="p-3 flex items-start gap-4 text-sm">
              <div className="shrink-0 text-xs text-muted-foreground w-32">
                {format(log.createdAt, "dd MMM yy HH:mm")}
              </div>
              <div className="shrink-0 w-32 truncate">
                <p className="text-xs font-medium">{log.user?.name ?? log.user?.email ?? "System"}</p>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{log.entity}</Badge>
                  <span className="text-xs font-medium">{log.action}</span>
                </div>
                {log.entityId && (
                  <p className="text-xs text-muted-foreground mt-0.5 font-mono">{log.entityId}</p>
                )}
                {log.details && (
                  <pre className="text-xs text-muted-foreground mt-1 bg-muted/30 rounded p-1.5 overflow-x-auto max-w-lg">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
