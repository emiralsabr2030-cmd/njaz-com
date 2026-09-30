import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Briefcase, Star } from "lucide-react";
import { PageHeader } from "@/components/layout/PublicLayout";
import { EmptyState, LoadingBlock } from "@/components/common/EmptyState";
import { Row, SearchBox, selectCls } from "@/components/common/ui-bits";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { JOB_STATUS_LABELS, formatDate, type JobStatus } from "@/lib/constants";
import { dbErrorAr } from "@/lib/company";

export const Route = createFileRoute("/_authenticated/admin/jobs")({
  head: () => ({ meta: [{ title: "إدارة الوظائف | نجاز" }] }),
  component: Page,
});

function Page() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | JobStatus>("");
  const q = useQuery({
    queryKey: ["admin.jobs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("id, title, slug, status, is_featured, applications_count, created_at, companies(name)").order("created_at", { ascending: false }).limit(500);
      if (error) throw error;
      return data;
    },
  });
  async function update(id: string, patch: { status?: JobStatus; is_featured?: boolean }) {
    const { error } = await supabase.from("jobs").update(patch).eq("id", id);
    if (error) return void toast.error("تعذّر التحديث", { description: dbErrorAr(error.message) });
    toast.success(patch.is_featured === undefined ? "تم تحديث الحالة" : patch.is_featured ? "تم إبراز الوظيفة" : "تم إلغاء الإبراز");
    qc.invalidateQueries({ queryKey: ["admin.jobs"] });
  }
  const list = (q.data ?? []).filter((j) => (!status || j.status === status) && (!search || j.title.includes(search) || (j.companies?.name ?? "").includes(search)));
  return (
    <div>
      <PageHeader title="الوظائف" description="أبرز الوظائف المميزة في الصفحة الرئيسية وأدر حالتها." />
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <SearchBox value={search} onChange={setSearch} placeholder="ابحث بالعنوان أو الشركة" />
        <select aria-label="تصفية بالحالة" className={`${selectCls} mb-4 h-10`} value={status} onChange={(e) => setStatus(e.target.value as JobStatus | "")}>
          <option value="">كل الحالات</option>
          {Object.entries(JOB_STATUS_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
      </div>
      {q.isLoading ? <LoadingBlock /> : list.length ? (
        <ul className="space-y-2">
          {list.map((j) => (
            <Row key={j.id}>
              <div className="min-w-0">
                <p className="truncate font-bold">{j.status === "PUBLISHED" ? <Link to="/jobs/$slug" params={{ slug: j.slug }} className="hover:underline">{j.title}</Link> : j.title}</p>
                <p className="text-xs text-muted-foreground">{j.companies?.name} · {j.applications_count} متقدم · {formatDate(j.created_at)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant={j.is_featured ? "default" : "outline"} aria-pressed={j.is_featured} onClick={() => update(j.id, { is_featured: !j.is_featured })}>
                  <Star className={j.is_featured ? "size-4 fill-current" : "size-4"} /> {j.is_featured ? "مميزة" : "إبراز"}
                </Button>
                <select aria-label="حالة الوظيفة" className={selectCls} value={j.status} onChange={(e) => update(j.id, { status: e.target.value as JobStatus })}>
                  {Object.entries(JOB_STATUS_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
              </div>
            </Row>
          ))}
        </ul>
      ) : <EmptyState icon={Briefcase} title="لا توجد وظائف مطابقة" />}
    </div>
  );
}
