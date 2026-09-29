import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Building2, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PublicLayout";
import { EmptyState, LoadingBlock } from "@/components/common/EmptyState";
import { CompanyForm } from "@/components/company/CompanyForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { companyToRow, dbErrorAr, missingCompanyFields } from "@/lib/company";
import { fetchMyCompanies } from "@/lib/company-queries";
import { VERIFICATION_LABELS } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/company/")({
  head: () => ({ meta: [{ title: "شركتي | نجاز" }] }),
  component: Page,
});

function Page() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const companies = useQuery({ queryKey: ["my-companies", user.id], queryFn: () => fetchMyCompanies(user.id) });
  const c = companies.data?.[0];
  const pending = useQuery({
    enabled: !!c,
    queryKey: ["my-verification", c?.id],
    queryFn: async () => {
      const { data } = await supabase.from("verification_requests").select("id").eq("company_id", c!.id).eq("status", "PENDING").limit(1);
      return (data?.length ?? 0) > 0;
    },
  });

  if (companies.isLoading) return <LoadingBlock />;
  if (!c)
    return (
      <div>
        <PageHeader title="شركتي" />
        <EmptyState icon={Building2} title="لم تُنشئ ملف شركتك بعد" description="أنشئ ملف الشركة واربطه بحسابك لتبدأ نشر الوظائف."
          action={<Button asChild><Link to="/company/setup">إنشاء ملف الشركة</Link></Button>} />
      </div>
    );

  const missing = missingCompanyFields(c);
  const isOwner = c.owner_id === user.id;

  async function requestVerification() {
    const { error } = await supabase.from("verification_requests").insert({ requester_id: user.id, company_id: c!.id, subject_type: "company", document_paths: [], status: "PENDING" });
    if (error) return void toast.error("تعذّر إرسال الطلب", { description: dbErrorAr(error.message) });
    toast.success("تم إرسال طلب التوثيق للإدارة");
    qc.invalidateQueries({ queryKey: ["my-verification"] });
  }

  return (
    <div className="space-y-6">
      <PageHeader title={c.name} description="إدارة بيانات شركتك" actions={<Badge variant={c.verification_status === "VERIFIED" ? "default" : "secondary"}>{VERIFICATION_LABELS[c.verification_status]}</Badge>} />
      {missing.length ? (
        <div role="status" className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
          <p className="flex items-center gap-2 font-bold"><AlertTriangle className="size-4" /> أكمل البيانات التالية لتتمكن من نشر الوظائف:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">{missing.map((m) => <li key={m}>{m}</li>)}</ul>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-accent/40 p-4 text-sm">
          <p className="flex items-center gap-2 font-bold"><CheckCircle2 className="size-4" /> ملف الشركة مكتمل ويمكنك نشر الوظائف</p>
          <div className="flex flex-wrap gap-2">
            {isOwner && (c.verification_status === "UNVERIFIED" || c.verification_status === "REJECTED") && (
              pending.data ? <Badge variant="secondary">طلب التوثيق قيد المراجعة</Badge>
                : <Button size="sm" variant="outline" onClick={requestVerification}><ShieldCheck className="size-4" /> طلب توثيق الشركة</Button>
            )}
            <Button size="sm" asChild><Link to="/company/jobs/new">نشر وظيفة</Link></Button>
          </div>
        </div>
      )}
      <CompanyForm
        key={c.id}
        defaults={c}
        saving={saving}
        submitLabel="حفظ التعديلات"
        onSave={async (v) => {
          setSaving(true);
          const { error } = await supabase.from("companies").update(companyToRow(v)).eq("id", c.id);
          setSaving(false);
          if (error) return void toast.error("تعذّر حفظ التعديلات", { description: dbErrorAr(error.message) });
          toast.success("تم حفظ بيانات الشركة");
          qc.invalidateQueries({ queryKey: ["my-companies"] });
        }}
      />
    </div>
  );
}
