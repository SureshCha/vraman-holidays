"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Link2, Check } from "lucide-react";

export function InvoiceActions({ invoiceNo }: { invoiceNo: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(
      `${window.location.origin}/invoice/${invoiceNo}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={copyLink}>
        {copied
          ? <Check className="h-3.5 w-3.5 mr-1.5 text-green-600" />
          : <Link2 className="h-3.5 w-3.5 mr-1.5" />}
        {copied ? "Copied!" : "Copy Link"}
      </Button>
      <Button variant="outline" size="sm" onClick={() => window.print()}>
        <Printer className="h-3.5 w-3.5 mr-1.5" />
        Print / Save PDF
      </Button>
    </div>
  );
}
