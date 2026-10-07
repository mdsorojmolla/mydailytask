"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CalendarDays, Home, ListTodo, Menu, Settings, TrendingUp } from "lucide-react";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SignOutButton } from "@/components/layout/sign-out-button";

const navigation = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/routine", label: "Routine", icon: BookOpen },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/insights", label: "Insights", icon: TrendingUp },
  { href: "/settings", label: "More", icon: Settings }
];

export function AppShell({
  children,
  userEmail
}: {
  children: React.ReactNode;
  userEmail: string;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-line bg-paper px-4 py-5 lg:block">
        <div className="flex h-full flex-col">
          <Link href="/home" className="focus-ring flex items-center gap-2.5 rounded-2xl px-2 py-2 transition hover:bg-white/60">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#5B4DFB] text-xs font-extrabold text-white shadow-glow">
              MD
            </span>
            <div>
              <span className="block text-sm font-extrabold text-ink leading-tight">My Day</span>
              <span className="text-[11px] text-muted font-medium">Routine & Tasks</span>
            </div>
          </Link>

          <nav aria-label="Main" className="mt-8 flex flex-col gap-1.5">
            {navigation.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`focus-ring flex min-h-11 items-center gap-3 rounded-2xl px-3.5 text-xs font-bold transition active:scale-95 ${
                    active
                      ? "bg-[#EEECFE] text-[#5B4DFB] shadow-xs"
                      : "text-muted hover:bg-white hover:text-ink"
                  }`}
                >
                  <item.icon
                    aria-hidden="true"
                    size={19}
                    strokeWidth={active ? 2.5 : 2}
                    className={active ? "text-[#5B4DFB]" : "text-muted"}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-slate-100 pt-4">
            <p className="truncate text-xs font-medium text-muted mb-2 px-1">{userEmail}</p>
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] pt-[max(1rem,env(safe-area-inset-top,0px))] lg:ml-64 lg:px-8 lg:pb-12 lg:pt-8">
        <div className="mx-auto w-full max-w-xl lg:max-w-4xl">{children}</div>
      </main>
      <MobileNav />
    </div>
  );
}
