import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useLang, useLangState, LangContext, type Lang } from "@/lib/i18n";
import { submitVolunteer } from "@/lib/volunteer.functions";
import { ArrowLeft, ArrowRight, Languages, Users, ShieldCheck, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/volunteer")({
  head: () => ({
    meta: [
      { title: "Volunteer & Training — Aqla" },
      { name: "description", content: "Join the Aqla volunteer & training pathway." },
    ],
  }),
  component: Page,
});

const INTERESTS = [
  "awareness_campaigns",
  "smoker_support",
  "data_entry",
  "follow_up_coordination",
  "content_creation",
  "events",
] as const;
type Interest = (typeof INTERESTS)[number];

type State = {
  full_name: string;
  mobile: string;
  email: string;
  age: string;
  gender: string;
  city: string;
  affiliation: string;
  academic_level: string;
  preferred_language: Lang;
  preferred_contact: "whatsapp" | "sms" | "phone" | "email";
  motivation: string;
  prior_awareness_work: "yes" | "no" | "";
  smoking_status: "smoker" | "former_smoker" | "non_smoker" | "";
  availability: string;
  interests: Interest[];
  screening: {
    agree_professional_boundaries: boolean;
    understand_no_medical_advice: boolean;
    agree_clinical_referral: boolean;
    agree_complete_training: boolean;
  };
};

function Page() {
  const ctx = useLangState();
  return (
    <LangContext.Provider value={ctx}>
      <Flow />
    </LangContext.Provider>
  );
}

function Flow() {
  const { t, lang, setLang, dir } = useLang();
  const [step, setStep] = useState(0); // 0 intro, 1 form, 2 screening, 3 done
  const [code, setCode] = useState<string | null>(null);
  const submit = useServerFn(submitVolunteer);
  const [busy, setBusy] = useState(false);
  const [s, setS] = useState<State>({
    full_name: "",
    mobile: "",
    email: "",
    age: "",
    gender: "",
    city: "",
    affiliation: "",
    academic_level: "",
    preferred_language: lang,
    preferred_contact: "whatsapp",
    motivation: "",
    prior_awareness_work: "",
    smoking_status: "",
    availability: "",
    interests: [],
    screening: {
      agree_professional_boundaries: false,
      understand_no_medical_advice: false,
      agree_clinical_referral: false,
      agree_complete_training: false,
    },
  });

  const totalSteps = 3;
  const progress = step === 3 ? 100 : Math.round((step / totalSteps) * 100);

  function toggleInterest(i: Interest) {
    setS((p) => ({
      ...p,
      interests: p.interests.includes(i) ? p.interests.filter((x) => x !== i) : [...p.interests, i],
    }));
  }

  function validateForm() {
    if (s.full_name.trim().length < 2) return t.fullName;
    if (s.mobile.trim().length < 6) return t.mobile;
    if (s.interests.length === 0) return t.interestsTitle;
    return null;
  }

  function validateScreening() {
    const sc = s.screening;
    if (!sc.agree_professional_boundaries || !sc.understand_no_medical_advice || !sc.agree_clinical_referral || !sc.agree_complete_training)
      return t.required;
    return null;
  }

  async function onSubmit() {
    const err = validateScreening();
    if (err) { toast.error(err); return; }
    setBusy(true);
    try {
      const res = await submit({
        data: {
          full_name: s.full_name.trim(),
          mobile: s.mobile.trim(),
          email: s.email.trim() || null,
          age: s.age ? Number(s.age) : null,
          gender: s.gender || null,
          city: s.city.trim() || null,
          affiliation: s.affiliation.trim() || null,
          academic_level: s.academic_level || null,
          preferred_language: s.preferred_language,
          preferred_contact: s.preferred_contact,
          motivation: s.motivation.trim() || null,
          prior_awareness_work: s.prior_awareness_work ? s.prior_awareness_work === "yes" : null,
          smoking_status: (s.smoking_status || null) as never,
          availability: s.availability.trim() || null,
          interests: s.interests,
          screening: s.screening as never,
        },
      });
      setCode(res.code);
      setStep(3);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div dir={dir} className="min-h-screen bg-background">
      <header className="border-b bg-card/70 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl volunteer-gradient text-white">
              <Users className="h-5 w-5" />
            </div>
            <span className="font-semibold">{t.brandShort}</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="gap-1.5">
            <Languages className="h-4 w-4" />{lang === "ar" ? "English" : "العربية"}
          </Button>
        </div>
        <div className="mx-auto max-w-3xl px-4 pb-3">
          <Progress value={progress} />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {step === 0 && (
          <Card className="overflow-hidden rounded-3xl border-0 shadow-elegant">
            <div className="volunteer-gradient p-6 text-white">
              <h1 className="text-2xl font-bold">{t.volIntroTitle}</h1>
            </div>
            <div className="space-y-4 p-6">
              <p className="text-foreground/80">{t.volIntroBody}</p>
              <Card className="rounded-2xl border-l-4 border-l-primary p-4">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm text-muted-foreground">{t.volIntroNote}</p>
                </div>
              </Card>
              <div className="flex justify-end pt-2">
                <Button onClick={() => setStep(1)} className="volunteer-gradient border-0 text-white">
                  {t.volBegin}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {step === 1 && (
          <Card className="rounded-3xl p-6 shadow-elegant">
            <h2 className="text-xl font-semibold">{t.volFormTitle}</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label={t.fullName} req>
                <Input value={s.full_name} onChange={(e) => setS({ ...s, full_name: e.target.value })} />
              </Field>
              <Field label={t.mobile} req>
                <Input value={s.mobile} onChange={(e) => setS({ ...s, mobile: e.target.value })} />
              </Field>
              <Field label={t.email}>
                <Input type="email" value={s.email} onChange={(e) => setS({ ...s, email: e.target.value })} />
              </Field>
              <Field label={t.age}>
                <Input type="number" min={14} max={100} value={s.age} onChange={(e) => setS({ ...s, age: e.target.value })} />
              </Field>
              <Field label={`${t.gender} ${t.optional}`}>
                <Select value={s.gender} onValueChange={(v) => setS({ ...s, gender: v })}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{lang === "ar" ? "ذكر" : "Male"}</SelectItem>
                    <SelectItem value="female">{lang === "ar" ? "أنثى" : "Female"}</SelectItem>
                    <SelectItem value="prefer_not">{lang === "ar" ? "أفضل عدم الإفصاح" : "Prefer not to say"}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t.city}>
                <Input value={s.city} onChange={(e) => setS({ ...s, city: e.target.value })} />
              </Field>
              <Field label={t.affiliation}>
                <Input value={s.affiliation} onChange={(e) => setS({ ...s, affiliation: e.target.value })} />
              </Field>
              <Field label={t.academicLevel}>
                <Select value={s.academic_level} onValueChange={(v) => setS({ ...s, academic_level: v })}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high_school">{lang === "ar" ? "ثانوي" : "High school"}</SelectItem>
                    <SelectItem value="diploma">{lang === "ar" ? "دبلوم" : "Diploma"}</SelectItem>
                    <SelectItem value="undergraduate">{lang === "ar" ? "بكالوريوس" : "Undergraduate"}</SelectItem>
                    <SelectItem value="graduate">{lang === "ar" ? "دراسات عليا" : "Graduate"}</SelectItem>
                    <SelectItem value="working">{lang === "ar" ? "موظف/عامل" : "Working professional"}</SelectItem>
                    <SelectItem value="other">{lang === "ar" ? "أخرى" : "Other"}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t.prefLang}>
                <Select value={s.preferred_language} onValueChange={(v) => setS({ ...s, preferred_language: v as Lang })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t.prefContact}>
                <Select value={s.preferred_contact} onValueChange={(v) => setS({ ...s, preferred_contact: v as State["preferred_contact"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="phone">{lang === "ar" ? "اتصال" : "Phone call"}</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="mt-5 space-y-4">
              <Field label={t.motivation}>
                <Textarea rows={3} value={s.motivation} onChange={(e) => setS({ ...s, motivation: e.target.value })} />
              </Field>

              <Field label={t.priorAwareness}>
                <RadioGroup
                  value={s.prior_awareness_work}
                  onValueChange={(v) => setS({ ...s, prior_awareness_work: v as State["prior_awareness_work"] })}
                  className="flex gap-6"
                >
                  <label className="flex items-center gap-2"><RadioGroupItem value="yes" />{t.yes}</label>
                  <label className="flex items-center gap-2"><RadioGroupItem value="no" />{t.no}</label>
                </RadioGroup>
              </Field>

              <Field label={t.smokingStatus}>
                <RadioGroup
                  value={s.smoking_status}
                  onValueChange={(v) => setS({ ...s, smoking_status: v as State["smoking_status"] })}
                  className="flex flex-wrap gap-6"
                >
                  <label className="flex items-center gap-2"><RadioGroupItem value="smoker" />{t.smoker}</label>
                  <label className="flex items-center gap-2"><RadioGroupItem value="former_smoker" />{t.formerSmoker}</label>
                  <label className="flex items-center gap-2"><RadioGroupItem value="non_smoker" />{t.nonSmoker}</label>
                </RadioGroup>
              </Field>

              <Field label={t.interestsTitle} req>
                <div className="grid gap-2 sm:grid-cols-2">
                  {INTERESTS.map((i) => (
                    <label key={i} className="flex items-start gap-2 rounded-xl border p-3 hover:bg-accent/30">
                      <Checkbox checked={s.interests.includes(i)} onCheckedChange={() => toggleInterest(i)} />
                      <span className="text-sm">{t[`int_${i}` as keyof typeof t]}</span>
                    </label>
                  ))}
                </div>
              </Field>

              <Field label={t.availability}>
                <Textarea rows={2} value={s.availability} onChange={(e) => setS({ ...s, availability: e.target.value })} />
              </Field>
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(0)}>
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />{t.back}
              </Button>
              <Button
                className="volunteer-gradient border-0 text-white"
                onClick={() => {
                  const err = validateForm();
                  if (err) { toast.error(err); return; }
                  setStep(2);
                }}
              >
                {t.next}<ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card className="rounded-3xl p-6 shadow-elegant">
            <h2 className="text-xl font-semibold">{t.screeningTitle}</h2>
            <div className="mt-4 space-y-3">
              {([
                ["agree_professional_boundaries", t.screen1],
                ["understand_no_medical_advice", t.screen2],
                ["agree_clinical_referral", t.screen3],
                ["agree_complete_training", t.screen4],
              ] as const).map(([k, label]) => (
                <label key={k} className="flex items-start gap-3 rounded-xl border p-3">
                  <Checkbox
                    checked={s.screening[k]}
                    onCheckedChange={(v) =>
                      setS({ ...s, screening: { ...s.screening, [k]: Boolean(v) } })
                    }
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />{t.back}
              </Button>
              <Button className="volunteer-gradient border-0 text-white" disabled={busy} onClick={onSubmit}>
                {busy ? t.saving : t.submit}
              </Button>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card className="rounded-3xl p-8 text-center shadow-elegant">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full volunteer-gradient text-white">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-2xl font-bold">{t.volSubmittedTitle}</h2>
            <p className="mt-2 text-muted-foreground">{t.volSubmittedBody}</p>
            {code && (
              <div className="mt-4 inline-block rounded-xl bg-muted px-4 py-2 text-sm">
                <span className="text-muted-foreground">{t.yourApplicationCode}: </span>
                <span className="font-mono font-semibold">{code}</span>
              </div>
            )}
            <div className="mt-6">
              <Link to="/"><Button variant="outline">{t.backHome}</Button></Link>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}

function Field({ label, req, children }: { label: string; req?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">
        {label}
        {req ? <span className="ms-1 text-destructive">*</span> : null}
      </Label>
      {children}
    </div>
  );
}
