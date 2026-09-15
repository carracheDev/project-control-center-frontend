"use client";

import { FormEvent, useState } from "react";
import type { Criterion, CreateEvidenceInput, Evidence, Interview, Task } from "@/types/domain";

interface EvidenceFormProps {
  evidence?: Evidence;
  criteria: Criterion[];
  tasks: Task[];
  interviews: Interview[];
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (input: CreateEvidenceInput) => Promise<void>;
  onUpload?: (input: CreateEvidenceInput, file: File) => Promise<void>;
  onCancel: () => void;
}

export function EvidenceForm({ evidence, criteria, tasks, interviews, isSubmitting, error, onSubmit, onUpload, onCancel }: EvidenceFormProps) {
  const [title, setTitle] = useState(evidence?.title ?? "");
  const [description, setDescription] = useState(evidence?.description ?? "");
  const [type, setType] = useState<Evidence["type"]>(evidence?.type ?? "DOCUMENT");
  const [source, setSource] = useState(evidence?.source ?? "");
  const [url, setUrl] = useState(evidence?.url ?? "");
  const [note, setNote] = useState(evidence?.note ?? "");
  const [criterionId, setCriterionId] = useState(evidence?.criterionId ?? "");
  const [taskId, setTaskId] = useState(evidence?.taskId ?? "");
  const [interviewId, setInterviewId] = useState(evidence?.interviewId ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) { setFormError("Le titre est obligatoire."); return; }
    if (!file && !source.trim()) { setFormError("La source est obligatoire."); return; }
    if (!file && !url.trim() && !note.trim()) { setFormError("Ajoutez un fichier, une URL ou une note."); return; }
    setFormError(null);
    const input: CreateEvidenceInput = { title: title.trim(), description: description.trim() || undefined, type, source: source.trim() || "UPLOAD", url: url.trim() || undefined, note: note.trim() || undefined, criterionId: criterionId || undefined, taskId: taskId || undefined, interviewId: interviewId || undefined };
    if (file && onUpload) await onUpload(input, file); else await onSubmit(input);
  }

  return <form className="space-y-4 rounded-xl border border-line bg-panel p-4" onSubmit={submit}>
    <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium text-ink">Titre<input className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" value={title} onChange={(event) => setTitle(event.target.value)} /></label><label className="block text-sm font-medium text-ink">Type<select className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" value={type} onChange={(event) => setType(event.target.value as Evidence["type"])}><option value="DOCUMENT">Document</option><option value="IMAGE">Image</option><option value="SPREADSHEET">Tableur</option><option value="LINK">Lien</option><option value="INTERVIEW">Interview</option><option value="NOTE">Note</option><option value="OTHER">Autre</option></select></label></div>
    <label className="block text-sm font-medium text-ink">Description<textarea className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" value={description} onChange={(event) => setDescription(event.target.value)} rows={2} /></label>
    <label className="block text-sm font-medium text-ink">Source<input className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" value={source} onChange={(event) => setSource(event.target.value)} placeholder="FIELD, DOCUMENT, WEB..." /></label>
    <label className="block text-sm font-medium text-ink">Fichier<span className="ml-2 text-xs font-normal text-muted">PDF, image, document ou tableur · 10 Mo maximum</span><input className="mt-2 block w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" type="file" accept="application/pdf,image/jpeg,image/png,image/webp,text/plain,.doc,.docx,.xls,.xlsx" onChange={(event) => setFile(event.target.files?.[0] ?? null)} /></label>
    <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium text-ink">Criterion<select className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" value={criterionId} onChange={(event) => setCriterionId(event.target.value)}><option value="">Aucun</option>{criteria.map((criterion) => <option key={criterion.id} value={criterion.id}>{criterion.order}. {criterion.name}</option>)}</select></label><label className="block text-sm font-medium text-ink">Tâche<select className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" value={taskId} onChange={(event) => setTaskId(event.target.value)}><option value="">Aucune</option>{tasks.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}</select></label></div>
    <label className="block text-sm font-medium text-ink">Interview<select className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" value={interviewId} onChange={(event) => setInterviewId(event.target.value)}><option value="">Aucune</option>{interviews.map((interview) => <option key={interview.id} value={interview.id}>{interview.respondentName}</option>)}</select></label>
    <label className="block text-sm font-medium text-ink">URL<input className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://..." /></label>
    <label className="block text-sm font-medium text-ink">Note<textarea className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" value={note} onChange={(event) => setNote(event.target.value)} rows={3} /></label>
    {(formError || error) && <p className="rounded-lg bg-red-50 p-3 text-sm text-danger">{formError || error}</p>}
    <div className="flex justify-end gap-3"><button className="px-3 py-2 text-sm font-semibold text-muted" type="button" onClick={onCancel}>Annuler</button><button className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" type="submit" disabled={isSubmitting}>{isSubmitting ? "Enregistrement..." : file ? "Téléverser la preuve" : evidence ? "Enregistrer" : "Ajouter la preuve"}</button></div>
  </form>;
}
