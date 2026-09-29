import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingBlock } from "@/components/common/EmptyState";
import { SIZE_RANGES, companySchema, fetchLookups, type CompanyValues, type MyCompany } from "@/lib/company";

export const selectCls = "h-10 w-full rounded-md border bg-background px-3 text-sm";

export function CompanyForm({ defaults, saving, submitLabel, onSave }: {
  defaults?: Partial<MyCompany>;
  saving: boolean;
  submitLabel: string;
  onSave: (v: CompanyValues) => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const lookups = useQuery({ queryKey: ["lookups"], queryFn: fetchLookups, staleTime: 600_000 });
  const d = (k: keyof MyCompany) => String(defaults?.[k] ?? "");

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.currentTarget));
    const r = companySchema.safeParse(raw);
    if (!r.success) {
      const errs: Record<string, string> = {};
      for (const i of r.error.issues) errs[String(i.path[0])] ??= i.message;
      setErrors(errs);
      const first = Object.keys(errs)[0];
      if (first) document.getElementById(first)?.focus();
      return;
    }
    setErrors({});
    onSave(r.data);
  }

  if (lookups.isLoading) return <LoadingBlock />;
  const Err = ({ k }: { k: string }) => (errors[k] ? <p id={`${k}-err`} role="alert" className="text-sm text-destructive">{errors[k]}</p> : null);
  const a = (k: string) => ({ id: k, name: k, "aria-invalid": !!errors[k] || undefined, "aria-describedby": errors[k] ? `${k}-err` : undefined });

  return (
    <form onSubmit={submit} noValidate className="space-y-4 rounded-xl border bg-card p-4 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="name">اسم الشركة *</Label><Input {...a("name")} defaultValue={d("name")} maxLength={120} /><Err k="name" /></div>
        <div className="space-y-2"><Label htmlFor="name_en">الاسم بالإنجليزية</Label><Input {...a("name_en")} dir="ltr" defaultValue={d("name_en")} maxLength={120} /><Err k="name_en" /></div>
        <div className="space-y-2">
          <Label htmlFor="industry_id">القطاع *</Label>
          <select {...a("industry_id")} defaultValue={d("industry_id")} className={selectCls}>
            <option value="">اختر القطاع</option>
            {lookups.data?.categories.map((c) => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
          </select><Err k="industry_id" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location_id">المدينة *</Label>
          <select {...a("location_id")} defaultValue={d("location_id")} className={selectCls}>
            <option value="">اختر المدينة</option>
            {lookups.data?.locations.map((l) => <option key={l.id} value={l.id}>{l.city_ar}</option>)}
          </select><Err k="location_id" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="size_range">عدد الموظفين *</Label>
          <select {...a("size_range")} defaultValue={d("size_range")} className={selectCls}>
            <option value="">اختر الحجم</option>
            {SIZE_RANGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select><Err k="size_range" />
        </div>
        <div className="space-y-2"><Label htmlFor="cr_number">رقم السجل التجاري</Label><Input {...a("cr_number")} dir="ltr" inputMode="numeric" maxLength={10} defaultValue={d("cr_number")} /><Err k="cr_number" /></div>
        <div className="space-y-2"><Label htmlFor="email">البريد الإلكتروني *</Label><Input {...a("email")} type="email" dir="ltr" defaultValue={d("email")} /><Err k="email" /></div>
        <div className="space-y-2"><Label htmlFor="phone">الجوال</Label><Input {...a("phone")} type="tel" dir="ltr" placeholder="05XXXXXXXX" defaultValue={d("phone")} /><Err k="phone" /></div>
      </div>
      <div className="space-y-2"><Label htmlFor="website">الموقع الإلكتروني</Label><Input {...a("website")} dir="ltr" placeholder="https://" defaultValue={d("website")} /><Err k="website" /></div>
      <div className="space-y-2"><Label htmlFor="description">نبذة عن الشركة *</Label><Textarea {...a("description")} rows={5} maxLength={3000} defaultValue={d("description")} /><Err k="description" /></div>
      <Button type="submit" disabled={saving} className="w-full sm:w-auto">{saving ? "جارٍ الحفظ…" : submitLabel}</Button>
    </form>
  );
}
