import Link from "next/link";
import { ArrowLeft, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { PageMessage } from "@/components/domain/message";
import { HolidayForm } from "@/components/domain/holiday-form";
import { Timeline } from "@/components/domain/timeline";
import { getScheduleForDate } from "@/lib/data";
import { formatDateLong, parseISODate, todayISO, toISODate } from "@/lib/utils/dates";

export default async function CalendarPage({
  searchParams
}: {
  searchParams: Promise<{ date?: string; error?: string; success?: string; holiday?: string }>;
}) {
  const params = await searchParams;
  const today = todayISO();
  const selectedDate = params.date ?? today;
  const schedule = await getScheduleForDate(selectedDate);
  const showHolidayForm = params.holiday === "true";

  const classCount = schedule.items.filter((i) => i.type === "CLASS").length;
  const taskCount = schedule.items.filter((i) => i.type === "TASK").length;
  const activityCount = schedule.items.filter((i) => i.type === "ACTIVITY").length;

  return (
    <div className="space-y-6">
      <PageMessage error={params.error} success={params.success} />

      {/* Top Header matching reference screenshot */}
      <header className="flex items-center justify-between gap-3">
        <Link
          href="/home"
          aria-label="Back to Home"
          className="focus-ring flex h-10 w-10 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-card text-ink hover:text-[#5B4DFB] active:scale-95 transition-all"
        >
          <ArrowLeft size={18} strokeWidth={2.2} />
        </Link>

        <h1 className="text-xl font-extrabold tracking-tight text-ink">
          Calendar
        </h1>

        <Link
          href={showHolidayForm ? `/calendar?date=${selectedDate}` : `/calendar?date=${selectedDate}&holiday=true`}
          aria-label="Add Holiday"
          className="focus-ring flex h-10 w-10 items-center justify-center rounded-2xl bg-[#5B4DFB] text-white shadow-glow active:scale-95 transition-all"
        >
          <Plus size={20} strokeWidth={2.5} />
        </Link>
      </header>

      {/* Collapsible Add Holiday Drawer */}
      {showHolidayForm ? (
        <section className="rounded-2xl border border-[#EEECFE] bg-white p-5 shadow-card animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h2 className="text-sm font-bold tracking-tight text-ink">Add Academic Holiday</h2>
            <Link href={`/calendar?date=${selectedDate}`} className="text-xs text-muted hover:text-ink font-semibold">
              Cancel
            </Link>
          </div>
          <HolidayForm returnTo={`/calendar?date=${selectedDate}`} compact />
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[340px_1fr] items-start">
        {/* Monthly Calendar Grid: Sticky on desktop, collapsible on mobile */}
        <aside className="self-start lg:sticky lg:top-8 rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-card transition-all">
          <details className="group" open>
            <summary className="flex lg:hidden cursor-pointer items-center justify-between font-bold text-xs text-[#5B4DFB] pb-2 select-none">
              <span>Month Calendar</span>
              <span className="text-[11px] text-muted group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <MonthGrid selectedDate={selectedDate} today={today} />
          </details>
        </aside>

        {/* Selected Date Schedule: Full natural vertical scrolling */}
        <section className="min-w-0 space-y-3 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-ink text-base">
                  {formatDateLong(selectedDate)}
                </span>
                {selectedDate === today ? (
                  <span className="rounded-full bg-[#EEECFE] px-2.5 py-0.5 text-[10px] font-bold text-[#5B4DFB]">
                    TODAY
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-muted mt-0.5">
                {[
                  classCount > 0 ? `${classCount} ${classCount === 1 ? "class" : "classes"}` : null,
                  taskCount > 0 ? `${taskCount} ${taskCount === 1 ? "task" : "tasks"}` : null,
                  activityCount > 0 ? `${activityCount} ${activityCount === 1 ? "habit" : "habits"}` : null
                ]
                  .filter(Boolean)
                  .join(" · ") || "No items scheduled"}
              </p>
            </div>

            {schedule.holidayNames.length > 0 ? (
              <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600 self-start sm:self-auto">
                {schedule.holidayNames.join(", ")}
              </span>
            ) : null}
          </div>

          <Timeline schedule={schedule} returnTo={`/calendar?date=${selectedDate}`} />
        </section>
      </div>
    </div>
  );
}

function MonthGrid({ selectedDate, today }: { selectedDate: string; today: string }) {
  const selected = parseISODate(selectedDate);
  const year = selected.getFullYear();
  const month = selected.getMonth();

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const days = Array.from({ length: end.getDate() }, (_, index) => {
    const date = new Date(year, month, index + 1);
    return toISODate(date);
  });

  // Calculate previous and next month dates
  const prevMonthDate = toISODate(new Date(year, month - 1, 1));
  const nextMonthDate = toISODate(new Date(year, month + 1, 1));

  return (
    <div>
      {/* Month header & navigation */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-extrabold text-ink">
          {new Intl.DateTimeFormat("en", {
            month: "long",
            year: "numeric"
          }).format(selected)}
        </h2>

        <div className="flex items-center gap-1.5">
          <Link
            href={`/calendar?date=${today}`}
            className="rounded-xl bg-[#EEECFE] px-2.5 py-1 text-xs font-bold text-[#5B4DFB] hover:bg-[#E3E0FE] active:scale-95 transition"
          >
            Today
          </Link>
          <Link
            href={`/calendar?date=${prevMonthDate}`}
            aria-label="Previous month"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-100 text-muted hover:text-ink hover:border-slate-300 active:scale-95 transition"
          >
            <ChevronLeft size={16} strokeWidth={2.2} />
          </Link>
          <Link
            href={`/calendar?date=${nextMonthDate}`}
            aria-label="Next month"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-100 text-muted hover:text-ink hover:border-slate-300 active:scale-95 transition"
          >
            <ChevronRight size={16} strokeWidth={2.2} />
          </Link>
        </div>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-muted mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <span key={day} className="py-1">
            {day}
          </span>
        ))}
      </div>

      {/* Month Days Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: start.getDay() }).map((_, index) => (
          <span key={`blank-${index}`} className="aspect-square" />
        ))}
        {days.map((day) => {
          const isSelected = day === selectedDate;
          const isCurrentToday = day === today;
          const dayNum = parseISODate(day).getDate();

          return (
            <Link
              key={day}
              href={`/calendar?date=${day}`}
              className={`focus-ring relative flex aspect-square items-center justify-center rounded-2xl text-xs font-bold transition-all active:scale-90 touch-manipulation select-none ${
                isSelected
                  ? "bg-[#5B4DFB] text-white shadow-glow scale-105"
                  : isCurrentToday
                    ? "border-2 border-[#5B4DFB] bg-[#EEECFE] text-[#5B4DFB]"
                    : "border border-slate-50 bg-[#FAF9FE] text-ink hover:bg-[#F0EFFE] hover:text-[#5B4DFB]"
              }`}
            >
              <span>{dayNum}</span>
              {isCurrentToday && !isSelected ? (
                <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-[#5B4DFB]" />
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
