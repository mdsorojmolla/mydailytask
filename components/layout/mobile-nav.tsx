"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CalendarDays, Home, ListTodo, Menu } from "lucide-react";

const mobileNavigation = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/routine", label: "Routine", icon: BookOpen },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/settings", label: "More", icon: Menu }
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile"
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-line bg-paper px-2 py-2 lg:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {mobileNavigation.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`focus-ring flex min-h-12 flex-col items-center justify-center rounded-md text-[11px] font-medium ${
                active ? "bg-accentSoft text-accent" : "text-muted"
              }`}
            >
              <item.icon aria-hidden="true" size={18} />
              <span className="mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
