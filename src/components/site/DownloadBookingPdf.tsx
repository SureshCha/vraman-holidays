"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { BookingPdfData } from "@/lib/booking-pdf";

export function DownloadBookingPdf({ booking }: { booking: BookingPdfData }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const { generateBookingPdf } = await import("@/lib/booking-pdf");
      await generateBookingPdf(booking);
    } catch (e) {
      console.error("PDF generation failed:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" onClick={handleDownload} disabled={loading}>
      <Download className="h-4 w-4 mr-2" />
      {loading ? "Generating…" : "Download PDF"}
    </Button>
  );
}
