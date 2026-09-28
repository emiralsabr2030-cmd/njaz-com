import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EMPLOYMENT_LABELS, WORK_MODE_LABELS, type EmploymentType, type WorkMode } from "@/lib/constants";

const EMP = Object.keys(EMPLOYMENT_LABELS) as [EmploymentType, ...EmploymentType[]];
const WM = Object.keys(WORK_MODE_LABELS) as [WorkMode, ...WorkMode[]];

const optNum = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : Number(v)))
  .refine((v) => v === null || (Number.isFinite(v) && v >= 0), "أدخل رقمًا صحيحًا موجبًا")
  .refine((v) => v === null || v <= 10_000_000, "القيمة كبيرة جدًا");

export const jobSchema = z
  .object({
    company_id: z.string().uuid("اختر الشركة"),
    title: z.string().trim().min(3, "العنوان يجب ألا يقل عن 3 أحرف").max(150, "العنوان يجب ألا يتجاوز 150 حرفًا"),
    employment_type: z.enum(EMP, { message: "اختر نوع التوظيف" }),
    work_mode: z.enum(WM, { message: "اختر نمط العمل" }),
    salary_min: optNum,
    salary_max: optNum,
    description: z.string().trim().min(20, "الوصف يجب ألا يقل عن 20 حرفًا").max(5000, "الوصف يجب ألا يتجاوز 5000 حرف"),
    requirements: z.string().trim().max(3000, "المتطلبات يجب ألا تتجاوز 3000 حرف"),
  })
  .superRefine((d, ctx) => {
    if (d.salary_min !== null && d.salary_max !== null && d.salary_min > d.salary_max)
      ctx.addIssue({ code: "custom", path: ["salary_max"], message: "الحد الأعلى للراتب يجب أن يكون أكبر من أو يساوي الحد الأدنى" });
  });

export type JobValues = z.output<typeof jobSchema>;
export type JobDefaults = Partial<Record<keyof z.input<typeof jobSchema>, string | number | null>>;
type Errors = Partial<Record<string, string>>;

const selectCls = "h-10 w-full rounded-md border bg-background px-3 text-sm";

export function JobForm({
  companies,
  defaults,
  saving,
  onSave,
  showPublish,
}: {
  companies: { id: string; name: string }[];
  defaults?: JobDefaults;
  saving: boolean;
  onSave: (v: JobValues, publish: boolean) => void;
  showPublish?: boolean;
}) {
  const [errors, setErrors] = useState<Errors>({});
  const d = (k: keyof JobDefaults) => (defaults?.[k] ?? "") as string;

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const publish = (e.nativeEvent as SubmitEvent).submitter?.getAttribute("value") === "publish";
    const raw = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const r = jobSchema.safeParse(raw);
    if (!r.success) {
      const errs: Errors = {};
      for (const i of r.error.issues) errs[String(i.path[0])] ??= i.message;
      setErrors(errs);
      document.getElementById(Object.keys(errs)[0])?.focus();
      return;
    }
    setErrors({});
    onSave(r.data, publish);
  }

  const Err = ({ k }: { k: string }) =>
    errors[k] ? <p id={`${k}-err`} role="alert" className="text-sm text-destructive">{errors[k]}</p> : null;
  const aria = (k: string) => ({ "aria-invalid": !!errors[k] || undefined, "aria-describedby": errors[k] ? `${k}-err` : undefined });

  return (
    <form onSubmit={submit} noValidate className="space-y-4 rounded-xl border bg-card p-4 sm:p-6">
      <div className="space-y-2">
        <Label htmlFor="company_id">الشركة *</Label>
        <select id="company_id" name="company_id" defaultValue={d("company_id")} className={selectCls} {...aria("company_id")}>
          {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <Err k="company_id" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">عنوان الوظيفة *</Label>
        <Input id="title" name="title" defaultValue={d("title")} maxLength={150} {...aria("title")} />
        <Err k="title" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="employment_type">نوع التوظيف *</Label>
          <select id="employment_type" name="employment_type" defaultValue={d("employment_type") || "FULL_TIME"} className={selectCls} {...aria("employment_type")}>
            {Object.entries(EMPLOYMENT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <Err k="employment_type" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="work_mode">نمط العمل *</Label>
          <select id="work_mode" name="work_mode" defaultValue={d("work_mode") || "ONSITE"} className={selectCls} {...aria("work_mode")}>
            {Object.entries(WORK_MODE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <Err k="work_mode" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="salary_min">الراتب من (ريال)</Label>
          <Input id="salary_min" name="salary_min" type="number" inputMode="numeric" min={0} defaultValue={d("salary_min")} {...aria("salary_min")} />
          <Err k="salary_min" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="salary_max">الراتب إلى (ريال)</Label>
          <Input id="salary_max" name="salary_max" type="number" inputMode="numeric" min={0} defaultValue={d("salary_max")} {...aria("salary_max")} />
          <Err k="salary_max" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">الوصف *</Label>
        <Textarea id="description" name="description" rows={5} maxLength={5000} defaultValue={d("description")} {...aria("description")} />
        <Err k="description" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="requirements">المتطلبات</Label>
        <Textarea id="requirements" name="requirements" rows={4} maxLength={3000} defaultValue={d("requirements")} {...aria("requirements")} />
        <Err k="requirements" />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="submit" value="draft" variant={showPublish ? "secondary" : "default"} disabled={saving}>
          {saving ? "جارٍ الحفظ…" : "حفظ كمسودة"}
        </Button>
        {showPublish && (
          <Button type="submit" value="publish" disabled={saving} className="bg-brand-accent text-brand-accent-foreground hover:bg-brand-accent/90">
            حفظ ونشر
          </Button>
        )}
      </div>
    </form>
  );
}

export function dbErrorAr(msg: string) {
  if (/row-level security|permission/i.test(msg)) return "ليست لديك صلاحية لإدارة وظائف هذه الشركة";
  if (/salary_range/.test(msg)) return "الحد الأعلى للراتب يجب أن يكون أكبر من الحد الأدنى";
  if (/salary_nonneg/.test(msg)) return "الراتب لا يمكن أن يكون سالبًا";
  if (/title_len/.test(msg)) return "عنوان الوظيفة غير صالح";
  return "حدث خطأ غير متوقع، حاول مرة أخرى";
}

export function toRow(v: JobValues) {
  return {
    company_id: v.company_id,
    title: v.title,
    description: v.description,
    requirements: v.requirements || null,
    employment_type: v.employment_type,
    work_mode: v.work_mode,
    salary_min: v.salary_min,
    salary_max: v.salary_max,
  };
}
