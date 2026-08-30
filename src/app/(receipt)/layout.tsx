import type { ReactNode } from "react";

// Minimal layout for printable pages — no site nav or footer.
export default function ReceiptLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
