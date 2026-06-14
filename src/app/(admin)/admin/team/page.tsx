import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { TeamClient } from "./TeamClient";

export default async function TeamAdminPage() {
  await connection();
  const session = await auth();
  if (!session || (session.user.role !== "OWNER" && session.user.role !== "ADMIN")) notFound();

  const members = await db.teamMember.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team</h1>
        <p className="text-muted-foreground text-sm">Manage team members displayed on the About page.</p>
      </div>
      <TeamClient members={members} />
    </div>
  );
}
