import type { ReactNode } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <PublicLayout>
      <article className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-extrabold text-primary">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">آخر تحديث: {updated}</p>
        <div className="mt-6 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm">
          هذا نص تمهيدي عام. يجب مراجعته واعتماده من مستشار قانوني قبل الإطلاق الرسمي، بما يتوافق مع نظام حماية البيانات الشخصية في المملكة العربية السعودية.
        </div>
        <div className="mt-8 space-y-6 leading-8 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-primary">{children}</div>
      </article>
    </PublicLayout>
  );
}
