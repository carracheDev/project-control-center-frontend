import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/format";
import type { Phase, Project } from "@/types/domain";

export function PhaseHeader({ phase, project }: { phase: Phase; project: Project | null }) {
  return <>
    <nav className="phase-page-crumbs" aria-label="Fil d'Ariane">
      <Link href="/projects">Projets</Link>
      <span aria-hidden="true">→</span>
      {project ? <Link href={`/projects/${project.id}`}>{project.name}</Link> : <span>Projet</span>}
      <span aria-hidden="true">→</span>
      <strong>Phase {phase.order}</strong>
    </nav>

    <section className="phase-header-card">
      <div className="phase-header-main">
        <span className="phase-order-large" aria-hidden="true">{String(phase.order).padStart(2, "0")}</span>
        <div className="phase-header-copy">
          <p className="eyebrow">{project?.name || "Projet"} · Phase {phase.order}</p>
          <h1>{phase.name}</h1>
          <p className="phase-header-description">{phase.description || "Aucune description"}</p>
        </div>
      </div>

      <div className="phase-header-side">
        <StatusBadge status={phase.status} />
        <div className="phase-metadata">
          <span>Deadline</span>
          <strong>{formatDate(phase.deadline)}</strong>
        </div>
        <Link className="button button-secondary" href={`/projects/${phase.projectId}`}>← Retour au projet</Link>
      </div>
    </section>
  </>;
}
