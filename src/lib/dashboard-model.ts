import { MODULES } from "@/data/modules";
import type { LearnerDashboardData } from "@/lib/dashboard.functions";

// ---------------------------------------------------------------------------
// Presentation-agnostic derivation of the learner model from raw records.
// No tenant-specific assumptions live in the dashboard components — they all
// consume this model.
// ---------------------------------------------------------------------------

export type CourseStatus = "not_started" | "in_progress" | "completed";

export type CourseView = {
  slug: string;
  num: string;
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  summaryEn: string;
  durationAr: string;
  durationEn: string;
  level: string;
  status: CourseStatus;
  percent: number;
  hasCertificate: boolean;
  certificateCode: string | null;
  score: number | null;
};

export type ExamStatus = "locked" | "available" | "passed" | "retake";

export type LearnerModel = {
  displayName: string;
  memberSince: string | null;
  courses: CourseView[];
  totalModules: number;
  completedModules: number;
  percent: number;
  remaining: number;
  certificates: LearnerDashboardData["certificates"];
  examStatus: ExamStatus;
  latestExamScore: number | null;
  examAttempts: number;
  passThreshold: number;
  sessions: LearnerDashboardData["sessions"];
  orgNameAr: string;
  orgNameEn: string;
};

export const PASS_THRESHOLD = 80;

export function buildLearnerModel(data: LearnerDashboardData): LearnerModel {
  const progressBySlug = new Map(data.progress.map((p) => [p.lesson_slug, p]));
  const certBySlug = new Map(
    data.certificates
      .filter((c) => c.is_valid && c.module_slug)
      .map((c) => [c.module_slug as string, c]),
  );

  const courses: CourseView[] = MODULES.map((m) => {
    const prog = progressBySlug.get(m.slug);
    const cert = certBySlug.get(m.slug);
    const completed = !!cert || !!prog?.completed;
    const status: CourseStatus = completed ? "completed" : prog ? "in_progress" : "not_started";
    const percent = completed ? 100 : prog ? 50 : 0;
    return {
      slug: m.slug,
      num: m.num,
      titleAr: m.title.ar,
      titleEn: m.title.en,
      summaryAr: m.summary.ar,
      summaryEn: m.summary.en,
      durationAr: m.duration.ar,
      durationEn: m.duration.en,
      level: m.tags?.[0] ?? "أساسي",
      status,
      percent,
      hasCertificate: !!cert,
      certificateCode: cert?.certificate_code ?? null,
      score: cert?.overall_score != null ? Number(cert.overall_score) : (prog?.practice_score != null ? Number(prog.practice_score) : null),
    };
  });

  const totalModules = courses.length;
  const completedModules = courses.filter((c) => c.status === "completed").length;
  const percent = totalModules ? Math.round((completedModules / totalModules) * 100) : 0;

  const passedExam = data.examAttempts.some((a) => a.passed);
  const latest = data.examAttempts[0] ?? null;
  const examStatus: ExamStatus = passedExam
    ? "passed"
    : completedModules < totalModules
      ? "locked"
      : data.examAttempts.length > 0
        ? "retake"
        : "available";

  return {
    displayName: data.profile.full_name?.trim() || data.profile.email?.split("@")[0] || "المتعلم",
    memberSince: data.profile.created_at ?? null,
    courses,
    totalModules,
    completedModules,
    percent,
    remaining: totalModules - completedModules,
    certificates: data.certificates,
    examStatus,
    latestExamScore: latest?.score != null ? Number(latest.score) : null,
    examAttempts: data.examAttempts.length,
    passThreshold: PASS_THRESHOLD,
    sessions: data.sessions,
    orgNameAr: data.organisation?.name_ar ?? "أكاديمية أقلع",
    orgNameEn: data.organisation?.name_en ?? "Aqla Academy",
  };
}

export const CERTIFICATE_TYPE_LABELS: Record<string, string> = {
  module_completion: "شهادة إتمام وحدة",
  program_completion: "شهادة إتمام البرنامج",
  abstinence_90: "شهادة الامتناع لمدة 90 يوماً",
  ambassador: "شهادة سفير أقلع",
  trained_volunteer: "شهادة المتطوع المدرّب",
};
