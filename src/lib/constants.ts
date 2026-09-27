import type { Database } from "@/integrations/supabase/types";

type E = Database["public"]["Enums"];
export type AppRole = E["app_role"];
export type EmploymentType = E["employment_type"];
export type WorkMode = E["work_mode"];
export type ApplicationStatus = E["application_status"];
export type VerificationStatus = E["verification_status"];
export type JobStatus = E["job_status"];

export const BRAND = {
  nameAr: "نجاز",
  nameEn: "NJAZ",
  description: "منصة الفرص والعمل",
  tagline: "الفرصة التي تتحول إلى إنجاز",
} as const;

export const EMPLOYMENT_LABELS: Record<EmploymentType, string> = {
  FULL_TIME: "دوام كامل",
  PART_TIME: "دوام جزئي",
  TEMPORARY: "مؤقت",
  SEASONAL: "موسمي",
  PROJECT: "مشروع",
};

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  ONSITE: "حضوري",
  REMOTE: "عن بُعد",
  HYBRID: "هجين",
};

export const APPLICATION_LABELS: Record<ApplicationStatus, string> = {
  APPLIED: "تم التقديم",
  REVIEWING: "قيد المراجعة",
  SHORTLISTED: "القائمة المختصرة",
  INTERVIEW: "مقابلة",
  OFFER: "عرض وظيفي",
  HIRED: "تم التوظيف",
  REJECTED: "مرفوض",
  WITHDRAWN: "منسحب",
};

export const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  UNVERIFIED: "غير موثّق",
  PENDING: "قيد التحقق",
  VERIFIED: "موثّق",
  REJECTED: "مرفوض",
  SUSPENDED: "موقوف",
};

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  DRAFT: "مسودة",
  PUBLISHED: "منشورة",
  CLOSED: "مغلقة",
  ARCHIVED: "مؤرشفة",
};

export const ROLE_LABELS: Record<AppRole, string> = {
  SUPER_ADMIN: "مدير عام",
  ADMIN: "مدير",
  MODERATOR: "مشرف",
  SUPPORT: "دعم",
  COMPANY_OWNER: "صاحب عمل",
  COMPANY_RECRUITER: "مسؤول توظيف",
  JOB_SEEKER: "باحث عن عمل",
  FREELANCER: "مستقل",
};

export const STAFF_ROLES: AppRole[] = ["SUPER_ADMIN", "ADMIN", "MODERATOR", "SUPPORT"];
export const EMPLOYER_ROLES: AppRole[] = ["COMPANY_OWNER", "COMPANY_RECRUITER"];

export function makeSlug(text: string) {
  const base = text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const suffix = Math.random().toString(36).slice(2, 8);
  return base ? `${base}-${suffix}` : suffix;
}

export function formatDate(d: string | null | undefined) {
  if (!d) return "";
  return new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium" }).format(new Date(d));
}
