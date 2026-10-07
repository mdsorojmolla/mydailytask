import Link from "next/link";
import {
  Bell,
  BookOpen,
  Calendar,
  ChevronRight,
  GraduationCap,
  Info,
  LineChart,
  LogOut,
  Moon,
  Plus,
  Shield,
  Sparkles,
  Upload,
  User
} from "lucide-react";
import { updateSettingsAction } from "@/app/actions/settings";
import { deleteActivityAction, toggleActivityAction } from "@/app/actions/activities";
import { ActivityForm } from "@/components/domain/activity-form";
import { PageMessage } from "@/components/domain/message";
import { NotificationPermissionButton } from "@/components/domain/notification-runtime";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";
import { StatusPill } from "@/components/ui/status";
import { getSettingsPageData } from "@/lib/data";
import { formatTime } from "@/lib/utils/dates";

export default async function SettingsPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; success?: string; section?: string }>;
}) {
  const params = await searchParams;
  const { user, settings, activities } = await getSettingsPageData();
  const showAddActivity = params.section === "add-activity";
  const showNotificationSettings = params.section === "notifications";

  const firstName =
    user.user_metadata?.full_name?.split(" ")[0] ??
    user.user_metadata?.name?.split(" ")[0] ??
    user.email?.split("@")[0] ??
    "User";
  const initials = firstName.slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageMessage error={params.error} success={params.success} />

      {/* Screen Title */}
      <header>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">More & Settings</h1>
        <p className="text-xs sm:text-sm text-muted">Account, preferences, and personal routines</p>
      </header>

      {/* User Profile Card */}
      <section className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#5B4DFB] text-sm font-extrabold text-white shadow-glow">
            {initials}
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-ink truncate">{user.user_metadata?.full_name ?? firstName}</h2>
            <p className="text-xs text-muted truncate">{user.email}</p>
          </div>
        </div>

        <div className="shrink-0">
          <SignOutButton />
        </div>
      </section>

      {/* Group: PERSONAL */}
      <section className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-muted px-1">Personal</p>
        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-card">
          {/* Insights link */}
          <Link
            href="/insights"
            className="flex items-center justify-between p-3.5 hover:bg-slate-50/70 active:bg-slate-100 transition"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <LineChart size={18} strokeWidth={2.2} />
              </div>
              <div>
                <p className="text-sm font-bold text-ink">Weekly Insights</p>
                <p className="text-xs text-muted">Completion rates and habit momentum</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-muted" />
          </Link>

          {/* Setup / Routine Assistant */}
          <Link
            href="/setup"
            className="flex items-center justify-between p-3.5 hover:bg-slate-50/70 active:bg-slate-100 transition"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEECFE] text-[#5B4DFB]">
                <Sparkles size={18} strokeWidth={2.2} />
              </div>
              <div>
                <p className="text-sm font-bold text-ink">System Setup Wizard</p>
                <p className="text-xs text-muted">
                  {settings.setupCompleted ? "Setup completed" : "Step-by-step routine setup"}
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="text-muted" />
          </Link>
        </div>
      </section>

      {/* Group: UNIVERSITY */}
      <section className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-muted px-1">University</p>
        <div className="divide-y divide-lineLight rounded-2xl border border-line bg-white overflow-hidden shadow-xs">
          <Link
            href="/routine"
            className="flex items-center justify-between p-3.5 hover:bg-stone-50 active:bg-stone-100 transition"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-classBg text-classTint">
                <BookOpen size={17} />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">University Routine</p>
                <p className="text-xs text-muted">Weekly timetable, course rooms, and teachers</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-muted" />
          </Link>

          <Link
            href="/routine?changeBatch=true"
            className="flex items-center justify-between p-3.5 hover:bg-stone-50 active:bg-stone-100 transition"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEECFE] text-[#5B4DFB]">
                <GraduationCap size={17} />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">
                  Academic Batch: {settings.selectedBatch || "Not selected"}
                </p>
                <p className="text-xs text-muted">Change your CSE batch section</p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#5B4DFB]">Change</span>
          </Link>

          <Link
            href="/calendar"
            className="flex items-center justify-between p-3.5 hover:bg-stone-50 active:bg-stone-100 transition"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-700">
                <Calendar size={17} />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">Academic Holidays</p>
                <p className="text-xs text-muted">Dates that automatically cancel classes</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-muted" />
          </Link>
        </div>
      </section>

      {/* Group: PERSONAL ROUTINE HABITS */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Routine Habits ({activities.length})</p>
          <Link
            href={showAddActivity ? "/settings" : "/settings?section=add-activity"}
            className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
          >
            <Plus size={13} />
            <span>{showAddActivity ? "Close" : "Add Habit"}</span>
          </Link>
        </div>

        {showAddActivity ? (
          <div className="rounded-2xl border border-line bg-white p-4 shadow-xs mb-3 animate-in fade-in duration-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Add Habit</h3>
            <ActivityForm returnTo="/settings" compact />
          </div>
        ) : null}

        <div className="divide-y divide-lineLight rounded-2xl border border-line bg-white overflow-hidden shadow-xs">
          {activities.length === 0 ? (
            <p className="p-4 text-center text-xs text-muted">No personal habits added yet.</p>
          ) : (
            activities.map((act) => (
              <div key={act.id} className="flex items-center justify-between p-3 hover:bg-stone-50/50">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${act.enabled ? "text-ink" : "text-muted line-through"}`}>
                      {act.name}
                    </p>
                    <span className="text-[10px] text-muted bg-stone-100 rounded px-1.5 py-0.2">
                      {act.category}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    {formatTime(act.startTime)} · {act.durationMinutes} min
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <form action={toggleActivityAction}>
                    <input type="hidden" name="returnTo" value="/settings" />
                    <input type="hidden" name="id" value={act.id} />
                    <input type="hidden" name="enabled" value={act.enabled ? "false" : "true"} />
                    <button
                      type="submit"
                      className="rounded border border-line px-2 py-1 text-[11px] font-semibold text-muted hover:text-ink hover:border-accent active:scale-95 transition"
                    >
                      {act.enabled ? "Disable" : "Enable"}
                    </button>
                  </form>
                  <form action={deleteActivityAction}>
                    <input type="hidden" name="returnTo" value="/settings" />
                    <input type="hidden" name="id" value={act.id} />
                    <button
                      type="submit"
                      className="rounded px-2 py-1 text-[11px] font-medium text-stone-400 hover:text-red-700 active:scale-95 transition"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Group: NOTIFICATIONS */}
      <section className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-muted px-1">Notifications</p>
        <div className="rounded-2xl border border-line bg-white p-4 shadow-xs space-y-4">
          <form action={updateSettingsAction} className="space-y-3">
            <input type="hidden" name="returnTo" value="/settings" />
            <label className="flex items-center gap-2 text-sm font-semibold text-ink cursor-pointer">
              <input
                name="browserNotificationsEnabled"
                type="checkbox"
                defaultChecked={settings.browserNotificationsEnabled}
                className="h-4 w-4 rounded border-line text-accent accent-accent"
              />
              Enable Browser Reminders
            </label>

            <Field label="Remind me before (minutes)">
              <TextInput
                name="reminderBeforeMinutes"
                type="number"
                min="0"
                max="120"
                defaultValue={settings.reminderBeforeMinutes}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Quiet hours start">
                <TextInput
                  name="quietHoursStart"
                  type="time"
                  defaultValue={settings.quietHoursStart ?? ""}
                />
              </Field>
              <Field label="Quiet hours end">
                <TextInput
                  name="quietHoursEnd"
                  type="time"
                  defaultValue={settings.quietHoursEnd ?? ""}
                />
              </Field>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button type="submit" tone="primary" className="text-xs font-semibold">
                Save Preferences
              </Button>
              <NotificationPermissionButton />
            </div>
          </form>
        </div>
      </section>

      {/* Group: APP & ABOUT */}
      <section className="space-y-2 pb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-muted px-1">App</p>
        <div className="rounded-2xl border border-line bg-white p-4 text-xs text-muted space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-ink">My Day</span>
            <span>v0.1.0 (PWA Ready)</span>
          </div>
          <p>
            Personal Routine & Task Flow powered by Next.js, Supabase Row-Level Security, and local schedule engine.
          </p>
        </div>
      </section>
    </div>
  );
}
