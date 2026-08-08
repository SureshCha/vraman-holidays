import "server-only";
import type { PaymentGatewayAdapter } from "./types";
import { EsewaAdapter } from "./esewa";
import { KhaltiAdapter } from "./khalti";
import { StripeAdapter } from "./stripe";
import { IpsAdapter } from "./ips";

export function getGateway(type: "ESEWA" | "KHALTI" | "STRIPE" | "IPS"): PaymentGatewayAdapter {
  switch (type) {
    case "ESEWA":  return new EsewaAdapter();
    case "KHALTI": return new KhaltiAdapter();
    case "STRIPE": return new StripeAdapter();
    case "IPS": return new IpsAdapter();
  }
}

export * from "./types";
