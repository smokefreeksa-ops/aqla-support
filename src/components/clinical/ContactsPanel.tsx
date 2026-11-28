import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Download, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listQuitChatContacts } from "@/lib/contact/contacts.functions";
import { CONTACT_COLUMNS } from "@/lib/contact/contacts-csv";

const LABELS = ["التاريخ", "الكنية", "البريد الإلكتروني", "الجوال", "المدينة", "الفئة العمرية", "قاصر", "ولي الأمر", "بريد ولي الأمر", "جوال ولي الأمر", "نطاق النتيجة", "علامة الخطر", "الحالة", "نهاية الحفظ"];

export function ContactsPanel() {
  const fn = useServerFn(listQuitChatContacts);
  const [search, setSearch] = useState("");
  const [minors, setMinors] = useState<"all" | "minors" | "adults">("all");
  const [page, setPage] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(false);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: ["quit-chat-contacts", search, minors, page],
    queryFn: () => fn({ data: { search, minors, page, exportCsv: false } }),
  });
  const download = async () => {
    setExporting(true); setExportError(false);
    try {
      const result = await fn({ data: { search, minors, page: 0, exportCsv: true } });
      if (result.csv === null) return;
      const url = URL.createObjectURL(new Blob([result.csv], { type: "text/csv;charset=utf-8" }));
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = "aqla-contacts.csv"; anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { setExportError(true); }
    finally { setExporting(false); }
  };
  return <section dir="rtl" className="space-y-4 py-4">
    <div className="flex flex-wrap items-end gap-3">
      <label className="min-w-0 grow space-y-1 text-sm">
        <span>بحث بالكنية أو البريد أو الجوال</span>
        <Input aria-label="بحث جهات الاتصال" maxLength={254} value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
      </label>
      <Select value={minors} onValueChange={(value) => { if (value === "all" || value === "minors" || value === "adults") { setMinors(value); setPage(0); } }}>
        <SelectTrigger aria-label="الفئة العمرية" className="w-40"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="all">الجميع</SelectItem><SelectItem value="minors">القاصرون فقط</SelectItem><SelectItem value="adults">البالغون فقط</SelectItem></SelectContent>
      </Select>
      <Button variant="outline" size="icon" aria-label="تحديث جهات الاتصال" title="تحديث" disabled={isFetching} onClick={() => void refetch()}><RefreshCw className="h-4 w-4" /></Button>
      <Button variant="outline" onClick={() => void download()} disabled={exporting || !!error || !data?.total}><Download className="h-4 w-4" />{exporting ? "جاري التصدير..." : "تصدير CSV"}</Button>
    </div>
    {error ? <p role="alert" className="text-destructive">جهات الاتصال متاحة للمسؤولين فقط، أو تعذّر تحميلها.</p> : isPending ? <p className="text-muted-foreground">جاري التحميل...</p> : <>
      <div className="overflow-x-auto border border-border">
        <table className="w-full text-right text-sm"><thead className="bg-muted"><tr>{LABELS.map((label) => <th key={label} className="whitespace-nowrap p-2">{label}</th>)}</tr></thead>
          <tbody>{data?.rows.map((row, index) => <tr key={`${row.created_at}-${index}`} className="border-t border-border">{CONTACT_COLUMNS.map((key) => <td key={key} className="whitespace-nowrap p-2" dir={key.includes("email") || key.includes("mobile") ? "ltr" : undefined}>{typeof row[key] === "boolean" ? (row[key] ? "نعم" : "لا") : row[key] ?? "—"}</td>)}</tr>)}
          {!data?.rows.length && <tr><td colSpan={14} className="p-6 text-center text-muted-foreground">لا توجد جهات اتصال مطابقة.</td></tr>}</tbody>
        </table>
      </div>
      <div className="flex items-center gap-3"><Button variant="outline" size="icon" aria-label="الصفحة السابقة" title="الصفحة السابقة" disabled={!page} onClick={() => setPage(page - 1)}><ChevronRight className="h-4 w-4" /></Button><span>{page + 1} / {Math.max(1, Math.ceil((data?.total ?? 0) / 50))} · {data?.total ?? 0}</span><Button variant="outline" size="icon" aria-label="الصفحة التالية" title="الصفحة التالية" disabled={(page + 1) * 50 >= (data?.total ?? 0)} onClick={() => setPage(page + 1)}><ChevronLeft className="h-4 w-4" /></Button></div>
    </>}
    {exportError && <p role="alert" className="text-destructive">تعذّر التصدير، حاول مرة أخرى.</p>}
  </section>;
}