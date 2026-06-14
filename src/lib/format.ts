/** Strip non-digit characters so a phone number can be used in a wa.me link. */
export function formatWhatsAppNumber(raw: string): string {
  return raw.replace(/\D/g, "");
}
