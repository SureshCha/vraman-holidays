import {
  Html, Head, Body, Container, Heading, Text, Section, Hr, Link,
} from "@react-email/components";

interface AdminNotificationProps {
  type: "booking" | "enquiry";
  summary: string;
  detailUrl: string;
  brandName: string;
}

export function AdminNotification({ type, summary, detailUrl, brandName }: AdminNotificationProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f6f6f6", padding: "20px" }}>
        <Container style={{ backgroundColor: "#fff", padding: "32px", borderRadius: "8px", maxWidth: "500px" }}>
          <Heading as="h1" style={{ fontSize: "20px", marginBottom: "16px" }}>
            New {type === "booking" ? "Booking" : "Enquiry"} — {brandName}
          </Heading>

          <Section style={{ backgroundColor: "#f9fafb", padding: "16px", borderRadius: "6px", margin: "16px 0" }}>
            <Text style={{ whiteSpace: "pre-line" }}>{summary}</Text>
          </Section>

          <Link href={detailUrl} style={{ color: "#2563eb" }}>View in Admin Panel →</Link>

          <Hr style={{ margin: "24px 0" }} />
          <Text style={{ fontSize: "12px", color: "#666" }}>
            This is an automated notification from {brandName} admin system.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
