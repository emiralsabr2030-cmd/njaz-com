import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { Briefcase, Search } from "lucide-react";
import { PublicLayout, PageHeader } from "@/components/layout/PublicLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, LoadingBlock } from "@/components/common/EmptyState";
import { JobCard, JOB_CARD_SELECT, type JobCardData } from "@/components/jobs/JobCard";
import { supabase } from "@/integrations/supabase/client";
import { EMPLOYMENT_LABELS, WORK_MODE_LABELS } from "@/lib/constants";

const searchSchema = z.object({
  q: z.string().optional(),
  mode: z.enum(["ONSITE", "REMOTE", "HYBRID"]).optional(),
  type: z.enum(["FULL_TIME", "PART_TIME", "TEMPORARY", "SEASONAL", "PROJECT"]).optional(),
  city: z.string().optional(),
});

export const Route = createFileRoute("/jobs/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "الوظائف المتاحة | نجاز" },
      { name: "description", content: "تصفح أحدث الوظائف في السعودية: حضوري، هجين، وعن بُعد." },
      { property: "og:title", content: "الوظائف المتاحة | نجاز" },
      { property: "og:description", content: "تصفح أحدث الوظائف في السعودية على منصة نجاز." },
    ],
  }),
  component: JobsPage,
});

const ALL = "__all";

function JobsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/jobs/" });
  const [q, setQ] = useState(search.q ?? "");

  const locations = useQuery({
    queryKey: ["locations"],
    queryFn: async () => (await supabase.from("locations").select("id, slug, city_ar").eq("is_active", true).order("city_ar")).data ?? [],
  });

  const jobs = useQuery({
    queryKey: ["jobs", "list", search],
    queryFn: async () => {
      let query = supabase.from("jobs").select(JOB_CARD_SELECT).eq("status", "PUBLISHED").order("published_at", { ascending: false }).limit(50);
      if (search.q) query = query.ilike("title", `%${search.q.replace(/[%_]/g, "")}%`);
      if (search.mode) query = query.eq("work_mode", search.mode);
      if (search.type) query = query.eq("employment_type", search.type);
      if (search.city) {
        const loc = locations.data?.find((l) => l.slug === search.city);
        if (loc) query = query.eq("location_id", loc.id);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as JobCardData[];
    },
    enabled: !search.city || locations.isSuccess,
  });

  const setFilter = (key: "mode" | "type" | "city", v: string) =>
    navigate({ search: (prev) => ({ ...prev, [key]: v === ALL ? undefined : v }) });

  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <PageHeader title="الوظائف" description="ابحث وصفِّ الفرص بحسب نمط العمل ونوع التوظيف والمدينة." />
        <form
          role="search"
          className="grid gap-2 rounded-2xl border bg-card p-3 sm:grid-cols-[minmax(0,1fr)_repeat(3,10rem)_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ search: (prev) => ({ ...prev, q: q.trim() || undefined }) });
          }}
        >
          <label htmlFor="q" className="sr-only">كلمة البحث</label>
          <Input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="المسمى الوظيفي" />
          <Select value={search.mode ?? ALL} onValueChange={(v) => setFilter("mode", v)}>
            <SelectTrigger aria-label="نمط العمل"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>كل الأنماط</SelectItem>
              {Object.entries(WORK_MODE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={search.type ?? ALL} onValueChange={(v) => setFilter("type", v)}>
            <SelectTrigger aria-label="نوع التوظيف"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>كل الأنواع</SelectItem>
              {Object.entries(EMPLOYMENT_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={search.city ?? ALL} onValueChange={(v) => setFilter("city", v)}>
            <SelectTrigger aria-label="المدينة"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>كل المدن</SelectItem>
              {locations.data?.map((l) => <SelectItem key={l.id} value={l.slug}>{l.city_ar}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button type="submit"><Search className="size-4" /> بحث</Button>
        </form>

        <div className="mt-8">
          {jobs.isLoading ? (
            <LoadingBlock />
          ) : jobs.data && jobs.data.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">{jobs.data.map((j) => <JobCard key={j.id} job={j} />)}</div>
          ) : (
            <EmptyState icon={Briefcase} title="لا توجد وظائف مطابقة" description="جرّب تعديل الفلاتر أو عد لاحقاً — تُضاف فرص جديدة باستمرار." />
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
