"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { deletePackage } from "./actions";
import { ContentStatus } from "@/generated/prisma/enums";

interface PackageRow {
  id: string;
  slug: string;
  title: string;
  destinationName: string;
  status: ContentStatus;
  durationDays: number;
  priceFrom: number;
  currency: string;
  featured: boolean;
  coverImage: string;
}

export function PackagesClient({ packages: initial }: { packages: PackageRow[] }) {
  const router = useRouter();
  const [packages, setPackages] = useState(initial);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deletePackage(id);
      if (result.success) {
        setPackages((prev) => prev.filter((p) => p.id !== id));
        toast.success("Package deleted");
      } else {
        toast.error(result.error);
      }
    });
  }

  const columns: ColumnDef<PackageRow>[] = [
    {
      id: "cover",
      header: "",
      cell: ({ row }) => (
        <div className="h-10 w-14 rounded overflow-hidden bg-muted shrink-0">
          {row.original.coverImage ? (
            <Image src={row.original.coverImage} alt={row.original.title} width={56} height={40} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-4 w-4 text-muted-foreground" /></div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm">{row.original.title}</p>
          <p className="text-xs text-muted-foreground">{row.original.destinationName}</p>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "PUBLISHED" ? "default" : "secondary"} className="text-xs">
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "durationDays",
      header: "Duration",
      cell: ({ row }) => <span className="text-sm">{row.original.durationDays}D</span>,
    },
    {
      accessorKey: "priceFrom",
      header: "From",
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {row.original.currency} {(row.original.priceFrom / 100).toLocaleString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => router.push(`/admin/packages/${row.original.id}/edit`)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <ConfirmDialog
            trigger={<Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>}
            title={`Delete "${row.original.title}"?`}
            description="All itinerary, gallery, and departure data will be removed."
            onConfirm={() => handleDelete(row.original.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => router.push("/admin/packages/new")}>
          <Plus className="h-4 w-4 mr-2" />New Package
        </Button>
      </div>
      <DataTable columns={columns} data={packages} searchKey="title" searchPlaceholder="Search packages…" />
    </div>
  );
}
