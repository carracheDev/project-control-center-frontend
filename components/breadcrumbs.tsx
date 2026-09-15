import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 flex-wrap items-center gap-1.5 text-[11px] text-muted">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
            {index > 0 && <span aria-hidden="true" className="text-[10px] text-[#8da0a0]">/</span>}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="truncate font-medium text-brand-900 transition-colors hover:text-brand-950"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`truncate ${isLast ? "font-semibold text-ink" : "font-medium text-muted"}`}
              >
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
