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

  return <form className="inline-form" onSubmit={submit}><label>Questionnaire<select value={questionnaireId} onChange={(event) => setQuestionnaireId(event.target.value)}>{questionnaires.map((questionnaire) => <option key={questionnaire.id} value={questionnaire.id}>{questionnaire.name} · v{questionnaire.version}</option>)}</select></label><div className="inline-form-grid"><label>Répondant<input value={respondentName} onChange={(event) => setRespondentName(event.target.value)} /></label><label>Rôle<span className="label-optional">Optionnel</span><input value={respondentRole} onChange={(event) => setRespondentRole(event.target.value)} /></label></div><div className="inline-form-grid"><label>Organisation<span className="label-optional">Optionnelle</span><input value={organization} onChange={(event) => setOrganization(event.target.value)} /></label><label>Statut<select value={status} onChange={(event) => setStatus(event.target.value as Interview["status"])}><option value="PLANNED">Planifiée</option><option value="IN_PROGRESS">En cours</option><option value="CANCELLED">Annulée</option><option value="COMPLETED">Terminée</option></select></label></div><label>Notes<span className="label-optional">Optionnelles</span><textarea rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} /></label>{(formError || error) && <div className="form-error">{formError || error}</div>}<div className="form-actions"><button className="button button-quiet" type="button" onClick={onCancel}>Annuler</button><button className="button button-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "..." : interview ? "Enregistrer" : "Planifier l’interview"}</button></div></form>;
}