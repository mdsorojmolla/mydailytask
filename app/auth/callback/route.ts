import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const host = request.headers.get("x-forwarded-host") ?? requestUrl.host;
  const proto =
    request.headers.get("x-forwarded-proto") ??
    (host.includes("localhost") ? "http" : "https");
  const origin = `${proto}://${host}`;
  const supabase = await createServerSupabaseClient();

  if (!supabase || !code) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  return NextResponse.redirect(`${origin}/`);
}
