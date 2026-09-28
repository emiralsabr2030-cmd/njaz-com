import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Building2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PublicLayout";
import { EmptyState, LoadingBlock } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { EMPLOYMENT_LABELS, WORK_MODE_LABELS, makeSlug, type EmploymentType, type WorkMode } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/company/jobs/new")({
  head: () => ({ meta: [{ title: "وظيفة جديدة | نجاز" }] }),
  component: Page,
});

const selectCls = "h-10 w-full rounded-md border bg-background px-3 text-sm";

function Page() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const companies = useQuery({
    queryKey: ["company.jobs.new.companies", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_members")
        .select("company_id, companies(id, name)")
        .eq("user_id", user.id);
      if (error) throw error;
      return (data ?? []).map((r) => r.companies).filter(Boolean) as { id: string; name: string }[];
    },
  });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const title = String(f.get("title") ?? "").trim();
    const description = String(f.get("description") ?? "").trim();
    if (title.length < 3 || description.length < 10) {
      toast.error("أدخل عنوانًا ووصفًا واضحين للوظيفة");
      return;
    }
    const num = (k: string) => {
      const v = String(f.get(k) ?? "").trim();
      return v ? Number(v) : null;
    };
    setSaving(true);
    const { error } = await supabase.from("jobs").insert({
      company_id: String(f.get("company_id")),
      created_by: user.id,
      title,
      description,
      requirements: String(f.get("requirements") ?? "") || null,
      employment_type: f.get("employment_type") as EmploymentType,
      work_mode: f.get("work_mode") as WorkMode,
      salary_min: num("salary_min"),
      salary_max: num("salary_max"),
      slug: `${makeSlug(title)}-${Date.now().toString(36)}`,
    });
    setSaving(false);
    if (error) {
      toast.error("تعذّر حفظ الوظيفة", { description: error.message });
      return;
    }
    toast.success("تم حفظ الوظيفة");
    navigate({ to: "/company/jobs" });
  }

  if (companies.isLoading) return <LoadingBlock />;
  if (!companies.data?.length)
    return (
      <div>
        <PageHeader title="وظيفة جديدة" />
        <EmptyState icon={Building2} title="لا توجد شركة مرتبطة بحسابك" />
      </div>
    );

  return (
    <div>
      <PageHeader title="وظيفة جديدة" />
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border bg-card p-6">
        <div className="space-y-2">
          <Label htmlFor="company_id">الشركة</Label>
          <select id="company_id" name="company_id" className={selectCls}>
            {companies.data.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">عنوان الوظيفة</Label>
          <Input id="title" name="title" required maxLength={150} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="employment_type">نوع التوظيف</Label>
            <select id="employment_type" name="employment_type" className={selectCls}>
              {Object.entries(EMPLOYMENT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="work_mode">نمط العمل</Label>
            <select id="work_mode" name="work_mode" className={selectCls}>
              {Object.entries(WORK_MODE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="salary_min">الراتب من (ريال)</Label>
            <Input id="salary_min" name="salary_min" type="number" min={0} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="salary_max">الراتب إلى (ريال)</Label>
            <Input id="salary_max" name="salary_max" type="number" min={0} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">الوصف</Label>
          <Textarea id="description" name="description" rows={5} required maxLength={5000} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="requirements">المتطلبات</Label>
          <Textarea id="requirements" name="requirements" rows={4} maxLength={3000} />
        </div>
        <Button type="submit" disabled={saving}>{saving ? "جارٍ الحفظ…" : "حفظ كمسودة"}</Button>
      </form>
    </div>
  );
}
