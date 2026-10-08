"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Plus,
  Sparkles,
  Sun,
  X,
  Palmtree,
  CheckCircle2,
  CalendarDays
} from "lucide-react";
import type { DailySchedule, ScheduledItem } from "@/lib/domain";
import type { MonthOverview } from "@/lib/data";
import { getCalendarScheduleAction, getMonthOverviewAction } from "@/app/actions/calendar";
import { PageMessage } from "@/components/domain/message";
import { HolidayForm } from "@/components/domain/holiday-form";
import { Timeline } from "@/components/domain/timeline";
import { openQuickAdd } from "@/components/domain/quick-add";
import {
  addDaysISO,
  formatDateLong,
  parseISODate,
  todayISO,
  toISODate,
  weekStartISO
} from "@/lib/utils/dates";

interface CalendarViewProps {
  initialDate: string;
  initialSchedule: DailySchedule;
  initialMonthOverview: MonthOverview;
  today: string;
  error?: string;
  success?: string;
  initialHolidayForm?: boolean;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const WEEKDAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function CalendarView({
  initialDate,
  initialSchedule,
  initialMonthOverview,
  today,
  error,
  success,
  initialHolidayForm = false
}: CalendarViewProps) {
  // Selected date (ISO string YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);

  // Month currently displayed in grid (Date object at 1st of month)
  const initialDateObj = parseISODate(initialDate);
  const [currentMonth, setCurrentMonth] = useState<Date>(
    new Date(initialDateObj.getFullYear(), initialDateObj.getMonth(), 1)
  );

  // View mode: "month" full grid vs "week" compact horizontal strip
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  // In-memory cache of schedules: YYYY-MM-DD -> DailySchedule
  const [scheduleCache, setScheduleCache] = useState<Record<string, DailySchedule>>({
    [initialDate]: initialSchedule
  });

  // In-memory cache of month overviews: YYYY-MM -> MonthOverview
  const initialMonthKey = `${initialDateObj.getFullYear()}-${String(
    initialDateObj.getMonth() + 1
  ).padStart(2, "0")}`;
  const [overviewCache, setOverviewCache] = useState<Record<string, MonthOverview>>({
    [initialMonthKey]: initialMonthOverview
  });

  // Loading states
  const [isLoadingDate, setIsLoadingDate] = useState<boolean>(false);
  const [isLoadingMonth, setIsLoadingMonth] = useState<boolean>(false);

  // Filter for schedule items
  const [activeFilter, setActiveFilter] = useState<"all" | "classes" | "tasks" | "activities">("all");

  // Month & Year Picker Modal
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [pickerYear, setPickerYear] = useState<number>(initialDateObj.getFullYear());

  // Holiday Drawer
  const [showHolidayForm, setShowHolidayForm] = useState<boolean>(initialHolidayForm);

  // Quick Add Menu popup
  const [showAddMenu, setShowAddMenu] = useState<boolean>(false);

  // Ref to the timeline agenda section for smooth mobile scroll
  const agendaRef = useRef<HTMLDivElement | null>(null);

  // Current schedule for the selected date
  const currentSchedule = scheduleCache[selectedDate];

  // Current month key YYYY-MM
  const currentMonthKey = `${currentMonth.getFullYear()}-${String(
    currentMonth.getMonth() + 1
  ).padStart(2, "0")}`;
  const currentOverview = overviewCache[currentMonthKey] || {};

  // Fetch schedule for date with caching
  const selectDate = async (date: string, shouldScroll = false) => {
    setSelectedDate(date);

    // Keep URL in sync without triggering Next.js layout unmounting
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("date", date);
      window.history.replaceState(null, "", url.toString());
    }

    // Also sync current month grid if selected date is in another month
    const d = parseISODate(date);
    if (
      d.getFullYear() !== currentMonth.getFullYear() ||
      d.getMonth() !== currentMonth.getMonth()
    ) {
      const newMonth = new Date(d.getFullYear(), d.getMonth(), 1);
      setCurrentMonth(newMonth);
      fetchMonthOverviewIfNeeded(d.getFullYear(), d.getMonth() + 1);
    }

    // If schedule is already in cache, zero loading needed!
    if (!scheduleCache[date]) {
      setIsLoadingDate(true);
      try {
        const res = await getCalendarScheduleAction(date);
        if (res.success && res.schedule) {
          setScheduleCache((prev) => ({ ...prev, [date]: res.schedule }));
        }
      } catch (err) {
        console.error("Failed to load schedule for date", date, err);
      } finally {
        setIsLoadingDate(false);
      }
    }

    // On mobile devices, smoothly scroll agenda into view
    if (shouldScroll && agendaRef.current && window.innerWidth < 1024) {
      setTimeout(() => {
        agendaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  };

  // Fetch month overview if not in cache
  const fetchMonthOverviewIfNeeded = async (year: number, month: number) => {
    const key = `${year}-${String(month).padStart(2, "0")}`;
    if (overviewCache[key]) return;

    setIsLoadingMonth(true);
    try {
      const res = await getMonthOverviewAction(year, month);
      if (res.success && res.overview) {
        setOverviewCache((prev) => ({ ...prev, [key]: res.overview }));
      }
    } catch (err) {
      console.error("Failed to load month overview", year, month, err);
    } finally {
      setIsLoadingMonth(false);
    }
  };

  // Navigate months
  const changeMonth = (offset: number) => {
    const newMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + offset,
      1
    );
    setCurrentMonth(newMonth);
    setPickerYear(newMonth.getFullYear());
    fetchMonthOverviewIfNeeded(newMonth.getFullYear(), newMonth.getMonth() + 1);
  };

  // Jump directly to today
  const jumpToToday = () => {
    const todayObj = parseISODate(today);
    setCurrentMonth(new Date(todayObj.getFullYear(), todayObj.getMonth(), 1));
    setPickerYear(todayObj.getFullYear());
    selectDate(today, true);
  };

  // Jump to specific month and year from picker
  const jumpToMonthYear = (monthIndex: number, year: number) => {
    const newMonth = new Date(year, monthIndex, 1);
    setCurrentMonth(newMonth);
    setShowPicker(false);
    fetchMonthOverviewIfNeeded(year, monthIndex + 1);
  };

  // Filter schedule items
  const filteredSchedule = currentSchedule
    ? {
        ...currentSchedule,
        items: currentSchedule.items.filter((item) => {
          if (activeFilter === "all") return true;
          if (activeFilter === "classes") return item.type === "CLASS";
          if (activeFilter === "tasks") return item.type === "TASK";
          if (activeFilter === "activities") return item.type === "ACTIVITY";
          return true;
        })
      }
    : null;

  const totalClasses = currentSchedule
    ? currentSchedule.items.filter((i) => i.type === "CLASS").length
    : 0;
  const totalTasks = currentSchedule
    ? currentSchedule.items.filter((i) => i.type === "TASK").length
    : 0;
  const totalActivities = currentSchedule
    ? currentSchedule.items.filter((i) => i.type === "ACTIVITY").length
    : 0;
  const totalItems = currentSchedule ? currentSchedule.items.length : 0;

  // Selected date human relative status
  const isSelectedToday = selectedDate === today;
  const tomorrow = addDaysISO(today, 1);
  const yesterday = addDaysISO(today, -1);
  const relativeBadge = isSelectedToday
    ? "TODAY"
    : selectedDate === tomorrow
      ? "TOMORROW"
      : selectedDate === yesterday
        ? "YESTERDAY"
        : null;

  return (
    <div className="space-y-5 pb-12">
      <PageMessage error={error} success={success} />

      {/* Top Header */}
      <header className="flex items-center justify-between gap-3">
        <Link
          href="/home"
          aria-label="Back to Home"
          className="focus-ring flex h-10 w-10 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-card text-ink hover:text-[#5B4DFB] active:scale-95 transition-all"
        >
          <ArrowLeft size={18} strokeWidth={2.2} />
        </Link>

        {/* Center Title & View Mode Switcher */}
        <div className="flex items-center gap-2">
          <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-ink">
            Calendar
          </h1>

          {/* View mode pill toggle: Month / Week */}
          <div className="flex items-center rounded-xl bg-slate-100/90 p-0.5 text-xs font-bold text-muted">
            <button
              type="button"
              onClick={() => setViewMode("month")}
              className={`rounded-lg px-2.5 py-1 transition-all active:scale-95 ${
                viewMode === "month"
                  ? "bg-white text-[#5B4DFB] shadow-xs font-extrabold"
                  : "text-muted hover:text-ink"
              }`}
            >
              Month
            </button>
            <button
              type="button"
              onClick={() => setViewMode("week")}
              className={`rounded-lg px-2.5 py-1 transition-all active:scale-95 ${
                viewMode === "week"
                  ? "bg-white text-[#5B4DFB] shadow-xs font-extrabold"
                  : "text-muted hover:text-ink"
              }`}
            >
              Week
            </button>
          </div>
        </div>

        {/* Plus Action Dropdown Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAddMenu((prev) => !prev)}
            aria-label="Add item"
            className="focus-ring flex h-10 w-10 items-center justify-center rounded-2xl bg-[#5B4DFB] text-white shadow-glow active:scale-95 transition-all"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>

          {/* Quick Add Menu Dropdown */}
          {showAddMenu ? (
            <div
              className="absolute right-0 top-12 z-40 w-56 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 duration-150"
              onClick={() => setShowAddMenu(false)}
            >
              <button
                type="button"
                onClick={() => openQuickAdd({ mode: "task", date: selectedDate })}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-ink hover:bg-[#EEECFE] hover:text-[#5B4DFB] transition"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <CheckCircle2 size={14} strokeWidth={2.5} />
                </div>
                <span>Add Task for this day</span>
              </button>

              <button
                type="button"
                onClick={() => setShowHolidayForm(true)}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-ink hover:bg-[#EEECFE] hover:text-[#5B4DFB] transition"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                  <Palmtree size={14} strokeWidth={2.5} />
                </div>
                <span>Add Academic Holiday</span>
              </button>

              <button
                type="button"
                onClick={() => openQuickAdd({ mode: "class" })}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-ink hover:bg-[#EEECFE] hover:text-[#5B4DFB] transition"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-50 text-[#5B4DFB]">
                  <CalendarDays size={14} strokeWidth={2.5} />
                </div>
                <span>Add University Class</span>
              </button>
            </div>
          ) : null}
        </div>
      </header>

      {/* Collapsible Add Holiday Drawer */}
      {showHolidayForm ? (
        <section className="rounded-2xl border border-[#EEECFE] bg-white p-5 shadow-card animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h2 className="text-sm font-bold tracking-tight text-ink">Add Academic Holiday</h2>
            <button
              type="button"
              onClick={() => setShowHolidayForm(false)}
              className="text-xs text-muted hover:text-ink font-semibold"
            >
              Cancel
            </button>
          </div>
          <HolidayForm
            returnTo={`/calendar?date=${selectedDate}`}
            compact
            defaultDate={selectedDate}
          />
        </section>
      ) : null}

      {/* Main Grid: Responsive 2-column on desktop */}
      <div className="grid gap-6 lg:grid-cols-[360px_1fr] items-start">
        {/* Left Column: Interactive Calendar Selector */}
        <aside className="self-start lg:sticky lg:top-6 rounded-2xl border border-slate-100/90 bg-white p-4 sm:p-5 shadow-card transition-all">
          {/* Calendar Header Navigation */}
          <div className="mb-4 flex items-center justify-between gap-2">
            {/* Clickable Month/Year Title Button (Opens quick picker) */}
            <button
              type="button"
              onClick={() => setShowPicker((prev) => !prev)}
              className="focus-ring flex items-center gap-1.5 rounded-xl py-1 px-1.5 font-extrabold text-base text-ink hover:text-[#5B4DFB] hover:bg-[#FAF9FE] transition active:scale-95"
              title="Click to jump to another month or year"
            >
              <span>
                {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
              <ChevronDown
                size={16}
                strokeWidth={2.5}
                className={`text-muted transition-transform duration-200 ${
                  showPicker ? "rotate-180 text-[#5B4DFB]" : ""
                }`}
              />
            </button>

            {/* Quick Controls: Today button + Prev/Next buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={jumpToToday}
                className="rounded-xl bg-[#EEECFE] px-2.5 py-1 text-xs font-bold text-[#5B4DFB] hover:bg-[#E3E0FE] active:scale-95 transition"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                aria-label="Previous month"
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-100 text-muted hover:text-ink hover:border-slate-300 active:scale-95 transition"
              >
                <ChevronLeft size={16} strokeWidth={2.2} />
              </button>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                aria-label="Next month"
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-100 text-muted hover:text-ink hover:border-slate-300 active:scale-95 transition"
              >
                <ChevronRight size={16} strokeWidth={2.2} />
              </button>
            </div>
          </div>

          {/* Month & Year Picker Popover */}
          {showPicker ? (
            <div className="mb-4 rounded-2xl border border-[#EEECFE] bg-[#FAF9FE] p-3 shadow-xs animate-in fade-in zoom-in-95 duration-150">
              {/* Year Selector */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setPickerYear((y) => y - 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-slate-200/80 text-muted hover:text-ink active:scale-95"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="font-extrabold text-sm text-ink">{pickerYear}</span>
                <button
                  type="button"
                  onClick={() => setPickerYear((y) => y + 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-slate-200/80 text-muted hover:text-ink active:scale-95"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* 12 Months Grid */}
              <div className="grid grid-cols-4 gap-1.5">
                {MONTH_NAMES.map((m, idx) => {
                  const isCurrent =
                    currentMonth.getMonth() === idx &&
                    currentMonth.getFullYear() === pickerYear;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => jumpToMonthYear(idx, pickerYear)}
                      className={`rounded-xl py-1.5 px-1 text-xs font-bold transition active:scale-95 ${
                        isCurrent
                          ? "bg-[#5B4DFB] text-white shadow-glow"
                          : "bg-white text-ink hover:bg-[#EEECFE] hover:text-[#5B4DFB] border border-slate-100"
                      }`}
                    >
                      {m.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Render Calendar View Mode: Full Month Grid or Week Strip */}
          {viewMode === "month" ? (
            <MonthGrid
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              today={today}
              overview={currentOverview}
              onSelectDate={(date) => selectDate(date, true)}
            />
          ) : (
            <WeekStripView
              selectedDate={selectedDate}
              today={today}
              overview={currentOverview}
              onSelectDate={(date) => selectDate(date, true)}
            />
          )}

          {/* Visual Legend Bar */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#5B4DFB]" />
              Class
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Task
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              Holiday
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Habit
            </span>
          </div>
        </aside>

        {/* Right Column: Selected Date Schedule & Agenda */}
        <section ref={agendaRef} className="min-w-0 space-y-4">
          {/* Day Header & Stats Card */}
          <div className="rounded-2xl border border-slate-100/90 bg-white p-4 sm:p-5 shadow-card transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-extrabold text-ink leading-tight">
                    {formatDateLong(selectedDate)}
                  </h2>
                  {relativeBadge ? (
                    <span className="rounded-full bg-[#EEECFE] px-2.5 py-0.5 text-[10px] font-extrabold text-[#5B4DFB] shadow-xs">
                      {relativeBadge}
                    </span>
                  ) : null}
                </div>

                {/* Day workload statistics */}
                <p className="text-xs text-muted mt-1">
                  {[
                    totalClasses > 0
                      ? `${totalClasses} ${totalClasses === 1 ? "class" : "classes"}`
                      : null,
                    totalTasks > 0
                      ? `${totalTasks} ${totalTasks === 1 ? "task" : "tasks"}`
                      : null,
                    totalActivities > 0
                      ? `${totalActivities} ${totalActivities === 1 ? "habit" : "habits"}`
                      : null
                  ]
                    .filter(Boolean)
                    .join(" · ") || (isLoadingDate ? "Loading schedule..." : "No items scheduled")}
                </p>
              </div>

              {/* Quick Add Task button for this day */}
              <button
                type="button"
                onClick={() => openQuickAdd({ mode: "task", date: selectedDate })}
                className="focus-ring inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-[#EEECFE] px-3 py-1.5 text-xs font-bold text-[#5B4DFB] hover:bg-[#E3E0FE] active:scale-95 transition"
              >
                <Plus size={14} strokeWidth={2.5} />
                <span>Add to this day</span>
              </button>
            </div>

            {/* Academic Holiday Banner if holiday active on this date */}
            {currentSchedule?.holidayNames && currentSchedule.holidayNames.length > 0 ? (
              <div className="mt-3.5 flex items-center gap-2.5 rounded-2xl bg-rose-50 border border-rose-100/80 p-3 text-rose-700 animate-in fade-in duration-200">
                <Palmtree size={18} className="shrink-0 text-rose-600" />
                <div className="min-w-0 flex-1">
                  <span className="block font-bold text-xs truncate">
                    {currentSchedule.holidayNames.join(", ")}
                  </span>
                  <span className="text-[11px] text-rose-500">
                    Academic Holiday · University classes are suspended
                  </span>
                </div>
              </div>
            ) : null}

            {/* Category Filter Pills */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={`rounded-xl px-3 py-1 text-xs font-bold transition active:scale-95 whitespace-nowrap ${
                  activeFilter === "all"
                    ? "bg-[#5B4DFB] text-white shadow-glow"
                    : "bg-slate-50 text-muted hover:text-ink hover:bg-slate-100"
                }`}
              >
                All ({totalItems})
              </button>
              {totalClasses > 0 ? (
                <button
                  type="button"
                  onClick={() => setActiveFilter("classes")}
                  className={`rounded-xl px-3 py-1 text-xs font-bold transition active:scale-95 whitespace-nowrap ${
                    activeFilter === "classes"
                      ? "bg-[#5B4DFB] text-white shadow-glow"
                      : "bg-slate-50 text-muted hover:text-ink hover:bg-slate-100"
                  }`}
                >
                  Classes ({totalClasses})
                </button>
              ) : null}
              {totalTasks > 0 ? (
                <button
                  type="button"
                  onClick={() => setActiveFilter("tasks")}
                  className={`rounded-xl px-3 py-1 text-xs font-bold transition active:scale-95 whitespace-nowrap ${
                    activeFilter === "tasks"
                      ? "bg-[#5B4DFB] text-white shadow-glow"
                      : "bg-slate-50 text-muted hover:text-ink hover:bg-slate-100"
                  }`}
                >
                  Tasks ({totalTasks})
                </button>
              ) : null}
              {totalActivities > 0 ? (
                <button
                  type="button"
                  onClick={() => setActiveFilter("activities")}
                  className={`rounded-xl px-3 py-1 text-xs font-bold transition active:scale-95 whitespace-nowrap ${
                    activeFilter === "activities"
                      ? "bg-[#5B4DFB] text-white shadow-glow"
                      : "bg-slate-50 text-muted hover:text-ink hover:bg-slate-100"
                  }`}
                >
                  Habits ({totalActivities})
                </button>
              ) : null}
            </div>
          </div>

          {/* Timeline Schedule Container with Smooth Micro-Transitions */}
          {isLoadingDate ? (
            /* Smooth Shimmer Placeholder only inside schedule list */
            <div className="space-y-3 animate-pulse pt-1" aria-busy="true">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-white p-4 shadow-card"
                >
                  <div className="h-10 w-10 rounded-2xl bg-[#EEECFE]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/5 rounded-lg bg-slate-200" />
                    <div className="h-3 w-2/5 rounded bg-slate-100" />
                  </div>
                  <div className="h-6 w-16 rounded-full bg-slate-100" />
                </div>
              ))}
            </div>
          ) : filteredSchedule ? (
            <div className="animate-in fade-in-50 duration-200">
              <Timeline
                schedule={filteredSchedule}
                returnTo={`/calendar?date=${selectedDate}`}
              />
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Month Grid Component with colorful indicator dots
// ----------------------------------------------------------------------
function MonthGrid({
  currentMonth,
  selectedDate,
  today,
  overview,
  onSelectDate
}: {
  currentMonth: Date;
  selectedDate: string;
  today: string;
  overview: MonthOverview;
  onSelectDate: (date: string) => void;
}) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const daysInMonth = end.getDate();

  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const d = new Date(year, month, index + 1);
    return toISODate(d);
  });

  return (
    <div>
      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-muted mb-2">
        {WEEKDAY_NAMES.map((day, idx) => (
          <span
            key={day}
            className={`py-1 ${idx === 0 || idx === 6 ? "text-slate-400" : ""}`}
          >
            {day}
          </span>
        ))}
      </div>

      {/* 7-column month days grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {/* Leading blank slots */}
        {Array.from({ length: start.getDay() }).map((_, index) => (
          <span key={`blank-${index}`} className="aspect-square" />
        ))}

        {/* Month Day Cells */}
        {days.map((day) => {
          const isSelected = day === selectedDate;
          const isCurrentToday = day === today;
          const dayNum = parseISODate(day).getDate();
          const dayInfo = overview[day];

          // Indicator counts
          const hasClasses = dayInfo ? dayInfo.classCount > 0 : false;
          const hasTasks = dayInfo ? dayInfo.taskCount > 0 : false;
          const hasHoliday = dayInfo ? dayInfo.holidayNames.length > 0 : false;
          const hasHabits = dayInfo ? dayInfo.activityCount > 0 : false;

          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelectDate(day)}
              className={`focus-ring relative flex aspect-square flex-col items-center justify-center rounded-2xl text-xs font-bold transition-all duration-150 active:scale-90 touch-manipulation select-none ${
                isSelected
                  ? "bg-[#5B4DFB] text-white shadow-glow scale-[1.04] z-10"
                  : isCurrentToday
                    ? "border-2 border-[#5B4DFB] bg-[#EEECFE] text-[#5B4DFB]"
                    : hasHoliday
                      ? "border border-rose-100 bg-rose-50/60 text-ink hover:bg-rose-100/70"
                      : "border border-slate-50 bg-[#FAF9FE] text-ink hover:bg-[#F0EFFE] hover:text-[#5B4DFB]"
              }`}
            >
              <span className="leading-none">{dayNum}</span>

              {/* Indicator Dots container */}
              <div className="absolute bottom-1.5 flex items-center justify-center gap-0.5">
                {isSelected ? (
                  /* White indicator dot when cell is active */
                  <span className="h-1 w-1 rounded-full bg-white opacity-90" />
                ) : (
                  <>
                    {hasClasses ? (
                      <span
                        title="Class"
                        className="h-1 w-1 rounded-full bg-[#5B4DFB]"
                      />
                    ) : null}
                    {hasTasks ? (
                      <span
                        title="Task"
                        className="h-1 w-1 rounded-full bg-blue-500"
                      />
                    ) : null}
                    {hasHoliday ? (
                      <span
                        title="Holiday"
                        className="h-1 w-1 rounded-full bg-rose-500"
                      />
                    ) : null}
                    {hasHabits && !hasClasses && !hasTasks ? (
                      <span
                        title="Habit"
                        className="h-1 w-1 rounded-full bg-amber-500"
                      />
                    ) : null}
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Week Strip Component (Compact horizontal strip mode for fast scrolling)
// ----------------------------------------------------------------------
function WeekStripView({
  selectedDate,
  today,
  overview,
  onSelectDate
}: {
  selectedDate: string;
  today: string;
  overview: MonthOverview;
  onSelectDate: (date: string) => void;
}) {
  const current = parseISODate(selectedDate);
  const weekStart = parseISODate(weekStartISO(current));

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return toISODate(d);
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-muted px-1">
        <span>Week of {formatDateLong(weekDays[0])}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onSelectDate(addDaysISO(selectedDate, -7))}
            aria-label="Previous week"
            className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-muted hover:text-ink active:scale-95"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            type="button"
            onClick={() => onSelectDate(addDaysISO(selectedDate, 7))}
            aria-label="Next week"
            className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-muted hover:text-ink active:scale-95"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day, idx) => {
          const isSelected = day === selectedDate;
          const isCurrentToday = day === today;
          const dateObj = parseISODate(day);
          const dayNum = dateObj.getDate();
          const dayInfo = overview[day];

          const hasClasses = dayInfo ? dayInfo.classCount > 0 : false;
          const hasTasks = dayInfo ? dayInfo.taskCount > 0 : false;
          const hasHoliday = dayInfo ? dayInfo.holidayNames.length > 0 : false;

          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelectDate(day)}
              className={`focus-ring flex flex-col items-center justify-center rounded-2xl py-2 px-1 text-center transition-all duration-150 active:scale-90 ${
                isSelected
                  ? "bg-[#5B4DFB] text-white shadow-glow"
                  : isCurrentToday
                    ? "border border-[#5B4DFB] bg-[#EEECFE] text-[#5B4DFB]"
                    : "border border-slate-100 bg-[#FAF9FE] text-ink hover:bg-[#F0EFFE]"
              }`}
            >
              <span
                className={`text-[10px] font-semibold ${
                  isSelected ? "text-white/80" : "text-muted"
                }`}
              >
                {WEEKDAY_NAMES[idx]}
              </span>
              <span className="text-sm font-extrabold my-0.5 leading-none">
                {dayNum}
              </span>

              {/* Dot Indicators */}
              <div className="flex items-center gap-0.5 h-1.5 mt-0.5">
                {isSelected ? (
                  <span className="h-1 w-1 rounded-full bg-white" />
                ) : (
                  <>
                    {hasClasses ? (
                      <span className="h-1 w-1 rounded-full bg-[#5B4DFB]" />
                    ) : null}
                    {hasTasks ? (
                      <span className="h-1 w-1 rounded-full bg-blue-500" />
                    ) : null}
                    {hasHoliday ? (
                      <span className="h-1 w-1 rounded-full bg-rose-500" />
                    ) : null}
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
