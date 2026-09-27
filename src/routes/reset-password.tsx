import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "تعيين كلمة مرور جديدة | نجاز" }, { name: "description", content: "عيّن كلمة مرور جديدة." }, { property: "og:title", content: "كلمة مرور جديدة | نجاز" }, { property: "og:description", content: "تعيين كلمة المرور." }] }),
  component: () => {
    const [pw, setPw] = useState("");
    const navigate = useNavigate();
    return (
      <PublicLayout>
        <form className="mx-auto mt-14 max-w-md space-y-4 rounded-2xl border bg-card p-6" onSubmit={async (e) => {
          e.preventDefault();
          if (pw.length < 8) return toast.error("8 أحرف على الأقل");
          const { error } = await supabase.auth.updateUser({ password: pw });
          if (error) return toast.error("انتهت صلاحية الرابط");
          toast.success("تم التحديث");
          navigate({ to: "/login" });
        }}>
          <h1 className="text-xl font-bold">كلمة مرور جديدة</h1>
          <Input type="password" dir="ltr" aria-label="كلمة المرور" value={pw} onChange={(e) => setPw(e.target.value)} />
          <Button type="submit" className="w-full">حفظ</Button>
        </form>
      </PublicLayout>
    );
  },
});
