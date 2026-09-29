import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Building2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PublicLayout";
import { EmptyState, LoadingBlock } from "@/components/common/EmptyState";
import { CompanyForm } from "@/components/company/CompanyForm";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { companyToRow, dbErrorAr } from "@/lib/company";
import { fetchMyCompanies } from "@/lib/company-queries";
import { makeSlug } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/company/setup")({
  head: () => ({ meta: [{ title: "إنشاء ملف الشركة | نجاز" }] }),
  component: Page,
});

function Page() {
  const { user, roles } = Route.useRouteContext();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const companies = useQuery({ queryKey: ["my-companies", user.id], queryFn: () => fetchMyCompanies(user.id) });

  if (companies.isLoading) return <LoadingBlock />;
  if (companies.data?.length)
    return (
      <div>
        <PageHeader title="ملف الشركة" />
        <EmptyState icon={Building2} title="حسابك مرتبط بشركة بالفعل" description={companies.data[0]!.name}
          action={<Button asChild><Link to="/company">إدارة الشركة</Link></Button>} />
      </div>
    );
  if (!roles.includes("COMPANY_OWNER"))
    return <EmptyState icon={Building2} title="هذا الحساب ليس حساب صاحب عمل" description="أنشئ حساب صاحب عمل لإضافة شركة، أو اطلب من الإدارة تعديل صلاحياتك." />;

  return (
    <div>
      <PageHeader title="إنشاء ملف الشركة" description="أكمل بيانات شركتك لتتمكن من نشر الوظائف. الحقول المعلّمة بـ * إلزامية." />
      <CompanyForm
        saving={saving}
        submitLabel="إنشاء الشركة"
        onSave={async (v) => {
          setSaving(true);
          const { error } = await supabase.from("companies").insert({
            id: crypto.randomUUID(), owner_id: user.id, slug: makeSlug(v.name_en || v.name), ...companyToRow(v),
          });
          setSaving(false);
          if (error) return void toast.error("تعذّر إنشاء الشركة", { description: dbErrorAr(error.message) });
          toast.success("تم إنشاء ملف الشركة وربطه بحسابك");
          await qc.invalidateQueries({ queryKey: ["my-companies"] });
          navigate({ to: "/company/jobs/new" });
        }}
      />
    </div>
  );
}
