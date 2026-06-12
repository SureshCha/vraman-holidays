import "server-only";
import type { PaymentGatewayAdapter } from "./types";
import { EsewaAdapter } from "./esewa";
import { KhaltiAdapter } from "./khalti";
import { StripeAdapter } from "./stripe";

export function getGateway(type: "ESEWA" | "KHALTI" | "STRIPE"): PaymentGatewayAdapter {
  switch (type) {
    case "ESEWA":  return new EsewaAdapter();
    case "KHALTI": return new KhaltiAdapter();
    case "STRIPE": return new StripeAdapter();
  }
}

export * from "./types";
