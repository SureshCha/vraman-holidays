import { NextResponse, connection } from "next/server";
import { getSettings } from "@/lib/settings";

// Drives live payment-method visibility on checkout — must read current
// settings on every request. `connection()` opts this route out of the
// outer Route Cache (a separate layer from getSettings()'s own cacheTag,
// which revalidateTag("settings") alone does not reach).
export async function GET() {
  await connection();
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
