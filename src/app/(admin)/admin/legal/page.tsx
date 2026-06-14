import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default async function LegalPagesAdmin() {
  await connection();
  const session = await auth();
  if (!session || (session.user.role !== "OWNER" && session.user.role !== "ADMIN")) notFound();

  const pages = await db.legalPage.findMany({ orderBy: { slug: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Legal Pages</h1>
        <p className="text-muted-foreground text-sm">Edit terms, privacy policy, and refund policy.</p>
      </div>

      <div className="border rounded-lg divide-y">
        {pages.map((page) => (
          <Link
            key={page.id}
            href={`/admin/legal/${page.slug}`}
            className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div>
              <p className="font-medium text-sm">{page.title}</p>
              <p className="text-xs text-muted-foreground">/legal/{page.slug}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs">
                Updated {format(page.updatedAt, "dd MMM yyyy")}
              </Badge>
              <span className="text-xs text-primary">Edit &rarr;</span>
            </div>
          </Link>
        ))}
        {pages.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">
            No legal pages found. Run the seed to create default pages.
          </p>
        )}
      </div>
    </div>
  );
}
