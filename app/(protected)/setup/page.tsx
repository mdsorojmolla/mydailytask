import Link from "next/link";
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
  searchParams: { error?: string; success?: string };
}) {
  const { user, settings } = await getSetupData();

  return (
    <>
      <PageMessage error={searchParams.error} success={searchParams.success} />
      <header className="mb-8">
        <p className="text-sm font-medium text-muted">Welcome, {user.email}</p>
        <h1 className="mt-1 text-3xl font-semibold">Set up your daily system</h1>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-9">
          <section className="border-t border-line pt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Step 1
            </p>
            <h2 className="mt-2 text-xl font-semibold">University routine</h2>
            <div className="mt-4">
              <ClassForm returnTo="/setup" />
            </div>
          </section>

          <section className="border-t border-line pt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Step 2
            </p>
            <h2 className="mt-2 text-xl font-semibold">Personal activities</h2>
            <div className="mt-4">
              <ActivityForm returnTo="/setup" />
            </div>
          </section>

          <section className="border-t border-line pt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Step 3
            </p>
            <h2 className="mt-2 text-xl font-semibold">Notifications</h2>
            <div className="mt-4">
              <NotificationPermissionButton />
            </div>
          </section>
        </div>

        <aside className="h-max rounded-md border border-line bg-white px-5 py-5">
          <p className="text-sm text-muted">
            Setup is optional. You can add or change everything later.
          </p>
          <form action={finishSetupAction} className="mt-5">
            <Button type="submit" tone="primary" className="w-full">
              {settings.setupCompleted ? "Go to Home" : "Start My Day"}
            </Button>
          </form>
          <Link
            href="/home"
            className="focus-ring mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-md border border-line text-sm font-semibold hover:border-accent/50"
          >
            Skip for now
          </Link>
        </aside>
      </div>
    </>
  );
}
