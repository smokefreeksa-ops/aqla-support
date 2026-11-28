export const CONTACT_COLUMNS = ["created_at", "nickname", "email", "mobile", "city", "age_band_captured", "is_minor", "guardian_name", "guardian_email", "guardian_mobile", "score_band", "risk_flag", "status", "retention_until"] as const;
export type ContactRow = Record<typeof CONTACT_COLUMNS[number], string | boolean | null>;

export function contactsCsv(rows: ContactRow[]): string {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  return "\ufeff" + [CONTACT_COLUMNS.join(","), ...rows.map((row) => CONTACT_COLUMNS.map((key) => {
    const value = String(row[key] ?? "");
    // Excel's apostrophe text prefix preserves '+' and leading zero without formulas.
    const text = value && (key === "mobile" || key === "guardian_mobile" || /^[=+\-@\t\r\n]/.test(value)) ? `'${value}` : value;
    return escape(text);
  }).join(","))].join("\r\n");
}