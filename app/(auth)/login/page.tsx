import { Chrome } from "lucide-react";
import { signInWithGoogleAction } from "@/app/(auth)/login/actions";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default function LoginPage({
  searchParams
}: {
  searchParams: { error?: string };
}) {
  const configured = hasSupabaseEnv();
  const error = loginError(searchParams.error);

  return (
    <main className="min-h-screen bg-paper px-5 py-8 text-ink">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-accent">
          Routine OS
        </p>
        <h1 className="text-4xl font-semibold leading-tight">
          Your day, organized around what matters now.
        </h1>
        <p className="mt-4 text-base leading-7 text-muted">
          Sign in with Google to keep your routine, tasks, activities, and
          reminders private to your account.
        </p>

        {error ? (
          <div
            role="alert"
            className="mt-8 rounded-md border border-danger/30 bg-white px-4 py-3 text-sm text-danger"
          >
            {error}
          </div>
        ) : null}

        {!configured ? (
          <div
            role="status"
            className="mt-8 rounded-md border border-warning/30 bg-white px-4 py-3 text-sm leading-6 text-warning"
          >
            Supabase environment variables are not configured yet. Add them to
            <span className="font-mono"> .env.local</span> before signing in.
          </div>
        ) : null}

        <form action={signInWithGoogleAction} className="mt-8">
          <button
            type="submit"
            disabled={!configured}
            className="focus-ring inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-line bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#29342e] disabled:cursor-not-allowed disabled:bg-muted"
          >
            <Chrome aria-hidden="true" size={18} />
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
