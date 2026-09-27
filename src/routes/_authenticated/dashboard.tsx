import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard, UserRound, FileText, Bookmark } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";


export const Route = createFileRoute("/_authenticated/dashboard")({

  component: () => <DashboardShell title="لوحة الباحث عن عمل" nav={NAV} />,
});

const NAV = [
  { to: "/dashboard", label: "الرئيسية", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/profile", label: "ملفي", icon: UserRound },
  { to: "/dashboard/applications", label: "طلباتي", icon: FileText },
  { to: "/dashboard/saved-jobs", label: "المحفوظة", icon: Bookmark },
];
