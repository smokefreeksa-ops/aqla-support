import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";
import { assignCohort, scoreFtnd, scoreNicotineControl } from "./scoring";

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
  followUpPreference: z.string(),
});

export type SubmissionInput = z.infer<typeof Submission>;

export const submitAssessment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Submission.parse(data))
  .handler(async ({ data }) => {
    const db = supabaseAdmin;

    const ftndResult = data.ftnd ? scoreFtnd(data.ftnd) : null;
    const nicResult = data.nicotine ? scoreNicotineControl(data.nicotine) : null;
    const youthFlag = (data.triage.age ?? 99) < 18 && (nicResult?.yes_count ?? 0) > 0;

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
        cohort: cohort.cohort,
        cohort_reason: cohort.reason,
        doctor_review_needed: cohort.doctorReviewNeeded,
        urgent_symptom: cohort.urgent,
      })
      .select("id, participant_code")
      .single();
    if (pErr || !participant) throw new Error(pErr?.message ?? "Submit failed");

    const pid = participant.id;

    const inserts: Promise<unknown>[] = [
      db.from("consent_records").insert({ participant_id: pid, ...data.consent }),
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
      db.from("follow_up_preferences").insert({
        participant_id: pid,
        preference: data.followUpPreference,
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
