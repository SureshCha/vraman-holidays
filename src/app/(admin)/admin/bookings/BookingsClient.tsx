"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Download } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { updateBookingStatus } from "./actions";
import { toCsv, downloadCsv } from "@/lib/csv";
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

function exportToCsv(rows: BookingRow[]) {
  const csv = toCsv(
    ["Ref", "Traveller", "Email", "Package", "Status", "Payment", "Amount", "Currency", "Date"],
    rows.map((r) => [
      r.bookingRef,
      r.primaryName,
      r.primaryEmail,
      r.packageTitle,
      r.status,
      r.paymentStatus ?? "",
      (r.totalAmount / 100).toFixed(2),
      r.currency,
      format(new Date(r.createdAt), "yyyy-MM-dd"),
    ]),
  );
  downloadCsv(`bookings-${format(new Date(), "yyyy-MM-dd")}.csv`, csv);
}

export function BookingsClient({ bookings: initial }: { bookings: BookingRow[] }) {
  const [bookings, setBookings] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const router = useRouter();

  const filteredBookings = useMemo(() => {
    if (statusFilter === "ALL") return bookings;
    return bookings.filter((b) => b.status === statusFilter);
  }, [bookings, statusFilter]);

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

  return (
    <div className="space-y-4">
      {/* Filters + Export */}
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
          <SelectTrigger className="w-40 h-9 text-sm">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {Object.values(BookingStatus).map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => exportToCsv(filteredBookings)}
          disabled={filteredBookings.length === 0}
        >
          <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={filteredBookings}
        searchKey="primaryName"
        searchPlaceholder="Search by traveller name…"
      />
    </div>
  );
}
