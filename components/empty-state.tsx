import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="grid min-h-[210px] place-items-center border border-dashed border-line p-7 text-center">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-panel text-xl text-brand-900" aria-hidden="true">+</span>
      <h3 className="mt-3 font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="my-2 max-w-[350px] leading-relaxed text-muted">{description}</p>
      {actionLabel && actionHref && <Link className="inline-flex rounded-lg border border-line bg-panel px-3 py-2 text-xs font-semibold text-brand-900" href={actionHref}>{actionLabel}</Link>}
    </div>
  );
}