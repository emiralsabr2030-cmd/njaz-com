import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/register")({
  validateSearch: z.object({ type: z.enum(["seeker", "employer"]).optional() }),
  head: () => ({ meta: [{ title: "إنشاء حساب | نجاز" }, { name: "description", content: "أنشئ حسابك كباحث عن عمل أو صاحب عمل." }, { property: "og:title", content: "إنشاء حساب | نجاز" }, { property: "og:description", content: "انضم إلى نجاز." }] }),
  component: Register,
});

function Register() {
  const search = Route.useSearch();
  const [type, setType] = useState<"seeker" | "employer">(search.type ?? "seeker");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) { toast.error("يجب الموافقة على الشروط وسياسة الخصوصية"); return; }
    if (password.length < 8) { toast.error("كلمة المرور 8 أحرف على الأقل"); return; }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: window.location.origin, data: { full_name: name, account_type: type === "employer" ? "COMPANY_OWNER" : "JOB_SEEKER" } },
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setDone(true);
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-md px-4 py-14">
        <h1 className="text-2xl font-extrabold text-primary">إنشاء حساب</h1>
        {done ? (
          <p className="mt-6 rounded-2xl border bg-card p-6">تم إنشاء الحساب. تحقّق من بريدك الإلكتروني لتأكيد الحساب ثم <Link to="/login" className="underline">سجّل الدخول</Link>.</p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border bg-card p-6">
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="نوع الحساب">
              {(["seeker", "employer"] as const).map((t) => (
                <Button key={t} type="button" role="radio" aria-checked={type === t} variant={type === t ? "default" : "outline"} onClick={() => setType(t)}>
                  {t === "seeker" ? "باحث عن عمل" : "صاحب عمل"}
                </Button>
              ))}
            </div>
            <div className="space-y-1.5"><Label htmlFor="name">الاسم الكامل</Label><Input id="name" required value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-1.5"><Label htmlFor="email">البريد الإلكتروني</Label><Input id="email" type="email" dir="ltr" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="space-y-1.5"><Label htmlFor="pw">كلمة المرور</Label><Input id="pw" type="password" dir="ltr" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <label className="flex items-start gap-2 text-sm">
              <Checkbox checked={agree} onCheckedChange={(v) => setAgree(v === true)} />
              <span>أوافق على <Link to="/terms" className="underline">الشروط</Link> و<Link to="/privacy" className="underline">سياسة الخصوصية</Link></span>
            </label>
            <Button type="submit" className="w-full" disabled={busy}>إنشاء الحساب</Button>
          </form>
        )}
      </div>
    </PublicLayout>
  );
}
