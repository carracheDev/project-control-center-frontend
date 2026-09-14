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

  return (
    <main className="page-shell dashboard-page">
      <section className="page-heading dashboard-header">
        <div>
          <p className="eyebrow">Pilotage multi-projets</p>
          <h1>Bonjour</h1>
          <p className="page-lede">Voici l’état actuel de vos projets, phases et prochaines actions à traiter.</p>
        </div>
        <Link className="button button-primary" href="/projects/new">
          <span aria-hidden="true">+</span> Nouveau projet
        </Link>
      </section>

      {error && <div className="alert alert-error">Impossible de charger le dashboard : {error}</div>}

      {isLoading ? (
        <LoadingState label="Chargement du dashboard..." />
      ) : (
        dashboard && (
          <>
            <DashboardSummary summary={dashboard.summary} />

            {dashboard.projects.length === 0 ? (
              <EmptyState
                title="Aucun projet n’est encore enregistré"
                description="Créez votre premier projet pour commencer à structurer les phases de travail."
                actionLabel="Créer un projet"
                actionHref="/projects/new"
              />
            ) : (
              <div className="dashboard-layout">
                <section className="content-section dashboard-projects-section">
                  <div className="section-heading">
                    <div>
                      <p className="eyebrow">Vue portefeuille</p>
                      <h2>Projets actifs</h2>
                    </div>
                    <Link className="text-link" href="/projects">
                      Gérer les projets <span aria-hidden="true">→</span>
                    </Link>
                  </div>

                  <div className="dashboard-project-grid">
                    {dashboard.projects.map((project) => (
                      <ProjectDashboardCardView key={project.id} project={project} />
                    ))}
                  </div>
                </section>

                <aside className="dashboard-side-column">
                  <DashboardAttention items={dashboard.attentionItems} />
                  <RecentValidations validations={dashboard.recentValidations} />
                </aside>
              </div>
            )}
          </>
        )
      )}
    </main>
  );
}

function DashboardSummary({ summary }: { summary: ProjectDashboardResult["summary"] }) {
  const metrics = [
    ["Projets", summary.totalProjects, "total"],
    ["Actifs", summary.activeProjects, "phases en cours"],
    ["Terminés", summary.completedProjects, "toutes phases validées"],
    ["Bloqués", summary.blockedProjects, "blocage détecté"],
    ["À surveiller", summary.projectsNeedingAttention, "projets à relancer"],
  ];

  return (
    <section className="dashboard-summary-grid" aria-label="Résumé global">
      {metrics.map(([label, value, note]) => (
        <article className="metric-card" key={label}>
          <span className="metric-label">{label}</span>
          <strong>{value}</strong>
          <span className="metric-note">{note}</span>
        </article>
      ))}
    </section>
  );
}

function ProjectDashboardCardView({ project }: { project: ProjectDashboardCard }) {
  const nextAction = project.attention.items[0]?.message ?? "Aucune attention particulière";

  return (
    <Link className={`dashboard-project-card ${project.attention.hasBlockers ? "dashboard-project-card-alert" : ""}`} href={`/projects/${project.id}`}>
      <div className="dashboard-project-card-top">
        <div>
          <p className="mini-label">Projet</p>
          <h3>{project.name}</h3>
        </div>
        {project.phase && <StatusBadge status={project.phase.status} />}
      </div>

      <p className="project-card-description">{project.description || "Aucune description"}</p>

      <div className="dashboard-project-card-meta">
        <span>Phase actuelle</span>
        <strong>{project.phase ? `${String(project.phase.order).padStart(2, "0")} · ${project.phase.name}` : "Aucune phase"}</strong>
      </div>

      <div className="dashboard-progress-block">
        <div className="dashboard-progress-header">
          <span>Progression</span>
          <strong>{project.progress.percentage}%</strong>
        </div>
        <div className="dashboard-progress-track">
          <span style={{ width: `${project.progress.percentage}%` }} />
        </div>
        <small>
          {project.progress.completedPhases}/{project.progress.totalPhases} phases validées
        </small>
      </div>

      <div className="dashboard-card-stats">
        <span>
          <strong>{project.tasks.done}</strong>
          <small>tâches terminées</small>
        </span>
        <span>
          <strong>{project.tasks.blocked}</strong>
          <small>bloquées</small>
        </span>
        <span>
          <strong>{project.interviews.completed}</strong>
          <small>interviews</small>
        </span>
        <span>
          <strong>{project.evidence.verified}</strong>
          <small>preuves</small>
        </span>
      </div>

      <div className="dashboard-card-footer">
        <span className="dashboard-card-action">Prochaine action</span>
        <strong>{nextAction}</strong>
      </div>
    </Link>
  );
}

function DashboardAttention({ items }: { items: (DashboardAttentionItem & { projectId: string; projectName: string })[] }) {
  return (
    <section className="content-section dashboard-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">À traiter</p>
          <h2>Points d’attention</h2>
        </div>
        <span className="panel-pill">{items.length}</span>
      </div>

      {items.length === 0 ? (
        <p className="dashboard-empty-line">Aucun élément ne nécessite d’attention.</p>
      ) : (
        <div className="dashboard-attention-list">
          {items.slice(0, 6).map((item, index) => (
            <Link className="dashboard-attention-item" href={`/phases/${item.phaseId}`} key={`${item.projectId}-${item.phaseId}-${item.type}-${index}`}>
              <span className={`attention-marker attention-${item.severity.toLowerCase()}`} aria-hidden="true">
                {item.severity === "HIGH" ? "!" : "·"}
              </span>
              <span className="dashboard-attention-copy">
                <strong>{item.projectName}</strong>
                <small>{item.message}</small>
              </span>
              <span className="row-arrow" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function RecentValidations({ validations }: { validations: ProjectDashboardResult["recentValidations"] }) {
  return (
    <section className="content-section dashboard-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Historique</p>
          <h2>Validations récentes</h2>
        </div>
        <span className="panel-pill">{validations.length}</span>
      </div>

      {validations.length === 0 ? (
        <p className="dashboard-empty-line">Aucune validation récente.</p>
      ) : (
        <div className="dashboard-validation-list">
          {validations.map((validation) => (
            <Link className="dashboard-validation-item" href={`/phases/${validation.phaseId}`} key={validation.id}>
              <span className="validation-check" aria-hidden="true">
                ✓
              </span>
              <span className="dashboard-validation-copy">
                <strong>{validation.phaseName}</strong>
                <small>
                  {validation.projectName} · {formatDate(validation.validatedAt)}
                </small>
                {validation.validatedBy && <small>par {validation.validatedBy}</small>}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}