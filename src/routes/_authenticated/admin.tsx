import { createFileRoute, redirect } from "@tanstack/react-router";
import { Gauge, Users, Building2, Briefcase, Flag, Settings } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { isStaff } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: ({ context }) => { if (!isStaff(context.roles)) throw redirect({ to: "/dashboard" }); },
  component: () => <DashboardShell title="لوحة الإدارة" nav={NAV} />,
});

const NAV = [
  { to: "/admin", label: "نظرة عامة", icon: Gauge, exact: true },
  { to: "/admin/users", label: "المستخدمون", icon: Users },
  { to: "/admin/companies", label: "الشركات", icon: Building2 },
  { to: "/admin/jobs", label: "الوظائف", icon: Briefcase },
  { to: "/admin/reports", label: "البلاغات", icon: Flag },
  { to: "/admin/settings", label: "الإعدادات", icon: Settings },
];
