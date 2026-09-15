import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/format";
import type { Phase, Project } from "@/types/domain";

export function PhaseHeader({ phase, project }: { phase: Phase; project: Project | null }) {
  return <>
    <nav className="mb-5 flex flex-wrap items-center gap-2 text-xs text-muted" aria-label="Fil d'Ariane">
      <Link className="transition-colors hover:text-brand-900" href="/projects">Projets</Link>
      <span aria-hidden="true">/</span>
      {project ? <Link className="transition-colors hover:text-brand-900" href={`/projects/${project.id}`}>{project.name}</Link> : <span>Projet</span>}
      <span aria-hidden="true">/</span>
      <strong className="font-semibold text-ink">Phase {phase.order}</strong>
    </nav>

    <section className="flex flex-col gap-6 rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-7 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-900 text-lg font-bold text-white" aria-hidden="true">{String(phase.order).padStart(2, "0")}</span>
        <div className="min-w-0">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">{project?.name || "Projet"} · Phase {phase.order}</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">{phase.name}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{phase.description || "Aucune description"}</p>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-start gap-4 sm:items-end">
        <StatusBadge status={phase.status} />
        <div className="text-left sm:text-right">
          <span className="block text-xs text-muted">Deadline</span>
          <strong className="text-sm font-semibold text-ink">{formatDate(phase.deadline)}</strong>
        </div>
        <Link className="inline-flex items-center rounded-lg border border-line bg-panel px-3 py-2 text-xs font-semibold text-brand-900 transition-colors hover:border-brand-900" href={`/projects/${phase.projectId}`}>← Retour au projet</Link>
      </div>
    </section>
  </>;
}
