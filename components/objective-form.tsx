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

  return <form className="inline-form" onSubmit={submit}><div className="inline-form-grid"><label>Nom<input value={name} onChange={(event) => setName(event.target.value)} /></label><label>Ordre<input type="number" min="1" value={order} onChange={(event) => setOrder(event.target.value)} /></label></div><label>Description<span className="label-optional">Optionnelle</span><textarea rows={2} value={description} onChange={(event) => setDescription(event.target.value)} /></label>{(formError || error) && <div className="form-error">{formError || error}</div>}<div className="form-actions"><button className="button button-quiet" type="button" onClick={onCancel}>Annuler</button><button className="button button-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "..." : objective ? "Enregistrer" : "Ajouter l’objectif"}</button></div></form>;
}