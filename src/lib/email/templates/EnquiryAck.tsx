import {
  Html, Head, Body, Container, Heading, Text, Hr,
} from "@react-email/components";

interface EnquiryAckProps {
  name: string;
  brandName: string;
  footerText: string;
}

export function EnquiryAck({ name, brandName, footerText }: EnquiryAckProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f6f6f6", padding: "20px" }}>
        <Container style={{ backgroundColor: "#fff", padding: "32px", borderRadius: "8px", maxWidth: "500px" }}>
          <Heading as="h1" style={{ fontSize: "20px", marginBottom: "16px" }}>
            We received your enquiry!
          </Heading>
          <Text>Hi {name},</Text>
          <Text>
            Thank you for reaching out to {brandName}. Our team will review your
            enquiry and get back to you within 24 hours.
          </Text>
          <Text>If your enquiry is urgent, feel free to call or WhatsApp us directly.</Text>

          <Hr style={{ margin: "24px 0" }} />
          <Text style={{ fontSize: "12px", color: "#666" }}>{footerText}</Text>
        </Container>
      </Body>
    </Html>
  );
}
