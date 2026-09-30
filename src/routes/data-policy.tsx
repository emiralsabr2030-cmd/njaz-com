import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/common/LegalPage";

export const Route = createFileRoute("/data-policy")({
  head: () => ({ meta: [{ title: "سياسة البيانات | نجاز" }, { name: "description", content: "سياسة البيانات لمنصة نجاز." }, { property: "og:title", content: "سياسة البيانات | نجاز" }, { property: "og:description", content: "سياسة البيانات لمنصة نجاز." }] }),
  component: () => (
    <LegalPage title="سياسة البيانات" contentKey="data-policy">
      <section><h2>مقدمة</h2><p>توضح هذه الوثيقة سياسة البيانات الخاصة بمنصة نجاز وكيفية تعاملنا مع المستخدمين وبياناتهم.</p></section>
      <section><h2>التواصل</h2><p>لأي استفسار يرجى التواصل مع فريق نجاز.</p></section>
    </LegalPage>
  ),
});
