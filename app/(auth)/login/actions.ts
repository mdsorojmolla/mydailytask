"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function signInWithGoogleAction() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) redirect("/login?error=missing-env");

  const headerStore = await headers();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    headerStore.get("origin") ??
    "http://localhost:3000";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent"
      }
    }
  });

  if (error || !data.url) redirect("/login?error=auth");
  redirect(data.url);
}
