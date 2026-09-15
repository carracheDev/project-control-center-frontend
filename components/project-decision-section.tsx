"use client";

import { FormEvent, useEffect, useState } from "react";
import { getDashboard, createProjectDecision, getProjectDecisions } from "@/lib/api";
import type { DecisionType, ProjectDashboardResult, ProjectDecision } from "@/types/domain";
import { formatDate } from "@/lib/format";

export function ProjectDecisionSection({ projectId }: { projectId: string }) {
  const [decisions, setDecisions] = useState<ProjectDecision[]>([]);
  const [dashboard, setDashboard] = useState<ProjectDashboardResult | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    Promise.all([getProjectDecisions(projectId), getDashboard(projectId)])
      .then(([loadedDecisions, loadedDashboard]) => {
        if (!isMounted) return;
        setDecisions(loadedDecisions);
        setDashboard(loadedDashboard);
      })
      .catch((requestError: Error) => { if (isMounted) setError(requestError.message); })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [projectId]);

  async function refresh() {
    const [loadedDecisions, loadedDashboard] = await Promise.all([getProjectDecisions(projectId), getDashboard(projectId)]);
    setDecisions(loadedDecisions);
    setDashboard(loadedDashboard);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const rationale = String(form.get("rationale") || "").trim();
    if (!rationale) {
      setError("Une justification est obligatoire.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await createProjectDecision(projectId, {
        type: String(form.get("type") || "GO") as DecisionType,
        rationale,
        nextSteps: String(form.get("nextSteps") || "").trim() || undefined,
        decidedBy: String(form.get("decidedBy") || "").trim() || undefined,
      });
      await refresh();
      setIsAdding(false);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Impossible d’enregistrer la décision");
    } finally {
      setIsSubmitting(false);
    }
  }

  return <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6">
    <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-muted">Choix humain explicite</p><h2 className="mt-1 font-display text-xl font-semibold text-ink">Décision du projet</h2></div><button className="rounded-lg bg-brand-900 px-3 py-2 text-sm font-semibold text-white" type="button" onClick={() => setIsAdding((current) => !current)}>Enregistrer une décision</button></div>
    {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-danger" role="alert">{error}</div>}
    {isAdding && <form className="mb-5 rounded-xl border border-line bg-panel p-4" onSubmit={submit}><fieldset className="space-y-4" disabled={isSubmitting}><legend className="font-semibold text-ink">Nouvelle décision</legend><div className="flex flex-wrap gap-4 text-sm text-ink"><label className="flex items-center gap-2"><input type="radio" name="type" value="GO" defaultChecked /> GO</label><label className="flex items-center gap-2"><input type="radio" name="type" value="PIVOT" /> PIVOT</label><label className="flex items-center gap-2"><input type="radio" name="type" value="NO_GO" /> NO-GO</label></div><label className="block text-sm font-medium text-ink">Justification<textarea className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" name="rationale" required rows={4} placeholder="Pourquoi cette décision est-elle prise ?" /></label><label className="block text-sm font-medium text-ink">Prochaines étapes<textarea className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" name="nextSteps" rows={3} placeholder="Actions décidées après ce choix" /></label><label className="block text-sm font-medium text-ink">Décidé par<input className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" name="decidedBy" placeholder="Nom ou rôle" /></label><div className="flex justify-end gap-3"><button className="px-3 py-2 text-sm font-semibold text-muted" type="button" onClick={() => setIsAdding(false)}>Annuler</button><button className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-semibold text-white" type="submit">{isSubmitting ? "Enregistrement..." : "Enregistrer"}</button></div></fieldset></form>}
    <DecisionFactSummary dashboard={dashboard} isLoading={isLoading} />
    {decisions.length === 0 ? <p className="border-t border-line py-5 text-sm text-muted">Aucune décision enregistrée.</p> : <div className="space-y-3">{decisions.map((decision) => <article className="rounded-xl border border-line bg-panel p-4" key={decision.id}><div className="flex justify-between gap-3"><strong className="text-sm text-ink">{decision.type === "NO_GO" ? "NO-GO" : decision.type}</strong><span className="text-xs text-muted">{formatDate(decision.decidedAt)}</span></div><p className="mt-3 text-sm leading-6 text-ink">{decision.rationale}</p>{decision.decidedBy && <small className="mt-2 block text-xs text-muted">Décidé par {decision.decidedBy}</small>}{decision.nextSteps && <div className="mt-3 border-l-2 border-accent-400 pl-3 text-sm"><b className="block text-ink">Prochaines étapes</b><span className="text-muted">{decision.nextSteps}</span></div>}<details className="mt-4 text-xs text-muted"><summary className="cursor-pointer font-semibold text-brand-900">Snapshot factuel</summary><div className="mt-3 grid gap-2 sm:grid-cols-2"><span>Phases validées <b>{decision.reportSnapshot.phaseSummary.validated}/{decision.reportSnapshot.phaseSummary.total}</b></span><span>Progression <b>{decision.reportSnapshot.progress.percentage}%</b></span><span>Critères satisfaits <b>{decision.reportSnapshot.criteriaSummary.satisfied}/{decision.reportSnapshot.criteriaSummary.required}</b></span><span>Tâches bloquées <b>{decision.reportSnapshot.taskSummary.blocked}</b></span><span>Interviews complétées <b>{decision.reportSnapshot.interviewSummary.completed}/{decision.reportSnapshot.interviewSummary.total}</b></span><span>Evidences vérifiées <b>{decision.reportSnapshot.evidenceSummary.verified}/{decision.reportSnapshot.evidenceSummary.total}</b></span></div></details></article>)}</div>}
  </section>;
}

function DecisionFactSummary({ dashboard, isLoading }: { dashboard: ProjectDashboardResult | null; isLoading: boolean }) {
  const project = dashboard?.projects[0];
  return <div className="mb-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">{[["Progression", isLoading ? "—" : `${project?.progress.percentage ?? 0}%`], ["Phases validées", isLoading ? "—" : `${project?.progress.completedPhases ?? 0}/${project?.progress.totalPhases ?? 0}`], ["Blockers", isLoading ? "—" : project?.attention.items.filter((item) => item.severity === "HIGH").length ?? 0], ["Interviews", isLoading ? "—" : `${project?.interviews.completed ?? 0}/${project?.interviews.total ?? 0}`], ["Critères", isLoading ? "—" : `${project?.criteria.satisfied ?? 0}/${project?.criteria.required ?? 0}`], ["Coverage", isLoading ? "—" : `${project?.coverage.satisfied ?? 0}/${project?.coverage.required ?? 0}`]].map(([label, value]) => <div className="bg-surface p-3" key={label}><span className="block text-[11px] text-muted">{label}</span><strong className="mt-1 block text-sm text-ink">{value}</strong></div>)}</div>;
}