import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";
import { assignCohort, scoreFtnd, scoreNicotineControl, scoreHonc } from "./scoring";

// Optional research-grade extension payload — each section is independent and skippable.
const ExtrasSchema = z
  .object({
    motivation: z
      .object({
        importance_0_10: z.number().int().min(0).max(10).nullable().optional(),
        confidence_0_10: z.number().int().min(0).max(10).nullable().optional(),
        main_reason: z.string().max(200).nullable().optional(),
        barriers: z.array(z.string().max(60)).max(20).optional(),
      })
      .optional(),
    quitHistory: z
      .object({
        ever_tried: z.boolean().nullable().optional(),
        attempts_count: z.number().int().min(0).max(99).nullable().optional(),
        longest_quit_duration: z.string().max(60).nullable().optional(),
        methods_used: z.array(z.string().max(60)).max(20).optional(),
        main_relapse_reason: z.string().max(120).nullable().optional(),
      })
      .optional(),
    safetyFlags: z
      .object({
        pregnancy: z.boolean().nullable().optional(),
        severe_chest_pain: z.boolean().nullable().optional(),
        severe_breathlessness: z.boolean().nullable().optional(),
        coughing_blood: z.boolean().nullable().optional(),
        severe_withdrawal: z.boolean().nullable().optional(),
        mental_health_concern: z.boolean().nullable().optional(),
        repeated_failed_attempts: z.boolean().nullable().optional(),
        multi_product_use: z.boolean().nullable().optional(),
        medication_request: z.boolean().nullable().optional(),
        alt_product_request: z.boolean().nullable().optional(),
        clinician_request: z.boolean().nullable().optional(),
      })
      .optional(),
    honc: z
      .object({
        q1: z.boolean(), q2: z.boolean(), q3: z.boolean(), q4: z.boolean(), q5: z.boolean(),
        q6: z.boolean(), q7: z.boolean(), q8: z.boolean(), q9: z.boolean(), q10: z.boolean(),
      })
      .optional(),
    productDetails: z
      .array(
        z.object({
          product: z.string().max(40),
          ever_use: z.boolean().nullable().optional(),
          current_use_30d: z.boolean().nullable().optional(),
          days_used_30d: z.number().int().min(0).max(30).nullable().optional(),
          age_first_use: z.number().int().min(5).max(110).nullable().optional(),
          age_regular_use: z.number().int().min(5).max(110).nullable().optional(),
          usual_place: z.string().max(80).nullable().optional(),
          source: z.string().max(80).nullable().optional(),
          family_peer_use: z.boolean().nullable().optional(),
          ad_exposure: z.boolean().nullable().optional(),
          is_main_product: z.boolean().optional(),
        }),
      )
      .max(10)
      .optional(),
    cigaretteModule: z
      .object({
        cigarettes_per_day: z.number().int().min(0).max(200).nullable().optional(),
        time_to_first_cig: z.string().max(40).nullable().optional(),
        hsi_score: z.number().int().min(0).max(6).nullable().optional(),
      })
      .optional(),
    vapeModule: z
      .object({
        days_30d: z.number().int().min(0).max(30).nullable().optional(),
        times_per_day: z.number().int().min(0).max(200).nullable().optional(),
        time_to_first: z.string().max(40).nullable().optional(),
        nicotine_concentration: z.string().max(40).nullable().optional(),
        device_type: z.string().max(40).nullable().optional(),
        flavors: z.string().max(120).nullable().optional(),
        refillable: z.string().max(40).nullable().optional(),
        used_at_institution: z.boolean().nullable().optional(),
        tried_to_stop: z.boolean().nullable().optional(),
      })
      .optional(),
    pouchModule: z
      .object({
        days_30d: z.number().int().min(0).max(30).nullable().optional(),
        pouches_per_day: z.number().int().min(0).max(100).nullable().optional(),
        nicotine_strength: z.string().max(40).nullable().optional(),
        time_to_first: z.string().max(40).nullable().optional(),
        flavors: z.string().max(120).nullable().optional(),
        source: z.string().max(80).nullable().optional(),
        used_at_institution: z.boolean().nullable().optional(),
        tried_to_stop: z.boolean().nullable().optional(),
        wants_counseling: z.boolean().nullable().optional(),
      })
      .optional(),
    shishaModule: z
      .object({
        days_30d: z.number().int().min(0).max(30).nullable().optional(),
        sessions_per_week: z.number().int().min(0).max(50).nullable().optional(),
        avg_session_minutes: z.number().int().min(0).max(600).nullable().optional(),
        shared_mouthpiece: z.boolean().nullable().optional(),
        setting: z.string().max(40).nullable().optional(),
        tobacco_type: z.string().max(40).nullable().optional(),
        also_uses_other: z.boolean().nullable().optional(),
        quit_interest: z.string().max(40).nullable().optional(),
      })
      .optional(),
    extendedDemographics: z
      .object({
        school_university_workplace: z.string().max(200).nullable().optional(),
        affiliation_type: z.string().max(40).nullable().optional(),
        education_level: z.string().max(80).nullable().optional(),
        nationality: z.string().max(80).nullable().optional(),
        pregnancy: z.boolean().nullable().optional(),
      })
      .optional(),
    consentResearchPublication: z.boolean().optional(),
  })
  .optional();

const Submission = z.object({
  triage: z.object({
    full_name: z.string().trim().min(1).max(120),
    mobile: z.string().trim().min(5).max(40),
    email: z.string().trim().email().max(200).optional().or(z.literal("")),
    age: z.number().int().min(8).max(110).optional().nullable(),
    date_of_birth: z.string().optional().nullable(),
    gender: z.string().max(40).optional().nullable(),
    city: z.string().max(120).optional().nullable(),
    affiliation: z.string().max(200).optional().nullable(),
    preferred_language: z.enum(["ar", "en"]),
    preferred_contact: z.enum(["whatsapp", "phone", "sms", "email"]),
    self_completing: z.boolean(),
    previously_tried_quit: z.boolean().nullable(),
    previous_quit_attempts: z.string().max(20).nullable(),
    main_reason: z.string().max(200).nullable(),
  }),
  consent: z.object({
    consent_assessment: z.boolean(),
    consent_contact: z.boolean(),
    consent_educational: z.boolean(),
    consent_service_eval: z.boolean(),
    consent_research: z.boolean(),
    guardian_notice_shown: z.boolean(),
  }),
  products: z.array(z.string()).min(1),
  ftnd: z
    .object({
      q1: z.number().int(),
      q2: z.number().int(),
      q3: z.number().int(),
      q4: z.number().int(),
      q5: z.number().int(),
      q6: z.number().int(),
    })
    .nullable(),
  nicotine: z
    .object({
      q1: z.boolean(), q2: z.boolean(), q3: z.boolean(), q4: z.boolean(), q5: z.boolean(),
      q6: z.boolean(), q7: z.boolean(), q8: z.boolean(), q9: z.boolean(), q10: z.boolean(),
    })
    .nullable(),
  readiness: z.enum([
    "quit_now","quit_prepare","reduce_first","not_ready_score",
    "discuss_alternatives","score_only","helping_someone"
  ]),
  riskFlags: z.array(z.string()),
  extras: ExtrasSchema,
});

export type SubmissionInput = z.infer<typeof Submission>;

export const submitAssessment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Submission.parse(data))
  .handler(async ({ data }) => {
    const db = supabaseAdmin;

    const ftndResult = data.ftnd ? scoreFtnd(data.ftnd) : null;
    const nicResult = data.nicotine ? scoreNicotineControl(data.nicotine) : null;
    const honcResult = data.extras?.honc ? scoreHonc(data.extras.honc) : null;
    const youthFlag = (data.triage.age ?? 99) < 18 && (nicResult?.yes_count ?? 0) > 0;

    // Merge safety flags from the new safety section into the riskFlags array so
    // cohort assignment sees them (backward compatible — riskFlags still primary).
    const sf = data.extras?.safetyFlags;
    if (sf) {
      const map: Array<[keyof typeof sf, string]> = [
        ["pregnancy", "pregnancy"],
        ["severe_chest_pain", "severe_chest_pain"],
        ["severe_breathlessness", "severe_sob"],
        ["coughing_blood", "coughing_blood"],
        ["severe_withdrawal", "severe_withdrawal"],
        ["mental_health_concern", "mental_health"],
        ["repeated_failed_attempts", "repeated_failed"],
        ["multi_product_use", "multi_product"],
        ["medication_request", "wants_medication"],
        ["alt_product_request", "wants_alternatives"],
        ["clinician_request", "requests_clinician"],
      ];
      for (const [k, flag] of map) {
        if (sf[k] && !data.riskFlags.includes(flag)) data.riskFlags.push(flag);
      }
    }
    // HONC high category also escalates to clinician review
    if (honcResult?.category === "high" && !data.riskFlags.includes("requests_clinician")) {
      data.riskFlags.push("requests_clinician");
    }

    const cohort = assignCohort({
      products: data.products as never,
      ftnd: ftndResult?.total,
      nicotineYes: nicResult?.yes_count,
      readiness: data.readiness,
      riskFlags: data.riskFlags,
      age: data.triage.age ?? undefined,
    });

    if (ftndResult && ftndResult.total >= 8 && !data.riskFlags.includes("very_high_dependence")) {
      data.riskFlags.push("very_high_dependence");
    }

    // 1. Insert participant
    const { data: participant, error: pErr } = await db
      .from("participants")
      .insert({
        full_name: data.triage.full_name,
        mobile: data.triage.mobile,
        email: data.triage.email || null,
        age: data.triage.age ?? null,
        date_of_birth: data.triage.date_of_birth || null,
        gender: data.triage.gender || null,
        city: data.triage.city || null,
        affiliation: data.triage.affiliation || null,
        preferred_language: data.triage.preferred_language,
        preferred_contact: data.triage.preferred_contact,
        self_completing: data.triage.self_completing,
        previously_tried_quit: data.triage.previously_tried_quit,
        previous_quit_attempts: data.triage.previous_quit_attempts,
        main_reason: data.triage.main_reason,
        guardian_consent_flag: data.consent.guardian_notice_shown,
        school_university_workplace: data.extras?.extendedDemographics?.school_university_workplace ?? null,
        affiliation_type: data.extras?.extendedDemographics?.affiliation_type ?? null,
        education_level: data.extras?.extendedDemographics?.education_level ?? null,
        nationality: data.extras?.extendedDemographics?.nationality ?? null,
        pregnancy: data.extras?.extendedDemographics?.pregnancy ?? data.extras?.safetyFlags?.pregnancy ?? null,
        research_consent_status: data.extras?.consentResearchPublication ? "given" : "not_given",
        cohort: cohort.cohort,
        cohort_reason: cohort.reason,
        doctor_review_needed: cohort.doctorReviewNeeded,
        urgent_symptom: cohort.urgent,
      })
      .select("id, participant_code")
      .single();
    if (pErr || !participant) throw new Error(pErr?.message ?? "Submit failed");

    const pid = participant.id;

    const inserts: PromiseLike<unknown>[] = [
      db.from("consent_records").insert({
        participant_id: pid,
        consent_assessment: data.consent.consent_assessment,
        consent_contact: data.consent.consent_contact,
        consent_educational: data.consent.consent_educational,
        consent_service_eval: data.consent.consent_service_eval,
        consent_research: data.consent.consent_research,
        consent_research_publication: data.extras?.consentResearchPublication ?? false,
        guardian_notice_shown: data.consent.guardian_notice_shown,
      }),
      db.from("product_use").insert({ participant_id: pid, products: data.products }),
      db.from("readiness_stage").insert({ participant_id: pid, stage: data.readiness }),
      db.from("risk_flags").insert({
        participant_id: pid,
        flags: data.riskFlags,
        urgent: cohort.urgent,
      }),
      db.from("cohort_assignment").insert({
        participant_id: pid,
        cohort: cohort.cohort,
        reason: cohort.reason,
        doctor_review_needed: cohort.doctorReviewNeeded,
      }),
      db.from("outcome_tracking").insert({ participant_id: pid }),
    ];
    if (ftndResult && data.ftnd) {
      inserts.push(
        db.from("cigarette_dependence_scores").insert({
          participant_id: pid,
          q1_time_to_first: data.ftnd.q1,
          q2_difficulty_refrain: data.ftnd.q2,
          q3_hardest_to_give_up: data.ftnd.q3,
          q4_cigs_per_day: data.ftnd.q4,
          q5_more_in_morning: data.ftnd.q5,
          q6_smoking_when_ill: data.ftnd.q6,
          total_score: ftndResult.total,
          category: ftndResult.category,
        }),
      );
    }
    if (nicResult && data.nicotine) {
      inserts.push(
        db.from("nicotine_control_scores").insert({
          participant_id: pid,
          answers: data.nicotine,
          yes_count: nicResult.yes_count,
          category: nicResult.category,
          youth_flag: youthFlag,
        }),
      );
    }
    await Promise.all(inserts);

    return {
      participantId: pid,
      participantCode: participant.participant_code,
      cohort: cohort.cohort,
      cohortReason: cohort.reason,
      doctorReviewNeeded: cohort.doctorReviewNeeded,
      urgent: cohort.urgent,
      ftnd: ftndResult,
      nicotine: nicResult,
    };
  });

// Public — called from the result page after the participant sees their cohort.
// Verified by the just-issued participant_code so we don't allow blind writes.
export const saveFollowUpPreference = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      participantId: z.string().uuid(),
      participantCode: z.string().min(4).max(40),
      preference: z.enum([
        "whatsapp_messages","phone_call","physician_review","email_only","no_contact",
      ]),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const db = supabaseAdmin;
    const { data: p, error: pErr } = await db
      .from("participants")
      .select("id, participant_code")
      .eq("id", data.participantId)
      .maybeSingle();
    if (pErr) throw new Error(pErr.message);
    if (!p || p.participant_code !== data.participantCode) {
      throw new Error("Invalid participant credentials");
    }
    // Replace any previous preference for this participant
    await db.from("follow_up_preferences").delete().eq("participant_id", data.participantId);
    const { error } = await db.from("follow_up_preferences").insert({
      participant_id: data.participantId,
      preference: data.preference,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
