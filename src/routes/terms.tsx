import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/common/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "الشروط والأحكام | نجاز" }, { name: "description", content: "الشروط والأحكام لمنصة نجاز." }, { property: "og:title", content: "الشروط والأحكام | نجاز" }, { property: "og:description", content: "الشروط والأحكام لمنصة نجاز." }] }),
  component: () => (
    <LegalPage title="الشروط والأحكام" contentKey="terms">
      <section><h2>مقدمة</h2><p>توضح هذه الوثيقة الشروط والأحكام الخاصة بمنصة نجاز وكيفية تعاملنا مع المستخدمين وبياناتهم.</p></section>
      <section><h2>التواصل</h2><p>لأي استفسار يرجى التواصل مع فريق نجاز.</p></section>
    </LegalPage>
  ),
});
