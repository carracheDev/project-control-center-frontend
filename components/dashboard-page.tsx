"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Activity, AlertCircle, ArrowRight, BarChart3, CheckCircle2, CircleCheck, Clock3, FolderKanban, ListChecks, Plus, ShieldAlert, Sparkles, type LucideIcon } from "lucide-react";
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
    <main className="dashboard-canvas mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
      <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[.2em] text-cyan-300">Project Control Center / cockpit</p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">Vue d&apos;ensemble</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Le signal opérationnel de votre portefeuille, concentré en un seul espace.</p>
        </div>
        <Link className="dashboard-primary-action inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-slate-950 transition" href="/projects/new">
          <Plus aria-hidden="true" size={16} /> Nouveau projet
        </Link>
      </section>

      {error && <div className="mb-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">Impossible de charger le dashboard : {error}</div>}

      {isLoading ? (
        <LoadingState label="Chargement du dashboard..." />
      ) : (
        dashboard && (
          <div className="space-y-8">
            <DashboardSummary summary={dashboard.summary} />
            <DashboardAnalytics projects={dashboard.projects} />

            {dashboard.projects.length === 0 ? (
              <EmptyState
                title="Aucun projet n’est encore enregistré"
                description="Créez votre premier projet pour commencer à structurer les phases de travail."
                actionLabel="Créer un projet"
                actionHref="/projects/new"
              />
            ) : (
              <div className="grid gap-5">
                <DashboardAttention items={dashboard.attentionItems} />
                <div className="grid gap-9 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,.75fr)]">
                  <DashboardProgression projects={dashboard.projects} />
                  <RecentValidations validations={dashboard.recentValidations} />
                </div>
              </div>
            )}
          </div>
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
    ["Santé critique", summary.health.critical, "projets à arbitrer", ShieldAlert, "text-danger"],
    ["Risques critiques", summary.criticalRisks, "à traiter en priorité", ShieldAlert, "text-danger"],
  ];

  return (
    <section className="dashboard-bento dashboard-kpis grid gap-3 sm:grid-cols-2 lg:grid-cols-6" aria-label="Résumé global">
      {metrics.map(([label, value, note, Icon, iconColor]) => (
        <div className="dashboard-card will-change-transform flex min-h-[116px] items-center gap-3 rounded-2xl px-5 py-4 transition" key={label}>
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/5 ${iconColor}`} aria-hidden="true"><Icon size={15} strokeWidth={2} /></span>
          <span className="grid gap-1">
            <span className="text-xs font-semibold text-slate-400">{label}</span>
            <strong className="font-display text-3xl font-bold leading-none text-white">{value}</strong>
            <span className="text-[11px] text-slate-500">{note}</span>
          </span>
        </div>
      ))}
    </section>
  );
}

function DashboardAnalytics({ projects }: { projects: ProjectDashboardCard[] }) {
  const totals = projects.reduce((result, project) => ({
    tasks: result.tasks + project.tasks.total,
    doneTasks: result.doneTasks + project.tasks.done,
    blockedTasks: result.blockedTasks + project.tasks.blocked,
    criteria: result.criteria + project.criteria.required,
    satisfiedCriteria: result.satisfiedCriteria + project.criteria.satisfied,
    pendingCriteria: result.pendingCriteria + project.criteria.pending,
    risks: result.risks + project.risks.total,
    openRisks: result.openRisks + project.risks.open,
    criticalRisks: result.criticalRisks + project.risks.critical,
  }), { tasks: 0, doneTasks: 0, blockedTasks: 0, criteria: 0, satisfiedCriteria: 0, pendingCriteria: 0, risks: 0, openRisks: 0, criticalRisks: 0 });

  return <section className="dashboard-bento grid gap-4 lg:grid-cols-3" aria-label="Analyses du portefeuille">
    <AnalyticsPanel icon={BarChart3} eyebrow="Exécution" title="État des tâches">
      <MetricBar label="Terminées" value={totals.doneTasks} total={totals.tasks} tone="success" />
      <MetricBar label="Bloquées" value={totals.blockedTasks} total={totals.tasks} tone="danger" />
      <MetricBar label="À traiter" value={Math.max(0, totals.tasks - totals.doneTasks - totals.blockedTasks)} total={totals.tasks} tone="warning" />
    </AnalyticsPanel>
    <AnalyticsPanel icon={ShieldAlert} eyebrow="Exposition" title="Risques">
      <MetricBar label="Critiques" value={totals.criticalRisks} total={totals.risks} tone="danger" />
      <MetricBar label="Ouverts" value={totals.openRisks} total={totals.risks} tone="warning" />
      <MetricBar label="Maîtrisés" value={Math.max(0, totals.risks - totals.openRisks)} total={totals.risks} tone="success" />
    </AnalyticsPanel>
    <AnalyticsPanel icon={ListChecks} eyebrow="Validation" title="Critères obligatoires">
      <MetricBar label="Satisfaits" value={totals.satisfiedCriteria} total={totals.criteria} tone="success" />
      <MetricBar label="En attente" value={totals.pendingCriteria} total={totals.criteria} tone="warning" />
      <MetricBar label="Autres à corriger" value={Math.max(0, totals.criteria - totals.satisfiedCriteria - totals.pendingCriteria)} total={totals.criteria} tone="danger" />
    </AnalyticsPanel>
    <AnalyticsPanel icon={CheckCircle2} eyebrow="Avancement" title="Phases validées">
      {projects.length === 0 ? <p className="text-sm text-muted">Aucun projet à analyser.</p> : projects.map((project) => <MetricBar key={project.id} label={project.name} value={project.progress.completedPhases} total={project.progress.totalPhases} tone={project.health.status === "CRITICAL" ? "danger" : project.health.status === "AT_RISK" ? "warning" : "success"} />)}
    </AnalyticsPanel>
  </section>;
}

function AnalyticsPanel({ icon: Icon, eyebrow, title, children }: { icon: LucideIcon; eyebrow: string; title: string; children: React.ReactNode }) {
  return <section className="dashboard-card min-h-[220px] rounded-2xl p-6 transition"><div className="mb-5 flex items-start gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/5 text-cyan-300"><Icon size={14} /></span><div><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-cyan-300">{eyebrow}</p><h2 className="mt-1 font-display text-lg font-bold tracking-tight text-white">{title}</h2></div></div><div className="space-y-4">{children}</div></section>;
}

function MetricBar({ label, value, total, tone }: { label: string; value: number; total: number; tone: "success" | "warning" | "danger" }) {
  const width = total === 0 ? 0 : Math.round((value / total) * 100);
  const colors = { success: "bg-success", warning: "bg-accent-400", danger: "bg-danger" } as const;
  return <div><div className="mb-1 flex items-center justify-between gap-3 text-xs"><span className="truncate text-slate-400">{label}</span><strong className="shrink-0 text-white">{value} <span className="font-normal text-slate-500">({width}%)</span></strong></div><div className="h-2 overflow-hidden rounded-full bg-white/10"><span className={`block h-full rounded-full ${colors[tone]}`} style={{ width: `${width}%` }} /></div></div>;
}

function IntelligenceCard({ projects }: { projects: ProjectDashboardCard[] }) {
  const activeProject = projects.find((project) => project.phase);
  return <section className="dashboard-intelligence dashboard-card rounded-2xl p-6 lg:col-span-3" aria-label="PCC Intelligence">
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
      <div className="max-w-xl">
        <p className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.18em] text-fuchsia-300"><Sparkles size={14} /> PCC Intelligence</p>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-white">Le prochain signal utile est dans vos phases.</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">Ouvrez une phase pour obtenir une analyse contextualisée des critères, preuves, readiness et gating.</p>
      </div>
      {activeProject?.phase ? <Link className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-fuchsia-300/30 bg-fuchsia-300/10 px-4 py-3 text-sm font-semibold text-fuchsia-100 transition hover:border-fuchsia-200 hover:bg-fuchsia-300/20" href={`/phases/${activeProject.phase.id}`}><Sparkles size={15} /> Analyser {activeProject.phase.name}<ArrowRight size={15} /></Link> : <span className="self-start rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-500">Aucune phase active</span>}
    </div>
    <div className="mt-6 grid gap-3 border-t border-white/10 pt-5 text-xs text-slate-400 sm:grid-cols-3">
      <span>01 / Contexte projet</span><span>02 / Blocages et signaux</span><span>03 / Conseil avant validation</span>
    </div>
  </section>;
}

function DashboardAttention({ items }: { items: (DashboardAttentionItem & { projectId: string; projectName: string })[] }) {
  return (
    <section className="dashboard-card rounded-2xl border-l-4 border-l-cyan-300 px-5 pb-4 pt-5 sm:px-6">
      <div className="mb-3 flex items-end justify-between gap-5">
        <div>
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[.14em] text-accent-400">À traiter</p>
          <h2 className="font-display text-xl font-bold tracking-tight text-white">Points d’attention</h2>
        </div>
        <span className="rounded-full bg-panel px-2.5 py-1 text-[10px] font-bold text-muted">{items.length} priorité{items.length > 1 ? "s" : ""}</span>
      </div>

      {items.length === 0 ? (
        <div className="border-t border-white/10 py-6"><p className="text-sm font-medium text-white">Tout est sous contrôle</p><p className="mt-1 text-xs text-slate-400">Aucun élément ne nécessite d’attention pour le moment.</p></div>
      ) : (
        <div className="border-t border-white/10">
          {items.slice(0, 6).map((item, index) => (
            <Link className="group grid min-h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-white/10 px-2 py-3 transition hover:border-cyan-300/50 hover:bg-white/[.03]" href={attentionHref(item)} key={`${item.projectId}-${item.phaseId}-${item.type}-${item.target.id}-${index}`}>
              <span className={`grid h-8 w-8 place-items-center rounded-lg ${item.severity === "HIGH" ? "bg-red-50 text-danger" : "bg-amber-50 text-warning"}`} aria-hidden="true">
                {item.severity === "HIGH" ? <AlertCircle size={16} /> : <Clock3 size={16} />}
              </span>
              <span className="grid min-w-0 gap-1">
                <small className="order-first text-[10px] font-bold uppercase tracking-[.06em] text-muted">{item.severity === "HIGH" ? "À corriger" : "À surveiller"} · {item.projectName}</small>
                <strong className="text-[13px] font-semibold leading-5 text-slate-200">{item.message}</strong>
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 transition group-hover:text-cyan-300">Ouvrir <ArrowRight aria-hidden="true" size={15} /></span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function attentionHref(item: DashboardAttentionItem): string {
  const tabs = { TASK: "tasks", CRITERION: "criteria", COVERAGE: "overview", EVIDENCE: "evidence", PHASE: "overview" } as const;
  return `/phases/${item.phaseId}?tab=${tabs[item.target.type] ?? "overview"}&focus=${encodeURIComponent(item.target.id)}`;
}

function DashboardProgression({ projects }: { projects: ProjectDashboardCard[] }) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[.14em] text-accent-400">Portefeuille</p>
          <h2 className="font-display text-xl font-bold tracking-tight text-white">Progression des projets</h2>
        </div>
        <Link className="inline-flex items-center gap-1 text-xs font-bold text-cyan-300 hover:text-white" href="/projects">Voir les projets <ArrowRight aria-hidden="true" size={14} /></Link>
      </div>
      <div className="border-t border-white/10">
        {projects.map((project) => (
          <Link className="group grid min-h-[72px] grid-cols-[minmax(140px,1fr)_minmax(100px,1.5fr)_42px_auto] items-center gap-4 rounded-xl border border-transparent border-b-white/10 px-2 py-3 transition hover:border-cyan-300/40 hover:bg-white/[.03]" href={`/projects/${project.id}`} key={project.id}>
            <span className="grid min-w-0 gap-1">
              <strong className="truncate text-[13px] font-semibold text-slate-200">{project.name}</strong>
              <small className="truncate text-[11px] text-slate-500">{project.phase ? `Phase ${project.phase.order} · ${project.phase.name}` : "Aucune phase active"}</small>
            </span>
            <span className="h-1.5 overflow-hidden rounded-full bg-line" aria-label={`${project.progress.percentage}% terminé`}>
              <span className="block h-full rounded-full bg-accent-400" style={{ width: `${project.progress.percentage}%` }} />
            </span>
            <strong className="text-right text-[13px] font-bold text-white">{project.progress.percentage}%</strong>
            <HealthBadge health={project.health} />
            {project.phase && <StatusBadge status={project.phase.status} />}
          </Link>
        ))}
      </div>
    </section>
  );
}

function HealthBadge({ health }: { health: ProjectDashboardCard["health"] }) {
  const styles = {
    HEALTHY: "bg-emerald-50 text-success",
    AT_RISK: "bg-amber-50 text-warning",
    CRITICAL: "bg-red-50 text-danger",
  } as const;
  return <span className={`rounded px-2 py-1 text-[10px] font-bold ${styles[health.status]}`} title={`Score de santé : ${health.score}/100`}>{health.label}</span>;
}

function RecentValidations({ validations }: { validations: ProjectDashboardResult["recentValidations"] }) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[.14em] text-cyan-300">Historique</p>
          <h2 className="font-display text-xl font-bold tracking-tight text-white">Dernières validations</h2>
        </div>
        <span className="rounded-full bg-panel px-2.5 py-1 text-[10px] font-bold text-muted">{validations.length}</span>
      </div>

      {validations.length === 0 ? (
        <p className="border-t border-white/10 py-5 text-sm text-slate-400">Aucune validation récente.</p>
      ) : (
        <div className="border-t border-white/10">
          {validations.map((validation) => (
            <Link className="group grid min-h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border-b border-white/10 px-2 py-3 transition hover:border-cyan-300/40 hover:bg-white/[.03]" href={`/phases/${validation.phaseId}`} key={validation.id}>
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-success" aria-hidden="true"><CircleCheck size={16} /></span>
              <span className="grid min-w-0 gap-1">
                <strong className="truncate text-[13px] font-semibold text-slate-200">{validation.phaseName}</strong>
                <small className="text-[11px] text-slate-500">
                  {validation.projectName} · {formatDate(validation.validatedAt)}
                </small>
                {validation.validatedBy && <small className="text-[11px] text-slate-500">par {validation.validatedBy}</small>}
              </span>
              <ArrowRight className="text-muted transition group-hover:text-brand-900" aria-hidden="true" size={15} />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
