import React from "react";

export type PrintableQuitPlanData = {
  userName?: string;
  city?: string;
  email?: string;
  product?: string;
  quitDate?: string;
  triggers?: string[];
  supporter?: string;
  fagerstromScore?: number;
  readiness?: number;
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-blue-900 text-xl font-extrabold border-b-2 border-blue-900 pb-2 mb-3 mt-6">
      {children}
    </h2>
  );
}

function TriggerLines({ triggers }: { triggers: string[] }) {
  const has = (t: string) => triggers.some((x) => x.includes(t));
  const items: string[] = [];
  if (has("القهوة"))
    items.push(
      "• القهوة الصباحية: اشرب قهوتك في مكان جديد (غير المكان المعتاد للتدخين)، وتصفح مقالاً أو كتاباً لكسر الارتباط الشرطي.",
    );
  if (has("توتر"))
    items.push(
      "• التوتر والغضب: الغضب يولد أدرينالين. غادر مكتبك فوراً، امشِ بخطوات سريعة لـ 5 دقائق لتفريغ الطاقة، واشرب كوب ماء بارد.",
    );
  if (has("بعد الأكل"))
    items.push(
      "• بعد الوجبات: قم من المائدة فور الانتهاء، واغسل أسنانك بمعجون غني بالنعناع لإنهاء طقس الطعام.",
    );
  if (has("السهر") || has("الفراغ"))
    items.push(
      "• أوقات الفراغ: العقل الفارغ يبحث عن الدوبامين. أشغل يديك بكرة مطاطية، وابدأ في ممارسة هواية أو تمرين رياضي منزلي.",
    );
  if (has("مجالسة"))
    items.push(
      '• التجمعات: اجعل في يدك دائماً كوب ماء أو قهوة، وذكر نفسك داخلياً: "أنا لا أحرم نفسي، أنا أتنفس بحرية بينما هم محتجزون في الإدمان".',
    );
  if (items.length === 0)
    items.push("• لم يتم تحديد محفزات بعد — راجع قائمة المحفزات في لوحة القيادة لتخصيص بروتوكول If-Then.");
  return (
    <ul className="space-y-2 text-[15px] leading-8">
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  );
}

export function PrintableQuitPlan({ data }: { data: PrintableQuitPlanData }) {
  const score = data.fagerstromScore ?? 0;
  const today = new Date().toLocaleDateString("ar-SA");
  const highDep = score >= 7;

  return (
    <div
      id="aqla-print-area"dir="rtl"className="hidden print:block bg-white text-slate-900 p-8 max-w-4xl mx-auto text-right"style={{ fontFamily: "Tajawal, Cairo, system-ui, sans-serif" }}
    >
      {/* Header */}
      <div className="border-b-4 border-blue-900 pb-4 mb-6">
        <h1 className="text-3xl font-extrabold text-blue-900">
          خطة الإقلاع الإكلينيكية المخصصة
        </h1>
        <p className="text-slate-600 mt-1 text-sm">Digital Therapeutic Quit Plan — منصة أقلع</p>
        <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
          <div>
            <div className="text-slate-500">الاسم</div>
            <div className="font-bold">{data.userName ?? "—"}</div>
          </div>
          <div>
            <div className="text-slate-500">تاريخ إصدار الخطة</div>
            <div className="font-bold">{today}</div>
          </div>
          <div>
            <div className="text-slate-500">تاريخ الإقلاع المستهدف</div>
            <div className="font-bold">{data.quitDate ?? "—"}</div>
          </div>
        </div>
        <div className="mt-3 text-sm bg-blue-50 border border-blue-200 rounded p-2">
          <span className="text-slate-600">شريك الدعم والمساءلة: </span>
          <span className="font-bold text-blue-900">{data.supporter ?? "—"}</span>
        </div>
      </div>

      {/* Section 1 */}
      <section>
        <SectionTitle>القسم الأول: التدخل الفسيولوجي (مقياس فاجرستروم)</SectionTitle>
        {highDep ? (
          <div className="text-[15px] leading-8">
            <p>
              <span className="font-bold">النتيجة:</span> اعتماد كيميائي مرتفع ({score}/10).
            </p>
            <p className="mt-2">
              <span className="font-bold">الخطة الطبية الموصى بها:</span> للسيطرة على الأعراض
              الانسحابية الشديدة، يُنصح بشدة باستخدام العلاج ببدائل النيكوتين (NRT) المزدوج. استخدم
              "لصقات النيكوتين"(عيار 21 ملغ) كجرعة أساسية طوال اليوم، مع استخدام "علكة النيكوتين"(عيار 2 ملغ) عند نوبات الرغبة الشديدة والمفاجئة.{" "}
              <span className="text-slate-600">
                (يرجى استشارة طبيبك أو الصيدلي لتأكيد الجرعات).
              </span>
            </p>
          </div>
        ) : (
          <div className="text-[15px] leading-8">
            <p>
              <span className="font-bold">النتيجة:</span> اعتماد كيميائي خفيف إلى متوسط ({score}/10).
            </p>
            <p className="mt-2">
              <span className="font-bold">الخطة الطبية الموصى بها:</span> تستطيع تجاوز الأعراض
              الانسحابية بالاعتماد على العلاج السلوكي المعرفي (CBT) المرفق في هذه الخطة، دون الحاجة
              الماسة للتدخل الدوائي. ومع ذلك، يمكن استخدام علكة النيكوتين (2 ملغ) عند الضرورة
              القصوى.
            </p>
          </div>
        )}
      </section>

      {/* Section 2 */}
      <section>
        <SectionTitle>القسم الثاني: استراتيجيات التعامل مع المحفزات (If-Then Protocol)</SectionTitle>
        <TriggerLines triggers={data.triggers ?? []} />
      </section>

      {/* Section 3 */}
      <section>
        <SectionTitle>القسم الثالث: خريطة التعافي الفسيولوجي (توقع التحديات)</SectionTitle>
        <ul className="space-y-2 text-[15px] leading-8">
          <li>
            <span className="font-bold">• الأيام 1 إلى 3 (المرحلة الحادة):</span> ستواجه تقلبات
            مزاجية، صداع، وصعوبة تركيز. هذا يعني أن جسدك يطرد النيكوتين بنجاح. أكثر من شرب الماء.
          </li>
          <li>
            <span className="font-bold">• الأيام 4 إلى 7 (مرحلة التنظيف):</span> ستستيقظ الأهداب
            التنفسية. قد يزيد السعال لطرد المخاط القديم. حواسك (الشم والتذوق) ستعود بقوة.
          </li>
          <li>
            <span className="font-bold">• الأسبوع 2 إلى 4 (مرحلة التوازن):</span> ستنخفض الرغبات
            الملحة بشكل كبير، وسيعود الدوبامين لإفرازه الطبيعي. ستلاحظ زيادة هائلة في لياقتك.
          </li>
        </ul>
      </section>

      {/* Section 4 */}
      <section>
        <SectionTitle>القسم الرابع: بروتوكول الطوارئ (عند الرغبة الشديدة جداً)</SectionTitle>
        <ol className="space-y-2 text-[15px] leading-8 list-decimal pr-5">
          <li>
            <span className="font-bold">قاعدة الـ 180 ثانية:</span> الرغبة الكيميائية هي موجة لا
            تدوم أكثر من 3 دقائق. اصمد لثلاث دقائق فقط، وستتلاشى.
          </li>
          <li>
            <span className="font-bold">تنفس العصب الحائر:</span> خذ شهيقاً من الأنف لـ 4 ثوانٍ،
            احبسه لـ 7 ثوانٍ، وازفره ببطء من الفم لـ 8 ثوانٍ.
          </li>
          <li>
            <span className="font-bold">الفرز العاطفي (HALT):</span> اسأل نفسك؛ هل أنا جائع؟ غاضب؟
            وحيد؟ مرهق؟ عالج الشعور الحقيقي، فالسيجارة ليست حلاً لأي منها.
          </li>
        </ol>
      </section>

      <p className="mt-8 text-xs text-slate-500 border-t border-slate-200 pt-3">
        هذه الوثيقة لأغراض الدعم والتثقيف الصحي ضمن منصة أقلع، ولا تُغني عن استشارة الطبيب أو
        الصيدلي المختص. — {data.email ?? ""}
      </p>
    </div>
  );
}
