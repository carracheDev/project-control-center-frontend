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
    <form className="form-panel" onSubmit={handleSubmit}>
      <label>Nom du projet<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex. Validation produit" /></label>
      <label>Description<span className="label-optional">Optionnelle</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Quel est le résultat attendu ?" rows={3} /></label>
      <div className="form-grid">
        <label>Date de début<span className="label-optional">Optionnelle</span><input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
        <label>Date de fin<span className="label-optional">Optionnelle</span><input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label>
      </div>
      {(formError || error) && <div className="form-error">{formError || error}</div>}
      <div className="form-actions"><button className="button button-quiet" type="button" onClick={onCancel}>Annuler</button><button className="button button-primary" disabled={isSubmitting} type="submit">{isSubmitting ? "Enregistrement..." : project ? "Enregistrer" : "Créer le projet"}</button></div>
    </form>
  );
}