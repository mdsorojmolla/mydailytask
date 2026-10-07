import type { Holiday, HolidayRepeatRule, RepeatRule } from "@/lib/domain";

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
] as const;

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function parseISODate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function weekStartISO(date: Date): string {
  const copy = new Date(date);
  const day = copy.getDay();
  copy.setDate(copy.getDate() - day);
  return toISODate(copy);
}

export function addDaysISO(value: string, days: number): string {
  const date = parseISODate(value);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function timeToMinutes(time: string | null): number | null {
  if (!time) return null;
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const normalized = Math.max(0, Math.min(minutes, 24 * 60 - 1));
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

export function addMinutesToTime(time: string, minutes: number): string {
  const start = timeToMinutes(time) ?? 0;
  return minutesToTime(start + minutes);
}

export function formatTime(time: string | null): string {
  if (!time) return "Any time";
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

export function formatDateLong(value: string): string {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(parseISODate(value));
}

export function isSameHolidayDate(
  holiday: Pick<Holiday, "date" | "repeatRule">,
  date: string
): boolean {
  if (holiday.repeatRule === "NONE") return holiday.date === date;
  const holidayDate = parseISODate(holiday.date);
  const targetDate = parseISODate(date);
  return (
    holidayDate.getMonth() === targetDate.getMonth() &&
    holidayDate.getDate() === targetDate.getDate()
  );
}

export function repeatMatchesDate(rule: RepeatRule, date: string): boolean {
  const day = parseISODate(date).getDay();
  if (rule === "DAILY") return true;
  if (rule === "WEEKDAYS") return day >= 1 && day <= 5;
  if (rule === "WEEKENDS") return day === 0 || day === 6;
  if (rule.startsWith("CUSTOM:")) {
    const days = rule
      .replace("CUSTOM:", "")
      .split(",")
      .map((item) => Number(item.trim()))
      .filter((item) => Number.isInteger(item));
    return days.includes(day);
  }
  return false;
}

export function holidayRepeatLabel(rule: HolidayRepeatRule): string {
  return rule === "YEARLY" ? "Every year" : "One time";
}
