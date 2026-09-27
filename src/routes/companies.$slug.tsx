import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Briefcase, Building2, Globe, SearchX } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { EmptyState, LoadingBlock } from "@/components/common/EmptyState";
import { JobCard, JOB_CARD_SELECT, type JobCardData } from "@/components/jobs/JobCard";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/companies/$slug")({
  head: () => ({
    meta: [
      { title: "صفحة الشركة | نجاز" },
      { name: "description", content: "نبذة عن الشركة ووظائفها المتاحة على نجاز." },
      { property: "og:title", content: "صفحة الشركة | نجاز" },
      { property: "og:description", content: "تعرّف على الشركة ووظائفها المتاحة." },
    ],
  }),
  component: CompanyPage,
});

function CompanyPage() {
  const { slug } = Route.useParams();
  const company = useQuery({
    queryKey: ["company", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("companies").select("*, locations(city_ar), categories(name_ar)").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const jobs = useQuery({
    queryKey: ["company-jobs", company.data?.id],
    enabled: !!company.data,
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select(JOB_CARD_SELECT).eq("company_id", company.data!.id).eq("status", "PUBLISHED").order("published_at", { ascending: false });
      if (error) throw error;
      return data as unknown as JobCardData[];
    },
  });

  if (company.isLoading) return <PublicLayout><div className="mx-auto max-w-5xl px-4 py-10"><LoadingBlock /></div></PublicLayout>;
  if (!company.data)
    return (
      <PublicLayout>
        <div className="mx-auto max-w-5xl px-4 py-10">
          <EmptyState icon={SearchX} title="الشركة غير موجودة" action={<Button asChild><Link to="/companies">كل الشركات</Link></Button>} />
        </div>
      </PublicLayout>
    );
  const c = company.data;
  return (
    <PublicLayout>
      <div className="bg-hero h-32 sm:h-44" aria-hidden />
      <div className="mx-auto max-w-5xl px-4">
        <div className="-mt-10 flex min-w-0 items-end gap-4">
          <div className="grid size-20 shrink-0 place-items-center rounded-2xl border-4 border-background bg-card text-primary"><Building2 className="size-9" /></div>
          <div className="min-w-0 pb-1">
            <h1 className="flex items-center gap-2 truncate text-2xl font-extrabold text-primary">
              {c.name} {c.verification_status === "VERIFIED" && <BadgeCheck className="size-5 shrink-0 text-brand-accent" aria-label="موثّقة" />}
            </h1>
            <p className="text-sm text-muted-foreground">{[c.categories?.name_ar, c.locations?.city_ar].filter(Boolean).join(" · ")}</p>
          </div>
        </div>
        {c.description && <p className="mt-6 whitespace-pre-line leading-8">{c.description}</p>}
        {c.website && (
          <a href={c.website} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm text-accent-foreground hover:underline">
            <Globe className="size-4" /> <span className="font-latin" dir="ltr">{c.website}</span>
          </a>
        )}
        <h2 className="mt-10 mb-4 text-xl font-bold">الوظائف المتاحة</h2>
        <div className="pb-16">
          {jobs.isLoading ? <LoadingBlock /> : jobs.data?.length ? (
            <div className="grid gap-4 sm:grid-cols-2">{jobs.data.map((j) => <JobCard key={j.id} job={j} />)}</div>
          ) : (
            <EmptyState icon={Briefcase} title="لا توجد وظائف منشورة حالياً" />
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
