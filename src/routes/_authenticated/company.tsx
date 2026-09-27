import { createFileRoute, redirect } from "@tanstack/react-router";
import { Building2, Briefcase, PlusCircle, Users } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { isAdmin, isEmployer } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/company")({
  beforeLoad: ({ context }) => { if (!isEmployer(context.roles) && !isAdmin(context.roles)) throw redirect({ to: "/dashboard" }); },
  component: () => <DashboardShell title="لوحة صاحب العمل" nav={NAV} />,
});

const NAV = [
  { to: "/company", label: "الشركة", icon: Building2, exact: true },
  { to: "/company/jobs", label: "الوظائف", icon: Briefcase, exact: true },
  { to: "/company/jobs/new", label: "وظيفة جديدة", icon: PlusCircle },
  { to: "/company/applications", label: "المتقدمون", icon: Users },
];
