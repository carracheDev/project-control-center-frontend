"use client";

import { FormEvent, useState } from "react";
import type { CreatePhaseInput, Phase } from "@/types/domain";

interface PhaseFormProps {
  phase?: Phase;
  nextOrder: number;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (input: CreatePhaseInput) => Promise<void>;
  onCancel: () => void;
}

export function PhaseForm({ phase, nextOrder, isSubmitting, error, onSubmit, onCancel }: PhaseFormProps) {
  const [name, setName] = useState(phase?.name ?? "");
  const [description, setDescription] = useState(phase?.description ?? "");
  const [order, setOrder] = useState(String(phase?.order ?? nextOrder));
  const [deadline, setDeadline] = useState(phase?.deadline ? phase.deadline.slice(0, 10) : "");
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedOrder = Number(order);
    if (!name.trim() || !Number.isInteger(parsedOrder) || parsedOrder < 1) {
      setFormError("Un nom et un ordre entier supérieur à zéro sont obligatoires.");
      return;
    }
    setFormError(null);
    await onSubmit({ name: name.trim(), description: description.trim() || undefined, order: parsedOrder, deadline: deadline || undefined });
  }

  return (
    <form className="form-panel" onSubmit={handleSubmit}>
      <label>Nom de la phase<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex. Cadrage" /></label>
      <label>Description<span className="label-optional">Optionnelle</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Ce que cette phase doit établir" rows={3} /></label>
      <div className="form-grid">
        <label>Ordre<input type="number" min="1" value={order} onChange={(event) => setOrder(event.target.value)} /></label>
        <label>Deadline<span className="label-optional">Optionnelle</span><input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} /></label>
      </div>
      {(formError || error) && <div className="form-error">{formError || error}</div>}
      <div className="form-actions"><button className="button button-quiet" type="button" onClick={onCancel}>Annuler</button><button className="button button-primary" disabled={isSubmitting} type="submit">{isSubmitting ? "Enregistrement..." : phase ? "Enregistrer" : "Créer la phase"}</button></div>
    </form>
  );
}