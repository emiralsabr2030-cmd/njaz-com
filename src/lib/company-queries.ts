import { supabase } from "@/integrations/supabase/client";
import type { MyCompany } from "./company";

export const COMPANY_SELECT =
  "id, name, slug, name_en, industry_id, location_id, size_range, cr_number, email, phone, website, description, verification_status, is_active, owner_id, locations(city_ar)";

export async function fetchMyCompanies(userId: string): Promise<MyCompany[]> {
  const { data, error } = await supabase.from("company_members").select(`companies(${COMPANY_SELECT})`).eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((r) => r.companies).filter(Boolean) as unknown as MyCompany[];
}
