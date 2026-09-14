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

  return <form className="inline-form" onSubmit={submit}><label>Question<textarea rows={2} value={text} onChange={(event) => setText(event.target.value)} /></label><div className="inline-form-grid"><label>Type<select value={type} onChange={(event) => setType(event.target.value as Question["type"])}><option value="TEXT">Texte court</option><option value="LONG_TEXT">Texte long</option><option value="NUMBER">Nombre</option><option value="BOOLEAN">Oui / Non</option><option value="SINGLE_CHOICE">Choix unique</option><option value="MULTIPLE_CHOICE">Choix multiples</option><option value="DATE">Date</option></select></label><label>Ordre<input type="number" min="1" value={order} onChange={(event) => setOrder(event.target.value)} /></label></div><label>Objectif<span className="label-optional">Optionnel</span><select value={objectiveId} onChange={(event) => setObjectiveId(event.target.value)}><option value="">Sans objectif</option>{objectives.map((objective) => <option key={objective.id} value={objective.id}>{objective.name}</option>)}</select></label><label>Description<span className="label-optional">Optionnelle</span><textarea rows={2} value={description} onChange={(event) => setDescription(event.target.value)} /></label><label className="checkbox-label"><input type="checkbox" checked={required} onChange={(event) => setRequired(event.target.checked)} /> Réponse obligatoire</label>{(formError || error) && <div className="form-error">{formError || error}</div>}<div className="form-actions"><button className="button button-quiet" type="button" onClick={onCancel}>Annuler</button><button className="button button-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "..." : question ? "Enregistrer" : "Ajouter la question"}</button></div></form>;
}