"use client";

import { FormEvent, useState } from "react";
import type { CreateTaskInput, Objective, Criterion, ProjectMember, Task, TaskPriority, TaskStatus } from "@/types/domain";

interface TaskFormProps {
  task?: Task;
  objectives: Objective[];
  criteria: Criterion[];
  members: ProjectMember[];
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (input: CreateTaskInput) => Promise<void>;
  onCancel: () => void;
}

export function TaskForm({ task, objectives, criteria, members, isSubmitting, error, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [objectiveId, setObjectiveId] = useState(task?.objectiveId ?? "");
  const [criterionId, setCriterionId] = useState(task?.criterionId ?? "");
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId ?? "");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "TODO");
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? "MEDIUM");
  const [deadline, setDeadline] = useState(task?.deadline?.slice(0, 10) ?? "");
  const [formError, setFormError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      setFormError("Le titre de la tâche est obligatoire.");
      return;
    }
    setFormError(null);
    await onSubmit({
      objectiveId: objectiveId || undefined,
      criterionId: criterionId || undefined,
      assigneeId: assigneeId || undefined,
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      deadline: deadline || undefined,
    });
  }

  return (
    <form className="space-y-4 rounded-xl border border-line bg-panel p-4" onSubmit={submit}>
      <label className="block text-sm font-medium text-ink">Titre<input className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" value={title} onChange={(event) => setTitle(event.target.value)} /></label>
      <label className="block text-sm font-medium text-ink">Description<textarea className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" rows={2} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-ink">Statut<select className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)}><option value="TODO">À faire</option><option value="IN_PROGRESS">En cours</option><option value="DONE">Terminée</option><option value="BLOCKED">Bloquée</option></select></label>
        <label className="block text-sm font-medium text-ink">Priorité<select className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)}><option value="LOW">Basse</option><option value="MEDIUM">Moyenne</option><option value="HIGH">Haute</option></select></label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-ink">Objectif<select className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" value={objectiveId} onChange={(event) => setObjectiveId(event.target.value)}><option value="">Sans objectif</option>{objectives.map((objective) => <option key={objective.id} value={objective.id}>{objective.order}. {objective.name}</option>)}</select></label>
        <label className="block text-sm font-medium text-ink">Critère<select className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" value={criterionId} onChange={(event) => setCriterionId(event.target.value)}><option value="">Sans critère</option>{criteria.map((criterion) => <option key={criterion.id} value={criterion.id}>{criterion.order}. {criterion.name}</option>)}</select></label>
      </div>
      <label className="block text-sm font-medium text-ink">Responsable<select className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)}><option value="">Non assignée</option>{members.filter((member) => member.user.isActive).map((member) => <option key={member.userId} value={member.userId}>{member.user.email}</option>)}</select></label>
      <label className="block text-sm font-medium text-ink">Échéance<input className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} /></label>
      {(formError || error) && <p className="text-sm text-danger" role="alert">{formError || error}</p>}
      <div className="flex justify-end gap-3"><button className="px-3 py-2 text-sm font-semibold text-muted" type="button" onClick={onCancel}>Annuler</button><button className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" type="submit" disabled={isSubmitting}>{isSubmitting ? "Enregistrement..." : "Enregistrer"}</button></div>
    </form>
  );
}
