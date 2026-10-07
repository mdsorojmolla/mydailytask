import Link from "next/link";
import { addDaysISO, formatDateLong, todayISO } from "@/lib/utils/dates";
import { getHomeData } from "@/lib/data";
import { NotificationRuntime } from "@/components/domain/notification-runtime";
import { PageMessage } from "@/components/domain/message";
import { NowPanel, Timeline } from "@/components/domain/timeline";
import { rescheduleTaskAction } from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import type { ScheduledItem } from "@/lib/domain";

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const params = await searchParams;
  const date = todayISO();
  const { user, settings, schedule } = await getHomeData(date);
  const greeting = getGreeting();

  return (
    <>
      <NotificationRuntime schedule={schedule} settings={settings} />
      <PageMessage error={params.error} success={params.success} />
      {!settings.setupCompleted ? (
        <div className="mb-6 rounded-md border border-accent/30 bg-white px-4 py-3 text-sm text-accent">
          Finish setup when you are ready.{" "}
          <Link href="/setup" className="font-semibold underline">
            Continue setup
          </Link>
        </div>
      ) : null}

      <div className="mb-8">
        <p className="text-sm font-medium text-muted">{formatDateLong(date)}</p>
        <h1 className="mt-1 text-2xl font-semibold">{greeting}</h1>
      </div>

      <NowPanel schedule={schedule} returnTo="/home" />

      <section className="mt-8">
        <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-xl font-semibold">Today</h2>
            <p className="mt-1 text-sm text-muted">
              {schedule.progress.completed} / {schedule.progress.total} completed
            </p>
          </div>
          {schedule.holidayNames.length > 0 ? (
            <p className="rounded-full border border-line bg-white px-3 py-1 text-sm text-muted">
              {schedule.holidayNames.join(", ")}
            </p>
          ) : null}
        </div>
        <div className="mb-5 h-2 rounded-full bg-white">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${schedule.progress.percentage}%` }}
          />
        </div>
        <Timeline schedule={schedule} returnTo="/home" />
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <DailyPlan schedule={schedule} />
        <EndOfDayReview items={schedule.items} date={date} />
      </section>
    </>
  );
}

function DailyPlan({ schedule }: { schedule: Awaited<ReturnType<typeof getHomeData>>["schedule"] }) {
  const high = schedule.planning.high;
  const medium = schedule.planning.medium;
  const low = schedule.planning.low;
  const total = high.length + medium.length + low.length;

  return (
    <section className="border-t border-line pt-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        Plan Your Day
      </p>
      <h2 className="mt-2 text-xl font-semibold">
        {total === 0 ? "No priority tasks scheduled." : `${total} priority tasks`}
      </h2>
      <PriorityList label="High Priority" items={high} />
      <PriorityList label="Medium" items={medium} />
      <PriorityList label="Low" items={low} />
      {schedule.planning.unscheduledWeekly.length > 0 ? (
        <div className="mt-4 rounded-md border border-line bg-white px-4 py-3">
          <p className="text-sm font-semibold">This week</p>
          <ul className="mt-2 space-y-2 text-sm text-muted">
            {schedule.planning.unscheduledWeekly.map((task) => (
              <li key={task.id}>{task.title}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function PriorityList({
  label,
  items
}: {
  label: string;
  items: ScheduledItem[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="mt-4">
      <p className="text-sm font-semibold">{label}</p>
      <ol className="mt-2 space-y-2 text-sm text-muted">
        {items.map((item, index) => (
          <li key={item.id}>
            {index + 1}. {item.title}
          </li>
        ))}
      </ol>
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
    <section className="border-t border-line pt-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        Day Complete
      </p>
      <h2 className="mt-2 text-xl font-semibold">
        {remaining.length === 0 ? "Nothing left to move." : `${remaining.length} remaining`}
      </h2>
      <div className="mt-4 space-y-3">
        {remaining.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between gap-3 rounded-md border border-line bg-white px-4 py-3 sm:flex-row sm:items-center"
          >
            <p className="text-sm font-medium">{item.title}</p>
            <form action={rescheduleTaskAction}>
              <input type="hidden" name="returnTo" value="/home" />
              <input type="hidden" name="id" value={item.sourceId} />
              <input type="hidden" name="date" value={tomorrow} />
              <input type="hidden" name="startTime" value={item.startTime ?? ""} />
              <input type="hidden" name="endTime" value={item.endTime ?? ""} />
              <Button type="submit" tone="secondary">
                Move to tomorrow
              </Button>
            </form>
          </div>
        ))}
      </div>
    </section>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
