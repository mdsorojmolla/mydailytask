import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/supabase/env";

export async function createServerSupabaseClient() {
  if (!hasSupabaseEnv()) return null;
  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: Array<{
          name: string;
          value: string;
          options: Parameters<typeof cookieStore.set>[2];
        }>
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Components cannot always set cookies. Middleware refreshes them.
        }
      }
    }
  });
}
