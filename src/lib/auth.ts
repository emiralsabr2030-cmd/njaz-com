import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "./constants";
import { EMPLOYER_ROLES, STAFF_ROLES } from "./constants";

export async function fetchRoles(userId: string): Promise<AppRole[]> {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) return [];
  return data.map((r) => r.role);
}

export const isStaff = (roles: AppRole[]) => roles.some((r) => STAFF_ROLES.includes(r));
export const isAdmin = (roles: AppRole[]) => roles.includes("ADMIN") || roles.includes("SUPER_ADMIN");
export const isEmployer = (roles: AppRole[]) => roles.some((r) => EMPLOYER_ROLES.includes(r));

export function homeForRoles(roles: AppRole[]): "/admin" | "/company" | "/dashboard" {
  if (isAdmin(roles)) return "/admin";
  if (isEmployer(roles)) return "/company";
  return "/dashboard";
}

/** Only allow same-origin relative paths as post-login redirects. */
export function safeRedirect(path: unknown): string | undefined {
  if (typeof path !== "string") return undefined;
  if (!path.startsWith("/") || path.startsWith("//")) return undefined;
  return path;
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async (s: Session | null) => {
      if (!active) return;
      setSession(s);
      setRoles(s ? await fetchRoles(s.user.id) : []);
      if (active) setLoading(false);
    };
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setTimeout(() => void load(s), 0);
    });
    supabase.auth.getSession().then(({ data }) => load(data.session));
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const user: User | null = session?.user ?? null;
  return { session, user, roles, loading };
}
