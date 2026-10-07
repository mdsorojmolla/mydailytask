import { Chrome } from "lucide-react";
import { signInWithGoogleAction } from "@/app/(auth)/login/actions";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const configured = hasSupabaseEnv();
  const params = await searchParams;
  const error = loginError(params?.error);

  return (
    <main className="min-h-dvh bg-paper px-5 py-8 pt-[max(2rem,env(safe-area-inset-top,0px))] pb-[max(2rem,env(safe-area-inset-bottom,0px))] text-ink">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-md flex-col justify-center">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#5B4DFB] text-sm font-extrabold text-white shadow-glow">
            MD
          </span>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#5B4DFB]">
            My Day
          </p>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight text-ink">
          Your day, organized around what matters now.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Sign in with Google to keep your routine, tasks, activities, and
          reminders synchronized in your personal productivity space.
        </p>

        {error ? (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-rose-200 bg-white px-4 py-3 text-xs font-semibold text-rose-600 shadow-card"
          >
            {error}
          </div>
        ) : null}

        {!configured ? (
          <div
            role="status"
            className="mt-6 rounded-2xl border border-amber-200 bg-white px-4 py-3.5 text-xs font-medium leading-relaxed text-amber-700 shadow-card"
          >
            Supabase environment variables are not configured yet. Add them to
            <span className="font-mono font-bold"> .env.local</span> before signing in.
          </div>
        ) : null}

        <form action={signInWithGoogleAction} className="mt-8">
          <button
            type="submit"
            disabled={!configured}
            className="focus-ring inline-flex min-h-12 w-full select-none items-center justify-center gap-2.5 rounded-2xl bg-[#5B4DFB] px-5 py-3 text-sm font-bold text-white shadow-glow transition-all active:scale-[0.98] touch-manipulation hover:bg-[#483AE3] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Chrome aria-hidden="true" size={20} />
            Continue with Google
          </button>
        </form>
      </div>
    </main>
  );
}

function loginError(error?: string) {
  if (error === "missing-env") return "Supabase is not configured for this app.";
  if (error === "auth") return "Google sign-in failed. Please try again.";
  return null;
}
