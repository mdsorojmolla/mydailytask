import Link from "next/link";
import { BookOpen, CalendarDays, Home, ListTodo, Menu, Settings, TrendingUp } from "lucide-react";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SignOutButton } from "@/components/layout/sign-out-button";

const navigation = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/routine", label: "Routine", icon: BookOpen },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/insights", label: "Insights", icon: TrendingUp },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({
  children,
  userEmail
}: {
  children: React.ReactNode;
  userEmail: string;
}) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-line bg-paper px-4 py-5 lg:block">
        <div className="flex h-full flex-col">
          <Link href="/home" className="focus-ring rounded-md px-2 py-1">
            <span className="block text-lg font-semibold">My Day</span>
            <span className="text-xs text-muted">Personal daily system</span>
          </Link>
          <nav aria-label="Main" className="mt-10 flex flex-col gap-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="focus-ring flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted transition hover:bg-white hover:text-ink"
              >
                <item.icon aria-hidden="true" size={18} />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto border-t border-line pt-4">
            <p className="truncate text-xs text-muted">{userEmail}</p>
            <SignOutButton />
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-line bg-paper/95 px-5 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/home" className="focus-ring rounded-md text-base font-semibold">
            My Day
          </Link>
          <Link
            href="/settings"
            aria-label="More"
            className="focus-ring rounded-md p-2 text-muted"
          >
            <Menu aria-hidden="true" size={20} />
          </Link>
        </div>
      </header>

      <main className="px-5 pb-28 pt-6 lg:ml-64 lg:px-10 lg:pb-10 lg:pt-10">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
      <MobileNav />
    </div>
  );
}
