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

  return <form className="inline-form option-form" onSubmit={submit}><div className="inline-form-grid"><label>Libellé<input value={label} onChange={(event) => setLabel(event.target.value)} /></label><label>Valeur<input value={value} onChange={(event) => setValue(event.target.value)} /></label></div><label>Ordre<input type="number" min="1" value={order} onChange={(event) => setOrder(event.target.value)} /></label>{(formError || error) && <div className="form-error">{formError || error}</div>}<div className="form-actions"><button className="button button-quiet" type="button" onClick={onCancel}>Annuler</button><button className="button button-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "..." : option ? "Enregistrer" : "Ajouter l’option"}</button></div></form>;
}