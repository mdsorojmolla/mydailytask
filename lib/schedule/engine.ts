import type {
  DailySchedule,
  Priority,
  ScheduleSource,
  ScheduledItem,
  Task
} from "@/lib/domain";
import {
  addMinutesToTime,
  isSameHolidayDate,
  parseISODate,
  repeatMatchesDate,
  timeToMinutes,
  toISODate,
  weekStartISO
} from "@/lib/utils/dates";

export type BuildDailyScheduleOptions = {
  date: string;
  now?: Date;
  source: ScheduleSource;
};

const ACTIVE_TASK_STATUSES = new Set(["NOT_STARTED", "IN_PROGRESS"]);

export function buildDailySchedule({
  date,
  now = new Date(),
  source
}: BuildDailyScheduleOptions): DailySchedule {
  const target = parseISODate(date);
  const dayOfWeek = target.getDay();
  const activeHolidays = source.holidays.filter((holiday) =>
    isSameHolidayDate(holiday, date)
  );
  const classHolidayActive = activeHolidays.some(
    (holiday) => holiday.affectsClasses
  );
  const cancelledClassIds = new Set(
    source.classExceptions
      .filter((exception) => exception.date === date)
      .map((exception) => exception.classId)
  );

  const classItems: ScheduledItem[] = source.classes
    .filter((item) => item.enabled)
    .filter((item) => item.dayOfWeek === dayOfWeek)
    .filter((item) => !classHolidayActive)
    .filter((item) => !cancelledClassIds.has(item.id))
    .map((item) => ({
      id: `class:${item.id}:${date}`,
      sourceId: item.id,
      type: "CLASS",
      title: item.courseName,
      subtitle: [item.room, item.teacher].filter(Boolean).join(" · "),
      date,
      startTime: trimTime(item.startTime),
      endTime: trimTime(item.endTime),
      status: "SCHEDULED",
      reminderEnabled: item.reminderEnabled,
      trackable: false,
      completed: false,
      cancelled: false
    }));

  const cancelledClassItems: ScheduledItem[] = source.classes
    .filter((item) => item.enabled)
    .filter((item) => item.dayOfWeek === dayOfWeek)
    .filter((item) => cancelledClassIds.has(item.id))
    .map((item) => ({
      id: `class-cancelled:${item.id}:${date}`,
      sourceId: item.id,
      type: "CLASS",
      title: item.courseName,
      subtitle: [item.room, "Cancelled"].filter(Boolean).join(" · "),
      date,
      startTime: trimTime(item.startTime),
      endTime: trimTime(item.endTime),
      status: "CANCELLED",
      reminderEnabled: false,
      trackable: false,
      completed: false,
      cancelled: true,
      reason: "Class cancelled for this date"
    }));

  const activityHistoryById = new Map(
    source.activityHistory
      .filter((history) => history.date === date)
      .map((history) => [history.activityId, history])
  );

  const activityItems: ScheduledItem[] = source.activities
    .filter((activity) => activity.enabled)
    .filter((activity) => repeatMatchesDate(activity.repeatRule, date))
    .map((activity) => {
      const history = activityHistoryById.get(activity.id);
      const completed = history?.status === "COMPLETED";
      return {
        id: `activity:${activity.id}:${date}`,
        sourceId: activity.id,
        type: "ACTIVITY",
        title: activity.name,
        subtitle: activity.category,
        date,
        startTime: trimTime(activity.startTime),
        endTime: addMinutesToTime(activity.startTime, activity.durationMinutes),
        status: completed ? "COMPLETED" : "NOT_STARTED",
        reminderEnabled: activity.reminderEnabled && !completed,
        trackable: activity.trackingEnabled,
        completed,
        cancelled: false
      };
    });

  const dailyTasks = source.tasks.filter((task) => taskBelongsToDate(task, date));
  const taskItems: ScheduledItem[] = dailyTasks.map((task) => ({
    id: `task:${task.id}:${date}`,
    sourceId: task.id,
    type: "TASK",
    title: task.title,
    subtitle: task.category ?? task.description ?? undefined,
    date,
    startTime: trimTime(task.startTime),
    endTime: trimTime(task.endTime),
    status: task.status,
    priority: task.priority,
    reminderEnabled:
      task.reminderEnabled && ACTIVE_TASK_STATUSES.has(task.status),
    trackable: true,
    completed: task.status === "COMPLETED",
    cancelled: task.status === "CANCELLED" || task.status === "SKIPPED"
  }));

  const holidayItems: ScheduledItem[] = activeHolidays.map((holiday) => ({
    id: `holiday:${holiday.id}:${date}`,
    sourceId: holiday.id,
    type: "HOLIDAY",
    title: holiday.name,
    subtitle: holiday.description ?? undefined,
    date,
    startTime: null,
    endTime: null,
    status: "HOLIDAY",
    reminderEnabled: false,
    trackable: false,
    completed: false,
    cancelled: false
  }));

  const items = [
    ...holidayItems,
    ...activityItems,
    ...classItems,
    ...cancelledClassItems,
    ...taskItems
  ].sort(compareScheduleItems);

  const nowItem = pickNowItem(items, date, now);
  const nextItem = pickNextItem(items, date, now, nowItem?.id ?? null);
  const trackableItems = items.filter(
    (item) => item.trackable && !item.cancelled
  );
  const completedCount = trackableItems.filter((item) => item.completed).length;

  return {
    date,
    items,
    now: nowItem,
    next: nextItem,
    progress: {
      completed: completedCount,
      total: trackableItems.length,
      percentage:
        trackableItems.length === 0
          ? 0
          : Math.round((completedCount / trackableItems.length) * 100)
    },
    holidayNames: activeHolidays.map((holiday) => holiday.name),
    planning: buildPlanning(items, source.tasks, date)
  };
}

export function taskBelongsToDate(task: Task, date: string): boolean {
  if (task.scope === "DAILY") return task.date === date;
  return task.date === date;
}

function buildPlanning(items: ScheduledItem[], tasks: Task[], date: string) {
  const taskItems = items.filter((item) => item.type === "TASK");
  const byPriority = (priority: Priority) =>
    taskItems.filter((item) => item.priority === priority && !item.cancelled);
  const weekStart = weekStartISO(parseISODate(date));
  const unscheduledWeekly = tasks.filter(
    (task) =>
      task.scope === "WEEKLY" &&
      task.weekStart === weekStart &&
      task.date === null &&
      !["COMPLETED", "CANCELLED", "SKIPPED"].includes(task.status)
  );

  return {
    high: byPriority("HIGH"),
    medium: byPriority("MEDIUM"),
    low: byPriority("LOW"),
    unscheduledWeekly
  };
}

function pickNowItem(
  items: ScheduledItem[],
  date: string,
  now: Date
): ScheduledItem | null {
  if (toISODate(now) !== date) return null;
  const minutes = now.getHours() * 60 + now.getMinutes();
  return (
    items.find((item) => {
      if (!isActiveForNow(item)) return false;
      const start = timeToMinutes(item.startTime);
      const end = timeToMinutes(item.endTime);
      if (start === null) return false;
      return minutes >= start && minutes < (end ?? start + 30);
    }) ?? null
  );
}

function pickNextItem(
  items: ScheduledItem[],
  date: string,
  now: Date,
  excludeId: string | null
): ScheduledItem | null {
  if (toISODate(now) !== date) {
    return items.find((item) => isActiveForNow(item)) ?? null;
  }
  const minutes = now.getHours() * 60 + now.getMinutes();
  return (
    items.find((item) => {
      if (item.id === excludeId || !isActiveForNow(item)) return false;
      const start = timeToMinutes(item.startTime);
      return start !== null && start >= minutes;
    }) ?? null
  );
}

function isActiveForNow(item: ScheduledItem): boolean {
  if (item.type === "HOLIDAY") return false;
  if (item.cancelled || item.completed) return false;
  return true;
}

function compareScheduleItems(a: ScheduledItem, b: ScheduledItem): number {
  const aTime = timeToMinutes(a.startTime);
  const bTime = timeToMinutes(b.startTime);
  if (aTime === null && bTime === null) return a.title.localeCompare(b.title);
  if (aTime === null) return -1;
  if (bTime === null) return 1;
  return aTime - bTime || a.title.localeCompare(b.title);
}

function trimTime(value: string | null): string | null {
  if (!value) return null;
  return value.slice(0, 5);
}
