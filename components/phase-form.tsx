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
    <form className="space-y-5 rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-7" onSubmit={handleSubmit}>
      <label className="block text-sm font-medium text-ink">Nom de la phase<input className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-900" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex. Cadrage" /></label>
      <label className="block text-sm font-medium text-ink">Description<span className="ml-2 text-xs font-normal text-muted">Optionnelle</span><textarea className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-900" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Ce que cette phase doit établir" rows={3} /></label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium text-ink">Ordre<input className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-900" type="number" min="1" value={order} onChange={(event) => setOrder(event.target.value)} /></label>
        <label className="block text-sm font-medium text-ink">Deadline<span className="ml-2 text-xs font-normal text-muted">Optionnelle</span><input className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-900" type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} /></label>
      </div>
      {(formError || error) && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-danger">{formError || error}</div>}
      <div className="flex flex-wrap justify-end gap-3 border-t border-line pt-5"><button className="rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:text-ink" type="button" onClick={onCancel}>Annuler</button><button className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-950 disabled:opacity-50" disabled={isSubmitting} type="submit">{isSubmitting ? "Enregistrement..." : phase ? "Enregistrer" : "Créer la phase"}</button></div>
    </form>
  );
}