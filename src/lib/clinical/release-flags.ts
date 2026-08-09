// Aqla Release 1 — hard release gates.
//
// Release 1 is behavioural-only. Medication / pharmacotherapy content is structurally
// impossible to render: BOTH the approval flag AND an approved clinical rule version
// are required. Flipping the flag alone is deliberately NOT sufficient.

export const SAUDI_MEDICATION_CONTENT_APPROVED = false;

/** Version of the deterministic behavioural rule set used to generate a plan. */
export const CLINICAL_RULE_VERSION = "aqla-behavioural-r1.0.0";

/** Version of the plan_json shape. */
export const PLAN_SCHEMA_VERSION = "plan_json.v1";

/** Version of the consent text shown next to the plan-email checkbox. */
export const PLAN_EMAIL_CONSENT_VERSION = "plan-email-consent.v1";

/** Version of the pre-health privacy notice text. Pending formal PDPL/legal review. */
export const PRIVACY_NOTICE_VERSION = "privacy-notice.v1-draft-pending-legal";

/**
 * Clinical rule versions that have passed clinical governance sign-off for
 * MEDICATION content specifically. Empty in Release 1 and must stay empty until
 * Saudi regulatory evidence, availability, versioned labels, Arabic clinical
 * back-translation, governance sign-off and pharmacotherapy acceptance tests all pass.
 */
export const APPROVED_MEDICATION_CONTENT_VERSIONS: readonly string[] = [];

/**
 * The ONLY permitted entry point for any medication branch.
 * Requires the approval flag AND an approved medication content version.
 */
export function canRenderMedicationContent(
  medicationContentVersion?: string | null,
): boolean {
  if (!SAUDI_MEDICATION_CONTENT_APPROVED) return false;
  if (!medicationContentVersion) return false;
  return APPROVED_MEDICATION_CONTENT_VERSIONS.includes(medicationContentVersion);
}

/** Identifiable admin/research disclosure is disabled in Release 1. */
export const ADMIN_RESEARCH_DISCLOSURE_ENABLED = false;
