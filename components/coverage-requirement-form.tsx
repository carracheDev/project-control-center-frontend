"use client";

import { FormEvent, useState } from "react";
import type { CreateCoverageRequirementInput, CoverageRequirement, Objective } from "@/types/domain";

export function CoverageRequirementForm({ requirement, objectives, isSubmitting, error, onSubmit, onCancel }: { requirement?: CoverageRequirement; objectives: Objective[]; isSubmitting: boolean; error: string | null; onSubmit: (input: CreateCoverageRequirementInput) => Promise<void>; onCancel: () => void }) {
  const [name, setName] = useState(requirement?.name ?? "");
  const [description, setDescription] = useState(requirement?.description ?? "");
  const [objectiveId, setObjectiveId] = useState(requirement?.objectiveId ?? "");
  const [minimumInterviews, setMinimumInterviews] = useState(String(requirement?.minimumInterviews ?? 1));
  const [required, setRequired] = useState(requirement?.required ?? true);
  const [formError, setFormError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const minimum = Number(minimumInterviews);
    if (!name.trim() || !Number.isInteger(minimum) || minimum < 1) { setFormError("Un nom et un minimum d’interviews entier positif sont obligatoires."); return; }
    setFormError(null);
    await onSubmit({ name: name.trim(), description: description.trim() || undefined, objectiveId: objectiveId || undefined, minimumInterviews: minimum, required });
  }

  return <form className="space-y-4 rounded-xl border border-line bg-panel p-4" onSubmit={submit}><label className="block text-sm font-medium text-ink">Nom<input className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex. Comprendre le problème" /></label><label className="block text-sm font-medium text-ink">Description<span className="ml-2 text-xs font-normal text-muted">Optionnelle</span><textarea className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" rows={2} value={description} onChange={(event) => setDescription(event.target.value)} /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium text-ink">Objective associé<span className="ml-2 text-xs font-normal text-muted">Optionnel</span><select className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" value={objectiveId} onChange={(event) => setObjectiveId(event.target.value)}><option value="">Couverture de phase</option>{objectives.map((objective) => <option key={objective.id} value={objective.id}>{objective.name}</option>)}</select></label><label className="block text-sm font-medium text-ink">Minimum d’interviews<input className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" type="number" min="1" value={minimumInterviews} onChange={(event) => setMinimumInterviews(event.target.value)} /></label></div><label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={required} onChange={(event) => setRequired(event.target.checked)} /> Requirement obligatoire</label>{(formError || error) && <div className="rounded-lg bg-red-50 p-3 text-sm text-danger">{formError || error}</div>}<div className="flex justify-end gap-3"><button className="px-3 py-2 text-sm font-semibold text-muted" type="button" onClick={onCancel}>Annuler</button><button className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" type="submit" disabled={isSubmitting}>{isSubmitting ? "..." : requirement ? "Enregistrer" : "Ajouter le requirement"}</button></div></form>;
}