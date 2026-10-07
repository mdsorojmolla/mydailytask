"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, FileText, Home, Plus, Users } from "lucide-react";
import { openQuickAdd } from "@/components/domain/quick-add";

export function MobileNav() {
  const pathname = usePathname();

  const isHome = pathname === "/home" || pathname === "/";
  const isCalendar = pathname.startsWith("/calendar") || pathname.startsWith("/routine");
  const isTasks = pathname.startsWith("/tasks");
  const isMore = pathname.startsWith("/settings") || pathname.startsWith("/insights");

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 px-4 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] backdrop-blur-xl border-t border-slate-100 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] lg:hidden"
    >
      <div className="mx-auto flex max-w-md items-center justify-between relative px-2">
        {/* Tab 1: Home */}
        <Link
          href="/home"
          prefetch={true}
          aria-label="Home"
          className={`flex min-h-[44px] flex-1 flex-col items-center justify-center transition-all duration-200 active:scale-90 ${
            isHome ? "text-[#5B4DFB]" : "text-muted hover:text-ink"
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-colors ${isHome ? "bg-[#EEECFE]" : ""}`}>
            <Home
              size={22}
              strokeWidth={isHome ? 2.5 : 2}
            />
          </div>
        </Link>

        {/* Tab 2: Calendar */}
        <Link
          href="/calendar"
          prefetch={true}
          aria-label="Calendar & Routine"
          className={`flex min-h-[44px] flex-1 flex-col items-center justify-center transition-all duration-200 active:scale-90 ${
            isCalendar ? "text-[#5B4DFB]" : "text-muted hover:text-ink"
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-colors ${isCalendar ? "bg-[#EEECFE]" : ""}`}>
            <CalendarDays
              size={22}
              strokeWidth={isCalendar ? 2.5 : 2}
            />
          </div>
        </Link>

        {/* Center: Floating (+) Action Button */}
        <div className="flex flex-1 items-center justify-center -translate-y-5">
          <button
            type="button"
            onClick={openQuickAdd}
            aria-label="Add new item"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#5B4DFB] text-white shadow-[0_8px_24px_rgba(91,77,251,0.45)] ring-4 ring-white transition-all duration-200 hover:scale-105 active:scale-90"
          >
            <Plus size={28} strokeWidth={2.8} />
          </button>
        </div>

        {/* Tab 3: Tasks */}
        <Link
          href="/tasks"
          prefetch={true}
          aria-label="Tasks"
          className={`flex min-h-[44px] flex-1 flex-col items-center justify-center transition-all duration-200 active:scale-90 ${
            isTasks ? "text-[#5B4DFB]" : "text-muted hover:text-ink"
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-colors ${isTasks ? "bg-[#EEECFE]" : ""}`}>
            <FileText
              size={22}
              strokeWidth={isTasks ? 2.5 : 2}
            />
          </div>
        </Link>

        {/* Tab 4: More / Profile */}
        <Link
          href="/settings"
          prefetch={true}
          aria-label="More and settings"
          className={`flex min-h-[44px] flex-1 flex-col items-center justify-center transition-all duration-200 active:scale-90 ${
            isMore ? "text-[#5B4DFB]" : "text-muted hover:text-ink"
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-colors ${isMore ? "bg-[#EEECFE]" : ""}`}>
            <Users
              size={22}
              strokeWidth={isMore ? 2.5 : 2}
            />
          </div>
        </Link>
      </div>
    </nav>
  );
}
