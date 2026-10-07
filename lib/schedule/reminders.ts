import type { DailySchedule, ScheduledItem } from "@/lib/domain";
import { timeToMinutes } from "@/lib/utils/dates";

export type ReminderCandidate = {
  key: string;
  title: string;
  body: string;
  fireAtMinutes: number;
  item: ScheduledItem;
};

export function getReminderCandidates(
  schedule: DailySchedule,
  beforeMinutes: number
): ReminderCandidate[] {
  const candidates: ReminderCandidate[] = [];

  for (const item of schedule.items) {
    if (!item.reminderEnabled || item.cancelled || item.completed) continue;
    const start = timeToMinutes(item.startTime);
    if (start === null) continue;
    const noun = item.type === "CLASS" ? "starts" : "is scheduled";

    if (beforeMinutes > 0) {
      candidates.push({
        key: `${item.id}:before:${beforeMinutes}`,
        title: item.title,
        body: `${item.title} ${noun} in ${beforeMinutes} minutes.`,
        fireAtMinutes: start - beforeMinutes,
        item
      });
    }

    candidates.push({
      key: `${item.id}:now`,
      title: item.title,
      body: `${item.title} ${noun} now.`,
      fireAtMinutes: start,
      item
    });
  }

  return candidates.filter((candidate) => candidate.fireAtMinutes >= 0);
}
