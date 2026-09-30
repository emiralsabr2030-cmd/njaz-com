import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, Building2, Briefcase, FileText, Flag, ShieldCheck, History } from "lucide-react";
import { PageHeader } from "@/components/layout/PublicLayout";
import { EmptyState, LoadingBlock } from "@/components/common/EmptyState";
import { StatCard } from "@/components/common/ui-bits";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "إحصاءات المنصة | نجاز" }] }),
  component: Page,
});

const count = async (q: PromiseLike<{ count: number | null; error: unknown }>) => {
  const r = await q;
  if (r.error) throw r.error;
  return r.count ?? 0;
};

function Page() {
  const stats = useQuery({
    queryKey: ["admin.stats"],
    queryFn: async () => {
      const h = { count: "exact" as const, head: true };
      const [users, companies, verified, published, drafts, apps, reports, pending] = await Promise.all([
        count(supabase.from("profiles").select("id", h)),
        count(supabase.from("companies").select("id", h)),
        count(supabase.from("companies").select("id", h).eq("verification_status", "VERIFIED")),
        count(supabase.from("jobs").select("id", h).eq("status", "PUBLISHED")),
        count(supabase.from("jobs").select("id", h).eq("status", "DRAFT")),
        count(supabase.from("job_applications").select("id", h)),
        count(supabase.from("reports").select("id", h).in("status", ["OPEN", "IN_REVIEW"])),
        count(supabase.from("verification_requests").select("id", h).eq("status", "PENDING")),
      ]);
      return { users, companies, verified, published, drafts, apps, reports, pending };
    },
  });
  const logs = useQuery({
    queryKey: ["admin.audit"],
    queryFn: async () => {
      const { data, error } = await supabase.from("audit_logs").select("id, action, entity_type, metadata, created_at").order("created_at", { ascending: false }).limit(15);
      if (error) throw error;
      return data;
    },
  });
  const s = stats.data;
  return (
    <div className="space-y-8">
      <PageHeader title="إحصاءات المنصة" description="نظرة عامة على نشاط نجاز" />
      {stats.isLoading || !s ? <LoadingBlock /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Users} label="المستخدمون" value={s.users} />
          <StatCard icon={Building2} label="الشركات" value={s.companies} hint={`${s.verified} موثّقة`} />
          <StatCard icon={Briefcase} label="وظائف منشورة" value={s.published} hint={`${s.drafts} مسودة`} />
          <StatCard icon={FileText} label="طلبات التوظيف" value={s.apps} />
          <StatCard icon={ShieldCheck} label="طلبات توثيق معلّقة" value={s.pending} />
          <StatCard icon={Flag} label="بلاغات مفتوحة" value={s.reports} />
        </div>
      )}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold"><History className="size-5" /> آخر العمليات</h2>
        {logs.isLoading ? <LoadingBlock /> : logs.data?.length ? (
          <ul className="divide-y rounded-xl border bg-card">
            {logs.data.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                <span>تغيير حالة التوثيق ({l.entity_type === "companies" ? "شركة" : "مستخدم"}): {String((l.metadata as Record<string, unknown>)?.["to"] ?? "")}</span>
                <span className="text-xs text-muted-foreground">{formatDate(l.created_at)}</span>
              </li>
            ))}
          </ul>
        ) : <EmptyState icon={History} title="لا توجد عمليات مسجّلة بعد" />}
      </section>
    </div>
  );
}
