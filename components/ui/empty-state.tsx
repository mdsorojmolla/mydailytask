import Link from "next/link";

export function EmptyState({
  title,
  actionLabel,
  href
}: {
  title: string;
  actionLabel?: string;
  href?: string;
}) {
  return (
    <div className="rounded-md border border-dashed border-line bg-white px-5 py-8 text-center">
      <p className="text-sm font-medium text-ink">{title}</p>
      {actionLabel && href ? (
        <Link
          href={href}
          className="focus-ring mt-4 inline-flex min-h-10 items-center rounded-md border border-line px-3 text-sm font-semibold hover:border-accent/50"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
