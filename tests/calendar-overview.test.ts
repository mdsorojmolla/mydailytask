import { describe, expect, it } from "vitest";
import {
  addDaysISO,
  formatDateLong,
  isSameHolidayDate,
  parseISODate,
  repeatMatchesDate,
  toISODate,
  weekStartISO
} from "@/lib/utils/dates";

describe("Calendar Date & Utility functions", () => {
  it("formats dates and parses ISO dates correctly", () => {
    const iso = "2026-10-09";
    const date = parseISODate(iso);
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(9); // 0-indexed: October is 9
    expect(date.getDate()).toBe(9);
    expect(toISODate(date)).toBe("2026-10-09");
  });

  it("calculates week start accurately for any date", () => {
    // 2026-10-09 is a Friday (day 5)
    const date = parseISODate("2026-10-09");
    const weekStart = weekStartISO(date);
    // Sunday of that week is 2026-10-04
    expect(weekStart).toBe("2026-10-04");
  });

  it("adds and subtracts days safely", () => {
    expect(addDaysISO("2026-10-09", 1)).toBe("2026-10-10");
    expect(addDaysISO("2026-10-09", -1)).toBe("2026-10-08");
    expect(addDaysISO("2026-10-31", 1)).toBe("2026-11-01");
  });

  it("identifies matching holiday dates for one-time and yearly recurrence", () => {
    const oneTime = { date: "2026-10-15", repeatRule: "NONE" as const };
    expect(isSameHolidayDate(oneTime, "2026-10-15")).toBe(true);
    expect(isSameHolidayDate(oneTime, "2026-10-16")).toBe(false);
    expect(isSameHolidayDate(oneTime, "2027-10-15")).toBe(false);

    const yearly = { date: "2026-10-15", repeatRule: "YEARLY" as const };
    expect(isSameHolidayDate(yearly, "2026-10-15")).toBe(true);
    expect(isSameHolidayDate(yearly, "2027-10-15")).toBe(true);
    expect(isSameHolidayDate(yearly, "2028-10-15")).toBe(true);
  });

  it("matches repeat rules for daily and weekdays", () => {
    // 2026-10-09 is a Friday
    expect(repeatMatchesDate("DAILY", "2026-10-09")).toBe(true);
    expect(repeatMatchesDate("WEEKDAYS", "2026-10-09")).toBe(true);
    expect(repeatMatchesDate("WEEKENDS", "2026-10-09")).toBe(false);

    // 2026-10-10 is a Saturday
    expect(repeatMatchesDate("WEEKENDS", "2026-10-10")).toBe(true);
    expect(repeatMatchesDate("WEEKDAYS", "2026-10-10")).toBe(false);
  });
});
