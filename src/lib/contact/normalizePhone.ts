/** Saudi mobile normalization shared by intake, guardian intake and the server. */
export function normalizeSaudiMobile(input: string): string | null {
  const digits = input
    .replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (c) => String(c.charCodeAt(0) - 0x06f0))
    .replace(/[\s\-()\u061c\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, "");
  const local = digits.replace(/^(?:\+966|00966|0)/, "");
  return /^5\d{8}$/.test(local) ? `+966${local}` : null;
}

export function isValidSaudiMobile(input: string): boolean {
  return normalizeSaudiMobile(input) !== null;
}