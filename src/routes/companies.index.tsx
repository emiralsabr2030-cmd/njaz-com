import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Building2 } from "lucide-react";
import { PublicLayout, PageHeader } from "@/components/layout/PublicLayout";
import { EmptyState, LoadingBlock } from "@/components/common/EmptyState";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/companies/")({
  head: () => ({
    meta: [
      { title: "الشركات | نجاز" },
      { name: "description", content: "تعرّف على الشركات وأصحاب الأعمال الذين يوظّفون عبر نجاز." },
      { property: "og:title", content: "الشركات | نجاز" },
      { property: "og:description", content: "الشركات وأصحاب الأعمال على منصة نجاز." },
    ],
  }),
  component: CompaniesPage,
});

function CompaniesPage() {
  const companies = useQuery({
    queryKey: ["companies", "list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, slug, name, description, verification_status, locations(city_ar)")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(60);
      if (error) throw error;
      return data;
    },
  });

  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <PageHeader title="الشركات" description="أصحاب الأعمال الموجودون على نجاز." />
        {companies.isLoading ? (
          <LoadingBlock />
        ) : companies.data?.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {companies.data.map((c) => (
              <Link key={c.id} to="/companies/$slug" params={{ slug: c.slug }} className="rounded-2xl border bg-card p-5 hover:shadow-soft">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-secondary text-primary"><Building2 className="size-6" /></div>
                  <div className="min-w-0">
                    <h3 className="flex items-center gap-1 truncate font-bold text-primary">
                      {c.name} {c.verification_status === "VERIFIED" && <BadgeCheck className="size-4 shrink-0 text-brand-accent" aria-label="موثّقة" />}
                    </h3>
                    {c.locations && <p className="text-xs text-muted-foreground">{c.locations.city_ar}</p>}
                  </div>
                </div>
                {c.description && <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>}
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState icon={Building2} title="لا توجد شركات بعد" description="ستظهر الشركات هنا بمجرد تسجيلها على المنصة." />
        )}
      </div>
    </PublicLayout>
  );
}
