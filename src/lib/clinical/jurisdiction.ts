// Jurisdiction profiles. Release 1 supports SA (Saudi routing) and GENERIC.
// GENERIC must never contain Saudi identifiers and must never invent a foreign
// emergency number.

import type { Jurisdiction } from "./types";

export interface JurisdictionProfile {
  id: Jurisdiction;
  label_ar: string;
  label_en: string;
  emergency_ar: string;
  urgent_ar: string;
  clinician_ar: string;
  booking_ar: string;
  support_ar: string;
  services: string[];
}

const SA_PROFILE: JurisdictionProfile = {
  id: "SA",
  label_ar: "المملكة العربية السعودية",
  label_en: "Saudi Arabia",
  emergency_ar: "هذه حالة طارئة. اتصل بالإسعاف على 997 فورًا أو توجّه لأقرب طوارئ.",
  urgent_ar:
    "تحتاج تقييمًا طبيًا عاجلًا في نفس اليوم. راجع أقرب مركز صحي أو عيادة، أو اتصل بمركز 937 للاستشارة الصحية الفورية.",
  clinician_ar:
    "ننصح بمراجعة طبيبك أو عيادة الإقلاع لمتابعة حالتك. يمكنك حجز موعد عبر تطبيق «صحتي».",
  booking_ar: "احجز موعد عيادة الإقلاع عبر تطبيق «صحتي».",
  support_ar: "للاستشارة الصحية أو الدعم: مركز 937 التابع لوزارة الصحة.",
  services: [
    "حجز موعد عيادة إقلاع عن التدخين عبر تطبيق «صحتي».",
    "استشارة صحية عبر مركز 937 (وزارة الصحة).",
  ],
};

const GENERIC_PROFILE: JurisdictionProfile = {
  id: "GENERIC",
  label_ar: "خارج المملكة",
  label_en: "Outside Saudi Arabia",
  emergency_ar:
    "هذه حالة طارئة. اتصل برقم الطوارئ المحلي في بلدك أو اطلب المساعدة الطبية العاجلة.",
  urgent_ar:
    "تحتاج تقييمًا طبيًا عاجلًا في نفس اليوم. راجع أقرب خدمة طبية عاجلة في بلدك، أو اتصل برقم الطوارئ المحلي إذا ساءت حالتك.",
  clinician_ar: "ننصح بمراجعة طبيبك أو أقرب خدمة صحية في بلدك لمتابعة حالتك.",
  booking_ar: "احجز موعدًا مع طبيبك أو أقرب خدمة إقلاع عن التدخين في بلدك.",
  support_ar: "اطلب الدعم من خدمة الإقلاع عن التدخين المتاحة في بلدك.",
  services: [
    "مراجعة طبيب الأسرة أو أقرب خدمة صحية في بلدك.",
    "خدمة الإقلاع عن التدخين المحلية إن وُجدت.",
  ],
};

export function getJurisdictionProfile(j: Jurisdiction): JurisdictionProfile {
  return j === "SA" ? SA_PROFILE : GENERIC_PROFILE;
}

/** Guard used by tests/QA: no Saudi identifier may leak into GENERIC output. */
export const SAUDI_IDENTIFIERS = ["997", "937", "صحتي", "Sehhaty", "SFDA", "الهيئة العامة للغذاء والدواء"];
