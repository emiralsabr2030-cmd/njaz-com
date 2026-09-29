import { useState } from "react";
import { Building2, MapPin, Monitor, Smartphone, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EMPLOYMENT_LABELS, WORK_MODE_LABELS, type EmploymentType, type WorkMode } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type PreviewValues = Record<string, string | number | null | undefined>;

export function JobPreview({ values, companyName, city }: { values: PreviewValues; companyName?: string | undefined; city?: string | undefined }) {
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");
  const s = (k: string) => String(values[k] ?? "").trim();
  const min = s("salary_min"), max = s("salary_max");
  const salary = min || max ? `${min ? Number(min).toLocaleString("ar-SA") : "—"} – ${max ? Number(max).toLocaleString("ar-SA") : "—"} ريال` : "";
  const emp = EMPLOYMENT_LABELS[s("employment_type") as EmploymentType];
  const wm = WORK_MODE_LABELS[s("work_mode") as WorkMode];
  const mobile = device === "mobile";

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">هكذا سيظهر الإعلان للباحثين عن عمل</p>
        <div className="flex gap-1 rounded-lg border bg-card p-1" role="group" aria-label="جهاز المعاينة">
          <Button type="button" size="sm" variant={mobile ? "default" : "ghost"} aria-pressed={mobile} onClick={() => setDevice("mobile")}><Smartphone className="size-4" /> هاتف</Button>
          <Button type="button" size="sm" variant={!mobile ? "default" : "ghost"} aria-pressed={!mobile} onClick={() => setDevice("desktop")}><Monitor className="size-4" /> كمبيوتر</Button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-2xl bg-muted p-3 sm:p-6">
        <div className={cn("mx-auto overflow-hidden border bg-background shadow-soft transition-all", mobile ? "w-[360px] max-w-full rounded-[2rem] border-4" : "w-full min-w-[640px] rounded-xl")}>
          <div className={cn("border-b bg-card", mobile ? "px-4 py-3" : "px-8 py-4")}>
            <div className="h-2 w-16 rounded-full bg-muted" aria-hidden />
          </div>
          <article className={cn(mobile ? "p-4" : "grid grid-cols-[minmax(0,1fr)_14rem] gap-8 p-8")}>
            <div className="min-w-0">
              <h2 className={cn("font-extrabold text-primary break-words", mobile ? "text-xl" : "text-3xl")}>{s("title") || "عنوان الوظيفة"}</h2>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Building2 className="size-4" /> {companyName || "اسم الشركة"}</span>
                {city && <span className="inline-flex items-center gap-1"><MapPin className="size-4" /> {city}</span>}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {emp && <Badge variant="secondary">{emp}</Badge>}
                {wm && <Badge className="bg-accent text-accent-foreground hover:bg-accent">{wm}</Badge>}
              </div>
              {salary && mobile && <p className="mt-3 inline-flex items-center gap-1 text-sm font-semibold"><Wallet className="size-4" /> {salary}</p>}
              <h3 className="mt-6 font-bold">الوصف</h3>
              <p className="mt-2 whitespace-pre-line break-words text-sm leading-7">{s("description") || "سيظهر وصف الوظيفة هنا."}</p>
              {s("requirements") && (<><h3 className="mt-6 font-bold">المتطلبات</h3><p className="mt-2 whitespace-pre-line break-words text-sm leading-7">{s("requirements")}</p></>)}
              {mobile && <div className="mt-6 rounded-lg bg-primary py-2.5 text-center text-sm font-bold text-primary-foreground">تقدّم الآن</div>}
            </div>
            {!mobile && (
              <aside className="h-fit space-y-3 rounded-xl border bg-card p-4 text-sm">
                {salary && <p className="inline-flex items-center gap-1 font-semibold"><Wallet className="size-4" /> {salary}</p>}
                <div className="rounded-lg bg-primary py-2.5 text-center font-bold text-primary-foreground">تقدّم الآن</div>
                <div className="rounded-lg border py-2 text-center">حفظ الوظيفة</div>
              </aside>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}
