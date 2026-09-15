"use client";

import { FormEvent, useState } from "react";
import type { CreateObjectiveInput, Objective } from "@/types/domain";

interface ObjectiveFormProps {
  objective?: Objective;
  nextOrder: number;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (input: CreateObjectiveInput) => Promise<void>;
  onCancel: () => void;
}

export function ObjectiveForm({ objective, nextOrder, isSubmitting, error, onSubmit, onCancel }: ObjectiveFormProps) {
  const [name, setName] = useState(objective?.name ?? "");
  const [description, setDescription] = useState(objective?.description ?? "");
  const [order, setOrder] = useState(String(objective?.order ?? nextOrder));
  const [formError, setFormError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedOrder = Number(order);
    if (!name.trim() || !Number.isInteger(parsedOrder) || parsedOrder < 1) {
      setFormError("Un nom et un ordre entier supérieur à zéro sont obligatoires.");
      return;
    }
    setFormError(null);
    await onSubmit({ name: name.trim(), description: description.trim() || undefined, order: parsedOrder });
  }

  return <form className="space-y-4 rounded-xl border border-line bg-panel p-4" onSubmit={submit}><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium text-ink">Nom<input className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" value={name} onChange={(event) => setName(event.target.value)} /></label><label className="block text-sm font-medium text-ink">Ordre<input className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" type="number" min="1" value={order} onChange={(event) => setOrder(event.target.value)} /></label></div><label className="block text-sm font-medium text-ink">Description<span className="ml-2 text-xs font-normal text-muted">Optionnelle</span><textarea className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" rows={2} value={description} onChange={(event) => setDescription(event.target.value)} /></label>{(formError || error) && <div className="rounded-lg bg-red-50 p-3 text-sm text-danger">{formError || error}</div>}<div className="flex justify-end gap-3"><button className="px-3 py-2 text-sm font-semibold text-muted" type="button" onClick={onCancel}>Annuler</button><button className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" type="submit" disabled={isSubmitting}>{isSubmitting ? "..." : objective ? "Enregistrer" : "Ajouter l’objectif"}</button></div></form>;
}