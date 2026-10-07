import Link from "next/link";
import { Bell, CalendarDays, CheckCircle2, ChevronRight, Clock, Plus } from "lucide-react";
import { addDaysISO, formatDateLong, todayISO } from "@/lib/utils/dates";
import { getHomeData } from "@/lib/data";
import { NotificationRuntime } from "@/components/domain/notification-runtime";
import { PageMessage } from "@/components/domain/message";
import { DateStrip } from "@/components/domain/date-strip";
import { NowPanel, Timeline } from "@/components/domain/timeline";
import { rescheduleTaskAction } from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import { PriorityPill } from "@/components/ui/status";
import type { ScheduledItem } from "@/lib/domain";

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; success?: string; date?: string }>;
}) {
  const params = await searchParams;
  const date = params.date || todayISO();
  const { user, settings, schedule } = await getHomeData(date);
  
  const firstName =
    user.user_metadata?.full_name?.split(" ")[0] ??
    user.user_metadata?.name?.split(" ")[0] ??
    user.email?.split("@")[0] ??
    "there";
  const greeting = `${getGreeting()}, ${firstName}`;
  const initials = (firstName.slice(0, 2)).toUpperCase();

  return (
    <div className="space-y-5">
      <NotificationRuntime schedule={schedule} settings={settings} />
      <PageMessage error={params.error} success={params.success} />

      {/* Top Header matching reference */}
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-ink">
            {greeting}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-muted">
            {formatDateLong(date)}
          </p>
        </div>

        {/* Quick controls with Bell icon & purple dot */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/settings"
            aria-label="Notifications"
            className="focus-ring relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-card text-ink hover:text-[#5B4DFB] active:scale-95 transition-all"
          >
            <Bell size={18} strokeWidth={2.2} />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-[#5B4DFB] ring-2 ring-white" />
          </Link>
          <Link
            href="/settings"
            aria-label="Account Settings"
            className="focus-ring flex h-10 w-10 items-center justify-center rounded-2xl bg-[#5B4DFB] text-xs font-bold text-white shadow-glow active:scale-95 transition-all"
          >
            {initials}
          </Link>
        </div>
      </header>

      {/* Horizontal Date Strip / Week Carousel */}
      <section aria-label="Date selector">
        <DateStrip selectedDate={date} basePath="/home" />
      </section>

      {/* Compact Contextual Setup Indicator */}
      {!settings.setupCompleted ? (
        <div className="flex items-center justify-between rounded-2xl border border-[#EEECFE] bg-white px-4 py-2.5 text-xs text-ink shadow-card">
          <div className="flex items-center gap-2 truncate">
            <span className="h-2 w-2 rounded-full bg-[#5B4DFB] shrink-0 animate-pulse" />
            <span className="truncate text-muted">Setup in progress · Customize your routine & habits</span>
          </div>
          <Link href="/setup" className="font-bold text-[#5B4DFB] ml-2 shrink-0 hover:underline">
            Continue
          </Link>
        </div>
      ) : null}

      {/* NOW / NEXT UP Section */}
      <NowPanel schedule={schedule} returnTo={`/home?date=${date}`} />

      {/* Today's Schedule & Timeline */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold tracking-tight text-ink">
              Schedule & Tasks
            </h2>
            {schedule.holidayNames.length > 0 ? (
              <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-600">
                {schedule.holidayNames.join(", ")}
              </span>
            ) : null}
          </div>

          {/* Compact Progress */}
          {schedule.progress.total > 0 ? (
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="font-bold text-[#5B4DFB]">
                {schedule.progress.completed}/{schedule.progress.total}
              </span>
              <div className="h-2 w-16 sm:w-20 rounded-full bg-[#EEECFE] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#5B4DFB] transition-all duration-300"
                  style={{ width: `${schedule.progress.percentage}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>

        <Timeline schedule={schedule} returnTo={`/home?date=${date}`} />
      </section>

      {/* Daily Priorities & End of Day Review */}
      <section className="grid gap-3 sm:grid-cols-2 pt-1">
        <DailyPlan schedule={schedule} />
        <EndOfDayReview items={schedule.items} date={date} />
      </section>
    </div>
  );
}

function DailyPlan({
  schedule
}: {
  schedule: Awaited<ReturnType<typeof getHomeData>>["schedule"];
}) {
  const high = schedule.planning.high;
  const medium = schedule.planning.medium;
  const low = schedule.planning.low;
  const total = high.length + medium.length + low.length;

  return (
    <div className="rounded-xl border border-line bg-white/70 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
          Priority Tasks
        </h3>
        <span className="text-xs font-semibold text-muted">
          {total} total
        </span>
      </div>

      {total === 0 ? (
        <p className="text-xs text-muted py-2">No priority tasks scheduled for today.</p>
      ) : (
        <div className="space-y-2">
          {high.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-xs">
              <span className={`truncate font-medium ${item.completed ? "line-through text-muted" : "text-ink"}`}>
                {item.title}
              </span>
              <PriorityPill priority="HIGH" />
            </div>
          ))}
          {medium.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-xs">
              <span className={`truncate font-medium ${item.completed ? "line-through text-muted" : "text-ink"}`}>
                {item.title}
              </span>
              <PriorityPill priority="MEDIUM" />
            </div>
          ))}
          {low.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-xs">
              <span className={`truncate font-medium ${item.completed ? "line-through text-muted" : "text-ink"}`}>
                {item.title}
              </span>
              <PriorityPill priority="LOW" />
            </div>
          ))}
        </div>
      )}

      {schedule.planning.unscheduledWeekly.length > 0 ? (
        <div className="border-t border-lineLight pt-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5">
            This Week ({schedule.planning.unscheduledWeekly.length})
          </p>
          <ul className="space-y-1 text-xs text-muted">
            {schedule.planning.unscheduledWeekly.slice(0, 3).map((task) => (
              <li key={task.id} className="truncate">
                • {task.title}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function EndOfDayReview({
  items,
  date
}: {
  items: ScheduledItem[];
  date: string;
}) {
  const remaining = items.filter(
    (item) =>
      item.type === "TASK" &&
      !item.completed &&
      !item.cancelled &&
      item.status !== "COMPLETED"
  );
  const tomorrow = addDaysISO(date, 1);

  return (
    <div className="rounded-xl border border-line bg-white/70 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
          Unfinished Tasks
        </h3>
        <span className="text-xs font-semibold text-muted">
          {remaining.length} remaining
        </span>
      </div>

      {remaining.length === 0 ? (
        <div className="flex items-center gap-2 text-xs text-muted py-2">
          <CheckCircle2 size={15} className="text-emerald-600" />
          <span>All tasks completed or cleared!</span>
        </div>
      ) : (
        <div className="space-y-2">
          {remaining.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-lineLight bg-white p-2 text-xs"
            >
              <span className="truncate font-medium text-ink">{item.title}</span>
              <form action={rescheduleTaskAction} className="shrink-0">
                <input type="hidden" name="returnTo" value="/home" />
                <input type="hidden" name="id" value={item.sourceId} />
                <input type="hidden" name="date" value={tomorrow} />
                <input type="hidden" name="startTime" value={item.startTime ?? ""} />
                <input type="hidden" name="endTime" value={item.endTime ?? ""} />
                <button
                  type="submit"
                  className="focus-ring rounded border border-line bg-stone-50 px-2 py-1 text-[11px] font-medium text-muted hover:text-ink hover:border-accent active:scale-95 transition"
                >
                  Move to tomorrow
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
