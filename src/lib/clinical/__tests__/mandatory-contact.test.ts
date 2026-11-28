import { describe, expect, it } from "vitest";
import { normalizeSaudiMobile, isValidSaudiMobile } from "../../contact/normalizePhone";
import { CONTACT_CONSENT_VERSION, validateContactAnswers, planEmailRecipient, suggestEmailCorrection } from "../../contact/consent";
import { contactsCsv, CONTACT_COLUMNS, type ContactRow } from "../../contact/contacts-csv";
import { withoutContactDetails } from "../../contact/public-plan";
import { nextQuestion } from "../questions";
import type { ClinicalAnswers } from "../types";

const contact: ClinicalAnswers = { nickname: "اختبار", contact_consent: true, contact_consent_at: "2026-11-28T03:04:00Z", contact_consent_version: CONTACT_CONSENT_VERSION, contact_email: "test@example.com", contact_mobile: "+966555096412" };
const firstIds = ["nickname", "contact_notice", "contact_email", "contact_mobile", "jurisdiction", "city", "privacy_ack", "age_band"];

describe("Saudi mobile normalization", () => {
  it.each(["0555096412", "555096412", "+966555096412", "00966555096412", "٠٥٥٥٠٩٦٤١٢", "۰۵۵۵۰۹۶۴۱۲", "\u061c(٠٥٥) ٥٠٩-٦٤١٢\u200f"])("accepts %s", (value) => {
    expect(normalizeSaudiMobile(value)).toBe("+966555096412");
    expect(isValidSaudiMobile(value)).toBe(true);
  });
  it.each(["0455096412", "055509641", "+971555096412"])("rejects %s", (value) => {
    expect(normalizeSaudiMobile(value)).toBeNull(); expect(isValidSaudiMobile(value)).toBe(false);
  });
});
describe("mandatory contact gates", () => {
  it("cannot bypass contact notice even with forged answered ids", () => { expect(nextQuestion({ nickname: "اختبار" }, firstIds)?.id).toBe("contact_notice"); });
  it.each(["", "broken"])("rejects email %s before jurisdiction", (contact_email) => { expect(nextQuestion({ ...contact, contact_email }, firstIds)?.id).toBe("contact_email"); });
  it.each(["", "055"])("rejects mobile %s before jurisdiction", (contact_mobile) => { expect(nextQuestion({ ...contact, contact_mobile }, firstIds)?.id).toBe("contact_mobile"); });
  it("reaches jurisdiction only after all three valid answers", () => { expect(nextQuestion(contact, firstIds.slice(0, 4))?.id).toBe("jurisdiction"); });
  it("requires all guardian answers immediately after under_18", () => {
    let answers: ClinicalAnswers = { ...contact, age_band: "under_18" };
    const ids = [...firstIds];
    const patches: Partial<ClinicalAnswers>[] = [{ guardian_name: "خالد" }, { guardian_relationship: "father" }, { guardian_email: "guardian@example.com" }, { guardian_mobile: "+966555096412" }, { guardian_consent: true, guardian_consent_at: "2026-11-28T03:04:00Z" }];
    const expected = ["guardian_name", "guardian_relationship", "guardian_email", "guardian_mobile", "guardian_consent"];
    patches.forEach((patch, index) => { const q = nextQuestion(answers, ids); expect(q?.id).toBe(expected[index]); if (q) ids.push(q.id); answers = { ...answers, ...patch }; });
    expect(nextQuestion(answers, ids)?.id).toBe("sex");
  });
  it("validates contacts again on the server and normalizes Arabic digits", () => {
    expect(validateContactAnswers({ ...contact, contact_mobile: "٠٥٥٥٠٩٦٤١٢" }, true).contact_mobile).toBe("+966555096412");
    expect(() => validateContactAnswers({ nickname: "اختبار" }, true)).toThrow();
  });
  it("rejects under_18 completion without guardian consent", () => { expect(() => validateContactAnswers({ ...contact, age_band: "under_18" }, true)).toThrow(); });
  it.each([
    ["gmial.com", "gmail.com"], ["gmai.com", "gmail.com"], ["gmail.co", "gmail.com"], ["hotmial.com", "hotmail.com"], ["hotmai.com", "hotmail.com"], ["outlok.com", "outlook.com"], ["yaho.com", "yahoo.com"], ["icloud.co", "icloud.com"],
  ])("suggests correction for %s", (typo, provider) => { expect(suggestEmailCorrection(`test@${typo}`)).toBe(`test@${provider}`); });
  it("allows keeping a valid typo-domain address", () => { expect(validateContactAnswers({ ...contact, contact_email: "test@gmial.com" }, true).contact_email).toBe("test@gmial.com"); });
  it("does not email a non-consenting participant", () => { expect(planEmailRecipient({ ...contact, plan_email_consent: false })).toBeNull(); });
  it("uses stored participant email for a consenting adult", () => { expect(planEmailRecipient({ ...contact, plan_email_consent: true })).toBe("test@example.com"); });
  it("sends only to the consenting minor's guardian, retaining participant email", () => {
    const answers: ClinicalAnswers = { ...contact, age_band: "under_18", plan_email_consent: true, guardian_name: "خالد", guardian_relationship: "father", guardian_email: "guardian@example.com", guardian_mobile: "+966555096412", guardian_consent: true, guardian_consent_at: "2026-11-28T03:04:00Z" };
    expect(planEmailRecipient(answers)).toBe("guardian@example.com"); expect(validateContactAnswers(answers, true).contact_email).toBe("test@example.com");
  });
});
describe("contact confidentiality and CSV", () => {
  it("redacts embedded legacy contact fields from public plan payloads", () => { expect(withoutContactDetails({ identity: { nickname: "مالك", email: "private@example.com" }, guardian_name: "خالد", mobile: "0555096412" })).toEqual({ identity: { nickname: "مالك" } }); });
  it("exports BOM, Arabic and text mobiles without spreadsheet formulas", () => {
    const row = Object.fromEntries(CONTACT_COLUMNS.map((key) => [key, null])) as ContactRow;
    row.nickname = "مالك"; row.mobile = "0555096412"; row.guardian_mobile = "+966555096412"; row.city = '=HYPERLINK("bad")';
    const csv = contactsCsv([row]);
    expect(new TextEncoder().encode(csv).slice(0, 3)).toEqual(new Uint8Array([239, 187, 191]));
    expect(csv).toContain('"مالك"'); expect(csv).toContain('"\'0555096412"'); expect(csv).toContain('"\'+966555096412"'); expect(csv).toContain('"\'=HYPERLINK(""bad"")"');
  });
});