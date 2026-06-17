import {
  Html, Head, Body, Container, Heading, Text, Section, Hr, Link,
} from "@react-email/components";

interface DigestBooking {
  bookingRef: string;
  packageTitle: string;
  totalAmount: string;
  currency: string;
}

interface DailyDigestProps {
  date: string;
  bookingsCount: number;
  enquiriesCount: number;
  totalRevenue: string;
  currency: string;
  recentBookings: DigestBooking[];
  brandName: string;
  adminUrl: string;
}

export function DailyDigest({
  date, bookingsCount, enquiriesCount, totalRevenue, currency,
  recentBookings, brandName, adminUrl,
}: DailyDigestProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f6f6f6", padding: "20px" }}>
        <Container style={{ backgroundColor: "#fff", padding: "32px", borderRadius: "8px", maxWidth: "500px" }}>
          <Heading as="h1" style={{ fontSize: "20px", marginBottom: "16px" }}>
            Daily Digest — {date}
          </Heading>
          <Text>Here&apos;s your {brandName} summary for the last 24 hours.</Text>

          <Section style={{ backgroundColor: "#f9fafb", padding: "16px", borderRadius: "6px", margin: "16px 0" }}>
            <Text style={{ margin: "4px 0" }}>New Bookings: <strong>{bookingsCount}</strong></Text>
            <Text style={{ margin: "4px 0" }}>New Enquiries: <strong>{enquiriesCount}</strong></Text>
            <Text style={{ margin: "4px 0", fontWeight: "bold" }}>Revenue: {currency} {totalRevenue}</Text>
          </Section>

          {recentBookings.length > 0 && (
            <>
              <Heading as="h2" style={{ fontSize: "14px", marginTop: "20px" }}>Recent Bookings</Heading>
              {recentBookings.map((b) => (
                <Text key={b.bookingRef} style={{ margin: "4px 0", fontSize: "13px" }}>
                  • <strong>{b.bookingRef}</strong> — {b.packageTitle} ({b.currency} {b.totalAmount})
                </Text>
              ))}
            </>
          )}

          <Link
            href={`${adminUrl}/admin/dashboard`}
            style={{
              display: "inline-block",
              backgroundColor: "#2563eb",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: "13px",
              marginTop: "20px",
            }}
          >
            Open Dashboard
          </Link>

          <Hr style={{ margin: "24px 0" }} />
          <Text style={{ fontSize: "12px", color: "#666" }}>
            This is an automated daily digest from {brandName}.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
