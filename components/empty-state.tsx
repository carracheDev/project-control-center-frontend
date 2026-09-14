import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-mark" aria-hidden="true">+</span>
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && actionHref && <Link className="button button-secondary" href={actionHref}>{actionLabel}</Link>}
    </div>
  );
}