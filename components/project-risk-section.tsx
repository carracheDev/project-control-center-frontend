"use client";

import { FormEvent, useEffect, useState } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { createProjectRisk, deleteRisk, getProjectMembers, getProjectRisks, updateRisk } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Phase, ProjectMember, Risk, RiskStatus } from "@/types/domain";

export function ProjectRiskSection({ projectId, phases }: { projectId: string; phases: Phase[] }) {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [riskToDelete, setRiskToDelete] = useState<Risk | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getProjectRisks(projectId), getProjectMembers(projectId)])
      .then(([loadedRisks, loadedMembers]) => { setRisks(loadedRisks); setMembers(loadedMembers); })
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setIsLoading(false));
  }, [projectId]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "").trim();
    if (!title) return;
    try {
      const created = await createProjectRisk(projectId, {
        title,
        description: String(form.get("description") || "").trim() || undefined,
        phaseId: String(form.get("phaseId") || "") || undefined,
        ownerId: String(form.get("ownerId") || "") || undefined,
        probability: Number(form.get("probability") || 3),
        impact: Number(form.get("impact") || 3),
        mitigation: String(form.get("mitigation") || "").trim() || undefined,
        deadline: String(form.get("deadline") || "") || undefined,
      });
      setRisks((items) => [created, ...items]);
      setSuccess(created.automation?.correctiveTaskCreated ? "Risque enregistré. Une tâche corrective haute priorité a été créée." : "Risque enregistré.");
      setIsAdding(false);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Impossible d'ajouter le risque"); }
  }

  async function changeStatus(risk: Risk, status: RiskStatus) {
    try { setRisks((items) => items.map((item) => item.id === risk.id ? { ...item, status } : item)); await updateRisk(risk.id, { status }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Impossible de mettre à jour le risque"); }
  }

  async function remove(risk: Risk) {
    setRiskToDelete(risk);
  }

  async function confirmRemove(risk: Risk) {
    setRiskToDelete(null);
    try { await deleteRisk(risk.id); setRisks((items) => items.filter((item) => item.id !== risk.id)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Impossible de supprimer le risque"); }
  }

  const openRisks = risks.filter((risk) => risk.status === "OPEN");
  return <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6">
    <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-muted">Pilotage des incertitudes</p><h2 className="mt-1 font-display text-xl font-semibold text-ink">Registre des risques <span className="text-muted">{openRisks.length} ouverts</span></h2></div><button className="inline-flex items-center gap-2 rounded-lg bg-brand-900 px-3 py-2 text-sm font-semibold text-white" type="button" onClick={() => setIsAdding((value) => !value)}><Plus size={15} /> Ajouter un risque</button></div>
    {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-danger">{error}</div>}
    {success && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-success">{success}</div>}
    {isAdding && <form className="mb-5 grid gap-3 rounded-xl border border-line bg-panel p-4 md:grid-cols-2" onSubmit={submit}><label className="text-sm font-medium text-ink md:col-span-2">Risque<input name="title" required className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" placeholder="Ex. Retard de validation client" /></label><label className="text-sm font-medium text-ink md:col-span-2">Description<textarea name="description" rows={2} className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" /></label><label className="text-sm font-medium text-ink">Phase<select name="phaseId" className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"><option value="">Projet entier</option>{phases.map((phase) => <option key={phase.id} value={phase.id}>{phase.order}. {phase.name}</option>)}</select></label><label className="text-sm font-medium text-ink">Responsable<select name="ownerId" className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"><option value="">Non assigné</option>{members.filter((member) => member.user.isActive).map((member) => <option key={member.userId} value={member.userId}>{member.user.email}</option>)}</select></label><label className="text-sm font-medium text-ink">Probabilité<select name="probability" defaultValue="3" className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm">{[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value} / 5</option>)}</select></label><label className="text-sm font-medium text-ink">Impact<select name="impact" defaultValue="3" className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm">{[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value} / 5</option>)}</select></label><label className="text-sm font-medium text-ink md:col-span-2">Plan de mitigation<textarea name="mitigation" rows={2} className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" /></label><label className="text-sm font-medium text-ink">Échéance<input name="deadline" type="date" className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" /></label><div className="flex items-end justify-end gap-3"><button type="button" className="px-3 py-2 text-sm font-semibold text-muted" onClick={() => setIsAdding(false)}>Annuler</button><button type="submit" className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-semibold text-white">Enregistrer</button></div></form>}
    {isLoading ? <p className="text-sm text-muted">Chargement des risques...</p> : risks.length === 0 ? <div className="border border-dashed border-line p-5 text-sm text-muted">Aucun risque enregistré.</div> : <div className="space-y-3">{risks.map((risk) => { const score = risk.probability * risk.impact; const tone = score >= 15 ? "border-red-200 bg-red-50" : score >= 8 ? "border-amber-200 bg-amber-50" : "border-line bg-panel"; return <article className={`rounded-xl border p-4 ${tone}`} key={risk.id}><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/70 text-danger"><AlertTriangle size={17} /></span><div><h3 className="font-semibold text-ink">{risk.title}</h3><p className="mt-1 text-xs text-muted">Score {score}/25 · {risk.phase?.name || "Projet entier"} · {risk.owner?.email || "Sans responsable"}</p></div></div><select aria-label={`Statut du risque ${risk.title}`} className="rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-ink" value={risk.status} onChange={(event) => void changeStatus(risk, event.target.value as RiskStatus)}><option value="OPEN">Ouvert</option><option value="MITIGATED">Mitigé</option><option value="ACCEPTED">Accepté</option><option value="CLOSED">Clos</option></select></div>{risk.description && <p className="mt-3 text-sm text-ink">{risk.description}</p>}{risk.mitigation && <p className="mt-3 border-l-2 border-accent-400 pl-3 text-sm text-muted"><strong>Mitigation :</strong> {risk.mitigation}</p>}<div className="mt-3 flex items-center justify-between text-xs text-muted"><span>{risk.deadline ? `Échéance ${formatDate(risk.deadline)}` : "Sans échéance"}</span><button type="button" className="text-danger hover:underline" onClick={() => void remove(risk)}>Supprimer</button></div></article>; })}</div>}
    <ConfirmDialog open={riskToDelete !== null} title="Supprimer ce risque ?" description={riskToDelete ? `Le risque « ${riskToDelete.title} » sera supprimé définitivement.` : ""} onCancel={() => setRiskToDelete(null)} onConfirm={() => riskToDelete && void confirmRemove(riskToDelete)} />
  </section>;
}
