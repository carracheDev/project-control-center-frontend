"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { StatusBadge } from "@/components/status-badge";
import { getDashboard } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { DashboardAttentionItem, ProjectDashboardCard, ProjectDashboardResult } from "@/types/domain";

export function DashboardPage() {
  const [dashboard, setDashboard] = useState<ProjectDashboardResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboard()
      .then(setDashboard)
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setIsLoading(false));
  }, []);

  return <main className="page-shell dashboard-page">
    <section className="page-heading page-heading-dashboard">
      <div>
        <p className="eyebrow">Pilotage multi-projets</p>
        <h1>Project Control Center</h1>
        <p className="page-lede">L’état opérationnel de vos projets, phases et points d’attention.</p>
      </div>
      <Link className="button button-primary" href="/projects/new"><span aria-hidden="true">+</span> Nouveau projet</Link>
    </section>

    {error && <div className="alert alert-error">Impossible de charger le dashboard : {error}</div>}
    {isLoading ? <LoadingState label="Chargement du dashboard..." /> : dashboard && <>
      <DashboardSummary summary={dashboard.summary} />
      {dashboard.projects.length === 0 ? <EmptyState title="Aucun projet n’est encore enregistré" description="Créez votre premier projet pour commencer à structurer les phases de travail." actionLabel="Créer un projet" actionHref="/projects/new" /> : <>
        <section className="content-section dashboard-projects-section">
          <div className="section-heading"><div><p className="eyebrow">Vue portefeuille</p><h2>Projets</h2></div><Link className="text-link" href="/projects">Gérer les projets <span aria-hidden="true">→</span></Link></div>
          <div className="dashboard-project-grid">{dashboard.projects.map((project) => <ProjectDashboardCardView key={project.id} project={project} />)}</div>
        </section>
        <div className="dashboard-lower-grid">
          <DashboardAttention items={dashboard.attentionItems} />
          <RecentValidations validations={dashboard.recentValidations} />
        </div>
      </>}
    </>}
  </main>;
}

function DashboardSummary({ summary }: { summary: ProjectDashboardResult["summary"] }) {
  const metrics = [
    ["Projets", summary.totalProjects, "total"],
    ["Actifs", summary.activeProjects, "phases en cours"],
    ["Terminés", summary.completedProjects, "toutes phases validées"],
    ["Bloqués", summary.blockedProjects, "blocage détecté"],
    ["Attention", summary.projectsNeedingAttention, "à surveiller"],
  ];
  return <section className="dashboard-summary-grid" aria-label="Résumé global">{metrics.map(([label, value, note]) => <article className="metric-card" key={label}><span className="metric-label">{label}</span><strong>{value}</strong><span className="metric-note">{note}</span></article>)}</section>;
}

function ProjectDashboardCardView({ project }: { project: ProjectDashboardCard }) {
  return <Link className={`dashboard-project-card ${project.attention.hasBlockers ? "dashboard-project-card-alert" : ""}`} href={`/projects/${project.id}`}>
    <div className="dashboard-project-card-heading"><div><h3>{project.name}</h3><p>{project.description || "Aucune description"}</p></div>{project.phase && <StatusBadge status={project.phase.status} />}</div>
    <div className="dashboard-phase-line"><span>Phase actuelle</span><strong>{project.phase ? `${String(project.phase.order).padStart(2, "0")} · ${project.phase.name}` : "Aucune phase"}</strong></div>
    <div className="dashboard-progress-line"><div className="dashboard-progress-track"><span style={{ width: `${project.progress.percentage}%` }} /></div><strong>{project.progress.percentage}%</strong><small>{project.progress.completedPhases}/{project.progress.totalPhases} phases validées</small></div>
    <div className="dashboard-card-stats"><span><strong>{project.tasks.done}/{project.tasks.total}</strong>Tâches terminées</span><span><strong>{project.tasks.blocked}</strong>Tâches bloquées</span><span><strong>{project.interviews.completed}/{project.interviews.total}</strong>Interviews</span><span><strong>{project.evidence.verified}/{project.evidence.total}</strong>Evidences vérifiées</span></div>
    {project.attention.items.length > 0 && <div className="dashboard-card-alert">{project.attention.items[0].message}<span>{project.attention.items.length > 1 ? `+${project.attention.items.length - 1} autres` : "Voir le détail"}</span></div>}
  </Link>;
}

function DashboardAttention({ items }: { items: (DashboardAttentionItem & { projectId: string; projectName: string })[] }) {
  return <section className="content-section dashboard-panel"><div className="section-heading"><div><p className="eyebrow">À traiter</p><h2>Attention</h2></div><span className="panel-count">{items.length}</span></div>{items.length === 0 ? <p className="dashboard-empty-line">Aucun élément ne nécessite d’attention.</p> : <div className="dashboard-attention-list">{items.slice(0, 8).map((item, index) => <Link className="dashboard-attention-item" href={`/phases/${item.phaseId}`} key={`${item.projectId}-${item.phaseId}-${item.type}-${index}`}><span className={`attention-marker attention-${item.severity.toLowerCase()}`} aria-hidden="true">{item.severity === "HIGH" ? "!" : "·"}</span><span><strong>{item.projectName}</strong><small>{item.message}</small></span><span className="row-arrow" aria-hidden="true">→</span></Link>)}</div>}</section>;
}

function RecentValidations({ validations }: { validations: ProjectDashboardResult["recentValidations"] }) {
  return <section className="content-section dashboard-panel"><div className="section-heading"><div><p className="eyebrow">Historique</p><h2>Validations récentes</h2></div><span className="panel-count">{validations.length}</span></div>{validations.length === 0 ? <p className="dashboard-empty-line">Aucune validation récente.</p> : <div className="dashboard-validation-list">{validations.map((validation) => <Link className="dashboard-validation-item" href={`/phases/${validation.phaseId}`} key={validation.id}><span className="validation-check" aria-hidden="true">✓</span><span><strong>{validation.phaseName}</strong><small>{validation.projectName} · {formatDate(validation.validatedAt)}</small>{validation.validatedBy && <small>par {validation.validatedBy}</small>}</span></Link>)}</div>}</section>;
}