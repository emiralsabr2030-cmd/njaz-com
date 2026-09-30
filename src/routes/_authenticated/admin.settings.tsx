import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PublicLayout";
import { LoadingBlock } from "@/components/common/EmptyState";
import { RichText } from "@/components/common/LegalPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { CONTENT_KEYS, siteContentQuery, type ContentKey } from "@/lib/site-content";
import { dbErrorAr } from "@/lib/company";
import { formatDate } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({ meta: [{ title: "محتوى الموقع | نجاز" }] }),
  component: Page,
});

function Page() {
  return (
    <div>
      <PageHeader title="محتوى الموقع" description="عدّل سياسة الخصوصية والشروط ونصوص التذييل. تظهر التعديلات فورًا للزوار." />
      <Tabs defaultValue="privacy" dir="rtl">
        <TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start">
          {CONTENT_KEYS.map((c) => <TabsTrigger key={c.key} value={c.key}>{c.label}</TabsTrigger>)}
        </TabsList>
        {CONTENT_KEYS.map((c) => (
          <TabsContent key={c.key} value={c.key}><Editor k={c.key} label={c.label} /></TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function Editor({ k, label }: { k: ContentKey; label: string }) {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const q = useQuery(siteContentQuery(k));
  if (q.isLoading) return <LoadingBlock />;
  return <EditorForm key={q.data?.updated_at ?? "new"} k={k} label={label} initial={q.data} onSaved={() => qc.invalidateQueries({ queryKey: ["site-content", k] })} userId={user.id} />;
}

function EditorForm({ k, label, initial, onSaved, userId }: { k: ContentKey; label: string; initial: { title: string; body: string; updated_at: string } | null | undefined; onSaved: () => void; userId: string }) {
  const [title, setTitle] = useState(initial?.title ?? label);
  const [body, setBody] = useState(initial?.body ?? "");
  const [saving, setSaving] = useState(false);
  const short = k.startsWith("footer");
  async function save() {
    if (!title.trim()) return void toast.error("العنوان مطلوب");
    if (body.length > 50000) return void toast.error("النص طويل جدًا");
    setSaving(true);
    const { error } = await supabase.from("site_content").upsert({ key: k, title: title.trim(), body, updated_by: userId });
    setSaving(false);
    if (error) return void toast.error("تعذّر الحفظ", { description: dbErrorAr(error.message) });
    toast.success("تم حفظ المحتوى");
    onSaved();
  }
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4 rounded-xl border bg-card p-4">
        <div className="space-y-2"><Label htmlFor={`t-${k}`}>العنوان</Label><Input id={`t-${k}`} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} /></div>
        <div className="space-y-2">
          <Label htmlFor={`b-${k}`}>النص</Label>
          <Textarea id={`b-${k}`} rows={short ? 4 : 18} value={body} onChange={(e) => setBody(e.target.value)} />
          <p className="text-xs text-muted-foreground">
            {short ? (k === "footer" ? "استخدم {year} لإدراج السنة الحالية تلقائيًا." : "نص قصير يظهر أسفل الشعار في التذييل.") : "ابدأ السطر بـ ## لإنشاء عنوان فرعي، واترك سطرًا فارغًا بين الفقرات."}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Button onClick={save} disabled={saving}>{saving ? "جارٍ الحفظ…" : "حفظ"}</Button>
          {initial?.updated_at && <span className="text-xs text-muted-foreground">آخر تحديث {formatDate(initial.updated_at)}</span>}
        </div>
      </div>
      <div className="rounded-xl border bg-background p-4">
        <p className="mb-3 text-xs font-bold text-muted-foreground">معاينة</p>
        <h2 className="text-xl font-extrabold text-primary">{title}</h2>
        <div className="mt-3 space-y-4 text-sm leading-7 [&_h2]:font-bold [&_h2]:text-primary">
          {body ? <RichText text={body.replace("{year}", String(new Date().getFullYear()))} /> : <p className="text-muted-foreground">لا يوجد نص بعد — سيُعرض النص الافتراضي.</p>}
        </div>
      </div>
    </div>
  );
}
