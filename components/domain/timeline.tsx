import { BookOpen, Calendar, Check, Clock, GraduationCap, MapPin, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import type { DailySchedule, ScheduledItem } from "@/lib/domain";
import { formatTime, timeToMinutes } from "@/lib/utils/dates";
import { ScheduledItemActions, TaskCheckbox } from "@/components/domain/item-actions";
import { CategoryIconBadge, PriorityPill, StatusPill } from "@/components/ui/status";

function getTimeRemaining(startTime: string | null, endTime: string | null, isNow: boolean): string | null {
  if (!startTime) return null;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (isNow && endTime) {
    const endMinutes = timeToMinutes(endTime);
    if (endMinutes !== null) {
      const diff = endMinutes - currentMinutes;
      if (diff > 0) return `Ends in ${diff}m`;
      if (diff === 0) return "Ending now";
    }
  } else if (!isNow && startTime) {
    const startMinutes = timeToMinutes(startTime);
    if (startMinutes !== null) {
      const diff = startMinutes - currentMinutes;
      if (diff > 60) {
        const h = Math.floor(diff / 60);
        const m = diff % 60;
        return `in ${h}h${m > 0 ? ` ${m}m` : ""}`;
      }
      if (diff > 0) return `in ${diff}m`;
    }
  }
  return null;
}

export function NowPanel({
  schedule,
  returnTo
}: {
  schedule: DailySchedule;
  returnTo: string;
}) {
  const isNow = Boolean(schedule.now);
  const item = schedule.now ?? schedule.next;
  const timeRemaining = item ? getTimeRemaining(item.startTime, item.endTime, isNow) : null;

  if (!item) {
    return (
      <section className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Status</p>
            </div>
            <h2 className="mt-1 text-base sm:text-lg font-bold text-ink">You&apos;re all clear.</h2>
            <p className="text-xs text-muted">No pending classes or tasks right now.</p>
          </div>
          <Link
            href="/tasks"
            className="focus-ring inline-flex items-center gap-1.5 rounded-xl bg-[#EEECFE] px-3.5 py-2 text-xs font-bold text-[#5B4DFB] hover:bg-[#E3E0FE] active:scale-95 transition-all"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>Add task</span>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#EEECFE] bg-white p-4 sm:p-5 shadow-card">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          {isNow ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5B4DFB] px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              NOW
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-[#EEECFE] px-2.5 py-0.5 text-[10px] font-extrabold text-[#5B4DFB]">
              NEXT UP
            </span>
          )}
          {timeRemaining ? (
            <span className="text-xs font-bold text-[#5B4DFB]">
              {timeRemaining}
            </span>
          ) : null}
        </div>
        <CategoryIconBadge type={item.type} />
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-muted">
            {item.subtitle || (item.type === "CLASS" ? "University Class" : "Focus Item")}
          </p>
          {item.priority ? <PriorityPill priority={item.priority} /> : null}
        </div>
        <h2 className="mt-1 text-base sm:text-lg font-bold tracking-tight text-ink leading-snug">
          {item.title}
        </h2>
      </div>

      <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#5B4DFB]">
          <Clock size={14} className="shrink-0" strokeWidth={2.2} />
          <span>
            {item.startTime ? formatTime(item.startTime) : "Flexible"}
            {item.endTime ? ` – ${formatTime(item.endTime)}` : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {item.type === "TASK" ? (
            <TaskCheckbox item={item} returnTo={returnTo} />
          ) : null}
          <StatusPill status={item.status} />
          <ScheduledItemActions item={item} date={schedule.date} returnTo={returnTo} />
        </div>
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
      <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-card">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEECFE] text-[#5B4DFB] mb-3">
          <Check size={24} strokeWidth={2.5} />
        </div>
        <p className="text-base font-bold text-ink">No tasks today</p>
        <p className="mt-1 text-xs text-muted">You&apos;re completely caught up for this day.</p>
        <Link
          href="/tasks"
          className="focus-ring mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#5B4DFB] px-4 py-2 text-xs font-bold text-white shadow-glow hover:bg-[#483AE3] active:scale-95 transition-all"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>Add task</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {schedule.items.map((item) => (
        <TimelineRow
          key={item.id}
          item={item}
          date={schedule.date}
          returnTo={returnTo}
        />
      ))}
    </div>
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
  const isCompleted = item.completed || item.status === "COMPLETED";

  // Category label matching screenshot: e.g. "Grocery shopping app design"
  const categoryLabel = item.subtitle 
    ? item.subtitle 
    : item.type === "CLASS"
      ? "University routine"
      : item.type === "ACTIVITY"
        ? "Personal routine"
        : item.type === "HOLIDAY"
          ? "Academic Calendar"
          : "Daily task";

  return (
    <div
      className={`group relative rounded-2xl border border-slate-100/90 bg-white p-4 shadow-card transition-all duration-200 hover:shadow-soft active:scale-[0.99] ${
        item.cancelled ? "opacity-60 bg-slate-50/80" : ""
      }`}
    >
      {/* Top Row: Category label on left, Category icon badge on right */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-xs font-semibold text-slate-400 truncate max-w-[220px]">
          {categoryLabel}
        </span>
        <CategoryIconBadge type={item.type} />
      </div>

      {/* Middle Row: Title + Task Checkbox (if task) */}
      <div className="flex items-start gap-2.5 my-1">
        {item.type === "TASK" ? (
          <div className="pt-0.5 shrink-0">
            <TaskCheckbox item={item} returnTo={returnTo} />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <h3
            className={`text-[15px] sm:text-base font-bold leading-snug text-ink ${
              isCompleted ? "line-through text-muted" : ""
            }`}
          >
            {item.title}
          </h3>
        </div>
      </div>

      {/* Bottom Row: Clock icon with time on left, status badge on right */}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-50 pt-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5B4DFB]">
          <Clock size={13} strokeWidth={2.2} />
          <span>
            {item.startTime ? formatTime(item.startTime) : "Flexible"}
            {item.endTime ? ` – ${formatTime(item.endTime)}` : ""}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {item.priority ? <PriorityPill priority={item.priority} /> : null}
          <StatusPill status={item.status} />
          <ScheduledItemActions item={item} date={date} returnTo={returnTo} />
        </div>
      </div>
    </div>
  );
}
