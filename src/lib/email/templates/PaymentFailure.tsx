import {
  Html, Head, Body, Container, Heading, Text, Section, Hr, Link,
} from "@react-email/components";

interface PaymentFailureProps {
  travellerName: string;
  bookingRef: string;
  packageTitle: string;
  totalAmount: string;
  currency: string;
  retryUrl: string;
  brandName: string;
  footerText: string;
}

export function PaymentFailure({
  travellerName, bookingRef, packageTitle,
  totalAmount, currency, retryUrl, brandName, footerText,
}: PaymentFailureProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f6f6f6", padding: "20px" }}>
        <Container style={{ backgroundColor: "#fff", padding: "32px", borderRadius: "8px", maxWidth: "500px" }}>
          <Heading as="h1" style={{ fontSize: "20px", marginBottom: "16px", color: "#dc2626" }}>
            Payment Could Not Be Processed
          </Heading>
          <Text>Hi {travellerName},</Text>
          <Text>
            Unfortunately, your payment for the following booking could not be completed.
            Please try again or contact us for assistance.
          </Text>

          <Section style={{ backgroundColor: "#fef2f2", padding: "16px", borderRadius: "6px", margin: "16px 0" }}>
            <Text style={{ margin: "4px 0", fontWeight: "bold" }}>Reference: {bookingRef}</Text>
            <Text style={{ margin: "4px 0" }}>Package: {packageTitle}</Text>
            <Text style={{ margin: "4px 0", fontWeight: "bold" }}>Amount: {currency} {totalAmount}</Text>
          </Section>

          <Link
            href={retryUrl}
            style={{
              display: "inline-block",
              backgroundColor: "#2563eb",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            Try Again
          </Link>

          <Text style={{ marginTop: "16px", fontSize: "14px", color: "#666" }}>
            If the problem persists, please contact us and we&apos;ll help you complete your booking.
          </Text>

          <Hr style={{ margin: "24px 0" }} />
          <Text style={{ fontSize: "12px", color: "#666" }}>{footerText}</Text>
        </Container>
      </Body>
    </Html>
  );
}
