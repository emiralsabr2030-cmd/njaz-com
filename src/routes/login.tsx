import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { fetchRoles, homeForRoles, safeRedirect } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({ meta: [{ title: "تسجيل الدخول | نجاز" }, { name: "description", content: "سجّل الدخول إلى حسابك في نجاز." }, { property: "og:title", content: "تسجيل الدخول | نجاز" }, { property: "og:description", content: "سجّل الدخول إلى نجاز." }] }),
  component: Login,
});

function Login() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error("بيانات الدخول غير صحيحة");
    const roles = await fetchRoles(data.user.id);
    navigate({ to: safeRedirect(redirect) ?? homeForRoles(roles) });
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-md px-4 py-14">
        <h1 className="text-2xl font-extrabold text-primary">تسجيل الدخول</h1>
        <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border bg-card p-6">
          <div className="space-y-1.5"><Label htmlFor="email">البريد الإلكتروني</Label><Input id="email" type="email" dir="ltr" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="space-y-1.5"><Label htmlFor="pw">كلمة المرور</Label><Input id="pw" type="password" dir="ltr" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <Button type="submit" className="w-full" disabled={busy}>دخول</Button>
          <Button type="button" variant="outline" className="w-full" onClick={() => lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })}>المتابعة عبر Google</Button>
          <div className="flex justify-between text-sm">
            <Link to="/forgot-password" className="underline">نسيت كلمة المرور؟</Link>
            <Link to="/register" className="underline">إنشاء حساب</Link>
          </div>
        </form>
      </div>
    </PublicLayout>
  );
}
