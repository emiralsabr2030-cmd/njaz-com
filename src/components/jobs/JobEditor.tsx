import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobForm, type JobDefaults, type JobValues } from "./JobForm";
import { JobPreview, type PreviewValues } from "./JobPreview";
import type { MyCompany } from "@/lib/company";

/** Job form + live responsive preview (phone / desktop) before publishing. */
export function JobEditor({ companies, defaults, saving, showPublish, onSave }: {
  companies: MyCompany[];
  defaults?: JobDefaults;
  saving: boolean;
  showPublish?: boolean;
  onSave: (v: JobValues, publish: boolean) => void;
}) {
  const [values, setValues] = useState<PreviewValues>({ company_id: companies[0]?.id, employment_type: "FULL_TIME", work_mode: "ONSITE", ...defaults });
  const company = companies.find((c) => c.id === values["company_id"]) ?? companies[0];
  return (
    <Tabs defaultValue="form" dir="rtl">
      <TabsList className="mb-4 grid w-full grid-cols-2 sm:w-80">
        <TabsTrigger value="form">بيانات الوظيفة</TabsTrigger>
        <TabsTrigger value="preview">معاينة الإعلان</TabsTrigger>
      </TabsList>
      <TabsContent value="form" forceMount className="data-[state=inactive]:hidden">
        <JobForm companies={companies} defaults={defaults} saving={saving} showPublish={showPublish} onSave={onSave} onChange={setValues} />
      </TabsContent>
      <TabsContent value="preview" className="data-[state=inactive]:hidden">
        <JobPreview values={values} companyName={company?.name} city={company?.locations?.city_ar} />
      </TabsContent>
    </Tabs>
  );
}
