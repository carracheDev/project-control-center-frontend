import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/format";
import type { Phase, Project } from "@/types/domain";

export function PhaseHeader({ phase, project }: { phase: Phase; project: Project | null }) {
  return <>
    <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]" aria-label="Fil d'Ariane">
      <Link className="font-bold text-[#4e7975]" href="/projects">Projets</Link><span aria-hidden="true">→</span>
      {project ? <Link className="font-bold text-[#4e7975]" href={`/projects/${project.id}`}>{project.name}</Link> : <span>Projet</span>}
      <span aria-hidden="true">→</span><strong className="text-[var(--ink)]">Phase {phase.order}</strong>
    </nav>
    <section className="flex flex-col justify-between gap-7 border-b border-[var(--line)] pb-7 md:flex-row md:items-start">
      <div className="flex min-w-0 items-start gap-4"><span className="grid h-14 w-14 shrink-0 place-items-center rounded bg-[#fff0cd] font-['Space_Grotesk'] text-xl font-bold text-[#9a6c25]" aria-hidden="true">{String(phase.order).padStart(2, "0")}</span><div className="min-w-0"><p className="eyebrow">{project?.name || "Projet"} · Phase {phase.order}</p><h1>{phase.name}</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">{phase.description || "Aucune description"}</p></div></div>
      <div className="flex shrink-0 flex-col items-start gap-3 text-xs text-[var(--muted)] md:items-end"><StatusBadge status={phase.status} /><span>Deadline <strong className="text-[var(--ink)]">{formatDate(phase.deadline)}</strong></span><Link className="button button-secondary" href={`/projects/${phase.projectId}`}>← Retour au projet</Link></div>
    </section>
  </>;
}
