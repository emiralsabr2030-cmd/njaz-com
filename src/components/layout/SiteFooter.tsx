import { Link } from "@tanstack/react-router";
import { BRAND } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t bg-brand-dark text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <p className="text-2xl font-extrabold">
            {BRAND.nameAr} <span className="font-latin text-lg opacity-70">| {BRAND.nameEn}</span>
          </p>
          <p className="mt-2 text-sm opacity-75">{BRAND.description} — {BRAND.tagline}</p>
        </div>
        <nav aria-label="روابط المنصة" className="flex flex-col gap-2 text-sm opacity-85">
          <Link to="/jobs">تصفح الوظائف</Link>
          <Link to="/companies">الشركات</Link>
          <Link to="/register">انضم إلى نجاز</Link>
        </nav>
        <nav aria-label="روابط قانونية" className="flex flex-col gap-2 text-sm opacity-85">
          <Link to="/privacy">سياسة الخصوصية</Link>
          <Link to="/terms">الشروط والأحكام</Link>
          <Link to="/data-policy">سياسة البيانات</Link>
        </nav>
      </div>
      <p className="border-t border-primary-foreground/10 py-4 text-center text-xs opacity-60">
        © {new Date().getFullYear()} نجاز. جميع الحقوق محفوظة.
      </p>
    </footer>
  );
}
