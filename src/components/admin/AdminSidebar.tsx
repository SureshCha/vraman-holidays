"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  MapPin,
  BookOpen,
  Star,
  MessageSquare,
  ShoppingBag,
  Home,
  FileText,
  Navigation,
  Image,
  Settings,
  Users,
} from "lucide-react";

type Role = "OWNER" | "ADMIN" | "EDITOR";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
        roles: ["OWNER", "ADMIN", "EDITOR"],
      },
    ],
  },
  {
    title: "Content",
    items: [
      {
        label: "Packages",
        href: "/admin/packages",
        icon: Package,
        roles: ["OWNER", "ADMIN", "EDITOR"],
      },
      {
        label: "Destinations",
        href: "/admin/destinations",
        icon: MapPin,
        roles: ["OWNER", "ADMIN", "EDITOR"],
      },
      {
        label: "Blog",
        href: "/admin/blog",
        icon: BookOpen,
        roles: ["OWNER", "ADMIN", "EDITOR"],
      },
      {
        label: "Testimonials",
        href: "/admin/testimonials",
        icon: Star,
        roles: ["OWNER", "ADMIN", "EDITOR"],
      },
      {
        label: "Enquiries",
        href: "/admin/enquiries",
        icon: MessageSquare,
        roles: ["OWNER", "ADMIN", "EDITOR"],
      },
    ],
  },
  {
    title: "Commerce",
    items: [
      {
        label: "Bookings",
        href: "/admin/bookings",
        icon: ShoppingBag,
        roles: ["OWNER", "ADMIN"],
      },
    ],
  },
  {
    title: "Site",
    items: [
      {
        label: "Homepage",
        href: "/admin/homepage",
        icon: Home,
        roles: ["OWNER", "ADMIN"],
      },
      {
        label: "Pages",
        href: "/admin/pages",
        icon: FileText,
        roles: ["OWNER", "ADMIN"],
      },
      {
        label: "Navigation",
        href: "/admin/navigation",
        icon: Navigation,
        roles: ["OWNER", "ADMIN"],
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Media",
        href: "/admin/media",
        icon: Image,
        roles: ["OWNER", "ADMIN", "EDITOR"],
      },
      {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
        roles: ["OWNER", "ADMIN"],
      },
      {
        label: "Users",
        href: "/admin/users",
        icon: Users,
        roles: ["OWNER"],
      },
    ],
  },
];

interface AdminSidebarProps {
  role: Role;
  userName?: string;
  userEmail: string;
}

export function AdminSidebar({ role, userName, userEmail }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/admin/dashboard" className="font-bold text-sm tracking-tight">
          VRAMAN ADMIN
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) =>
            item.roles.includes(role)
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title}>
              <p className="px-2 mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.title}
              </p>
              <ul className="space-y-0.5">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin/dashboard" &&
                      pathname.startsWith(item.href));

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t p-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
            {(userName ?? userEmail)[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{userName ?? userEmail}</p>
            <p className="text-xs text-muted-foreground">{role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
