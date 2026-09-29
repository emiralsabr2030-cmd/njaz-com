import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const SIZE_RANGES = ["1-10", "11-50", "51-200", "201-500", "500+"] as const;

const optText = (max: number, msg: string) => z.string().trim().max(max, msg);

export const companySchema = z.object({
  name: z.string().trim().min(2, "اسم الشركة يجب ألا يقل عن حرفين").max(120, "اسم الشركة طويل جدًا"),
  name_en: optText(120, "الاسم الإنجليزي طويل جدًا").refine((v) => v === "" || /^[A-Za-z0-9 .,&'()-]+$/.test(v), "الاسم الإنجليزي يجب أن يكون بأحرف إنجليزية"),
  industry_id: z.string().uuid("اختر القطاع"),
  location_id: z.string().uuid("اختر المدينة"),
  size_range: z.enum(SIZE_RANGES, { message: "اختر حجم الشركة" }),
  cr_number: z.string().trim().refine((v) => v === "" || /^\d{10}$/.test(v), "رقم السجل التجاري يتكون من 10 أرقام"),
  email: z.string().trim().min(1, "البريد الإلكتروني مطلوب").email("البريد الإلكتروني غير صالح").max(255),
  phone: z.string().trim().refine((v) => v === "" || /^(05\d{8}|\+9665\d{8})$/.test(v.replace(/\s/g, "")), "رقم الجوال يجب أن يكون بصيغة 05XXXXXXXX"),
  website: z.string().trim().refine((v) => v === "" || /^https?:\/\/[^\s.]+\.[^\s]+$/i.test(v), "الموقع يجب أن يبدأ بـ https://"),
  description: z.string().trim().min(30, "النبذة يجب ألا تقل عن 30 حرفًا").max(3000, "النبذة يجب ألا تتجاوز 3000 حرف"),
});
export type CompanyValues = z.output<typeof companySchema>;

export function companyToRow(v: CompanyValues) {
  return {
    name: v.name,
    name_en: v.name_en || null,
    industry_id: v.industry_id,
    location_id: v.location_id,
    size_range: v.size_range,
    cr_number: v.cr_number || null,
    email: v.email,
    phone: v.phone ? v.phone.replace(/\s/g, "") : null,
    website: v.website || null,
    description: v.description,
  };
}

export type MyCompany = {
  id: string;
  name: string;
  slug: string;
  name_en: string | null;
  industry_id: string | null;
  location_id: string | null;
  size_range: string | null;
  cr_number: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  description: string | null;
  verification_status: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED" | "SUSPENDED";
  is_active: boolean;
  owner_id: string;
  locations: { city_ar: string } | null;
};

/** Company is ready for job posting when its core profile passes validation. */
export function missingCompanyFields(c: MyCompany): string[] {
  const r = companySchema.safeParse({
    name: c.name ?? "", name_en: c.name_en ?? "", industry_id: c.industry_id ?? "", location_id: c.location_id ?? "",
    size_range: c.size_range ?? "", cr_number: c.cr_number ?? "", email: c.email ?? "", phone: c.phone ?? "",
    website: c.website ?? "", description: c.description ?? "",
  });
  const out = r.success ? [] : [...new Set(r.error.issues.map((i) => i.message))];
  if (c.verification_status === "SUSPENDED") out.push("الشركة موقوفة من الإدارة");
  if (!c.is_active) out.push("الشركة غير مفعّلة");
  return out;
}

export async function fetchLookups() {
  const [cats, locs] = await Promise.all([
    supabase.from("categories").select("id, name_ar").eq("is_active", true).order("name_ar"),
    supabase.from("locations").select("id, city_ar").eq("is_active", true).order("city_ar"),
  ]);
  if (cats.error) throw cats.error;
  if (locs.error) throw locs.error;
  return { categories: cats.data, locations: locs.data };
}

export function dbErrorAr(msg: string) {
  if (/row-level security|permission/i.test(msg)) return "ليست لديك صلاحية لتنفيذ هذا الإجراء";
  if (/duplicate key|unique/i.test(msg)) return "هذه البيانات مستخدمة مسبقًا";
  if (/salary_range/.test(msg)) return "الحد الأعلى للراتب يجب أن يكون أكبر من الحد الأدنى";
  if (/salary_nonneg/.test(msg)) return "الراتب لا يمكن أن يكون سالبًا";
  if (/title_len/.test(msg)) return "عنوان الوظيفة غير صالح";
  if (/network|fetch/i.test(msg)) return "تعذّر الاتصال، تحقق من الإنترنت";
  return "حدث خطأ غير متوقع، حاول مرة أخرى";
}
