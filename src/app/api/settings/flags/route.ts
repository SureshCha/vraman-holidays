import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json({
    enableEsewa:        settings.featureFlags.enableEsewa,
    enableKhalti:       settings.featureFlags.enableKhalti,
    enableStripe:       settings.featureFlags.enableStripe,
    enableBankTransfer: settings.featureFlags.enableBankTransfer,
    bankInstructions:   settings.paymentConfig.instructions,
  });
}
