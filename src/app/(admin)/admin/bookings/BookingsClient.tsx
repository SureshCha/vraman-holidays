"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { updateBookingStatus } from "./actions";
import { BookingStatus, PaymentStatus } from "@/generated/prisma/enums";

interface BookingRow {
  id: string;
  bookingRef: string;
  packageTitle: string;
  primaryName: string;
  primaryEmail: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus | null;
  totalAmount: number;
  currency: string;
  createdAt: string;
}

const STATUS_COLORS: Record<BookingStatus, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING:   "secondary",
  CONFIRMED: "default",
  CANCELLED: "destructive",
  COMPLETED: "outline",
};

export function BookingsClient({ bookings: initial }: { bookings: BookingRow[] }) {
  const [bookings, setBookings] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleStatusChange(id: string, status: BookingStatus) {
    startTransition(async () => {
      const result = await updateBookingStatus(id, status);
      if (result.success) {
        setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
        toast.success("Status updated");
      } else {
        toast.error(result.error);
      }
    });
  }

  const columns: ColumnDef<BookingRow>[] = [
    {
      accessorKey: "bookingRef",
      header: "Ref",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.bookingRef}</span>,
    },
    {
      accessorKey: "primaryName",
      header: "Traveller",
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium">{row.original.primaryName}</p>
          <p className="text-xs text-muted-foreground">{row.original.primaryEmail}</p>
        </div>
      ),
    },
    {
      accessorKey: "packageTitle",
      header: "Package",
      cell: ({ row }) => <span className="text-sm">{row.original.packageTitle}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Select
          value={row.original.status}
          onValueChange={(v) => v && handleStatusChange(row.original.id, (v ?? row.original.status) as BookingStatus)}
          disabled={isPending}
        >
          <SelectTrigger className="w-32 h-7 text-xs">
            <SelectValue>
              <Badge variant={STATUS_COLORS[row.original.status]} className="text-xs">
                {row.original.status}
              </Badge>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.values(BookingStatus).map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => row.original.paymentStatus ? (
        <Badge variant={row.original.paymentStatus === "SUCCESS" ? "default" : "secondary"} className="text-xs">
          {row.original.paymentStatus}
        </Badge>
      ) : <span className="text-xs text-muted-foreground">—</span>,
    },
    {
      accessorKey: "totalAmount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {row.original.currency} {(row.original.totalAmount / 100).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {format(new Date(row.original.createdAt), "dd MMM yy")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => router.push(`/admin/bookings/${row.original.id}`)}>
          <Eye className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];

  return <DataTable columns={columns} data={bookings} searchKey="primaryName" searchPlaceholder="Search by traveller name…" />;
}
