"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { toISODate } from "@/lib/utils/dates";

interface DateStripProps {
  selectedDate?: string;
  basePath?: string;
}

export function DateStrip({ selectedDate, basePath }: DateStripProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPath = basePath || pathname;

  const today = new Date();
  const activeDateStr = selectedDate || toISODate(today);
  const activeDate = new Date(`${activeDateStr}T12:00:00`);

  // Generate 5 days centered on activeDate or starting around today
  const days = [-2, -1, 0, 1, 2].map((offset) => {
    const d = new Date(activeDate);
    d.setDate(activeDate.getDate() + offset);
    const key = toISODate(d);
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const dayNum = d.getDate();
    const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
    const isSelected = key === activeDateStr;
    const isToday = key === toISODate(today);

    // Build URL preserving existing query params except date
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", key);

    return {
      key,
      month,
      dayNum,
      weekday,
      isSelected,
      isToday,
      href: `${currentPath}?${params.toString()}`
    };
  });

  return (
    <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1">
      {days.map((day) => (
        <Link
          key={day.key}
          href={day.href}
          prefetch={true}
          className={`flex-1 min-w-[58px] max-w-[72px] h-[82px] rounded-2xl flex flex-col items-center justify-center transition-all duration-200 active:scale-95 ${
            day.isSelected
              ? "bg-[#5B4DFB] text-white shadow-glow scale-[1.03]"
              : "bg-white text-ink border border-slate-100/90 shadow-card hover:border-accent/40"
          }`}
        >
          <span
            className={`text-[11px] font-semibold leading-none ${
              day.isSelected ? "text-white/80" : "text-muted"
            }`}
          >
            {day.month}
          </span>
          <span
            className={`text-xl font-extrabold my-1 leading-none ${
              day.isSelected ? "text-white" : "text-ink"
            }`}
          >
            {day.dayNum}
          </span>
          <span
            className={`text-[11px] font-semibold leading-none ${
              day.isSelected ? "text-white/80" : "text-muted"
            }`}
          >
            {day.weekday}
          </span>
        </Link>
      ))}
    </div>
  );
}
