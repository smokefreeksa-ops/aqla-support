import { createFileRoute } from "@tanstack/react-router";
import { AqlaQuitEngine } from "@/components/aqla-engine/AqlaQuitEngine";

export const Route = createFileRoute("/aqla-quit-engine")({
  component: Page,
  head: () => ({
    meta: [
      { title: "اختبار الاعتماد وخطة الإقلاع الشخصية — أقلع" },
      {
        name: "description",
        content:
          "محرك أقلع لفهم نمط النيكوتين وبناء خطة إقلاع شخصية عملية بـ 8 خطوات.",
      },
    ],
  }),
});

function Page() {
  return (
    <main dir="rtl" className="min-h-screen bg-gradient-to-b from-blue-50 to-white print:bg-white">
      <div className="max-w-3xl mx-auto px-4 pt-8 pb-2 text-right print:hidden">
        <h1 className="text-2xl md:text-3xl font-extrabold text-blue-900">
          اختبار الاعتماد وخطة الإقلاع الشخصية
        </h1>
        <p className="text-slate-700 mt-2">
          محرك أقلع لفهم نمط النيكوتين وبناء خطة إقلاع عملية.
        </p>
        <p className="text-slate-600 text-sm mt-3 leading-7">
          هذا ليس اختبارًا للتسلية. هذا محرك عملي يساعدك على فهم علاقتك بالسجائر، الشيشة، الفيب،
          أكياس النيكوتين، أو أي منتج نيكوتين، ثم يخرج لك بخطة شخصية قابلة للتنفيذ.
        </p>
        <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900">
          هذا الاختبار يساعدك على فهم نمط استخدامك للنيكوتين وبناء خطة إقلاع أولية. لا يشخّص مرضًا،
          ولا يصف دواء، ولا يغني عن الطبيب أو عيادة الإقلاع، خصوصًا إذا كنت حاملًا، أو لديك مرض قلبي
          أو تنفسي، أو تستخدم أدوية نفسية أو أدوية مزمنة، أو لديك قلق/اكتئاب شديد، أو أفكار إيذاء
          للنفس.
        </div>
      </div>
      <AqlaQuitEngine />
      <style>{`@media print { @page { size: A4; margin: 14mm; } body { background: #fff !important; } }`}</style>
    </main>
  );
}
