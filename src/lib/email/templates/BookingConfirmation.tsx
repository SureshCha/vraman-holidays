import {
  Html, Head, Body, Container, Heading, Text, Section, Hr, Link,
} from "@react-email/components";

interface BookingConfirmationProps {
  travellerName: string;
  bookingRef: string;
  packageTitle: string;
  departureDate?: string;
  totalAmount: string;
  currency: string;
  brandName: string;
  footerText: string;
}

export function BookingConfirmation({
  travellerName, bookingRef, packageTitle, departureDate,
  totalAmount, currency, brandName, footerText,
}: BookingConfirmationProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f6f6f6", padding: "20px" }}>
        <Container style={{ backgroundColor: "#fff", padding: "32px", borderRadius: "8px", maxWidth: "500px" }}>
          <Heading as="h1" style={{ fontSize: "20px", marginBottom: "16px" }}>
            Booking Confirmed!
          </Heading>
          <Text>Hi {travellerName},</Text>
          <Text>Thank you for booking with {brandName}. Here are your booking details:</Text>

          <Section style={{ backgroundColor: "#f9fafb", padding: "16px", borderRadius: "6px", margin: "16px 0" }}>
            <Text style={{ margin: "4px 0", fontWeight: "bold" }}>Reference: {bookingRef}</Text>
            <Text style={{ margin: "4px 0" }}>Package: {packageTitle}</Text>
            {departureDate && <Text style={{ margin: "4px 0" }}>Departure: {departureDate}</Text>}
            <Text style={{ margin: "4px 0", fontWeight: "bold" }}>Total: {currency} {totalAmount}</Text>
          </Section>

          <Text>We&apos;ll be in touch shortly with more details about your trip.</Text>

          <Hr style={{ margin: "24px 0" }} />
          <Text style={{ fontSize: "12px", color: "#666" }}>{footerText}</Text>
        </Container>
      </Body>
    </Html>
  );
}
