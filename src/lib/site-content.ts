import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const CONTENT_KEYS = [
  { key: "privacy", label: "سياسة الخصوصية" },
  { key: "terms", label: "الشروط والأحكام" },
  { key: "data-policy", label: "سياسة البيانات" },
  { key: "footer", label: "نص تذييل الحقوق" },
  { key: "footer-about", label: "نبذة التذييل" },
] as const;
export type ContentKey = (typeof CONTENT_KEYS)[number]["key"];

export const siteContentQuery = (key: ContentKey) => ({
  queryKey: ["site-content", key],
  queryFn: async () => {
    const { data, error } = await supabase.from("site_content").select("title, body, updated_at").eq("key", key).maybeSingle();
    if (error) throw error;
    return data;
  },
  staleTime: 60_000,
});

export function useSiteContent(key: ContentKey) {
  return useQuery(siteContentQuery(key));
}
