import { supabase } from "@/integrations/supabase/client";

export async function fetchMyCompanies(userId: string) {
  const { data, error } = await supabase.from("company_members").select("companies(id, name)").eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((r) => r.companies).filter(Boolean) as { id: string; name: string }[];
}
