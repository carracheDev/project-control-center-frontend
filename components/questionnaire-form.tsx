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

  return <form className="space-y-4 rounded-xl border border-line bg-panel p-4" onSubmit={submit}><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium text-ink">Nom<input className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" value={name} onChange={(event) => setName(event.target.value)} /></label><label className="block text-sm font-medium text-ink">Version<input className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" type="number" min="1" value={version} onChange={(event) => setVersion(event.target.value)} /></label></div><label className="block text-sm font-medium text-ink">Statut<select className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" value={status} onChange={(event) => setStatus(event.target.value as Questionnaire["status"])}><option value="DRAFT">Brouillon</option><option value="ACTIVE">Actif</option><option value="ARCHIVED">Archivé</option></select></label><label className="block text-sm font-medium text-ink">Description<textarea className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" rows={2} value={description} onChange={(event) => setDescription(event.target.value)} /></label>{(formError || error) && <div className="rounded-lg bg-red-50 p-3 text-sm text-danger">{formError || error}</div>}<div className="flex justify-end gap-3"><button className="px-3 py-2 text-sm font-semibold text-muted" type="button" onClick={onCancel}>Annuler</button><button className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" type="submit" disabled={isSubmitting}>{isSubmitting ? "..." : questionnaire ? "Enregistrer" : "Créer le questionnaire"}</button></div></form>;
}