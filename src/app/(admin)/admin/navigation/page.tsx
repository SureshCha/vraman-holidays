import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { NavigationClient } from "./NavigationClient";

export default async function NavigationPage() {
  await connection();
  const session = await auth();
  if (!session || session.user.role === "EDITOR") notFound();

  const navItems = await db.navigation.findMany({ where: { parentId: null }, orderBy: { order: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Navigation</h1>
        <p className="text-muted-foreground text-sm">Manage header and footer menu links.</p>
      </div>
      <NavigationClient items={navItems} />
    </div>
  );
}
