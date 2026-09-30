import { Link } from "@tanstack/react-router";
import { BRAND } from "@/lib/constants";
import { useSiteContent } from "@/lib/site-content";

export function SiteFooter() {
  const rights = useSiteContent("footer");
  const about = useSiteContent("footer-about");
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t bg-brand-dark text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="text-2xl font-extrabold">
            {BRAND.nameAr} <span className="font-latin text-lg opacity-70">| {BRAND.nameEn}</span>
          </p>
          <p className="mt-3 max-w-sm text-sm leading-7 opacity-75">{about.data?.body || `${BRAND.description} — ${BRAND.tagline}`}</p>
        </div>
        <nav aria-label="روابط المنصة" className="flex flex-col gap-3 text-sm">
          <p className="font-bold opacity-100">المنصة</p>
          <Link to="/jobs" className="opacity-75 hover:opacity-100">تصفح الوظائف</Link>
          <Link to="/companies" className="opacity-75 hover:opacity-100">الشركات</Link>
          <Link to="/register" className="opacity-75 hover:opacity-100">انضم إلى نجاز</Link>
        </nav>
        <nav aria-label="روابط قانونية" className="flex flex-col gap-3 text-sm">
          <p className="font-bold">قانوني</p>
          <Link to="/privacy" className="opacity-75 hover:opacity-100">سياسة الخصوصية</Link>
          <Link to="/terms" className="opacity-75 hover:opacity-100">الشروط والأحكام</Link>
          <Link to="/data-policy" className="opacity-75 hover:opacity-100">سياسة البيانات</Link>
        </nav>
      </div>
      <p className="border-t border-primary-foreground/10 px-4 py-5 text-center text-xs opacity-60">
        {rights.data?.body ? rights.data.body.replace("{year}", String(year)) : `© ${year} نجاز. جميع الحقوق محفوظة.`}
      </p>
    </footer>
  );
}
