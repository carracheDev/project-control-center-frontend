"use client";

import { FormEvent, useState } from "react";
import type { CreateOptionInput, QuestionOption } from "@/types/domain";

export function OptionForm({ option, nextOrder, isSubmitting, error, onSubmit, onCancel }: { option?: QuestionOption; nextOrder: number; isSubmitting: boolean; error: string | null; onSubmit: (input: CreateOptionInput) => Promise<void>; onCancel: () => void }) {
  const [label, setLabel] = useState(option?.label ?? "");
  const [value, setValue] = useState(option?.value ?? "");
  const [order, setOrder] = useState(String(option?.order ?? nextOrder));
  const [formError, setFormError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedOrder = Number(order);
    if (!label.trim() || !value.trim() || !Number.isInteger(parsedOrder) || parsedOrder < 1) { setFormError("Le libellé, la valeur et un ordre positif sont obligatoires."); return; }
    setFormError(null);
    await onSubmit({ label: label.trim(), value: value.trim(), order: parsedOrder });
  }

  return <form className="space-y-4 rounded-xl border border-line bg-panel p-4" onSubmit={submit}><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium text-ink">Libellé<input className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" value={label} onChange={(event) => setLabel(event.target.value)} /></label><label className="block text-sm font-medium text-ink">Valeur<input className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" value={value} onChange={(event) => setValue(event.target.value)} /></label></div><label className="block text-sm font-medium text-ink">Ordre<input className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" type="number" min="1" value={order} onChange={(event) => setOrder(event.target.value)} /></label>{(formError || error) && <div className="rounded-lg bg-red-50 p-3 text-sm text-danger">{formError || error}</div>}<div className="flex justify-end gap-3"><button className="px-3 py-2 text-sm font-semibold text-muted" type="button" onClick={onCancel}>Annuler</button><button className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" type="submit" disabled={isSubmitting}>{isSubmitting ? "..." : option ? "Enregistrer" : "Ajouter l’option"}</button></div></form>;
}