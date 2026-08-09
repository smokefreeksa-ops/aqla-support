import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLearnerDashboard, useLearnerActions } from "@/hooks/useLearnerDashboard";
import { DashboardSkeleton, DashboardError } from "@/components/dashboard/DashboardStates";
import { formatDate } from "@/components/dashboard/DashboardParts";

export const Route = createFileRoute("/dashboard/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { model, data, isPending, isError, refetch } = useLearnerDashboard();
  const { saveProfile } = useLearnerActions();
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data?.profile) {
      setFullName(data.profile.full_name ?? "");
      setCity(data.profile.city ?? "");
    }
  }, [data?.profile]);

  if (isPending) return <DashboardSkeleton />;
  if (isError || !model || !data) return <DashboardError onRetry={() => refetch()} />;

  async function onSave() {
    setSaving(true);
    try {
      await saveProfile({ full_name: fullName.trim() || null, city: city.trim() || null });
      toast.success("تم حفظ بيانات ملفك الشخصي");
    } catch {
      toast.error("تعذّر حفظ البيانات، حاول مرة أخرى");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-bold">الملف الشخصي</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          الاسم المستخدم في شهاداتك ولوحة المتعلم · عضو منذ {formatDate(model.memberSince)}
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-[15px]">بياناتي</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">الاسم الكامل</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="الاسم كما سيظهر في الشهادة" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">المدينة</Label>
            <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="مثال: جدة" />
          </div>
          <div className="space-y-1.5">
            <Label>البريد الإلكتروني</Label>
            <Input value={data.profile.email ?? "—"} readOnly disabled />
          </div>
          <Button onClick={onSave} disabled={saving}>{saving ? "جارٍ الحفظ…" : "حفظ التغييرات"}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
