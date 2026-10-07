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
    <>
      <PageMessage error={params.error} success={params.success} />
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">Insights</h1>
        <p className="mt-2 text-sm text-muted">This week</p>
      </header>

      {insights.tasks.length < 3 ? (
        <section className="rounded-md border border-line bg-white px-5 py-8">
          <h2 className="text-xl font-semibold">Insights will appear with more history.</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Complete a few tasks and this page will start showing useful weekly
            patterns.
          </p>
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-3">
          <Metric
            label="Tasks completed"
            value={`${insights.completed.length} / ${insights.tasks.length}`}
          />
          <Metric label="Completion rate" value={`${insights.completionRate}%`} />
          <Metric
            label="High priority"
            value={`${insights.completedHigh.length} / ${insights.high.length}`}
          />
        </section>
      )}
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-white px-5 py-5">
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  );
}
