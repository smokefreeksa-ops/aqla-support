/** Legacy stored plans can embed an address; public plan links never disclose it. */
export function withoutContactDetails<T>(value: T): T {
  const clean = (item: unknown): unknown => {
    if (Array.isArray(item)) return item.map(clean);
    if (item && typeof item === "object") return Object.fromEntries(Object.entries(item).filter(([key]) =>
      !["email", "mobile", "phone", "full_name", "contact_email", "contact_mobile"].includes(key) && !key.startsWith("guardian_"),
    ).map(([key, nested]) => [key, key === "contact" ? nested : clean(nested)]));
    return item;
  };
  return clean(value) as T;
}