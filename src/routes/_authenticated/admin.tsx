import { createFileRoute, redirect } from "@tanstack/react-router";
import { Gauge, Users, Building2, Briefcase, Flag, FileText } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { isAdmin } from "@/lib/auth";

// UI gate only; every admin action is also enforced by RLS (is_admin) in the database.
export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: ({ context }) => {
    if (!isAdmin(context.roles)) throw redirect({ to: "/dashboard" });
  },
  component: () => <DashboardShell title="لوحة الإدارة" nav={NAV} />,
});

const NAV = [
  { to: "/admin", label: "الإحصاءات", icon: Gauge, exact: true },
  { to: "/admin/users", label: "المستخدمون والصلاحيات", icon: Users },
  { to: "/admin/companies", label: "الشركات والتوثيق", icon: Building2 },
  { to: "/admin/jobs", label: "الوظائف", icon: Briefcase },
  { to: "/admin/reports", label: "البلاغات", icon: Flag },
  { to: "/admin/settings", label: "محتوى الموقع", icon: FileText },
];
