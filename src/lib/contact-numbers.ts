/** Official Aqla business line: quit plan and cessation support. WhatsApp and voice calls. */
export const AQLA_SUPPORT_PHONE = "966542298004";
/** General enquiries line used across the rest of the site. */
export const AQLA_GENERAL_PHONE = "966555096412";

export function whatsappLink(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
export function telLink(phone: string): string {
  return `tel:+${phone}`;
}