import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PublicLayout";
import { EmptyState, LoadingBlock } from "@/components/common/EmptyState";
import { Row, SearchBox, selectCls } from "@/components/common/ui-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ROLE_LABELS, VERIFICATION_LABELS, formatDate, type AppRole, type VerificationStatus } from "@/lib/constants";
import { dbErrorAr } from "@/lib/company";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({ meta: [{ title: "المستخدمون والصلاحيات | نجاز" }] }),
  component: Page,
});

const MANAGED: AppRole[] = ["ADMIN", "MODERATOR", "SUPPORT", "COMPANY_OWNER", "COMPANY_RECRUITER", "JOB_SEEKER", "FREELANCER"];

function Page() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const q = useQuery({
    queryKey: ["admin.users"],
    queryFn: async () => {
      const [p, r] = await Promise.all([
        supabase.from("profiles").select("id, full_name, username, verification_status, created_at").order("created_at", { ascending: false }).limit(500),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      if (p.error) throw p.error;
      if (r.error) throw r.error;
      const roles = new Map<string, AppRole[]>();
      for (const x of r.data) roles.set(x.user_id, [...(roles.get(x.user_id) ?? []), x.role]);
      return p.data.map((u) => ({ ...u, roles: roles.get(u.id) ?? [] }));
    },
  });

  async function toggleRole(uid: string, role: AppRole, has: boolean) {
    if (uid === user.id && role === "ADMIN" && has) return void toast.error("لا يمكنك إزالة صلاحية المدير من حسابك");
    const { error } = has
      ? await supabase.from("user_roles").delete().eq("user_id", uid).eq("role", role)
      : await supabase.from("user_roles").insert({ user_id: uid, role });
    if (error) return void toast.error("تعذّر تحديث الصلاحية", { description: dbErrorAr(error.message) });
    toast.success(has ? "تمت إزالة الصلاحية" : "تمت إضافة الصلاحية");
    qc.invalidateQueries({ queryKey: ["admin.users"] });
  }
  async function setVerification(uid: string, v: VerificationStatus) {
    const { error } = await supabase.from("profiles").update({ verification_status: v }).eq("id", uid);
    if (error) return void toast.error("تعذّر التحديث", { description: dbErrorAr(error.message) });
    toast.success("تم تحديث حالة الحساب");
    qc.invalidateQueries({ queryKey: ["admin.users"] });
  }

  const list = (q.data ?? []).filter((u) => !search || (u.full_name ?? "").includes(search) || (u.username ?? "").includes(search));
  return (
    <div>
      <PageHeader title="المستخدمون والصلاحيات" description="أضف أو أزل الصلاحيات، ووثّق الحسابات أو أوقفها." />
      <SearchBox value={search} onChange={setSearch} placeholder="ابحث بالاسم" />
      {q.isLoading ? <LoadingBlock /> : list.length ? (
        <ul className="space-y-3">
          {list.map((u) => (
            <li key={u.id} className="rounded-xl border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-bold">{u.full_name || "بدون اسم"} {u.id === user.id && <span className="text-xs text-muted-foreground">(أنت)</span>}</p>
                  <p className="text-xs text-muted-foreground">انضم {formatDate(u.created_at)}</p>
                </div>
                <select aria-label="حالة الحساب" className={selectCls} value={u.verification_status} onChange={(e) => setVerification(u.id, e.target.value as VerificationStatus)}>
                  {Object.entries(VERIFICATION_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5" aria-label="الصلاحيات">
                {MANAGED.map((r) => {
                  const has = u.roles.includes(r);
                  return (
                    <Button key={r} size="sm" variant={has ? "default" : "outline"} aria-pressed={has} className="h-7 rounded-full px-3 text-xs" onClick={() => toggleRole(u.id, r, has)}>
                      {ROLE_LABELS[r]}
                    </Button>
                  );
                })}
                {u.roles.includes("SUPER_ADMIN") && <Badge>{ROLE_LABELS.SUPER_ADMIN}</Badge>}
              </div>
            </li>
          ))}
        </ul>
      ) : <EmptyState icon={Users} title="لا يوجد مستخدمون مطابقون" />}
    </div>
  );
}

export { Row };
