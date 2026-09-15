"use client";

import { FormEvent, useState } from "react";
import type { CreateProjectInput, Project } from "@/types/domain";

interface ProjectFormProps {
  project?: Project;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (input: CreateProjectInput) => Promise<void>;
  onCancel: () => void;
}

function dateValue(date: string | null | undefined) {
  return date ? date.slice(0, 10) : "";
}

export function ProjectForm({ project, isSubmitting, error, onSubmit, onCancel }: ProjectFormProps) {
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [startDate, setStartDate] = useState(dateValue(project?.startDate));
  const [endDate, setEndDate] = useState(dateValue(project?.endDate));
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setFormError("Le nom du projet est obligatoire.");
      return;
    }
    setFormError(null);
    await onSubmit({ name: name.trim(), description: description.trim() || undefined, startDate: startDate || undefined, endDate: endDate || undefined });
  }

  return (
    <form className="space-y-5 rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-7" onSubmit={handleSubmit}>
      <label className="block text-sm font-medium text-ink">Nom du projet<input className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-900" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex. Validation produit" /></label>
      <label className="block text-sm font-medium text-ink">Description<span className="ml-2 text-xs font-normal text-muted">Optionnelle</span><textarea className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-900" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Quel est le résultat attendu ?" rows={3} /></label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium text-ink">Date de début<span className="ml-2 text-xs font-normal text-muted">Optionnelle</span><input className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-900" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
        <label className="block text-sm font-medium text-ink">Date de fin<span className="ml-2 text-xs font-normal text-muted">Optionnelle</span><input className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-900" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label>
      </div>
      {(formError || error) && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-danger">{formError || error}</div>}
      <div className="flex flex-wrap justify-end gap-3 border-t border-line pt-5"><button className="rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:text-ink" type="button" onClick={onCancel}>Annuler</button><button className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-950 disabled:opacity-50" disabled={isSubmitting} type="submit">{isSubmitting ? "Enregistrement..." : project ? "Enregistrer" : "Créer le projet"}</button></div>
    </form>
  );
}