import Link from "next/link";
import { PageMessage } from "@/components/domain/message";
import { HolidayForm } from "@/components/domain/holiday-form";
import { Timeline } from "@/components/domain/timeline";
import { getScheduleForDate } from "@/lib/data";
import { formatDateLong, parseISODate, todayISO, toISODate } from "@/lib/utils/dates";

export default async function CalendarPage({
  searchParams
}: {
  searchParams: { date?: string; error?: string; success?: string };
}) {
  const selectedDate = searchParams.date ?? todayISO();
  const schedule = await getScheduleForDate(selectedDate);

  return (
    <>
      <PageMessage error={searchParams.error} success={searchParams.success} />
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">Calendar</h1>
        <p className="mt-2 text-sm text-muted">
          {formatDateLong(selectedDate)}
        </p>
      </header>
      <section className="grid gap-8 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-7">
          <MonthGrid selectedDate={selectedDate} />
          <section className="border-t border-line pt-5">
            <h2 className="mb-4 text-lg font-semibold">Add Holiday</h2>
            <HolidayForm returnTo={`/calendar?date=${selectedDate}`} />
          </section>
        </aside>
        <section>
          <h2 className="mb-4 text-lg font-semibold">Timeline</h2>
          <Timeline
            schedule={schedule}
            returnTo={`/calendar?date=${selectedDate}`}
          />
        </section>
      </section>
    </>
  );
}

function MonthGrid({ selectedDate }: { selectedDate: string }) {
  const selected = parseISODate(selectedDate);
  const start = new Date(selected.getFullYear(), selected.getMonth(), 1);
  const end = new Date(selected.getFullYear(), selected.getMonth() + 1, 0);
  const days = Array.from({ length: end.getDate() }, (_, index) => {
    const date = new Date(selected.getFullYear(), selected.getMonth(), index + 1);
    return toISODate(date);
  });

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {new Intl.DateTimeFormat("en", {
            month: "long",
            year: "numeric"
          }).format(selected)}
        </h2>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
          <span key={`${day}-${index}`} className="py-1">
            {day}
          </span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: start.getDay() }).map((_, index) => (
          <span key={`blank-${index}`} />
        ))}
        {days.map((day) => {
          const active = day === selectedDate;
          return (
            <Link
              key={day}
              href={`/calendar?date=${day}`}
              className={`focus-ring flex aspect-square items-center justify-center rounded-md border text-sm font-medium ${
                active
                  ? "border-accent bg-accentSoft text-accent"
                  : "border-line bg-white text-ink hover:border-accent/50"
              }`}
            >
              {parseISODate(day).getDate()}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
