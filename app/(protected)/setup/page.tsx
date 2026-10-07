import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, Bell, Sparkles } from "lucide-react";
import { finishSetupAction } from "@/app/actions/settings";
import { ActivityForm } from "@/components/domain/activity-form";
import { ClassForm } from "@/components/domain/class-form";
import { PageMessage } from "@/components/domain/message";
import { NotificationPermissionButton } from "@/components/domain/notification-runtime";
import { Button } from "@/components/ui/button";
import { getSetupData } from "@/lib/data";

export default async function SetupPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const params = await searchParams;
  const { user, settings } = await getSetupData();

  return (
    <div className="space-y-6">
      <PageMessage error={params.error} success={params.success} />
      
      <header className="border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <Link
            href="/home"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-black/5 hover:text-ink active:scale-95 transition-all"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">Set up your routine</h1>
            <p className="text-xs text-muted">Customize classes, personal habits, and notifications</p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border/80 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-border/50">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">1</span>
              <div>
                <h2 className="text-sm font-semibold text-ink">University routine</h2>
                <p className="text-xs text-muted">Add your weekly courses, times, and classrooms</p>
              </div>
            </div>
            <div className="mt-4">
              <ClassForm returnTo="/setup" />
            </div>
          </section>

          <section className="rounded-2xl border border-border/80 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-border/50">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">2</span>
              <div>
                <h2 className="text-sm font-semibold text-ink">Personal activities</h2>
                <p className="text-xs text-muted">Daily habits like breakfast, exercise, or study blocks</p>
              </div>
            </div>
            <div className="mt-4">
              <ActivityForm returnTo="/setup" />
            </div>
          </section>

          <section className="rounded-2xl border border-border/80 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-border/50">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">3</span>
              <div>
                <h2 className="text-sm font-semibold text-ink">Timely reminders</h2>
                <p className="text-xs text-muted">Get notified 10 minutes before classes and tasks</p>
              </div>
            </div>
            <div className="mt-4">
              <NotificationPermissionButton />
            </div>
          </section>
        </div>

        <aside className="h-max rounded-2xl border border-border/80 bg-white p-5 shadow-xs lg:sticky lg:top-20">
          <p className="text-xs text-muted leading-relaxed">
            Setup is completely optional. You can adjust classes, personal habits, and preferences anytime from Routine or Settings.
          </p>
          <form action={finishSetupAction} className="mt-4">
            <Button type="submit" tone="primary" className="w-full">
              {settings.setupCompleted ? "Go to Home" : "Finish & Open Home"}
            </Button>
          </form>
          <Link
            href="/home"
            className="focus-ring mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-border/80 text-xs font-semibold text-muted hover:text-ink hover:border-ink/20 active:scale-98 transition-all"
          >
            Skip for now
          </Link>
        </aside>
      </div>
    </div>
  );
}
