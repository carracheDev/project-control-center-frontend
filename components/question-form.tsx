"use client";

import { FormEvent, useState } from "react";
import type { CreateQuestionInput, Objective, Question } from "@/types/domain";

export function QuestionForm({ question, objectives, nextOrder, isSubmitting, error, onSubmit, onCancel }: { question?: Question; objectives: Objective[]; nextOrder: number; isSubmitting: boolean; error: string | null; onSubmit: (input: CreateQuestionInput) => Promise<void>; onCancel: () => void }) {
  const [text, setText] = useState(question?.text ?? "");
  const [description, setDescription] = useState(question?.description ?? "");
  const [type, setType] = useState(question?.type ?? "TEXT");
  const [required, setRequired] = useState(question?.required ?? false);
  const [order, setOrder] = useState(String(question?.order ?? nextOrder));
  const [objectiveId, setObjectiveId] = useState(question?.objectiveId ?? "");
  const [formError, setFormError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedOrder = Number(order);
    if (!text.trim() || !Number.isInteger(parsedOrder) || parsedOrder < 1) { setFormError("Le texte et un ordre entier positif sont obligatoires."); return; }
    setFormError(null);
    await onSubmit({ text: text.trim(), description: description.trim() || undefined, type, required, order: parsedOrder, objectiveId: objectiveId || undefined });
  }

  return <form className="space-y-4 rounded-xl border border-line bg-panel p-4" onSubmit={submit}><label className="block text-sm font-medium text-ink">Question<textarea className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" rows={2} value={text} onChange={(event) => setText(event.target.value)} /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium text-ink">Type<select className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" value={type} onChange={(event) => setType(event.target.value as Question["type"])}><option value="TEXT">Texte court</option><option value="LONG_TEXT">Texte long</option><option value="NUMBER">Nombre</option><option value="BOOLEAN">Oui / Non</option><option value="SINGLE_CHOICE">Choix unique</option><option value="MULTIPLE_CHOICE">Choix multiples</option><option value="DATE">Date</option></select></label><label className="block text-sm font-medium text-ink">Ordre<input className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" type="number" min="1" value={order} onChange={(event) => setOrder(event.target.value)} /></label></div><label className="block text-sm font-medium text-ink">Objectif<span className="ml-2 text-xs font-normal text-muted">Optionnel</span><select className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" value={objectiveId} onChange={(event) => setObjectiveId(event.target.value)}><option value="">Sans objectif</option>{objectives.map((objective) => <option key={objective.id} value={objective.id}>{objective.name}</option>)}</select></label><label className="block text-sm font-medium text-ink">Description<span className="ml-2 text-xs font-normal text-muted">Optionnelle</span><textarea className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" rows={2} value={description} onChange={(event) => setDescription(event.target.value)} /></label><label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={required} onChange={(event) => setRequired(event.target.checked)} /> Réponse obligatoire</label>{(formError || error) && <div className="rounded-lg bg-red-50 p-3 text-sm text-danger">{formError || error}</div>}<div className="flex justify-end gap-3"><button className="px-3 py-2 text-sm font-semibold text-muted" type="button" onClick={onCancel}>Annuler</button><button className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" type="submit" disabled={isSubmitting}>{isSubmitting ? "..." : question ? "Enregistrer" : "Ajouter la question"}</button></div></form>;
}