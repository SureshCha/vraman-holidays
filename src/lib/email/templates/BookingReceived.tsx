import {
  Html, Head, Body, Container, Heading, Text, Section, Hr,
} from "@react-email/components";

interface BookingReceivedProps {
  travellerName: string;
  bookingRef: string;
  packageTitle: string;
  departureDate?: string;
  totalAmount: string;
  currency: string;
  brandName: string;
  footerText: string;
}

export function BookingReceived({
  travellerName, bookingRef, packageTitle, departureDate,
  totalAmount, currency, brandName, footerText,
}: BookingReceivedProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f6f6f6", padding: "20px" }}>
        <Container style={{ backgroundColor: "#fff", padding: "32px", borderRadius: "8px", maxWidth: "500px" }}>
          <Heading as="h1" style={{ fontSize: "20px", marginBottom: "16px" }}>
            Booking Received
          </Heading>
          <Text>Hi {travellerName},</Text>
          <Text>
            We&apos;ve received your booking request with {brandName}. Your booking will be
            confirmed once payment is complete.
          </Text>

          <Section style={{ backgroundColor: "#f9fafb", padding: "16px", borderRadius: "6px", margin: "16px 0" }}>
            <Text style={{ margin: "4px 0", fontWeight: "bold" }}>Reference: {bookingRef}</Text>
            <Text style={{ margin: "4px 0" }}>Package: {packageTitle}</Text>
            {departureDate && <Text style={{ margin: "4px 0" }}>Departure: {departureDate}</Text>}
            <Text style={{ margin: "4px 0", fontWeight: "bold" }}>Total: {currency} {totalAmount}</Text>
          </Section>

          <Text>
            Please complete your payment to confirm your booking. If you have any questions,
            don&apos;t hesitate to contact us.
          </Text>

          <Hr style={{ margin: "24px 0" }} />
          <Text style={{ fontSize: "12px", color: "#666" }}>{footerText}</Text>
        </Container>
      </Body>
    </Html>
  );
}
