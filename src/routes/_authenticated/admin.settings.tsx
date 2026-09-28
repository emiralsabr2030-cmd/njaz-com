import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Inbox } from "lucide-react";
import { PageHeader } from "@/components/layout/PublicLayout";
import { EmptyState, LoadingBlock } from "@/components/common/EmptyState";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({ meta: [{ title: "طلبات التوثيق | نجاز" }] }),
  component: Page,
});

function Page() {
  const q = useQuery({
    queryKey: ["admin.settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("verification_requests").select("*").limit(50);
      if (error) throw error;
      return data as Record<string, unknown>[];
    },
  });
  return (
    <div>
      <PageHeader title="طلبات التوثيق" />
      {q.isLoading ? <LoadingBlock /> : q.data?.length ? (
        <ul className="space-y-2">{q.data.map((r, i) => (
          <li key={i} className="rounded-xl border bg-card p-4 text-sm">{String(r["title"] ?? r["name"] ?? r["full_name"] ?? r["reason"] ?? r["status"] ?? r["id"] ?? "")}</li>
        ))}</ul>
      ) : <EmptyState icon={Inbox} title="لا توجد بيانات بعد" />}
    </div>
  );
}
