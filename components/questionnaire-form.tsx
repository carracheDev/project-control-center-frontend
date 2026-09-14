"use client";

import { FormEvent, useState } from "react";
import type { CreateQuestionnaireInput, Questionnaire } from "@/types/domain";

export function QuestionnaireForm({ questionnaire, isSubmitting, error, onSubmit, onCancel }: { questionnaire?: Questionnaire; isSubmitting: boolean; error: string | null; onSubmit: (input: CreateQuestionnaireInput) => Promise<void>; onCancel: () => void }) {
  const [name, setName] = useState(questionnaire?.name ?? "");
  const [description, setDescription] = useState(questionnaire?.description ?? "");
  const [version, setVersion] = useState(String(questionnaire?.version ?? 1));
  const [status, setStatus] = useState(questionnaire?.status ?? "DRAFT");
  const [formError, setFormError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedVersion = Number(version);
    if (!name.trim() || !Number.isInteger(parsedVersion) || parsedVersion < 1) { setFormError("Un nom et une version entière positive sont obligatoires."); return; }
    setFormError(null);
    await onSubmit({ name: name.trim(), description: description.trim() || undefined, version: parsedVersion, status });
  }

  return <form className="inline-form" onSubmit={submit}><div className="inline-form-grid"><label>Nom<input value={name} onChange={(event) => setName(event.target.value)} /></label><label>Version<input type="number" min="1" value={version} onChange={(event) => setVersion(event.target.value)} /></label></div><label>Statut<select value={status} onChange={(event) => setStatus(event.target.value as Questionnaire["status"])}><option value="DRAFT">Brouillon</option><option value="ACTIVE">Actif</option><option value="ARCHIVED">Archivé</option></select></label><label>Description<span className="label-optional">Optionnelle</span><textarea rows={2} value={description} onChange={(event) => setDescription(event.target.value)} /></label>{(formError || error) && <div className="form-error">{formError || error}</div>}<div className="form-actions"><button className="button button-quiet" type="button" onClick={onCancel}>Annuler</button><button className="button button-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "..." : questionnaire ? "Enregistrer" : "Créer le questionnaire"}</button></div></form>;
}