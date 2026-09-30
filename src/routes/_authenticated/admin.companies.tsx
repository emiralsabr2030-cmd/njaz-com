import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Building2, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PublicLayout";
import { EmptyState, LoadingBlock } from "@/components/common/EmptyState";
import { Row, SearchBox, selectCls } from "@/components/common/ui-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { VERIFICATION_LABELS, formatDate, type VerificationStatus } from "@/lib/constants";
import { dbErrorAr } from "@/lib/company";

export const Route = createFileRoute("/_authenticated/admin/companies")({
  head: () => ({ meta: [{ title: "الشركات والتوثيق | نجاز" }] }),
  component: Page,
});

function Page() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const requests = useQuery({
    queryKey: ["admin.verifications"],
    queryFn: async () => {
      const { data, error } = await supabase.from("verification_requests").select("id, company_id, notes, created_at, companies(name, slug, cr_number, email)").eq("status", "PENDING").order("created_at");
      if (error) throw error;
      return data;
    },
  });
  const companies = useQuery({
    queryKey: ["admin.companies"],
    queryFn: async () => {
      const { data, error } = await supabase.from("companies").select("id, name, slug, cr_number, verification_status, is_active, created_at").order("created_at", { ascending: false }).limit(500);
      if (error) throw error;
      return data;
    },
  });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin.companies"] }); qc.invalidateQueries({ queryKey: ["admin.verifications"] }); };

  async function update(id: string, patch: { verification_status?: VerificationStatus; is_active?: boolean }) {
    const { error } = await supabase.from("companies").update(patch).eq("id", id);
    if (error) return void toast.error("تعذّر التحديث", { description: dbErrorAr(error.message) });
    toast.success("تم التحديث");
    refresh();
  }
  async function review(reqId: string, companyId: string | null, approve: boolean) {
    const status = approve ? "VERIFIED" : "REJECTED";
    const { error } = await supabase.from("verification_requests").update({ status, reviewed_by: user.id, reviewed_at: new Date().toISOString(), review_note: notes[reqId] || null }).eq("id", reqId);
    if (error) return void toast.error("تعذّر حفظ المراجعة", { description: dbErrorAr(error.message) });
    if (companyId) await supabase.from("companies").update({ verification_status: status }).eq("id", companyId);
    toast.success(approve ? "تم توثيق الشركة" : "تم رفض الطلب");
    refresh();
  }

  const list = (companies.data ?? []).filter((c) => !search || c.name.includes(search) || (c.cr_number ?? "").includes(search));
  return (
    <div className="space-y-8">
      <PageHeader title="الشركات والتوثيق" />
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold"><ShieldCheck className="size-5" /> طلبات التوثيق المعلّقة</h2>
        {requests.isLoading ? <LoadingBlock /> : requests.data?.length ? (
          <ul className="space-y-3">
            {requests.data.map((r) => (
              <li key={r.id} className="rounded-xl border bg-card p-4">
                <div className="flex flex-wrap justify-between gap-2">
                  <div>
                    <p className="font-bold">{r.companies?.name}</p>
                    <p className="text-xs text-muted-foreground" dir="auto">السجل: {r.companies?.cr_number || "—"} · {r.companies?.email || "—"} · {formatDate(r.created_at)}</p>
                  </div>
                  {r.companies && <Button size="sm" variant="ghost" asChild><Link to="/companies/$slug" params={{ slug: r.companies.slug }}>عرض الملف</Link></Button>}
                </div>
                <Textarea className="mt-3" rows={2} placeholder="ملاحظة للمراجعة (اختياري)" value={notes[r.id] ?? ""} onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })} />
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => review(r.id, r.company_id, true)}>توثيق</Button>
                  <Button size="sm" variant="outline" onClick={() => review(r.id, r.company_id, false)}>رفض</Button>
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="rounded-xl border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">لا توجد طلبات توثيق معلّقة</p>}
      </section>
      <section>
        <h2 className="mb-3 text-lg font-bold">جميع الشركات</h2>
        <SearchBox value={search} onChange={setSearch} placeholder="ابحث بالاسم أو السجل التجاري" />
        {companies.isLoading ? <LoadingBlock /> : list.length ? (
          <ul className="space-y-2">
            {list.map((c) => (
              <Row key={c.id}>
                <div className="min-w-0">
                  <p className="truncate font-bold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(c.created_at)} {!c.is_active && <Badge variant="secondary" className="ms-1">معطّلة</Badge>}</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm">مفعّلة <Switch checked={c.is_active} onCheckedChange={(v) => update(c.id, { is_active: v })} /></label>
                  <select aria-label="حالة التوثيق" className={selectCls} value={c.verification_status} onChange={(e) => update(c.id, { verification_status: e.target.value as VerificationStatus })}>
                    {Object.entries(VERIFICATION_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                </div>
              </Row>
            ))}
          </ul>
        ) : <EmptyState icon={Building2} title="لا توجد شركات" />}
      </section>
    </div>
  );
}
