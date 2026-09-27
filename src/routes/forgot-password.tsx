import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "استعادة كلمة المرور | نجاز" }, { name: "description", content: "استعد الوصول إلى حسابك." }, { property: "og:title", content: "استعادة كلمة المرور | نجاز" }, { property: "og:description", content: "استعادة كلمة المرور." }] }),
  component: () => {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    return (
      <PublicLayout>
        <div className="mx-auto max-w-md px-4 py-14">
          <h1 className="text-2xl font-extrabold text-primary">استعادة كلمة المرور</h1>
          {sent ? <p className="mt-6">أرسلنا رابط الاستعادة إلى بريدك إن كان مسجّلاً.</p> : (
            <form className="mt-6 space-y-4 rounded-2xl border bg-card p-6" onSubmit={async (e) => {
              e.preventDefault();
              const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
              if (error) toast.error("تعذّر الإرسال"); else setSent(true);
            }}>
              <Input type="email" dir="ltr" required aria-label="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Button type="submit" className="w-full">إرسال الرابط</Button>
            </form>
          )}
        </div>
      </PublicLayout>
    );
  },
});
