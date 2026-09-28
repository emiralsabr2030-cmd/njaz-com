import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { FileQuestion } from "lucide-react";
import { PageHeader } from "@/components/layout/PublicLayout";
import { EmptyState, LoadingBlock } from "@/components/common/EmptyState";
import { JobForm, dbErrorAr, toRow } from "@/components/jobs/JobForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { JOB_STATUS_LABELS } from "@/lib/constants";
import { fetchMyCompanies } from "@/lib/company-queries";

export const Route = createFileRoute("/_authenticated/company/jobs/$jobId")({
  head: () => ({ meta: [{ title: "تعديل الوظيفة | نجاز" }] }),
  component: Page,
});

function Page() {
  const { user } = Route.useRouteContext();
  const { jobId } = Route.useParams();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const companies = useQuery({ queryKey: ["my-companies", user.id], queryFn: () => fetchMyCompanies(user.id) });
  const job = useQuery({
    queryKey: ["company-jobs", jobId],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*").eq("id", jobId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (job.isLoading || companies.isLoading) return <LoadingBlock />;
  if (!job.data)
    return <EmptyState icon={FileQuestion} title="الوظيفة غير موجودة أو ليست لديك صلاحية" action={<Button asChild variant="secondary"><Link to="/company/jobs">العودة للوظائف</Link></Button>} />;

  const j = job.data;
  const isPublished = j.status === "PUBLISHED";

  async function setStatus(status: "DRAFT" | "PUBLISHED" | "CLOSED") {
    setSaving(true);
    const { error } = await supabase.from("jobs").update({ status }).eq("id", jobId);
    setSaving(false);
    if (error) return void toast.error("تعذّر تحديث الحالة", { description: dbErrorAr(error.message) });
    toast.success(status === "PUBLISHED" ? "تم نشر الوظيفة" : "تم تحديث الحالة");
    qc.invalidateQueries({ queryKey: ["company-jobs"] });
  }

  return (
    <div>
      <PageHeader title="تعديل الوظيفة" />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant={isPublished ? "default" : "secondary"}>{JOB_STATUS_LABELS[j.status]}</Badge>
        {isPublished && (
          <>
            <Button size="sm" variant="outline" asChild><Link to="/jobs/$slug" params={{ slug: j.slug }}>عرض الإعلان</Link></Button>
            <Button size="sm" variant="ghost" disabled={saving} onClick={() => setStatus("DRAFT")}>إرجاع لمسودة</Button>
            <Button size="sm" variant="ghost" disabled={saving} onClick={() => setStatus("CLOSED")}>إغلاق</Button>
          </>
        )}
      </div>
      <JobForm
        key={j.updated_at}
        companies={companies.data ?? []}
        defaults={j}
        saving={saving}
        showPublish={!isPublished}
        onSave={async (v, publish) => {
          setSaving(true);
          const { error } = await supabase
            .from("jobs")
            .update({ ...toRow(v), ...(publish ? { status: "PUBLISHED" as const } : {}) })
            .eq("id", jobId);
          setSaving(false);
          if (error) return void toast.error("تعذّر حفظ التعديلات", { description: dbErrorAr(error.message) });
          toast.success(publish ? "تم حفظ الوظيفة ونشرها" : "تم حفظ التعديلات");
          qc.invalidateQueries({ queryKey: ["company-jobs"] });
        }}
      />
    </div>
  );
}
