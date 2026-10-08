import { CalendarView } from "@/components/domain/calendar-view";
import { getMonthOverview, getScheduleForDate } from "@/lib/data";
import { parseISODate, todayISO } from "@/lib/utils/dates";

export const metadata = {
  title: "Calendar & Schedule | My Day",
  description: "View and manage your academic calendar, university routine, and daily tasks."
};

export default async function CalendarPage({
  searchParams
}: {
  searchParams: Promise<{ date?: string; error?: string; success?: string; holiday?: string }>;
}) {
  const params = await searchParams;
  const today = todayISO();
  const selectedDate = params.date ?? today;
  const selectedDateObj = parseISODate(selectedDate);
  const year = selectedDateObj.getFullYear();
  const month = selectedDateObj.getMonth() + 1;

  // Run initial date schedule query and month overview in parallel for fast SSR
  const [schedule, monthOverview] = await Promise.all([
    getScheduleForDate(selectedDate),
    getMonthOverview(year, month)
  ]);

  return (
    <CalendarView
      initialDate={selectedDate}
      initialSchedule={schedule}
      initialMonthOverview={monthOverview}
      today={today}
      error={params.error}
      success={params.success}
      initialHolidayForm={params.holiday === "true"}
    />
  );
}
