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
              <div className="dashboard-content">
                <DashboardAttention items={dashboard.attentionItems} />
                <div className="dashboard-lower-grid">
                  <DashboardProgression projects={dashboard.projects} />
                  <RecentValidations validations={dashboard.recentValidations} />
                </div>
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
    ["Projets", summary.totalProjects, "dans votre portefeuille"],
    ["En cours", summary.activeProjects, "à suivre maintenant"],
    ["À traiter", summary.projectsNeedingAttention, "demandent une décision"],
    ["Terminés", summary.completedProjects, "validation complète"],
  ];

  return (
    <section className="dashboard-summary" aria-label="Résumé global">
      {metrics.map(([label, value, note]) => (
        <div className="dashboard-summary-item" key={label}>
          <span className="metric-label">{label}</span>
          <strong>{value}</strong>
          <span className="metric-note">{note}</span>
        </div>
      ))}
    </section>
  );
}

function DashboardAttention({ items }: { items: (DashboardAttentionItem & { projectId: string; projectName: string })[] }) {
  return (
    <section className="dashboard-section dashboard-attention-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">À traiter</p>
          <h2>Points d’attention</h2>
        </div>
        <span className="panel-pill">{items.length} priorité{items.length > 1 ? "s" : ""}</span>
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
                <small>{item.severity === "HIGH" ? "À corriger" : "À surveiller"} · {item.projectName}</small>
                <strong>{item.message}</strong>
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

function DashboardProgression({ projects }: { projects: ProjectDashboardCard[] }) {
  return (
    <section className="dashboard-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Portefeuille</p>
          <h2>Progression</h2>
        </div>
        <Link className="text-link" href="/projects">Voir les projets <span aria-hidden="true">→</span></Link>
      </div>
      <div className="dashboard-progression-list">
        {projects.map((project) => (
          <Link className="dashboard-progression-row" href={`/projects/${project.id}`} key={project.id}>
            <span className="dashboard-progression-name">
              <strong>{project.name}</strong>
              <small>{project.phase ? `Phase ${project.phase.order} · ${project.phase.name}` : "Aucune phase active"}</small>
            </span>
            <span className="dashboard-progression-bar" aria-label={`${project.progress.percentage}% terminé`}>
              <span style={{ width: `${project.progress.percentage}%` }} />
            </span>
            <strong className="dashboard-progression-value">{project.progress.percentage}%</strong>
            {project.phase && <StatusBadge status={project.phase.status} />}
          </Link>
        ))}
      </div>
    </section>
  );
}

function RecentValidations({ validations }: { validations: ProjectDashboardResult["recentValidations"] }) {
  return (
    <section className="dashboard-section dashboard-validations-section">
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
