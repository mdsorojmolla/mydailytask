import Link from "next/link";
import { ArrowLeft, CheckCircle2, TrendingUp, Zap } from "lucide-react";
import { PageMessage } from "@/components/domain/message";
import { getInsightsData } from "@/lib/data";

export default async function InsightsPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const params = await searchParams;
  const insights = await getInsightsData();

  return (
    <div className="space-y-6">
      <PageMessage error={params.error} success={params.success} />
      
      <header className="flex items-center justify-between border-b border-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/settings"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-black/5 hover:text-ink active:scale-95 transition-all"
              aria-label="Back to more"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">Insights</h1>
          </div>
          <p className="mt-0.5 pl-10 text-xs font-medium text-muted">Weekly performance & habits</p>
        </div>
      </header>

      {insights.tasks.length < 3 ? (
        <section className="rounded-2xl border border-dashed border-border/80 bg-white p-6 sm:p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent mb-3">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h2 className="text-base font-semibold text-ink">Building your rhythm</h2>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted">
            Complete a few more tasks this week and your personal completion patterns and pace metrics will appear here.
          </p>
          <div className="mt-5">
            <Link
              href="/tasks"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-ink px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-ink/90 active:scale-95 transition-all"
            >
              Go to Tasks
            </Link>
          </div>
        </section>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric
              icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
              label="Tasks Completed"
              value={`${insights.completed.length} of ${insights.tasks.length}`}
              subtext={`${insights.completionRate}% completion rate`}
            />
            <Metric
              icon={<TrendingUp className="h-4 w-4 text-accent" />}
              label="Completion Rate"
              value={`${insights.completionRate}%`}
              subtext={insights.completionRate >= 70 ? "Strong pace" : "Keep going"}
            />
            <Metric
              icon={<Zap className="h-4 w-4 text-amber-600" />}
              label="High Priority Completed"
              value={`${insights.completedHigh.length} of ${insights.high.length}`}
              subtext="Critical milestones"
            />
          </div>

          <div className="rounded-2xl border border-border/80 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs font-medium text-muted mb-2">
              <span>Overall completion</span>
              <span className="font-semibold text-ink">{insights.completionRate}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-black/5">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500"
                style={{ width: `${Math.min(insights.completionRate, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  subtext
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
}) {
  return (
    <div className="rounded-2xl border border-border/80 bg-white p-4 shadow-xs">
      <div className="flex items-center gap-2 text-xs font-medium text-muted mb-2">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-2xl font-bold tracking-tight text-ink">{value}</p>
      <p className="mt-1 text-[11px] text-muted">{subtext}</p>
    </div>
  );
}
