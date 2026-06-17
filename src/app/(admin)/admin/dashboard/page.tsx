import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { connection } from "next/server";
import { BookingStatus } from "@/generated/prisma/enums";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";

export default async function DashboardPage() {
  await connection();
  const session = await auth();

  const now = new Date();

  const [
    totalBookings,
    pendingBookings,
    confirmedBookings,
    totalEnquiries,
    revenueAgg,
    revenueByGateway,
    upcomingDepartures,
    recentBookings,
  ] = await Promise.all([
    db.booking.count(),
    db.booking.count({ where: { status: BookingStatus.PENDING } }),
    db.booking.count({ where: { status: BookingStatus.CONFIRMED } }),
    db.enquiry.count({ where: { read: false } }),
    db.paymentTransaction.aggregate({
      where: { status: "SUCCESS" },
      _sum: { amount: true },
    }),
    db.paymentTransaction.groupBy({
      by: ["gateway"],
      where: { status: "SUCCESS" },
      _sum: { amount: true },
    }),
    db.packageDeparture.findMany({
      where: { departureDate: { gte: now } },
      take: 5,
      orderBy: { departureDate: "asc" },
      include: { package: { select: { title: true, slug: true } } },
    }),
    db.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        package: { select: { title: true } },
        travellers: { where: { isPrimary: true }, take: 1 },
      },
    }),
  ]);

  const totalRevenue = revenueAgg._sum.amount ?? 0;

  const GATEWAY_COLORS: Record<string, string> = {
    ESEWA: "bg-green-500",
    KHALTI: "bg-purple-500",
    STRIPE: "bg-blue-500",
    BANK_TRANSFER: "bg-amber-500",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user.name ?? session?.user.email}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalBookings}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-amber-600">{pendingBookings}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-600">{confirmedBookings}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unread Enquiries</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalEnquiries}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">NPR {(totalRevenue / 100).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Gateway */}
      {revenueByGateway.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue by Gateway</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              {revenueByGateway.map((g) => (
                <div key={g.gateway} className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${GATEWAY_COLORS[g.gateway] ?? "bg-gray-400"}`} />
                  <span className="text-sm">
                    {g.gateway.replace("_", " ")}:{" "}
                    <span className="font-semibold">NPR {((g._sum.amount ?? 0) / 100).toLocaleString()}</span>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Two-column: Departures + Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Departures</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDepartures.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming departures.</p>
            ) : (
              <div className="space-y-2">
                {upcomingDepartures.map((d) => (
                  <div key={d.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium text-sm">{d.package.title}</p>
                      <p className="text-xs text-muted-foreground">{format(d.departureDate, "dd MMM yyyy")}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {d.maxSeats - d.bookedSeats} seats left
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bookings yet.</p>
            ) : (
              <div className="space-y-2">
                {recentBookings.map((b) => {
                  const t = b.travellers[0];
                  return (
                    <Link key={b.id} href={`/admin/bookings/${b.id}`} className="flex items-center justify-between text-sm border-b pb-2 last:border-0 hover:bg-muted/50 -mx-1 px-1 rounded">
                      <div>
                        <p className="font-medium text-sm">{t ? `${t.firstName} ${t.lastName}` : b.bookingRef}</p>
                        <p className="text-xs text-muted-foreground">{b.package.title}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={b.status === "CONFIRMED" ? "default" : "secondary"} className="text-xs">{b.status}</Badge>
                        <p className="text-xs text-muted-foreground mt-0.5">{format(b.createdAt, "dd MMM")}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
