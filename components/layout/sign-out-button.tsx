"use client";

import { LogOut } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        const supabase = createBrowserSupabaseClient();
        await supabase.auth.signOut();
        window.location.href = "/login";
      }}
      className="focus-ring mt-3 inline-flex min-h-9 items-center gap-2 rounded-md border border-line px-3 text-sm font-medium text-muted hover:bg-white hover:text-ink"
    >
      <LogOut aria-hidden="true" size={16} />
      Sign out
    </button>
  );
}
