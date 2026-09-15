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
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[.14em] text-amber-700">Pilotage multi-projets</p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-slate-950">Vue d&apos;ensemble</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Voici l’état actuel de vos projets, phases et prochaines actions à traiter.</p>
        </div>
        <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-950 px-4 text-sm font-semibold text-white transition hover:bg-brand-900" href="/projects/new">
          <span aria-hidden="true">+</span> Nouveau projet
        </Link>
      </section>

      {error && <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">Impossible de charger le dashboard : {error}</div>}

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
  const metrics = [
    ["Projets", summary.totalProjects, "dans votre portefeuille"],
    ["En cours", summary.activeProjects, "à suivre maintenant"],
    ["À traiter", summary.projectsNeedingAttention, "demandent une décision"],
    ["Terminés", summary.completedProjects, "validation complète"],
  ];

  return (
    <section className="grid overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,.05)] sm:grid-cols-2 lg:grid-cols-4" aria-label="Résumé global">
      {metrics.map(([label, value, note]) => (
        <div className="grid min-h-24 content-center gap-1 border-b border-slate-200 px-5 py-4 last:border-b-0 sm:[&:nth-child(even)]:border-l lg:border-b-0 lg:border-l lg:first:border-l-0" key={label}>
          <span className="text-xs font-semibold text-slate-800">{label}</span>
          <strong className="font-display text-2xl font-bold text-slate-950">{value}</strong>
          <span className="text-[11px] text-slate-500">{note}</span>
        </div>
      ))}
    </section>
  );
}

function DashboardAttention({ items }: { items: (DashboardAttentionItem & { projectId: string; projectName: string })[] }) {
  return (
    <section className="rounded-xl border border-slate-200 border-l-4 border-l-accent-400 bg-white px-5 pb-3 pt-5 shadow-[0_8px_24px_rgba(15,23,42,.05)] sm:px-6">
      <div className="mb-3 flex items-end justify-between gap-5">
        <div>
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[.14em] text-amber-700">À traiter</p>
          <h2 className="font-display text-xl font-bold tracking-tight text-slate-950">Points d’attention</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">{items.length} priorité{items.length > 1 ? "s" : ""}</span>
      </div>

      {items.length === 0 ? (
        <p className="border-t border-slate-200 py-5 text-sm text-slate-500">Aucun élément ne nécessite d’attention.</p>
      ) : (
        <div className="border-t border-slate-200">
          {items.slice(0, 6).map((item, index) => (
            <Link className="grid min-h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-slate-200 py-3 transition hover:bg-slate-50" href={`/phases/${item.phaseId}`} key={`${item.projectId}-${item.phaseId}-${item.type}-${index}`}>
              <span className={`grid h-6 w-6 place-items-center rounded-md text-xs font-bold ${item.severity === "HIGH" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-700"}`} aria-hidden="true">
                {item.severity === "HIGH" ? "!" : "·"}
              </span>
              <span className="grid min-w-0 gap-1">
                <small className="order-first text-[10px] font-bold uppercase tracking-[.06em] text-slate-400">{item.severity === "HIGH" ? "À corriger" : "À surveiller"} · {item.projectName}</small>
                <strong className="text-[13px] font-semibold leading-5 text-slate-800">{item.message}</strong>
              </span>
              <span className="text-lg text-slate-400" aria-hidden="true">
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
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[.14em] text-amber-700">Portefeuille</p>
          <h2 className="font-display text-xl font-bold tracking-tight text-slate-950">Progression des projets</h2>
        </div>
        <Link className="text-xs font-bold text-blue-600 hover:text-blue-800" href="/projects">Voir les projets <span aria-hidden="true">→</span></Link>
      </div>
      <div className="border-t border-slate-200">
        {projects.map((project) => (
          <Link className="grid min-h-[72px] grid-cols-[minmax(140px,1fr)_minmax(100px,1.5fr)_42px_auto] items-center gap-4 border-b border-slate-200 px-1 py-3 transition hover:bg-white" href={`/projects/${project.id}`} key={project.id}>
            <span className="grid min-w-0 gap-1">
              <strong className="truncate text-[13px] font-semibold text-slate-800">{project.name}</strong>
              <small className="truncate text-[11px] text-slate-500">{project.phase ? `Phase ${project.phase.order} · ${project.phase.name}` : "Aucune phase active"}</small>
            </span>
            <span className="h-1.5 overflow-hidden rounded-full bg-slate-200" aria-label={`${project.progress.percentage}% terminé`}>
              <span className="block h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300" style={{ width: `${project.progress.percentage}%` }} />
            </span>
            <strong className="text-right text-[13px] font-bold text-slate-700">{project.progress.percentage}%</strong>
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
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[.14em] text-amber-700">Historique</p>
          <h2 className="font-display text-xl font-bold tracking-tight text-slate-950">Dernières validations</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">{validations.length}</span>
      </div>

      {validations.length === 0 ? (
        <p className="border-t border-slate-200 py-5 text-sm text-slate-500">Aucune validation récente.</p>
      ) : (
        <div className="border-t border-slate-200">
          {validations.map((validation) => (
            <Link className="grid min-h-16 grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border-b border-slate-200 py-3 transition hover:bg-white" href={`/phases/${validation.phaseId}`} key={validation.id}>
              <span className="grid h-6 w-6 place-items-center rounded-md bg-emerald-50 text-xs font-bold text-emerald-700" aria-hidden="true">
                ✓
              </span>
              <span className="grid min-w-0 gap-1">
                <strong className="truncate text-[13px] font-semibold text-slate-800">{validation.phaseName}</strong>
                <small className="text-[11px] text-slate-500">
                  {validation.projectName} · {formatDate(validation.validatedAt)}
                </small>
                {validation.validatedBy && <small className="text-[11px] text-slate-400">par {validation.validatedBy}</small>}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
