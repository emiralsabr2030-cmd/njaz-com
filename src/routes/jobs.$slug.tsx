import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Bookmark, BookmarkCheck, Building2, MapPin, SearchX } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, LoadingBlock } from "@/components/common/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { APPLICATION_LABELS, EMPLOYMENT_LABELS, WORK_MODE_LABELS, formatDate } from "@/lib/constants";

export const Route = createFileRoute("/jobs/$slug")({
  head: () => ({
    meta: [
      { title: "تفاصيل الوظيفة | نجاز" },
      { name: "description", content: "تفاصيل الوظيفة ومتطلباتها وطريقة التقديم عبر نجاز." },
      { property: "og:title", content: "تفاصيل الوظيفة | نجاز" },
      { property: "og:description", content: "اطّلع على تفاصيل الوظيفة وقدّم عبر نجاز." },
    ],
  }),
  component: JobDetail,
});

function JobDetail() {
  const { slug } = Route.useParams();
  const { user, roles } = useSession();
  const qc = useQueryClient();

  const job = useQuery({
    queryKey: ["job", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*, companies(name, slug, verification_status), locations(city_ar), categories(name_ar)")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const mine = useQuery({
    queryKey: ["job-mine", job.data?.id, user?.id],
    enabled: !!job.data && !!user,
    queryFn: async () => {
      const [app, saved, resumes] = await Promise.all([
        supabase.from("job_applications").select("id, status").eq("job_id", job.data!.id).eq("applicant_id", user!.id).maybeSingle(),
        supabase.from("saved_jobs").select("job_id").eq("job_id", job.data!.id).eq("user_id", user!.id).maybeSingle(),
        supabase.from("resumes").select("id, title, is_default").eq("profile_id", user!.id),
      ]);
      return { application: app.data, saved: !!saved.data, resumes: resumes.data ?? [] };
    },
  });

  const [cover, setCover] = useState("");
  const [resumeId, setResumeId] = useState<string>("");

  const apply = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("job_applications").insert({
        job_id: job.data!.id,
        applicant_id: user!.id,
        cover_letter: cover || null,
        resume_id: resumeId || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم إرسال طلبك بنجاح");
      qc.invalidateQueries({ queryKey: ["job-mine"] });
    },
    onError: (e: Error) => toast.error(e.message.includes("duplicate") ? "سبق أن قدّمت على هذه الوظيفة" : "تعذّر إرسال الطلب"),
  });

  const toggleSave = useMutation({
    mutationFn: async () => {
      if (mine.data?.saved) {
        const { error } = await supabase.from("saved_jobs").delete().eq("job_id", job.data!.id).eq("user_id", user!.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("saved_jobs").insert({ job_id: job.data!.id, user_id: user!.id });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["job-mine"] }),
  });

  if (job.isLoading) return <PublicLayout><div className="mx-auto max-w-4xl px-4 py-10"><LoadingBlock /></div></PublicLayout>;
  if (!job.data)
    return (
      <PublicLayout>
        <div className="mx-auto max-w-4xl px-4 py-10">
          <EmptyState icon={SearchX} title="الوظيفة غير متاحة" description="ربما أُغلقت الوظيفة أو أن الرابط غير صحيح." action={<Button asChild><Link to="/jobs">تصفح الوظائف</Link></Button>} />
        </div>
      </PublicLayout>
    );

  const j = job.data;
  const isSeeker = roles.includes("JOB_SEEKER");

  return (
    <PublicLayout>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <article className="min-w-0">
          <h1 className="text-3xl font-extrabold text-primary">{j.title}</h1>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {j.companies && (
              <Link to="/companies/$slug" params={{ slug: j.companies.slug }} className="inline-flex items-center gap-1 hover:underline">
                <Building2 className="size-4" /> {j.companies.name}
              </Link>
            )}
            {j.locations && <span className="inline-flex items-center gap-1"><MapPin className="size-4" /> {j.locations.city_ar}</span>}
            {j.published_at && <span>نُشرت {formatDate(j.published_at)}</span>}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary">{EMPLOYMENT_LABELS[j.employment_type]}</Badge>
            <Badge className="bg-accent text-accent-foreground hover:bg-accent">{WORK_MODE_LABELS[j.work_mode]}</Badge>
            {j.categories && <Badge variant="outline">{j.categories.name_ar}</Badge>}
            {j.show_salary && j.salary_min && (
              <Badge variant="outline">{j.salary_min.toLocaleString("ar-SA")}{j.salary_max ? ` – ${j.salary_max.toLocaleString("ar-SA")}` : ""} {j.salary_currency}</Badge>
            )}
          </div>
          <section className="mt-8 space-y-6 leading-8">
            <div><h2 className="text-xl font-bold">الوصف</h2><p className="mt-2 whitespace-pre-line">{j.description}</p></div>
            {j.requirements && <div><h2 className="text-xl font-bold">المتطلبات</h2><p className="mt-2 whitespace-pre-line">{j.requirements}</p></div>}
            {j.benefits && <div><h2 className="text-xl font-bold">المزايا</h2><p className="mt-2 whitespace-pre-line">{j.benefits}</p></div>}
          </section>
        </article>

        <aside className="h-fit rounded-2xl border bg-card p-6 lg:sticky lg:top-24">
          {!user ? (
            <div className="space-y-3 text-center">
              <p className="text-sm text-muted-foreground">سجّل الدخول للتقديم على هذه الوظيفة.</p>
              <Button asChild className="w-full"><Link to="/login" search={{ redirect: `/jobs/${slug}` }}>تسجيل الدخول للتقديم</Link></Button>
            </div>
          ) : !isSeeker ? (
            <p className="text-sm text-muted-foreground">التقديم متاح لحسابات الباحثين عن عمل فقط.</p>
          ) : mine.data?.application ? (
            <div className="space-y-2 text-center">
              <p className="font-bold">لقد قدّمت على هذه الوظيفة</p>
              <Badge>{APPLICATION_LABELS[mine.data.application.status]}</Badge>
              <Button asChild variant="outline" className="mt-2 w-full"><Link to="/dashboard/applications">متابعة طلباتي</Link></Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); apply.mutate(); }}>
              <h2 className="font-bold">قدّم الآن</h2>
              <div className="space-y-1.5">
                <Label>السيرة الذاتية</Label>
                {mine.data?.resumes.length ? (
                  <Select value={resumeId} onValueChange={setResumeId}>
                    <SelectTrigger><SelectValue placeholder="اختر سيرة ذاتية" /></SelectTrigger>
                    <SelectContent>{mine.data.resumes.map((r) => <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>)}</SelectContent>
                  </Select>
                ) : (
                  <p className="text-xs text-muted-foreground">لا توجد سيرة ذاتية. <Link to="/dashboard/profile" className="underline">ارفع سيرتك</Link></p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cover">رسالة تعريفية (اختياري)</Label>
                <Textarea id="cover" value={cover} onChange={(e) => setCover(e.target.value)} maxLength={3000} rows={5} />
              </div>
              <Button type="submit" className="w-full bg-brand-accent text-brand-accent-foreground hover:bg-brand-accent/90" disabled={apply.isPending}>إرسال الطلب</Button>
            </form>
          )}
          {user && isSeeker && (
            <Button variant="ghost" className="mt-3 w-full" onClick={() => toggleSave.mutate()} disabled={toggleSave.isPending}>
              {mine.data?.saved ? <><BookmarkCheck className="size-4" /> محفوظة</> : <><Bookmark className="size-4" /> حفظ الوظيفة</>}
            </Button>
          )}
        </aside>
      </div>
    </PublicLayout>
  );
}
