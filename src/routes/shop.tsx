import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ShieldAlert, Info, ArrowRight, Plus, Check, Languages, ShoppingBag, ExternalLink } from "lucide-react";
import { LangContext, useLang, useLangState } from "@/lib/i18n";
import { trackEvent } from "@/lib/track-event";
import { getShopCatalog, submitNrtRequest, type ShopProduct } from "@/lib/shop.functions";
import { SocialLinks } from "@/components/SocialLinks";
import aqlaLogo from "@/assets/aqla-logo.png";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Aqla Support Shop — Request NRT for Review" },
      {
        name: "description",
        content:
          "Request nicotine replacement therapy (NRT) or support options from Aqla. All requests are reviewed by the Aqla team. Not a prescription.",
      },
      { property: "og:title", content: "Aqla Support Shop" },
      {
        property: "og:description",
        content: "Request nicotine replacement therapy or support options. All requests are reviewed by the Aqla team.",
      },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const ctx = useLangState();
  return (
    <LangContext.Provider value={ctx}>
      <Inner />
    </LangContext.Provider>
  );
}

type Stage = "browse"| "form"| "confirmed";

type ConfirmedResult = {
  request_code: string;
  requires_clinician_review: boolean;
};

function Inner() {
  const { lang, setLang, dir } = useLang();
  const isAr = lang === "ar";

  const catalogFn = useServerFn(getShopCatalog);
  const { data, isLoading } = useQuery({
    queryKey: ["shop-catalog"],
    queryFn: () => catalogFn(),
    staleTime: 60_000,
  });

  const products = data?.products ?? [];
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [stage, setStage] = useState<Stage>("browse");
  const [confirmed, setConfirmed] = useState<ConfirmedResult | null>(null);
  const [learnMoreSlug, setLearnMoreSlug] = useState<string | null>(null);

  useEffect(() => {
    trackEvent("shop_page_viewed");
  }, []);

  const learnMoreProduct = useMemo(
    () => products.find((p) => p.product_slug === learnMoreSlug) ?? null,
    [products, learnMoreSlug],
  );

  function toggleSelect(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else {
        next.add(slug);
        trackEvent("product_added_to_request");
      }
      return next;
    });
  }

  function startRequest() {
    if (selected.size === 0) {
      toast.error(isAr ? "اختر منتجًا واحدًا على الأقل": "Select at least one product.");
      return;
    }
    trackEvent("nrt_request_started");
    setStage("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div dir={dir} className="min-h-screen bg-background">
      <header className="border-b bg-card/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/"className="flex items-center gap-3">
            <img src={aqlaLogo} alt="Aqla — أقلع logo"className="h-[38px] w-auto object-contain sm:h-12" />
            <div className="leading-tight">
              <div className="font-semibold tracking-tight">{isAr ? "أقلع": "Aqla"}</div>
              <div className="text-[11px] text-muted-foreground">Aqla — أقلع</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost"size="sm"onClick={() => setLang(isAr ? "en": "ar")} className="gap-1.5">
              <Languages className="h-4 w-4" />
              {isAr ? "English": "العربية"}
            </Button>
            <Link to="/"><Button variant="ghost"size="sm">{isAr ? "الرئيسية": "Home"}</Button></Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        {stage === "browse" && (
          <BrowseStage
            isAr={isAr}
            products={products}
            isLoading={isLoading}
            selected={selected}
            toggleSelect={toggleSelect}
            onLearnMore={(slug) => {
              trackEvent("product_learn_more_clicked");
              setLearnMoreSlug(slug);
            }}
            onContinue={startRequest}
          />
        )}

        {stage === "form" && (
          <FormStage
            isAr={isAr}
            products={products}
            selected={selected}
            onCancel={() => setStage("browse")}
            onSubmitted={(res) => {
              setConfirmed(res);
              setStage("confirmed");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}

        {stage === "confirmed" && confirmed && (
          <ConfirmedStage isAr={isAr} result={confirmed} />
        )}
      </main>

      <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-muted-foreground">
        <SocialLinks />
        <p className="mt-3">© {isAr ? "أقلع": "Aqla"} — {new Date().getFullYear()}</p>
      </footer>

      <Dialog open={learnMoreProduct !== null} onOpenChange={(o) => !o && setLearnMoreSlug(null)}>
        {learnMoreProduct && (
          <LearnMoreDialog isAr={isAr} product={learnMoreProduct} />
        )}
      </Dialog>
    </div>
  );
}

/* -------------------- Browse -------------------- */

function BrowseStage(props: {
  isAr: boolean;
  products: ShopProduct[];
  isLoading: boolean;
  selected: Set<string>;
  toggleSelect: (slug: string) => void;
  onLearnMore: (slug: string) => void;
  onContinue: () => void;
}) {
  const { isAr, products, isLoading, selected, toggleSelect, onLearnMore, onContinue } = props;
  return (
    <>
      <section className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
          <ShoppingBag className="h-3.5 w-3.5" />
          {isAr ? "طلب للمراجعة فقط": "Request for review only"}
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          {isAr ? "متجر أقلع للدعم": "Aqla Support Shop"}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
          {isAr
            ? "اختر المنتجات أو وسائل الدعم التي ترغب بمعرفة المزيد عنها، وسيقوم فريق أقلع بمراجعة طلبك والتواصل معك. لا تُعد هذه الصفحة وصفة طبية أو توصية علاجية.": "Choose the products or support options you would like to learn more about. The Aqla team will review your request and contact you. This page is not a prescription or medical recommendation."}
        </p>
      </section>

      <Card className="mt-6 rounded-2xl border-l-4 border-l-destructive p-4">
        <div className="flex gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <p className="text-sm leading-7">
            {isAr ? (
              <><b>تنبيه مهم:</b> منتجات بدائل النيكوتين قد لا تكون مناسبة للجميع. إذا كنت أقل من 18 سنة، أو حاملًا أو مرضعًا، أو لديك ألم في الصدر، أمراض قلب، ضيق تنفس شديد، أو تستخدم أدوية منتظمة، فيجب مراجعة مختص قبل استخدام أي منتج.</>
            ) : (
              <><b>Important notice:</b> Nicotine replacement products may not be suitable for everyone. If you are under 18, pregnant or breastfeeding, have chest pain, heart disease, severe shortness of breath, or take regular medications, you should be reviewed by a clinician before using any product.</>
            )}
          </p>
        </div>
      </Card>

      <section className="mt-8">
        {isLoading && (
          <p className="text-center text-sm text-muted-foreground">{isAr ? "جارٍ التحميل…": "Loading…"}</p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          {products.map((p) => {
            const isSel = selected.has(p.product_slug);
            const options = (p.available_options?.options ?? []) as string[];
            return (
              <Card
                key={p.id}
                className={`rounded-2xl border-0 p-5 shadow-elegant card-gradient ${isSel ? "ring-2 ring-primary": ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold">{isAr ? p.name_ar : p.name_en}</h3>
                  {isSel && <Badge className="bg-primary text-primary-foreground">{isAr ? "مضاف": "Added"}</Badge>}
                </div>
                <p className="mt-2 text-sm leading-6 text-foreground/75">
                  {isAr ? p.description_ar : p.description_en}
                </p>
                {options.length > 0 && (
                  <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                    {options.map((o, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="mt-1 inline-block h-1 w-1 rounded-full bg-muted-foreground" />
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => toggleSelect(p.product_slug)}
                    variant={isSel ? "secondary": "default"}
                    className={isSel ? "": "quit-gradient border-0 text-white"}
                  >
                    {isSel ? <Check className="h-4 w-4"/> : <Plus className="h-4 w-4" />}
                    {isSel ? (isAr ? "إزالة": "Remove") : (isAr ? "أضف للطلب": "Add to request")}
                  </Button>
                  <Button size="sm"variant="ghost" onClick={() => onLearnMore(p.product_slug)}>
                    <Info className="h-4 w-4" />
                    {isAr ? "معرفة المزيد": "Learn more"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col items-center gap-2">
          <Button
            size="lg"
            onClick={onContinue}
            disabled={selected.size === 0}
            className="quit-gradient border-0 text-white"
          >
            {isAr ? "إرسال الطلب للمراجعة": "Submit request for review"}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
          <p className="text-xs text-muted-foreground">
            {isAr
              ? "سيتم استكمال بياناتك في الخطوة التالية. جميع الطلبات تخضع لمراجعة الفريق.": "You will complete your details in the next step. All requests are reviewed by the team."}
          </p>
        </div>
      </section>
    </>
  );
}

/* -------------------- Learn more dialog -------------------- */

function LearnMoreDialog({ isAr, product }: { isAr: boolean; product: ShopProduct }) {
  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>{isAr ? product.name_ar : product.name_en}</DialogTitle>
        <DialogDescription>
          {isAr ? product.description_ar : product.description_en}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3 text-sm leading-7">
        <p>
          <b>{isAr ? "كيفية الاستخدام بشكل عام:": "General use concept:"}</b>{""}
          {isAr
            ? "تختلف طريقة الاستخدام حسب المنتج والشخص. لا نقدم هنا أي تعليمات للجرعة. يحتاج اختيار النوع والاستخدام مراجعة من مختص أو صيدلي.": "How to use varies by product and person. We do not provide dosing here. Choosing the type and use requires review by a clinician or pharmacist."}
        </p>
        <p>
          <b>{isAr ? "من يجب أن يراجع قبل الاستخدام:": "Who should seek review first:"}</b>{""}
          {isAr
            ? "الحوامل والمرضعات، الأشخاص أقل من 18 سنة، من لديهم أمراض قلب أو ألم صدر، ضيق تنفس شديد، أو يستخدمون أدوية منتظمة.": "Pregnant or breastfeeding people, anyone under 18, those with heart disease or chest pain, severe shortness of breath, or anyone taking regular medications."}
        </p>
        <p>
          <b>{isAr ? "آثار جانبية شائعة عامة:": "General common side effects:"}</b>{""}
          {isAr
            ? "قد تشمل تهيجًا موضعيًا، صداعًا، غثيانًا، أو اضطرابًا بسيطًا في النوم. تختلف بين المنتجات والأشخاص.": "May include local irritation, headache, nausea, or mild sleep disturbance. Varies by product and person."}
        </p>
        <Card className="rounded-xl border-l-4 border-l-primary bg-primary-soft/50 p-3 text-sm">
          {isAr
            ? "هذا ليس وصفة طبية. أكمل تقييم أقلع أو انتظر مراجعة الفريق قبل الاستخدام.": "This is not a prescription. Complete the Aqla assessment or wait for team review before use."}
        </Card>
      </div>
      <DialogFooter className="sm:justify-start">
        <Link to="/assessment">
          <Button variant="outline"size="sm">
            {isAr ? "إكمال تقييم أقلع": "Complete Aqla assessment"}
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </DialogFooter>
    </DialogContent>
  );
}

/* -------------------- Form -------------------- */

type FormState = {
  full_name: string;
  mobile_number: string;
  email: string;
  city: string;
  district: string;
  delivery_address: string;
  preferred_contact_method: ""| "whatsapp"| "phone"| "email";
  preferred_language: ""| "ar"| "en";
  notes: string;
  age_group: ""| "under_18"| "18_24"| "25_34"| "35_44"| "45_plus";
  pregnant_or_breastfeeding: ""| "yes"| "no"| "prefer_not_to_say"| "not_applicable";
  chest_pain_or_heart_condition: ""| "yes"| "no"| "prefer_not_to_say";
  severe_breathing_problem: ""| "yes"| "no"| "prefer_not_to_say";
  taking_regular_medications: ""| "yes"| "no"| "prefer_not_to_say";
  completed_aqla_assessment: ""| "yes"| "no";
  consent_to_contact: boolean;
  acknowledgement_not_prescription: boolean;
};

const initialForm: FormState = {
  full_name: "",
  mobile_number: "",
  email: "",
  city: "",
  district: "",
  delivery_address: "",
  preferred_contact_method: "",
  preferred_language: "",
  notes: "",
  age_group: "",
  pregnant_or_breastfeeding: "",
  chest_pain_or_heart_condition: "",
  severe_breathing_problem: "",
  taking_regular_medications: "",
  completed_aqla_assessment: "",
  consent_to_contact: false,
  acknowledgement_not_prescription: false,
};

function FormStage(props: {
  isAr: boolean;
  products: ShopProduct[];
  selected: Set<string>;
  onCancel: () => void;
  onSubmitted: (res: ConfirmedResult) => void;
}) {
  const { isAr, products, selected, onCancel, onSubmitted } = props;
  const [form, setForm] = useState<FormState>({ ...initialForm, preferred_language: isAr ? "ar": "en" });
  const [submitting, setSubmitting] = useState(false);
  const submitFn = useServerFn(submitNrtRequest);

  const selectedProducts = useMemo(
    () => products.filter((p) => selected.has(p.product_slug)),
    [products, selected],
  );

  function update<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.consent_to_contact || !form.acknowledgement_not_prescription) {
      toast.error(isAr ? "يرجى الموافقة على الإقرارات المطلوبة": "Please accept the required acknowledgements.");
      return;
    }
    if (form.full_name.trim().length < 2 || form.mobile_number.trim().length < 5) {
      toast.error(isAr ? "الاسم ورقم الجوال مطلوبان": "Name and mobile number are required.");
      return;
    }
    if (selected.size === 0) {
      toast.error(isAr ? "اختر منتجًا واحدًا على الأقل": "Select at least one product.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitFn({
        data: {
          full_name: form.full_name.trim(),
          mobile_number: form.mobile_number.trim(),
          email: form.email.trim() || undefined,
          city: form.city.trim() || undefined,
          district: form.district.trim() || undefined,
          delivery_address: form.delivery_address.trim() || undefined,
          preferred_contact_method: form.preferred_contact_method || undefined,
          preferred_language: form.preferred_language || undefined,
          selected_products: Array.from(selected),
          notes: form.notes.trim() || undefined,
          age_group: form.age_group || undefined,
          pregnant_or_breastfeeding: form.pregnant_or_breastfeeding || undefined,
          chest_pain_or_heart_condition: form.chest_pain_or_heart_condition || undefined,
          severe_breathing_problem: form.severe_breathing_problem || undefined,
          taking_regular_medications: form.taking_regular_medications || undefined,
          completed_aqla_assessment: form.completed_aqla_assessment || undefined,
          consent_to_contact: form.consent_to_contact,
          acknowledgement_not_prescription: form.acknowledgement_not_prescription,
        },
      });
      if (!res.ok) {
        toast.error(res.error ?? (isAr ? "تعذّر إرسال الطلب": "Could not submit request."));
        return;
      }
      trackEvent("nrt_request_submitted");
      if (res.requires_clinician_review) trackEvent("nrt_request_requires_review");
      onSubmitted({ request_code: res.request_code, requires_clinician_review: res.requires_clinician_review });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  const yesNoPns: { v: FormState["chest_pain_or_heart_condition"]; ar: string; en: string }[] = [
    { v: "yes", ar: "نعم", en: "Yes" },
    { v: "no", ar: "لا", en: "No" },
    { v: "prefer_not_to_say", ar: "أفضّل عدم الإجابة", en: "Prefer not to say" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {isAr ? "إكمال بيانات الطلب": "Complete your request"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isAr
            ? "بياناتك تستخدم لمراجعة الفريق والتواصل معك فقط.": "Your details are used only for team review and contacting you."}
        </p>
      </div>

      <Card className="p-4">
        <div className="text-sm font-semibold">{isAr ? "المنتجات المختارة": "Selected products"}</div>
        <ul className="mt-2 space-y-1 text-sm">
          {selectedProducts.map((p) => (
            <li key={p.id} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span>{isAr ? p.name_ar : p.name_en}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="space-y-4 p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={isAr ? "الاسم الكامل": "Full name"} required>
            <Input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} required maxLength={120} />
          </Field>
          <Field label={isAr ? "رقم الجوال": "Mobile number"} required>
            <Input value={form.mobile_number} onChange={(e) => update("mobile_number", e.target.value)} required maxLength={40} />
          </Field>
          <Field label={isAr ? "البريد الإلكتروني (اختياري)": "Email (optional)"}>
            <Input type="email"value={form.email} onChange={(e) => update("email", e.target.value)} maxLength={255} />
          </Field>
          <Field label={isAr ? "المدينة": "City"}>
            <Input value={form.city} onChange={(e) => update("city", e.target.value)} maxLength={80} />
          </Field>
          <Field label={isAr ? "الحي (اختياري)": "District (optional)"}>
            <Input value={form.district} onChange={(e) => update("district", e.target.value)} maxLength={120} />
          </Field>
          <Field label={isAr ? "عنوان التوصيل (اختياري)": "Delivery address (optional)"}>
            <Input value={form.delivery_address} onChange={(e) => update("delivery_address", e.target.value)} maxLength={500} />
          </Field>
          <Field label={isAr ? "وسيلة التواصل المفضلة": "Preferred contact method"}>
            <Select value={form.preferred_contact_method} onValueChange={(v) => update("preferred_contact_method", v as FormState["preferred_contact_method"])}>
              <SelectTrigger><SelectValue placeholder={isAr ? "اختر": "Choose"} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="phone">{isAr ? "هاتف": "Phone"}</SelectItem>
                <SelectItem value="email">{isAr ? "بريد إلكتروني": "Email"}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label={isAr ? "اللغة المفضلة": "Preferred language"}>
            <Select value={form.preferred_language} onValueChange={(v) => update("preferred_language", v as FormState["preferred_language"])}>
              <SelectTrigger><SelectValue placeholder={isAr ? "اختر": "Choose"} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ar">العربية</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </Card>

      <Card className="space-y-4 p-4">
        <div className="text-sm font-semibold text-foreground">
          {isAr ? "أسئلة السلامة": "Safety screening"}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={isAr ? "الفئة العمرية": "Age group"}>
            <Select value={form.age_group} onValueChange={(v) => update("age_group", v as FormState["age_group"])}>
              <SelectTrigger><SelectValue placeholder={isAr ? "اختر": "Choose"} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="under_18">{isAr ? "أقل من 18": "Under 18"}</SelectItem>
                <SelectItem value="18_24">18–24</SelectItem>
                <SelectItem value="25_34">25–34</SelectItem>
                <SelectItem value="35_44">35–44</SelectItem>
                <SelectItem value="45_plus">{isAr ? "45 فأكثر": "45+"}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label={isAr ? "حامل أو مرضعة؟": "Pregnant or breastfeeding?"}>
            <Select value={form.pregnant_or_breastfeeding} onValueChange={(v) => update("pregnant_or_breastfeeding", v as FormState["pregnant_or_breastfeeding"])}>
              <SelectTrigger><SelectValue placeholder={isAr ? "اختر": "Choose"} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">{isAr ? "نعم": "Yes"}</SelectItem>
                <SelectItem value="no">{isAr ? "لا": "No"}</SelectItem>
                <SelectItem value="prefer_not_to_say">{isAr ? "أفضّل عدم الإجابة": "Prefer not to say"}</SelectItem>
                <SelectItem value="not_applicable">{isAr ? "لا ينطبق": "Not applicable"}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label={isAr ? "ألم صدر أو أمراض قلب؟": "Chest pain or heart condition?"}>
            <PickOne value={form.chest_pain_or_heart_condition} options={yesNoPns} onChange={(v) => update("chest_pain_or_heart_condition", v)} isAr={isAr} />
          </Field>
          <Field label={isAr ? "ضيق تنفس شديد؟": "Severe breathing problem?"}>
            <PickOne value={form.severe_breathing_problem} options={yesNoPns} onChange={(v) => update("severe_breathing_problem", v)} isAr={isAr} />
          </Field>
          <Field label={isAr ? "تستخدم أدوية منتظمة؟": "Taking regular medications?"}>
            <PickOne value={form.taking_regular_medications} options={yesNoPns} onChange={(v) => update("taking_regular_medications", v)} isAr={isAr} />
          </Field>
          <Field label={isAr ? "هل أكملت تقييم أقلع؟": "Completed the Aqla assessment?"}>
            <Select value={form.completed_aqla_assessment} onValueChange={(v) => update("completed_aqla_assessment", v as FormState["completed_aqla_assessment"])}>
              <SelectTrigger><SelectValue placeholder={isAr ? "اختر": "Choose"} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">{isAr ? "نعم": "Yes"}</SelectItem>
                <SelectItem value="no">{isAr ? "لا": "No"}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Field label={isAr ? "ملاحظات (اختياري)": "Notes (optional)"}>
          <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} maxLength={2000} rows={3} />
        </Field>
      </Card>

      <Card className="space-y-3 p-4">
        <label className="flex items-start gap-3">
          <Checkbox checked={form.acknowledgement_not_prescription} onCheckedChange={(v) => update("acknowledgement_not_prescription", Boolean(v))} />
          <span className="text-sm leading-6">
            {isAr
              ? "أوافق على أن هذا الطلب لا يُعد وصفة طبية أو توصية علاجية، وأن فريق أقلع سيقوم بمراجعته قبل التواصل معي.": "I understand that this request is not a prescription or treatment recommendation, and that the Aqla team will review it before contacting me."}
          </span>
        </label>
        <label className="flex items-start gap-3">
          <Checkbox checked={form.consent_to_contact} onCheckedChange={(v) => update("consent_to_contact", Boolean(v))} />
          <span className="text-sm leading-6">
            {isAr
              ? "أوافق على أن يتواصل معي فريق أقلع بخصوص هذا الطلب.": "I agree for the Aqla team to contact me about this request."}
          </span>
        </label>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button type="button"variant="outline"onClick={onCancel}>{isAr ? "العودة للمنتجات": "Back to products"}</Button>
        <Button type="submit"disabled={submitting} className="quit-gradient border-0 text-white">
          {submitting ? (isAr ? "جارٍ الإرسال…": "Sending…") : (isAr ? "إرسال الطلب للمراجعة": "Submit request for review")}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-sm">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
    </div>
  );
}

function PickOne<T extends string>({
  value, options, onChange, isAr,
}: {
  value: T | "";
  options: { v: T; ar: string; en: string }[];
  onChange: (v: T) => void;
  isAr: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <Button
          key={o.v}
          type="button"size="sm"variant={value === o.v ? "default": "outline"}
          onClick={() => onChange(o.v)}
          className={value === o.v ? "quit-gradient border-0 text-white": ""}
        >
          {isAr ? o.ar : o.en}
        </Button>
      ))}
    </div>
  );
}

/* -------------------- Confirmed -------------------- */

function ConfirmedStage({ isAr, result }: { isAr: boolean; result: ConfirmedResult }) {
  const nav = useNavigate();
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full quit-gradient text-white shadow-md">
        <Check className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-2xl font-semibold tracking-tight">
        {isAr ? "تم استلام طلبك بنجاح": "Your request has been received"}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {isAr ? "رقم الطلب:": "Request number:"} <b className="text-foreground">{result.request_code}</b>
      </p>

      {result.requires_clinician_review ? (
        <Card className="mt-6 rounded-2xl border-l-4 border-l-destructive p-4 text-start">
          <div className="flex gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <p className="text-sm leading-7">
              {isAr
                ? "تم استلام طلبك، ويحتاج إلى مراجعة مختص قبل أي خطوة. سيتواصل معك فريق أقلع.": "Your request has been received and requires clinician review before any next step. The Aqla team will contact you."}
            </p>
          </div>
        </Card>
      ) : (
        <Card className="mt-6 rounded-2xl border-l-4 border-l-primary p-4 text-start">
          <p className="text-sm leading-7">
            {isAr
              ? "تم استلام طلبك. سيتواصل معك فريق أقلع لمراجعة التفاصيل وتأكيد الخطوة المناسبة.": "Your request has been received. The Aqla team will contact you to review the details and confirm the appropriate next step."}
          </p>
        </Card>
      )}

      <Card className="mt-4 rounded-2xl p-4 text-start text-sm leading-7 text-muted-foreground">
        {isAr
          ? "يرجى عدم استخدام أي منتج علاجي دون مراجعة مختص إذا كانت لديك حالة صحية أو كنت غير متأكد من مناسبته لك.": "Please do not use any therapeutic product without clinician or pharmacist review if you have a health condition or are unsure whether it is suitable for you."}
      </Card>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button variant="outline"onClick={() => nav({ to: "/" })}>
          {isAr ? "العودة للرئيسية": "Back to home"}
        </Button>
        <Link to="/assessment"onClick={() => trackEvent("complete_assessment_clicked_from_shop")}>
          <Button className="quit-gradient border-0 text-white">
            {isAr ? "إكمال تقييم أقلع": "Complete Aqla assessment"}
          </Button>
        </Link>
        <a
          href="https://wa.me/966555096412"target="_blank"rel="noopener noreferrer"onClick={() => trackEvent("whatsapp_clicked_from_shop")}
        >
          <Button variant="secondary">
            {isAr ? "تواصل عبر واتساب": "Contact on WhatsApp"}
          </Button>
        </a>
      </div>
    </div>
  );
}
