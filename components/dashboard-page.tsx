"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Activity, AlertCircle, ArrowRight, CheckCircle2, CircleCheck, Clock3, FolderKanban, Plus, type LucideIcon } from "lucide-react";
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
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[.14em] text-accent-400">Pilotage multi-projets</p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-ink">Vue d&apos;ensemble</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Voici l’état actuel de vos projets, phases et prochaines actions à traiter.</p>
        </div>
        <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-950 px-4 text-sm font-semibold text-white transition hover:bg-brand-900" href="/projects/new">
          <Plus aria-hidden="true" size={16} /> Nouveau projet
        </Link>
      </section>

      {error && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">Impossible de charger le dashboard : {error}</div>}

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
              <div className="grid gap-9">
                <DashboardAttention items={dashboard.attentionItems} />
                <div className="grid gap-9 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,.75fr)]">
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
  const metrics: [string, number, string, LucideIcon, string][] = [
    ["Projets", summary.totalProjects, "dans votre portefeuille", FolderKanban, "text-brand-900"],
    ["En cours", summary.activeProjects, "à suivre maintenant", Activity, "text-blue-600"],
    ["À traiter", summary.projectsNeedingAttention, "demandent une décision", AlertCircle, "text-warning"],
    ["Terminés", summary.completedProjects, "validation complète", CheckCircle2, "text-success"],
  ];

  return (
    <section className="grid overflow-hidden rounded-xl border border-line bg-surface shadow-[0_8px_24px_rgba(15,23,42,.05)] sm:grid-cols-2 lg:grid-cols-4" aria-label="Résumé global">
      {metrics.map(([label, value, note, Icon, iconColor]) => (
        <div className="flex min-h-28 items-center gap-3 border-b border-line px-5 py-4 last:border-b-0 sm:[&:nth-child(even)]:border-l lg:border-b-0 lg:border-l lg:first:border-l-0" key={label}>
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-panel ${iconColor}`} aria-hidden="true"><Icon size={17} strokeWidth={2} /></span>
          <span className="grid gap-1">
            <span className="text-xs font-semibold text-ink">{label}</span>
            <strong className="font-display text-2xl font-bold leading-none text-ink">{value}</strong>
            <span className="text-[11px] text-muted">{note}</span>
          </span>
        </div>
      ))}
    </section>
  );
}

function DashboardAttention({ items }: { items: (DashboardAttentionItem & { projectId: string; projectName: string })[] }) {
  return (
    <section className="rounded-xl border border-line border-l-4 border-l-accent-400 bg-surface px-5 pb-3 pt-5 shadow-[0_8px_24px_rgba(15,23,42,.05)] sm:px-6">
      <div className="mb-3 flex items-end justify-between gap-5">
        <div>
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[.14em] text-accent-400">À traiter</p>
          <h2 className="font-display text-xl font-bold tracking-tight text-ink">Points d’attention</h2>
        </div>
        <span className="rounded-full bg-panel px-2.5 py-1 text-[10px] font-bold text-muted">{items.length} priorité{items.length > 1 ? "s" : ""}</span>
      </div>

      {items.length === 0 ? (
        <p className="border-t border-line py-5 text-sm text-muted">Aucun élément ne nécessite d’attention.</p>
      ) : (
        <div className="border-t border-line">
          {items.slice(0, 6).map((item, index) => (
            <Link className="group grid min-h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-line px-2 py-3 transition hover:border-accent-400 hover:bg-panel" href={`/phases/${item.phaseId}`} key={`${item.projectId}-${item.phaseId}-${item.type}-${index}`}>
              <span className={`grid h-8 w-8 place-items-center rounded-lg ${item.severity === "HIGH" ? "bg-red-50 text-danger" : "bg-amber-50 text-warning"}`} aria-hidden="true">
                {item.severity === "HIGH" ? <AlertCircle size={16} /> : <Clock3 size={16} />}
              </span>
              <span className="grid min-w-0 gap-1">
                <small className="order-first text-[10px] font-bold uppercase tracking-[.06em] text-muted">{item.severity === "HIGH" ? "À corriger" : "À surveiller"} · {item.projectName}</small>
                <strong className="text-[13px] font-semibold leading-5 text-ink">{item.message}</strong>
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted transition group-hover:text-brand-900">Ouvrir <ArrowRight aria-hidden="true" size={15} /></span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function DashboardProgression({ projects }: { projects: ProjectDashboardCard[] }) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[.14em] text-accent-400">Portefeuille</p>
          <h2 className="font-display text-xl font-bold tracking-tight text-ink">Progression des projets</h2>
        </div>
        <Link className="inline-flex items-center gap-1 text-xs font-bold text-brand-900 hover:text-brand-950" href="/projects">Voir les projets <ArrowRight aria-hidden="true" size={14} /></Link>
      </div>
      <div className="border-t border-line">
        {projects.map((project) => (
          <Link className="group grid min-h-[72px] grid-cols-[minmax(140px,1fr)_minmax(100px,1.5fr)_42px_auto] items-center gap-4 rounded-lg border border-transparent border-b-line px-2 py-3 transition hover:border-accent-400 hover:bg-surface hover:shadow-[0_6px_16px_rgba(15,23,42,.05)]" href={`/projects/${project.id}`} key={project.id}>
            <span className="grid min-w-0 gap-1">
              <strong className="truncate text-[13px] font-semibold text-ink">{project.name}</strong>
              <small className="truncate text-[11px] text-muted">{project.phase ? `Phase ${project.phase.order} · ${project.phase.name}` : "Aucune phase active"}</small>
            </span>
            <span className="h-1.5 overflow-hidden rounded-full bg-line" aria-label={`${project.progress.percentage}% terminé`}>
              <span className="block h-full rounded-full bg-accent-400" style={{ width: `${project.progress.percentage}%` }} />
            </span>
            <strong className="text-right text-[13px] font-bold text-ink">{project.progress.percentage}%</strong>
            {project.phase && <StatusBadge status={project.phase.status} />}
          </Link>
        ))}
      </div>
    </section>
  );
}

function RecentValidations({ validations }: { validations: ProjectDashboardResult["recentValidations"] }) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[.14em] text-accent-400">Historique</p>
          <h2 className="font-display text-xl font-bold tracking-tight text-ink">Dernières validations</h2>
        </div>
        <span className="rounded-full bg-panel px-2.5 py-1 text-[10px] font-bold text-muted">{validations.length}</span>
      </div>

      {validations.length === 0 ? (
        <p className="border-t border-line py-5 text-sm text-muted">Aucune validation récente.</p>
      ) : (
        <div className="border-t border-line">
          {validations.map((validation) => (
            <Link className="group grid min-h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-line rounded-lg px-2 py-3 transition hover:border-accent-400 hover:bg-surface" href={`/phases/${validation.phaseId}`} key={validation.id}>
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-success" aria-hidden="true"><CircleCheck size={16} /></span>
              <span className="grid min-w-0 gap-1">
                <strong className="truncate text-[13px] font-semibold text-ink">{validation.phaseName}</strong>
                <small className="text-[11px] text-muted">
                  {validation.projectName} · {formatDate(validation.validatedAt)}
                </small>
                {validation.validatedBy && <small className="text-[11px] text-muted">par {validation.validatedBy}</small>}
              </span>
              <ArrowRight className="text-muted transition group-hover:text-brand-900" aria-hidden="true" size={15} />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
