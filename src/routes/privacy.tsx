import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/common/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "سياسة الخصوصية | نجاز" }, { name: "description", content: "سياسة الخصوصية لمنصة نجاز." }, { property: "og:title", content: "سياسة الخصوصية | نجاز" }, { property: "og:description", content: "سياسة الخصوصية لمنصة نجاز." }] }),
  component: () => (
    <LegalPage title="سياسة الخصوصية" updated="2026">
      <section><h2>مقدمة</h2><p>توضح هذه الوثيقة سياسة الخصوصية الخاصة بمنصة نجاز وكيفية تعاملنا مع المستخدمين وبياناتهم.</p></section>
      <section><h2>التواصل</h2><p>لأي استفسار يرجى التواصل مع فريق نجاز.</p></section>
    </LegalPage>
  ),
});
