import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Flag } from "lucide-react";
import { PageHeader } from "@/components/layout/PublicLayout";
import { EmptyState, LoadingBlock } from "@/components/common/EmptyState";
import { selectCls } from "@/components/common/ui-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/constants";
import { dbErrorAr } from "@/lib/company";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  head: () => ({ meta: [{ title: "البلاغات | نجاز" }] }),
  component: Page,
});

const STATUS = { OPEN: "مفتوح", IN_REVIEW: "قيد المراجعة", RESOLVED: "تمت المعالجة", DISMISSED: "مرفوض" } as const;
type S = keyof typeof STATUS;
const TARGET: Record<string, string> = { job: "وظيفة", company: "شركة", profile: "مستخدم" };

function Page() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"" | S>("OPEN");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const q = useQuery({
    queryKey: ["admin.reports"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(500);
      if (error) throw error;
      return data;
    },
  });
  async function save(id: string, status: S) {
    const { error } = await supabase.from("reports").update({ status, handled_by: user.id, ...(notes[id] !== undefined ? { resolution_note: notes[id] } : {}) }).eq("id", id);
    if (error) return void toast.error("تعذّر تحديث البلاغ", { description: dbErrorAr(error.message) });
    toast.success("تم تحديث البلاغ");
    qc.invalidateQueries({ queryKey: ["admin.reports"] });
  }
  const list = (q.data ?? []).filter((r) => !filter || r.status === filter);
  return (
    <div>
      <PageHeader title="البلاغات" actions={
        <select aria-label="تصفية" className={selectCls} value={filter} onChange={(e) => setFilter(e.target.value as S | "")}>
          <option value="">الكل</option>
          {Object.entries(STATUS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
      } />
      {q.isLoading ? <LoadingBlock /> : list.length ? (
        <ul className="space-y-3">
          {list.map((r) => (
            <li key={r.id} className="rounded-xl border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-bold">{r.reason}</p>
                <div className="flex items-center gap-2"><Badge variant="secondary">{TARGET[r.target_type] ?? r.target_type}</Badge><Badge>{STATUS[r.status]}</Badge></div>
              </div>
              {r.details && <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{r.details}</p>}
              <p className="mt-1 text-xs text-muted-foreground">{formatDate(r.created_at)}</p>
              <Textarea className="mt-3" rows={2} placeholder="ملاحظة المعالجة" defaultValue={r.resolution_note ?? ""} onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })} />
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => save(r.id, "IN_REVIEW")}>قيد المراجعة</Button>
                <Button size="sm" onClick={() => save(r.id, "RESOLVED")}>تمت المعالجة</Button>
                <Button size="sm" variant="ghost" onClick={() => save(r.id, "DISMISSED")}>رفض البلاغ</Button>
              </div>
            </li>
          ))}
        </ul>
      ) : <EmptyState icon={Flag} title="لا توجد بلاغات" description="ستظهر هنا البلاغات المرسلة من المستخدمين." />}
    </div>
  );
}
