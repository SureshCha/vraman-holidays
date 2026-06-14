import { getSettings } from "@/lib/settings";
import { MessageCircle } from "lucide-react";

export async function WhatsAppButton() {
  const settings = await getSettings();

  if (!settings.featureFlags.enableWhatsapp || !settings.contact.whatsappNumber) {
    return null;
  }

  // Strip non-digit characters for the wa.me link
  const number = settings.contact.whatsappNumber.replace(/\D/g, "");

  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#20bd5a] transition-colors"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
