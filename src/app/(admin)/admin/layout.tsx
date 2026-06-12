import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { QueryProvider } from "@/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

type Role = "OWNER" | "ADMIN" | "EDITOR";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection(); // signals intentional per-request rendering (reads session cookie)
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  const role = session.user.role as Role;
  const userEmail = session.user.email;
  const userName = session.user.name ?? undefined;

  return (
    <QueryProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex md:w-60 md:flex-col border-r bg-background shrink-0">
          <AdminSidebar role={role} userName={userName} userEmail={userEmail} />
        </aside>

        {/* Mobile sidebar */}
        <Sheet>
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Mobile top bar */}
            <header className="md:hidden flex h-14 items-center border-b px-4 gap-3">
                  <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open menu" />}>
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <span className="font-bold text-sm">VRAMAN ADMIN</span>
            </header>

            {/* Page content */}
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>

          <SheetContent side="left" className="p-0 w-60">
            <AdminSidebar role={role} userName={userName} userEmail={userEmail} />
          </SheetContent>
        </Sheet>
      </div>
      <Toaster richColors position="top-right" />
    </QueryProvider>
  );
}
