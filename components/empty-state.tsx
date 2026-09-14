import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="grid min-h-[210px] place-items-center border border-dashed border-[#cbd6d1] p-7 text-center">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-[#dcebe3] text-xl text-[var(--teal)]" aria-hidden="true">+</span>
      <h3 className="mt-3">{title}</h3>
      <p className="my-2 max-w-[350px] leading-relaxed text-[var(--muted)]">{description}</p>
      {actionLabel && actionHref && <Link className="button button-secondary" href={actionHref}>{actionLabel}</Link>}
    </div>
  );
}