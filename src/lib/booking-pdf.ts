export interface BookingPdfData {
  bookingRef: string;
  packageTitle: string;
  travellerName: string;
  travellerEmail: string;
  departureDate?: string;
  returnDate?: string;
  totalAmount: number;
  currency: string;
  status: string;
  brandName: string;
  brandEmail?: string;
  brandPhone?: string;
}

export async function generateBookingPdf(data: BookingPdfData): Promise<void> {
  // Dynamic import keeps jspdf out of the initial bundle
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // Header band
  doc.setFillColor(18, 104, 179); // #1268b3
  doc.rect(0, 0, pw, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(data.brandName, margin, 20);

  y = 45;
  doc.setTextColor(30, 30, 30);

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Booking Confirmation", margin, y);
  y += 10;

  // Booking ref box
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(margin, y, pw - margin * 2, 14, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Booking Reference:", margin + 4, y + 9);
  doc.setFont("courier", "bold");
  doc.setFontSize(13);
  doc.text(data.bookingRef, margin + 55, y + 9);
  y += 22;

  // Details table
  const rows: [string, string][] = [
    ["Package", data.packageTitle],
    ["Traveller", data.travellerName],
    ["Email", data.travellerEmail],
    ...(data.departureDate ? [["Departure", data.departureDate] as [string, string]] : []),
    ...(data.returnDate ? [["Return", data.returnDate] as [string, string]] : []),
    ["Total Paid", `${data.currency} ${(data.totalAmount / 100).toLocaleString()}`],
    ["Status", data.status],
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  for (const [label, value] of rows) {
    doc.setFont("helvetica", "bold");
    doc.text(label + ":", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, margin + 45, y);
    y += 8;
  }

  y += 10;

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pw - margin, y);
  y += 8;

  // Footer
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("Thank you for booking with " + data.brandName + ".", margin, y);
  y += 6;
  if (data.brandEmail) doc.text("Email: " + data.brandEmail, margin, y);
  if (data.brandPhone) doc.text("  |  Phone: " + data.brandPhone, margin + 50, y);

  doc.save(`booking-${data.bookingRef}.pdf`);
}
