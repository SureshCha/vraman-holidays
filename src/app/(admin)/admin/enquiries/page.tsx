import { connection } from "next/server";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default async function EnquiriesPage() {
  await connection();
  const enquiries = await db.enquiry.findMany({ orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Enquiries</h1>
        <p className="text-muted-foreground text-sm">Contact and "Propose Your Trip" submissions.</p>
      </div>
      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Message</th>
              <th className="text-left px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {enquiries.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No enquiries yet.</td></tr>}
            {enquiries.map((e) => (
              <tr key={e.id} className={`hover:bg-muted/20 ${!e.read ? "bg-primary/5" : ""}`}>
                <td className="px-4 py-3 font-medium">{e.name}</td>
                <td className="px-4 py-3"><Badge variant={e.type === "PROPOSE" ? "default" : "secondary"} className="text-xs">{e.type}</Badge></td>
                <td className="px-4 py-3 text-muted-foreground">{e.email}</td>
                <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{e.message}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{format(e.createdAt, "dd MMM yy")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
