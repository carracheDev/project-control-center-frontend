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

  return <section className="content-section decision-section">
    <div className="section-heading"><div><p className="eyebrow">Choix humain explicite</p><h2>Décision du projet</h2></div><button className="button button-primary" type="button" onClick={() => setIsAdding((current) => !current)}>Enregistrer une décision</button></div>
    {error && <div className="alert alert-error" role="alert">{error}</div>}
    {isAdding && <form className="decision-form" onSubmit={submit}><fieldset disabled={isSubmitting}><legend>Nouvelle décision</legend><div className="decision-type-options"><label><input type="radio" name="type" value="GO" defaultChecked /> GO</label><label><input type="radio" name="type" value="PIVOT" /> PIVOT</label><label><input type="radio" name="type" value="NO_GO" /> NO-GO</label></div><label>Justification<textarea name="rationale" required rows={4} placeholder="Pourquoi cette décision est-elle prise ?" /></label><label>Prochaines étapes<span className="label-optional">Optionnelles</span><textarea name="nextSteps" rows={3} placeholder="Actions décidées après ce choix" /></label><label>Décidé par<span className="label-optional">Optionnel</span><input name="decidedBy" placeholder="Nom ou rôle" /></label><div className="form-actions"><button className="button button-quiet" type="button" onClick={() => setIsAdding(false)}>Annuler</button><button className="button button-primary" type="submit">{isSubmitting ? "Enregistrement..." : "Enregistrer"}</button></div></fieldset></form>}
    <DecisionFactSummary dashboard={dashboard} isLoading={isLoading} />
    {decisions.length === 0 ? <p className="decision-empty">Aucune décision enregistrée.</p> : <div className="decision-history">{decisions.map((decision) => <article className={`decision-card decision-${decision.type.toLowerCase()}`} key={decision.id}><div className="decision-card-heading"><strong>{decision.type === "NO_GO" ? "NO-GO" : decision.type}</strong><span>{formatDate(decision.decidedAt)}</span></div><p>{decision.rationale}</p>{decision.decidedBy && <small>Décidé par {decision.decidedBy}</small>}{decision.nextSteps && <div className="decision-next-steps"><b>Prochaines étapes</b><span>{decision.nextSteps}</span></div>}<details><summary>Snapshot factuel</summary><div className="decision-snapshot"><span>Phases validées <b>{decision.reportSnapshot.phaseSummary.validated}/{decision.reportSnapshot.phaseSummary.total}</b></span><span>Progression <b>{decision.reportSnapshot.progress.percentage}%</b></span><span>Critères satisfaits <b>{decision.reportSnapshot.criteriaSummary.satisfied}/{decision.reportSnapshot.criteriaSummary.required}</b></span><span>Tâches bloquées <b>{decision.reportSnapshot.taskSummary.blocked}</b></span><span>Interviews complétées <b>{decision.reportSnapshot.interviewSummary.completed}/{decision.reportSnapshot.interviewSummary.total}</b></span><span>Evidences vérifiées <b>{decision.reportSnapshot.evidenceSummary.verified}/{decision.reportSnapshot.evidenceSummary.total}</b></span></div></details></article>)}</div>}
  </section>;
}

function DecisionFactSummary({ dashboard, isLoading }: { dashboard: ProjectDashboardResult | null; isLoading: boolean }) {
  const project = dashboard?.projects[0];
  return <div className="decision-facts"><div><span>Progression</span><strong>{isLoading ? "—" : `${project?.progress.percentage ?? 0}%`}</strong></div><div><span>Phases validées</span><strong>{isLoading ? "—" : `${project?.progress.completedPhases ?? 0}/${project?.progress.totalPhases ?? 0}`}</strong></div><div><span>Blockers</span><strong>{isLoading ? "—" : project?.attention.items.filter((item) => item.severity === "HIGH").length ?? 0}</strong></div><div><span>Interviews</span><strong>{isLoading ? "—" : `${project?.interviews.completed ?? 0}/${project?.interviews.total ?? 0}`}</strong></div><div><span>Critères</span><strong>{isLoading ? "—" : `${project?.criteria.satisfied ?? 0}/${project?.criteria.required ?? 0}`}</strong></div><div><span>Coverage</span><strong>{isLoading ? "—" : `${project?.coverage.satisfied ?? 0}/${project?.coverage.required ?? 0}`}</strong></div></div>;
}