import { track } from "@/lib/events";
import { Link } from "@tanstack/react-router";
import { Award, BookOpen, GraduationCap, TrendingUp, CheckCircle2, Lock, PlayCircle, FileText, CalendarDays, Video } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CERTIFICATE_TYPE_LABELS, type CourseView, type LearnerModel } from "@/lib/dashboard-model";

const dateFmt = new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium" });
const dateTimeFmt = new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium", timeStyle: "short" });

export function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  try { return dateFmt.format(new Date(iso)); } catch { return "—"; }
}
export function formatDateTime(iso: string | null | undefined) {
  if (!iso) return "—";
  try { return dateTimeFmt.format(new Date(iso)); } catch { return "—"; }
}

/* -------------------------------------------------------------- Welcome */

export function WelcomeHeader({ model }: { model: LearnerModel }) {
  return (
    <section className="rounded-3xl bg-gradient-to-l from-[#0A1A0E] via-[#0e4a30] to-[#006C35] p-6 text-white shadow-lg sm:p-8">
      <p className="text-[13px] text-white/70">{model.orgNameAr}</p>
      <h1 className="mt-1 text-2xl font-bold sm:text-3xl">أهلاً {model.displayName} </h1>
      <p className="mt-2 max-w-xl text-[13.5px] leading-7 text-white/80">
        تابع رحلتك التدريبية، أكمل وحداتك، واحصل على شهاداتك المعتمدة.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <StatTile icon={BookOpen} label="الوحدات المكتملة" value={`${model.completedModules} / ${model.totalModules}`} />
        <StatTile icon={TrendingUp} label="نسبة التقدم" value={`${model.percent}%`} />
        <StatTile icon={Award} label="الشهادات المحصّلة" value={String(model.certificates.filter((c) => c.is_valid).length)} />
      </div>
      <div className="mt-5">
        <Progress value={model.percent} className="h-2 bg-white/20" />
        <p className="mt-2 text-[12px] text-white/70">
          {model.remaining > 0 ? `تبقّى ${model.remaining} وحدة لإكمال البرنامج` : "أكملت جميع الوحدات — أحسنت!"}
        </p>
      </div>
    </section>
  );
}

function StatTile({ icon: Icon, label, value }: { icon: typeof Award; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
      <div className="flex items-center gap-2 text-white/75">
        <Icon className="h-4 w-4" />
        <span className="text-[12px]">{label}</span>
      </div>
      <p className="mt-1.5 text-xl font-bold">{value}</p>
    </div>
  );
}

/* --------------------------------------------------------------- Course */

const STATUS_META: Record<CourseView["status"], { label: string; className: string }> = {
  completed: { label: "مكتملة", className: "bg-surface-muted text-ink-secondary" },
  in_progress: { label: "قيد التقدم", className: "bg-amber-100 text-amber-900" },
  not_started: { label: "لم تبدأ", className: "bg-muted text-muted-foreground" },
};

export function CourseCard({ course, onStart }: { course: CourseView; onStart?: (slug: string) => void }) {
  const meta = STATUS_META[course.status];
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="secondary" className="rounded-full text-[11px]">الوحدة {course.num}</Badge>
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${meta.className}`}>{meta.label}</span>
        </div>
        <CardTitle className="mt-2 text-[15px] leading-7">{course.titleAr}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col pt-0">
        <p className="line-clamp-3 text-[13px] leading-6 text-muted-foreground">{course.summaryAr}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-muted-foreground">
          <span> {course.durationAr}</span>
          <span>· {course.level}</span>
          {course.score != null && <span>· النتيجة {course.score}%</span>}
        </div>
        <div className="mt-3">
          <Progress value={course.percent} className="h-1.5" />
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Button asChild size="sm" className="flex-1" onClick={() => { track("module_start", course.slug); onStart?.(course.slug); }}>
            <Link to="/modules/$slug" params={{ slug: course.slug }}>
              {course.status === "completed" ? "مراجعة الوحدة" : course.status === "in_progress" ? "متابعة" : "ابدأ الآن"}
            </Link>
          </Button>
          {course.certificateCode && (
            <Button asChild size="sm" variant="outline">
              <Link to="/academy-certificate/$code" params={{ code: course.certificateCode }}>الشهادة</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ----------------------------------------------------------- Assessment */

export function FinalAssessmentCard({ model }: { model: LearnerModel }) {
  const locked = model.examStatus === "locked";
  const passed = model.examStatus === "passed";
  return (
    <Card className="border-[#006C35]/25 bg-[#006C35]/[0.04]">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-[#006C35]" />
          <CardTitle className="text-[15px]">التقييم النهائي</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-[13px] leading-7 text-muted-foreground">
          يُفتح التقييم النهائي بعد إكمال جميع وحدات البرنامج، ودرجة النجاح {model.passThreshold}%.
        </p>
        <ul className="mt-3 space-y-1.5 text-[12.5px]">
          <li className="flex items-center gap-2">
            {model.remaining === 0 ? <CheckCircle2 className="h-4 w-4 text-digital" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
            إكمال الوحدات ({model.completedModules}/{model.totalModules})
          </li>
          <li className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            المحاولات السابقة: {model.examAttempts}
            {model.latestExamScore != null && ` · آخر نتيجة ${model.latestExamScore}%`}
          </li>
        </ul>
        <div className="mt-4">
          {passed ? (
            <Button asChild size="sm" variant="outline">
              <Link to="/dashboard/certificates">عرض شهادة البرنامج</Link>
            </Button>
          ) : (
            <Button asChild size="sm" disabled={locked}>
              <Link to="/academy">
                <PlayCircle className="me-2 h-4 w-4" />
                {locked ? "أكمل الوحدات لفتح التقييم" : model.examStatus === "retake" ? "إعادة المحاولة" : "ابدأ التقييم النهائي"}
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------------------------------------------------------- Certificate */

export function CertificateCard({ cert }: { cert: LearnerModel["certificates"][number] }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] text-muted-foreground">
              {CERTIFICATE_TYPE_LABELS[cert.certificate_type] ?? "شهادة"}
            </p>
            <h3 className="mt-1 text-[15px] font-semibold">{cert.module_slug ?? "برنامج أكاديمية أقلع"}</h3>
            <p className="mt-1 text-[12px] text-muted-foreground">
              صدرت في {formatDate(cert.issued_at)} · رقم {cert.certificate_code}
              {cert.overall_score != null && ` · النتيجة ${cert.overall_score}%`}
            </p>
          </div>
          <Award className={cert.is_valid ? "h-6 w-6 text-[#006C35]" : "h-6 w-6 text-muted-foreground"} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link to="/academy-certificate/$code" params={{ code: cert.certificate_code }} onClick={() => track("certificate_download", cert.certificate_code)}>عرض / تحميل PDF</Link>
          </Button>
          <Button size="sm" variant="outline" onClick={() => window.print()}>طباعة</Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------- Sessions */

export function SessionRow({ session }: { session: LearnerModel["sessions"][number] }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#006C35]/10 text-[#006C35]">
        {session.session_type === "webinar" ? <Video className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="text-[14px] font-semibold">{session.title_ar}</h4>
        {session.description_ar && (
          <p className="mt-1 line-clamp-2 text-[12.5px] leading-6 text-muted-foreground">{session.description_ar}</p>
        )}
        <p className="mt-1 text-[12px] text-muted-foreground">{formatDateTime(session.starts_at)}</p>
      </div>
      {session.join_url && (
        <Button asChild size="sm" variant="outline">
          <a href={session.join_url} target="_blank" rel="noopener noreferrer">انضمام</a>
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-8 text-center">
      <p className="text-[14px] font-medium">{title}</p>
      {hint && <p className="mt-1 text-[12.5px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
