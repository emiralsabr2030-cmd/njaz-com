import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Logo } from "@/components/brand/Logo";
import { supabase } from "@/integrations/supabase/client";
import { homeForRoles, useSession } from "@/lib/auth";

const NAV = [
  { to: "/jobs", label: "الوظائف" },
  { to: "/companies", label: "الشركات" },
] as const;

export function useSignOut() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  return async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  };
}

export function SiteHeader() {
  const { user, roles, loading } = useSession();
  const signOut = useSignOut();
  const [open, setOpen] = useState(false);

  const authArea = loading ? (
    <div className="h-9 w-24" aria-hidden />
  ) : user ? (
    <div className="flex items-center gap-2">
      <Button asChild size="sm" variant="secondary">
        <Link to={homeForRoles(roles)}>
          <LayoutDashboard className="size-4" /> لوحتي
        </Link>
      </Button>
      <Button size="sm" variant="ghost" onClick={signOut} aria-label="تسجيل الخروج">
        <LogOut className="size-4" />
      </Button>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Button asChild size="sm" variant="ghost">
        <Link to="/login">دخول</Link>
      </Button>
      <Button asChild size="sm" className="bg-brand-accent text-brand-accent-foreground hover:bg-brand-accent/90">
        <Link to="/register">إنشاء حساب</Link>
      </Button>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex min-w-0 items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex" aria-label="التنقل الرئيسي">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="hidden md:block">{authArea}</div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button size="icon" variant="ghost" aria-label="القائمة">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetTitle className="sr-only">القائمة</SheetTitle>
            <nav className="mt-8 flex flex-col gap-4" onClick={() => setOpen(false)}>
              {NAV.map((n) => (
                <Link key={n.to} to={n.to} className="text-base font-semibold">
                  {n.label}
                </Link>
              ))}
              <div className="pt-4">{authArea}</div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
