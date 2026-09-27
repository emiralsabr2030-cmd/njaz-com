import { Link, Outlet } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useSignOut } from "./SiteHeader";

export type ShellNavItem = { to: string; label: string; icon: LucideIcon; exact?: boolean };

export function DashboardShell({ title, nav }: { title: string; nav: ShellNavItem[] }) {
  const signOut = useSignOut();
  return (
    <div className="min-h-screen bg-background md:grid md:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="border-b bg-sidebar md:sticky md:top-0 md:h-screen md:border-b-0 md:border-l">
        <div className="flex items-center justify-between gap-2 p-4 md:block">
          <Logo />
          <p className="text-xs font-bold text-muted-foreground md:mt-4">{title}</p>
        </div>
        <nav aria-label={title} className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact ?? false }}
              className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              activeProps={{ className: "bg-accent text-accent-foreground" }}
            >
              <item.icon className="size-4 shrink-0" aria-hidden />
              {item.label}
            </Link>
          ))}
          <Button variant="ghost" size="sm" onClick={signOut} className="shrink-0 justify-start gap-2 text-muted-foreground md:mt-4">
            <LogOut className="size-4" /> تسجيل الخروج
          </Button>
        </nav>
      </aside>
      <main id="main" className="mx-auto w-full max-w-5xl p-4 sm:p-8">
        <Outlet />
      </main>
    </div>
  );
}
