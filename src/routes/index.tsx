import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Briefcase, Building2, FileCheck2, Search, ShieldCheck, Sparkles, UserRound, Users } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, LoadingBlock } from "@/components/common/EmptyState";
import { JobCard, JOB_CARD_SELECT, type JobCardData } from "@/components/jobs/JobCard";
import { supabase } from "@/integrations/supabase/client";
import { BRAND } from "@/lib/constants";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "نجاز | NJAZ — الفرصة التي تتحول إلى إنجاز" },
      { name: "description", content: "ابحث عن وظيفتك القادمة أو وظّف أفضل الكفاءات في السعودية: حضوري، هجين، وعن بُعد." },
      { property: "og:title", content: "نجاز | NJAZ — منصة الفرص والعمل" },
      { property: "og:description", content: "منصة سعودية تربط أصحاب الأعمال بالباحثين عن العمل والكفاءات." },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const featured = useQuery({
    queryKey: ["jobs", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select(JOB_CARD_SELECT)
        .eq("status", "PUBLISHED")
        .order("is_featured", { ascending: false })
        .order("published_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data as unknown as JobCardData[];
    },
  });

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-hero text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <p className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-semibold">
            <Sparkles className="size-3.5" aria-hidden /> {BRAND.description}
          </p>
          <h1 className="mt-5 max-w-2xl text-4xl leading-tight font-extrabold sm:text-5xl">{BRAND.tagline}</h1>
          <p className="mt-4 max-w-xl text-base opacity-85 sm:text-lg">
            نجاز يربط أصحاب الأعمال في المملكة بالكفاءات المناسبة — وظائف حضورية وهجينة وعن بُعد، في مكان واحد.
          </p>
          <form
            role="search"
            className="mt-8 flex max-w-xl flex-col gap-2 rounded-2xl bg-card p-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/jobs", search: { q: q.trim() || undefined } });
            }}
          >
            <label htmlFor="hero-q" className="sr-only">ابحث عن وظيفة</label>
            <Input
              id="hero-q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="المسمى الوظيفي أو المهارة"
              className="h-12 border-0 bg-transparent text-foreground shadow-none focus-visible:ring-0"
            />
            <Button type="submit" size="lg" className="h-12 bg-brand-accent text-brand-accent-foreground hover:bg-brand-accent/90">
              <Search className="size-4" /> ابحث
            </Button>
          </form>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-extrabold text-primary">فرص مميزة</h2>
          <Link to="/jobs" className="text-sm font-semibold text-accent-foreground hover:underline">كل الوظائف ←</Link>
        </div>
        {featured.isLoading ? (
          <LoadingBlock />
        ) : featured.data && featured.data.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.data.map((j) => <JobCard key={j.id} job={j} />)}
          </div>
        ) : (
          <EmptyState
            icon={Briefcase}
            title="لا توجد فرص منشورة بعد"
            description="كن أول صاحب عمل ينشر فرصة على نجاز."
            action={<Button asChild><Link to="/register" search={{ type: "employer" }}>انشر وظيفة</Link></Button>}
          />
        )}
      </section>

      {/* How it works */}
      <section className="border-y bg-card">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-extrabold text-primary">كيف يعمل نجاز</h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              { icon: UserRound, t: "أنشئ حسابك", d: "سجّل كباحث عن عمل أو كصاحب عمل خلال دقائق." },
              { icon: Search, t: "اكتشف أو انشر", d: "تصفّح الفرص بحسب المدينة ونمط العمل، أو انشر وظيفتك." },
              { icon: FileCheck2, t: "قدّم وتابع", d: "قدّم بسيرتك الذاتية وتابع حالة طلبك خطوة بخطوة." },
            ].map((s, i) => (
              <li key={s.t} className="rounded-2xl border bg-background p-6">
                <span className="text-sm font-bold text-accent-foreground">0{i + 1}</span>
                <s.icon className="mt-3 size-7 text-primary" aria-hidden />
                <h3 className="mt-3 font-bold">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Audiences */}
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-16 md:grid-cols-2">
        <div className="rounded-3xl border bg-card p-8">
          <Users className="size-8 text-accent-foreground" aria-hidden />
          <h2 className="mt-4 text-2xl font-extrabold text-primary">للباحثين عن العمل</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>• ملف مهني متكامل: خبرات، تعليم، مهارات، وشهادات</li>
            <li>• سير ذاتية محفوظة بخصوصية تامة</li>
            <li>• حفظ الوظائف ومتابعة حالة الطلبات</li>
          </ul>
          <Button asChild className="mt-6"><Link to="/register">ابدأ كباحث عن عمل</Link></Button>
        </div>
        <div className="rounded-3xl bg-primary p-8 text-primary-foreground">
          <Building2 className="size-8" aria-hidden />
          <h2 className="mt-4 text-2xl font-extrabold">لأصحاب الأعمال</h2>
          <ul className="mt-4 space-y-2 text-sm opacity-85">
            <li>• صفحة شركة موثّقة تعرض هويتك</li>
            <li>• نشر وإدارة الوظائف بسهولة</li>
            <li>• إدارة المتقدمين ومراحل التوظيف</li>
          </ul>
          <Button asChild className="mt-6 bg-brand-accent text-brand-accent-foreground hover:bg-brand-accent/90">
            <Link to="/register" search={{ type: "employer" }}>سجّل شركتك</Link>
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="flex flex-col items-start gap-4 rounded-3xl border bg-accent p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-primary">فرصتك القادمة تبدأ هنا</h2>
            <p className="mt-1 inline-flex items-center gap-1 text-sm text-accent-foreground">
              <ShieldCheck className="size-4" aria-hidden /> بياناتك محمية وفق أعلى معايير الخصوصية
            </p>
          </div>
          <Button asChild size="lg"><Link to="/register">انضم مجاناً</Link></Button>
        </div>
      </section>
    </PublicLayout>
  );
}
