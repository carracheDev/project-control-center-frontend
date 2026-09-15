"use client";

import { FormEvent, useState } from "react";
import type { CreateInterviewInput, Interview, Questionnaire } from "@/types/domain";

export function InterviewForm({ interview, questionnaires, isSubmitting, error, onSubmit, onCancel }: { interview?: Interview; questionnaires: Questionnaire[]; isSubmitting: boolean; error: string | null; onSubmit: (input: CreateInterviewInput) => Promise<void>; onCancel: () => void }) {
  const [questionnaireId, setQuestionnaireId] = useState(interview?.questionnaireId ?? questionnaires[0]?.id ?? "");
  const [respondentName, setRespondentName] = useState(interview?.respondentName ?? "");
  const [respondentRole, setRespondentRole] = useState(interview?.respondentRole ?? "");
  const [organization, setOrganization] = useState(interview?.organization ?? "");
  const [status, setStatus] = useState(interview?.status ?? "PLANNED");
  const [notes, setNotes] = useState(interview?.notes ?? "");
  const [formError, setFormError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!questionnaireId || !respondentName.trim()) { setFormError("Le questionnaire et le nom du répondant sont obligatoires."); return; }
    setFormError(null);
    await onSubmit({ questionnaireId, respondentName: respondentName.trim(), respondentRole: respondentRole.trim() || undefined, organization: organization.trim() || undefined, status, notes: notes.trim() || undefined });
  }

  return <form className="space-y-4 rounded-xl border border-line bg-panel p-4" onSubmit={submit}><label className="block text-sm font-medium text-ink">Questionnaire<select className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" value={questionnaireId} onChange={(event) => setQuestionnaireId(event.target.value)}>{questionnaires.map((questionnaire) => <option key={questionnaire.id} value={questionnaire.id}>{questionnaire.name} · v{questionnaire.version}</option>)}</select></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium text-ink">Répondant<input className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" value={respondentName} onChange={(event) => setRespondentName(event.target.value)} /></label><label className="block text-sm font-medium text-ink">Rôle<input className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" value={respondentRole} onChange={(event) => setRespondentRole(event.target.value)} /></label></div><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium text-ink">Organisation<input className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" value={organization} onChange={(event) => setOrganization(event.target.value)} /></label><label className="block text-sm font-medium text-ink">Statut<select className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" value={status} onChange={(event) => setStatus(event.target.value as Interview["status"])}><option value="PLANNED">Planifiée</option><option value="IN_PROGRESS">En cours</option><option value="CANCELLED">Annulée</option><option value="COMPLETED">Terminée</option></select></label></div><label className="block text-sm font-medium text-ink">Notes<textarea className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} /></label>{(formError || error) && <div className="rounded-lg bg-red-50 p-3 text-sm text-danger">{formError || error}</div>}<div className="flex justify-end gap-3"><button className="px-3 py-2 text-sm font-semibold text-muted" type="button" onClick={onCancel}>Annuler</button><button className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" type="submit" disabled={isSubmitting}>{isSubmitting ? "..." : interview ? "Enregistrer" : "Planifier l’interview"}</button></div></form>;
}