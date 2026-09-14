"use client";

import { FormEvent, useState } from "react";
import type { CreateCriterionInput, Criterion, Objective } from "@/types/domain";

interface CriterionFormProps {
  criterion?: Criterion;
  objectives: Objective[];
  nextOrder: number;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (input: CreateCriterionInput) => Promise<void>;
  onCancel: () => void;
}

export function CriterionForm({ criterion, objectives, nextOrder, isSubmitting, error, onSubmit, onCancel }: CriterionFormProps) {
  const [name, setName] = useState(criterion?.name ?? "");
  const [description, setDescription] = useState(criterion?.description ?? "");
  const [objectiveId, setObjectiveId] = useState(criterion?.objectiveId ?? "");
  const [order, setOrder] = useState(String(criterion?.order ?? nextOrder));
  const [required, setRequired] = useState(criterion?.required ?? false);
  const [formError, setFormError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedOrder = Number(order);
    if (!name.trim() || !Number.isInteger(parsedOrder) || parsedOrder < 1) {
      setFormError("Un nom et un ordre entier supérieur à zéro sont obligatoires.");
      return;
    }
    setFormError(null);
    await onSubmit({ objectiveId: objectiveId || undefined, name: name.trim(), description: description.trim() || undefined, required, order: parsedOrder });
  }

  return <form className="inline-form" onSubmit={submit}><div className="inline-form-grid"><label>Nom<input value={name} onChange={(event) => setName(event.target.value)} /></label><label>Ordre<input type="number" min="1" value={order} onChange={(event) => setOrder(event.target.value)} /></label></div><label>Objectif<span className="label-optional">Optionnel</span><select value={objectiveId} onChange={(event) => setObjectiveId(event.target.value)}><option value="">Sans objectif</option>{objectives.map((objective) => <option key={objective.id} value={objective.id}>{objective.order}. {objective.name}</option>)}</select></label><label>Description<span className="label-optional">Optionnelle</span><textarea rows={2} value={description} onChange={(event) => setDescription(event.target.value)} /></label><label className="checkbox-label"><input type="checkbox" checked={required} onChange={(event) => setRequired(event.target.checked)} /> Critère obligatoire</label>{(formError || error) && <div className="form-error">{formError || error}</div>}<div className="form-actions"><button className="button button-quiet" type="button" onClick={onCancel}>Annuler</button><button className="button button-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "..." : criterion ? "Enregistrer" : "Ajouter le critère"}</button></div></form>;
}