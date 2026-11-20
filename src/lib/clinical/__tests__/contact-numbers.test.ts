import { describe, expect, it } from "vitest";
import { AQLA_GENERAL_PHONE, AQLA_SUPPORT_PHONE, telLink, whatsappLink } from "../../contact-numbers";

describe("Aqla contact destinations", () => {
  it("uses the official business number for cessation support", () => {
    expect(AQLA_SUPPORT_PHONE).toBe(["966", "542298004"].join(""));
  });

  it("preserves the separate general enquiries number", () => {
    expect(AQLA_GENERAL_PHONE).toBe(["966", "555096412"].join(""));
  });

  it("encodes a generic support request without personal plan data", () => {
    const message = "السلام عليكم، أرغب في دعم للإقلاع عن التدخين أو النيكوتين.";
    const url = new URL(whatsappLink(AQLA_SUPPORT_PHONE, message));
    expect(url.origin).toBe("https://wa.me");
    expect(url.pathname).toBe(`/966${"542298004"}`);
    expect(url.searchParams.get("text")).toBe(message);
    expect([...url.searchParams.keys()]).toEqual(["text"]);
  });

  it("uses the same business number for direct calls", () => {
    expect(telLink(AQLA_SUPPORT_PHONE)).toBe(`tel:+966${"542298004"}`);
  });
});