import { getSettings } from "@/lib/settings";
import { formatWhatsAppNumber } from "@/lib/format";
import { MessageCircle } from "lucide-react";

export async function WhatsAppButton() {
  const settings = await getSettings();

  if (!settings.featureFlags.enableWhatsapp || !settings.contact.whatsappNumber) {
    return null;
  }

  const number = formatWhatsAppNumber(settings.contact.whatsappNumber);

  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl hover:bg-[#20bd5a] hover:scale-110 active:scale-95 transition-all duration-200 animate-bounce [animation-duration:2s] [animation-iteration-count:3]"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
