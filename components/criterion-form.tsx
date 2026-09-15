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

  return <form className="space-y-4 rounded-xl border border-line bg-panel p-4" onSubmit={submit}><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium text-ink">Nom<input className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" value={name} onChange={(event) => setName(event.target.value)} /></label><label className="block text-sm font-medium text-ink">Ordre<input className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" type="number" min="1" value={order} onChange={(event) => setOrder(event.target.value)} /></label></div><label className="block text-sm font-medium text-ink">Objectif<span className="ml-2 text-xs font-normal text-muted">Optionnel</span><select className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" value={objectiveId} onChange={(event) => setObjectiveId(event.target.value)}><option value="">Sans objectif</option>{objectives.map((objective) => <option key={objective.id} value={objective.id}>{objective.order}. {objective.name}</option>)}</select></label><label className="block text-sm font-medium text-ink">Description<span className="ml-2 text-xs font-normal text-muted">Optionnelle</span><textarea className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" rows={2} value={description} onChange={(event) => setDescription(event.target.value)} /></label><label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={required} onChange={(event) => setRequired(event.target.checked)} /> Critère obligatoire</label>{(formError || error) && <div className="rounded-lg bg-red-50 p-3 text-sm text-danger">{formError || error}</div>}<div className="flex justify-end gap-3"><button className="px-3 py-2 text-sm font-semibold text-muted" type="button" onClick={onCancel}>Annuler</button><button className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" type="submit" disabled={isSubmitting}>{isSubmitting ? "..." : criterion ? "Enregistrer" : "Ajouter le critère"}</button></div></form>;
}