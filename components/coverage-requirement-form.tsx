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

  return <form className="inline-form" onSubmit={submit}><label>Nom<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex. Comprendre le problème" /></label><label>Description<span className="label-optional">Optionnelle</span><textarea rows={2} value={description} onChange={(event) => setDescription(event.target.value)} /></label><div className="inline-form-grid"><label>Objective associé<span className="label-optional">Optionnel</span><select value={objectiveId} onChange={(event) => setObjectiveId(event.target.value)}><option value="">Couverture de phase</option>{objectives.map((objective) => <option key={objective.id} value={objective.id}>{objective.name}</option>)}</select></label><label>Minimum d’interviews<input type="number" min="1" value={minimumInterviews} onChange={(event) => setMinimumInterviews(event.target.value)} /></label></div><label className="checkbox-label"><input type="checkbox" checked={required} onChange={(event) => setRequired(event.target.checked)} /> Requirement obligatoire</label>{(formError || error) && <div className="form-error">{formError || error}</div>}<div className="form-actions"><button className="button button-quiet" type="button" onClick={onCancel}>Annuler</button><button className="button button-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "..." : requirement ? "Enregistrer" : "Ajouter le requirement"}</button></div></form>;
}