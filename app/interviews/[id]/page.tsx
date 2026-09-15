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

  if (isLoading) return <main><LoadingState label="Chargement de l’interview..." /></main>;
  if (!interview) return <main><div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-danger">{error || "Interview introuvable"}</div><Link className="mt-4 inline-block text-sm font-semibold text-muted" href="/projects">← Retour</Link></main>;
  const questions = interview.questionnaire?.questions ?? [];

  return <main className="space-y-6">
    <Link className="inline-block text-sm font-semibold text-muted hover:text-brand-900" href={`/phases/${interview.phaseId}`}>← Retour à la phase</Link>
    {success && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-success" role="status">{success}</div>}
    {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-danger" role="alert">{error}</div>}
    <section className="flex flex-col justify-between gap-5 rounded-2xl border border-line bg-surface p-6 shadow-sm sm:flex-row sm:items-start"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-muted">Interview</p><h1 className="mt-2 font-display text-3xl font-semibold text-ink">{interview.respondentName}</h1><p className="mt-2 text-sm text-muted">{interview.respondentRole || "Rôle non défini"} · {interview.organization || "Organisation non définie"}</p></div><select className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink" value={status} onChange={(event) => void changeStatus(event.target.value as Interview["status"])} disabled={isSubmitting}><option value="PLANNED">Planifiée</option><option value="IN_PROGRESS">En cours</option><option value="COMPLETED">Terminée</option><option value="CANCELLED">Annulée</option></select></section>
    <section className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3"><div className="bg-surface p-4"><span className="block text-xs text-muted">Questionnaire</span><strong className="mt-1 block text-sm text-ink">{interview.questionnaire?.name || "Questionnaire"} · v{interview.questionnaire?.version}</strong></div><div className="bg-surface p-4"><span className="block text-xs text-muted">Réponses</span><strong className="mt-1 block text-sm text-ink">{responses.length} / {questions.length}</strong></div><div className="bg-surface p-4"><span className="block text-xs text-muted">Terminée le</span><strong className="mt-1 block text-sm text-ink">{formatDate(interview.completedAt)}</strong></div></section>
    <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6"><div className="mb-5"><p className="text-xs font-bold uppercase tracking-[.14em] text-muted">Questionnaire</p><h2 className="mt-1 font-display text-xl font-semibold text-ink">Réponses <span className="text-muted">{questions.length}</span></h2></div><div className="space-y-4">{questions.length === 0 ? <div className="border border-dashed border-line p-5 text-sm text-muted">Ce questionnaire ne contient aucune question.</div> : questions.map((question) => <div className="rounded-xl border border-line bg-panel p-5" key={question.id}><div className="flex flex-wrap items-start justify-between gap-3"><h3 className="font-semibold text-ink">{question.order}. {question.text} {question.required && <span className="ml-2 rounded bg-amber-50 px-2 py-1 text-[10px] font-bold text-warning">Requis</span>}</h3><span className="text-xs text-muted">{question.type}</span></div><p className="mt-2 text-sm text-muted">{question.description}</p><div className="mt-4"><ResponseField question={question} response={responses.find((response) => response.questionId === question.id)} isSubmitting={isSubmitting} onSave={(value) => saveResponse(question.id, value)} onDelete={() => { const response = responses.find((item) => item.questionId === question.id); return response ? removeResponse(response.id) : Promise.resolve(); }} /></div></div>)}</div></section>
  </main>;
}