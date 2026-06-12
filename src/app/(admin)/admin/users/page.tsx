import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { UsersClient } from "./UsersClient";

export default async function UsersPage() {
  await connection();
  const session = await auth();
  if (session?.user.role !== "OWNER") notFound();

  const users = await db.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground text-sm">
          Manage admin panel access. Only Owners can add or remove users.
        </p>
      </div>
      <UsersClient
        users={users.map((u) => ({
          ...u,
          createdAt: u.createdAt.toISOString(),
        }))}
        currentUserId={session.user.id}
      />
    </div>
  );
}
