import { updateSettingsAction } from "@/app/actions/settings";
import { deleteActivityAction, toggleActivityAction } from "@/app/actions/activities";
import { ActivityForm } from "@/components/domain/activity-form";
import { PageMessage } from "@/components/domain/message";
import { NotificationPermissionButton } from "@/components/domain/notification-runtime";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";
import { StatusPill } from "@/components/ui/status";
import { getSettingsPageData } from "@/lib/data";
import { formatTime } from "@/lib/utils/dates";

export default async function SettingsPage({
  searchParams
}: {
  searchParams: { error?: string; success?: string };
}) {
  const { user, settings, activities } = await getSettingsPageData();

  return (
    <>
      <PageMessage error={searchParams.error} success={searchParams.success} />
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="mt-2 text-sm text-muted">{user.email}</p>
      </header>

      <section className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <section className="border-y border-line py-5">
            <h2 className="mb-4 text-lg font-semibold">Notifications</h2>
            <form action={updateSettingsAction} className="space-y-4">
              <input type="hidden" name="returnTo" value="/settings" />
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  name="browserNotificationsEnabled"
                  type="checkbox"
                  defaultChecked={settings.browserNotificationsEnabled}
                  className="h-4 w-4 accent-accent"
                />
                Browser notifications
              </label>
              <Field label="Reminder before minutes">
                <TextInput
                  name="reminderBeforeMinutes"
                  type="number"
                  min="0"
                  max="120"
                  defaultValue={settings.reminderBeforeMinutes}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Quiet start">
                  <TextInput
                    name="quietHoursStart"
                    type="time"
                    defaultValue={settings.quietHoursStart ?? ""}
                  />
                </Field>
                <Field label="Quiet end">
                  <TextInput
                    name="quietHoursEnd"
                    type="time"
                    defaultValue={settings.quietHoursEnd ?? ""}
                  />
                </Field>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" tone="primary">
                  Save Settings
                </Button>
                <NotificationPermissionButton />
              </div>
            </form>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Personal Activities</h2>
            <div className="mt-4 divide-y divide-line border-y border-line">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="grid gap-3 py-4 md:grid-cols-[1fr_auto] md:items-center"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{activity.name}</h3>
                      <StatusPill status={activity.enabled ? "ENABLED" : "DISABLED"} />
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {formatTime(activity.startTime)} · {activity.category}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <form action={toggleActivityAction}>
                      <input type="hidden" name="returnTo" value="/settings" />
                      <input type="hidden" name="id" value={activity.id} />
                      <input
                        type="hidden"
                        name="enabled"
                        value={activity.enabled ? "false" : "true"}
                      />
                      <Button type="submit" tone="secondary">
                        {activity.enabled ? "Disable" : "Enable"}
                      </Button>
                    </form>
                    <form action={deleteActivityAction}>
                      <input type="hidden" name="returnTo" value="/settings" />
                      <input type="hidden" name="id" value={activity.id} />
                      <Button type="submit" tone="danger">
                        Delete
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="border-y border-line py-5">
          <h2 className="mb-4 text-lg font-semibold">Add Activity</h2>
          <ActivityForm returnTo="/settings" />
        </aside>
      </section>
    </>
  );
}
