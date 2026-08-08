import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";

// Drives live payment-method visibility on the booking page — must always
// read current settings per request, never be frozen into the build as a
// static response (Cache Components would otherwise prerender this at build
// time since it has no other dynamic signal).
export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json({
    enableEsewa:        settings.featureFlags.enableEsewa,
    enableKhalti:       settings.featureFlags.enableKhalti,
    enableStripe:       settings.featureFlags.enableStripe,
    enableIps:          settings.featureFlags.enableIps,
    enableBankTransfer: settings.featureFlags.enableBankTransfer,
    bankInstructions:   settings.paymentConfig.instructions,
  });
}
