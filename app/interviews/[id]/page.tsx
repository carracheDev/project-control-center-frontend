"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingState } from "@/components/loading-state";
import { ResponseField } from "@/components/response-field";
import { createResponse, deleteResponse, getInterview, updateInterview, updateResponse } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Interview, Response } from "@/types/domain";

export default function InterviewDetailPage() {
  const params = useParams<{ id: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [status, setStatus] = useState<Interview["status"]>("PLANNED");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    getInterview(params.id)
      .then((loaded) => { setInterview(loaded); setStatus(loaded.status); setResponses(loaded.responses ?? []); })
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setIsLoading(false));
  }, [params.id]);

  async function saveResponse(questionId: string, value: string) {
    setIsSubmitting(true);
    try {
      const existing = responses.find((response) => response.questionId === questionId);
      const saved = existing ? await updateResponse(existing.id, { value }) : await createResponse(params.id, { questionId, value });
      setResponses((items) => existing ? items.map((item) => item.id === saved.id ? saved : item) : [...items, saved]);
      setSuccess("Réponse enregistrée.");
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Impossible d’enregistrer la réponse"); }
    finally { setIsSubmitting(false); }
  }

  async function removeResponse(id: string) {
    try { await deleteResponse(id); setResponses((items) => items.filter((item) => item.id !== id)); setSuccess("Réponse effacée."); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Impossible d’effacer la réponse"); }
  }

  async function changeStatus(nextStatus: Interview["status"]) {
    setIsSubmitting(true);
    try { const updated = await updateInterview(params.id, { status: nextStatus }); setInterview((current) => current ? { ...current, ...updated } : current); setStatus(updated.status); setSuccess("Statut de l’interview mis à jour."); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Le backend a refusé ce changement de statut"); }
    finally { setIsSubmitting(false); }
  }

  if (isLoading) return <main className="page-shell"><LoadingState label="Chargement de l’interview..." /></main>;
  if (!interview) return <main className="page-shell"><div className="alert alert-error">{error || "Interview introuvable"}</div><Link className="back-link" href="/projects">← Retour</Link></main>;
  const questions = interview.questionnaire?.questions ?? [];

  return <main className="page-shell">
    <Link className="back-link" href={`/phases/${interview.phaseId}`}>← Retour à la phase</Link>
    {success && <div className="alert alert-success" role="status">{success}</div>}
    {error && <div className="alert alert-error" role="alert">{error}</div>}
    <section className="detail-hero"><div><p className="eyebrow">Interview</p><h1>{interview.respondentName}</h1><p className="page-lede">{interview.respondentRole || "Rôle non défini"} · {interview.organization || "Organisation non définie"}</p></div><select className="status-select" value={status} onChange={(event) => void changeStatus(event.target.value as Interview["status"])} disabled={isSubmitting}><option value="PLANNED">Planifiée</option><option value="IN_PROGRESS">En cours</option><option value="COMPLETED">Terminée</option><option value="CANCELLED">Annulée</option></select></section>
    <section className="detail-facts"><div><span>Questionnaire</span><strong>{interview.questionnaire?.name || "Questionnaire"} · v{interview.questionnaire?.version}</strong></div><div><span>Réponses</span><strong>{responses.length} / {questions.length}</strong></div><div><span>Terminée le</span><strong>{formatDate(interview.completedAt)}</strong></div></section>
    <section className="content-section entity-section"><div className="section-heading"><div><p className="eyebrow">Questionnaire</p><h2>Réponses <span className="count-label">{questions.length}</span></h2></div></div><div className="response-list">{questions.length === 0 ? <div className="empty-inline">Ce questionnaire ne contient aucune question.</div> : questions.map((question) => <div className="response-card" key={question.id}><div className="question-heading"><h3>{question.order}. {question.text} {question.required && <span className="required-label">Requis</span>}</h3><span>{question.type}</span></div><p>{question.description}</p><ResponseField question={question} response={responses.find((response) => response.questionId === question.id)} isSubmitting={isSubmitting} onSave={(value) => saveResponse(question.id, value)} onDelete={() => { const response = responses.find((item) => item.questionId === question.id); return response ? removeResponse(response.id) : Promise.resolve(); }} /></div>)}</div></section>
  </main>;
}