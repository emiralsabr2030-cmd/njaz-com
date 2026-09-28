import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Building2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PublicLayout";
import { EmptyState, LoadingBlock } from "@/components/common/EmptyState";
import { JobForm, dbErrorAr, toRow } from "@/components/jobs/JobForm";
import { supabase } from "@/integrations/supabase/client";
import { makeSlug } from "@/lib/constants";
import { fetchMyCompanies } from "@/lib/company-queries";

export const Route = createFileRoute("/_authenticated/company/jobs/new")({
  head: () => ({ meta: [{ title: "وظيفة جديدة | نجاز" }] }),
  component: Page,
});

function Page() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const companies = useQuery({ queryKey: ["my-companies", user.id], queryFn: () => fetchMyCompanies(user.id) });

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
      <PageHeader title="وظيفة جديدة" description="تُحفظ الوظيفة كمسودة ويمكنك تعديلها قبل نشرها." />
      <JobForm
        companies={companies.data}
        saving={saving}
        onSave={async (v) => {
          setSaving(true);
          const { data, error } = await supabase
            .from("jobs")
            .insert({ ...toRow(v), created_by: user.id, status: "DRAFT", slug: `${makeSlug(v.title)}-${Date.now().toString(36)}` })
            .select("id")
            .single();
          setSaving(false);
          if (error) return void toast.error("تعذّر حفظ الوظيفة", { description: dbErrorAr(error.message) });
          toast.success("تم حفظ الوظيفة كمسودة");
          await qc.invalidateQueries({ queryKey: ["company-jobs"] });
          navigate({ to: "/company/jobs/$jobId", params: { jobId: data.id } });
        }}
      />
    </div>
  );
}
