import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, PlusCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/PublicLayout";
import { EmptyState, LoadingBlock } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { EMPLOYMENT_LABELS, JOB_STATUS_LABELS, WORK_MODE_LABELS, formatDate } from "@/lib/constants";
import { fetchMyCompanies } from "@/lib/company-queries";

export const Route = createFileRoute("/_authenticated/company/jobs/")({
  head: () => ({ meta: [{ title: "وظائف الشركة | نجاز" }] }),
  component: Page,
});

function Page() {
  const { user } = Route.useRouteContext();
  const q = useQuery({
    queryKey: ["company-jobs", "list", user.id],
    queryFn: async () => {
      const ids = (await fetchMyCompanies(user.id)).map((c) => c.id);
      if (!ids.length) return [];
      const { data, error } = await supabase
        .from("jobs")
        .select("id, title, status, employment_type, work_mode, updated_at, applications_count")
        .in("company_id", ids)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const add = (
    <Button asChild><Link to="/company/jobs/new"><PlusCircle className="size-4" /> وظيفة جديدة</Link></Button>
  );
  return (
    <div>
      <PageHeader title="وظائف الشركة" actions={add} />
      {q.isLoading ? <LoadingBlock /> : q.data?.length ? (
        <ul className="space-y-2">
          {q.data.map((j) => (
            <li key={j.id}>
              <Link to="/company/jobs/$jobId" params={{ jobId: j.id }} className="flex flex-col gap-2 rounded-xl border bg-card p-4 transition-colors hover:bg-muted sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-bold">{j.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {EMPLOYMENT_LABELS[j.employment_type]} · {WORK_MODE_LABELS[j.work_mode]} · آخر تعديل {formatDate(j.updated_at)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-xs">
                  <span className="text-muted-foreground">{j.applications_count} متقدم</span>
                  <Badge variant={j.status === "PUBLISHED" ? "default" : "secondary"}>{JOB_STATUS_LABELS[j.status]}</Badge>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : <EmptyState icon={Briefcase} title="لا توجد وظائف بعد" description="أنشئ أول وظيفة واحفظها كمسودة." action={add} />}
    </div>
  );
}
