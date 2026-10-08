"use server";

import { getMonthOverview, getScheduleForDate } from "@/lib/data";
import { rethrowIfRedirect } from "@/app/actions/helpers";

export async function getCalendarScheduleAction(date: string) {
  try {
    const schedule = await getScheduleForDate(date);
    return { success: true, schedule };
  } catch (error) {
    rethrowIfRedirect(error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load schedule"
    };
  }
}

export async function getMonthOverviewAction(year: number, month: number) {
  try {
    const overview = await getMonthOverview(year, month);
    return { success: true, overview };
  } catch (error) {
    rethrowIfRedirect(error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load month overview"
    };
  }
}
