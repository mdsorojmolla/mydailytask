"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { rethrowIfRedirect } from "@/app/actions/helpers";

export async function signInWithGoogleAction() {
  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) redirect("/login?error=missing-env");

    const headerStore = await headers();
    const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
    const proto =
      headerStore.get("x-forwarded-proto") ??
      (host?.includes("localhost") ? "http" : "https");
    const requestOrigin =
      headerStore.get("origin") ?? (host ? `${proto}://${host}` : null);
    const origin =
      requestOrigin ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

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
  } catch (error) {
    rethrowIfRedirect(error);
    redirect("/login?error=auth");
  }
}
