import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  await connection();
  const session = await auth();
  if (!session || session.user.role === "EDITOR") notFound();

  const settings = await db.siteSettings.findUnique({ where: { id: 1 } });
  if (!settings) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">Configure your site. Changes apply immediately — no deploy needed.</p>
      </div>
      <SettingsClient settings={settings} />
    </div>
  );
}
