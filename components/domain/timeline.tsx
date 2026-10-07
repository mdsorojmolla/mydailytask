import type { DailySchedule, ScheduledItem } from "@/lib/domain";
import { formatTime } from "@/lib/utils/dates";
import { ScheduledItemActions } from "@/components/domain/item-actions";
import { EmptyState } from "@/components/ui/empty-state";
import { PriorityPill, StatusPill, TypePill } from "@/components/ui/status";

export function NowPanel({
  schedule,
  returnTo
}: {
  schedule: DailySchedule;
  returnTo: string;
}) {
  const item = schedule.now ?? schedule.next;
  const heading = schedule.now ? "Now" : "Next";

  if (!item) {
    return (
      <section className="border-b border-line pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          Now
        </p>
        <h2 className="mt-3 text-3xl font-semibold">Your day is clear.</h2>
      </section>
    );
  }

  return (
    <section className="border-b border-line pb-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {heading}
      </p>
      <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-4xl font-semibold tracking-normal">{item.title}</h2>
          <p className="mt-2 text-base text-muted">
            {formatTime(item.startTime)} - {formatTime(item.endTime)}
            {item.subtitle ? ` · ${item.subtitle}` : ""}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <TypePill type={item.type} />
            <StatusPill status={item.status} />
            {item.priority ? <PriorityPill priority={item.priority} /> : null}
          </div>
        </div>
        <ScheduledItemActions
          item={item}
          date={schedule.date}
          returnTo={returnTo}
        />
      </div>
    </section>
  );
}

export function Timeline({
  schedule,
  returnTo
}: {
  schedule: DailySchedule;
  returnTo: string;
}) {
  if (schedule.items.length === 0) {
    return (
      <EmptyState
        title="No tasks today. Your day is clear."
        actionLabel="Add Task"
        href="/tasks"
      />
    );
  }

  return (
    <ol className="divide-y divide-line border-y border-line">
      {schedule.items.map((item) => (
        <TimelineRow
          key={item.id}
          item={item}
          date={schedule.date}
          returnTo={returnTo}
        />
      ))}
    </ol>
  );
}

function TimelineRow({
  item,
  date,
  returnTo
}: {
  item: ScheduledItem;
  date: string;
  returnTo: string;
}) {
  return (
    <li className="grid gap-3 py-4 sm:grid-cols-[120px_1fr_auto] sm:items-center">
      <div className="text-sm font-medium text-muted">
        {formatTime(item.startTime)}
      </div>
      <div className={item.cancelled ? "opacity-60" : ""}>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold">{item.title}</h3>
          <TypePill type={item.type} />
          <StatusPill status={item.status} />
          {item.priority ? <PriorityPill priority={item.priority} /> : null}
        </div>
        {item.subtitle ? (
          <p className="mt-1 text-sm text-muted">{item.subtitle}</p>
        ) : null}
      </div>
      <div className="sm:justify-self-end">
        <ScheduledItemActions item={item} date={date} returnTo={returnTo} />
      </div>
    </li>
  );
}
