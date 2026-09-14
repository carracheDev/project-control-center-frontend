"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingState } from "@/components/loading-state";
import { OptionForm } from "@/components/option-form";
import { QuestionForm } from "@/components/question-form";
import { QuestionnaireForm } from "@/components/questionnaire-form";
import { createOption, createQuestion, deleteOption, deleteQuestion, deleteQuestionnaire, getObjectives, getQuestionnaire, updateOption, updateQuestion, updateQuestionnaire } from "@/lib/api";
import type { CreateOptionInput, CreateQuestionInput, CreateQuestionnaireInput, Objective, Question, Questionnaire } from "@/types/domain";

type FormKind = "questionnaire" | "question" | "option" | null;

export default function QuestionnaireDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [formKind, setFormKind] = useState<FormKind>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    getQuestionnaire(params.id)
      .then(async (loaded) => {
        setQuestionnaire(loaded);
        setQuestions(loaded.questions ?? []);
        setObjectives(await getObjectives(loaded.phaseId));
      })
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setIsLoading(false));
  }, [params.id]);

  function closeForm() { setFormKind(null); setEditingId(null); setActiveQuestionId(null); setError(null); }

  async function saveQuestionnaire(input: CreateQuestionnaireInput) {
    setIsSubmitting(true);
    try { const updated = await updateQuestionnaire(params.id, input); setQuestionnaire((current) => current ? { ...current, ...updated } : current); setSuccess("Questionnaire mis à jour."); closeForm(); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Impossible de modifier le questionnaire"); }
    finally { setIsSubmitting(false); }
  }

  async function saveQuestion(input: CreateQuestionInput) {
    setIsSubmitting(true);
    try {
      if (editingId) { const updated = await updateQuestion(editingId, input); setQuestions((items) => items.map((item) => item.id === editingId ? updated : item)); }
      else { const created = await createQuestion(params.id, input); setQuestions((items) => [...items, created].sort((a, b) => a.order - b.order)); }
      setSuccess(editingId ? "Question mise à jour." : "Question créée."); closeForm();
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Impossible d’enregistrer la question"); }
    finally { setIsSubmitting(false); }
  }

  async function saveOption(input: CreateOptionInput) {
    if (!activeQuestionId) return;
    setIsSubmitting(true);
    try {
      if (editingId) { const updated = await updateOption(editingId, input); setQuestions((items) => items.map((question) => question.id === activeQuestionId ? { ...question, options: question.options.map((option) => option.id === editingId ? updated : option) } : question)); }
      else { const created = await createOption(activeQuestionId, input); setQuestions((items) => items.map((question) => question.id === activeQuestionId ? { ...question, options: [...question.options, created].sort((a, b) => a.order - b.order) } : question)); }
      setSuccess(editingId ? "Option mise à jour." : "Option créée."); closeForm();
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Impossible d’enregistrer l’option"); }
    finally { setIsSubmitting(false); }
  }

  async function removeQuestion(id: string) {
    if (!window.confirm("Supprimer cette question et ses options ?")) return;
    try { await deleteQuestion(id); setQuestions((items) => items.filter((item) => item.id !== id)); setSuccess("Question supprimée."); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Impossible de supprimer la question"); }
  }

  async function removeOption(questionId: string, id: string) {
    if (!window.confirm("Supprimer cette option ?")) return;
    try { await deleteOption(id); setQuestions((items) => items.map((question) => question.id === questionId ? { ...question, options: question.options.filter((option) => option.id !== id) } : question)); setSuccess("Option supprimée."); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Impossible de supprimer l’option"); }
  }

  async function removeQuestionnaire() {
    if (!questionnaire || !window.confirm("Supprimer ce questionnaire ?")) return;
    try { await deleteQuestionnaire(questionnaire.id); router.push(`/projects/${questionnaire.phaseId}`); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Impossible de supprimer le questionnaire"); }
  }

  if (isLoading) return <main className="page-shell"><LoadingState label="Chargement du questionnaire..." /></main>;
  if (!questionnaire) return <main className="page-shell"><div className="alert alert-error">{error || "Questionnaire introuvable"}</div><Link className="back-link" href="/projects">← Retour</Link></main>;
  const editingQuestion = editingId ? questions.find((question) => question.id === editingId) : undefined;
  const activeQuestion = questions.find((question) => question.id === activeQuestionId);
  const editingOption = editingId && activeQuestion ? activeQuestion.options.find((option) => option.id === editingId) : undefined;

  return <main className="page-shell">
    <Link className="back-link" href={`/phases/${questionnaire.phaseId}`}>← Retour à la phase</Link>
    {success && <div className="alert alert-success" role="status">{success}</div>}
    {error && <div className="alert alert-error" role="alert">{error}</div>}
    <section className="detail-hero"><div><p className="eyebrow">Questionnaire · version {questionnaire.version}</p><h1>{questionnaire.name}</h1><p className="page-lede">{questionnaire.description || "Aucune description"}</p></div><div className="detail-actions"><span className={`task-status questionnaire-${questionnaire.status.toLowerCase()}`}>{questionnaire.status}</span><button className="button button-secondary" type="button" onClick={() => setFormKind("questionnaire")}>Modifier</button><button className="button button-danger" type="button" onClick={() => void removeQuestionnaire()}>Supprimer</button></div></section>
    {formKind === "questionnaire" && <QuestionnaireForm questionnaire={questionnaire} isSubmitting={isSubmitting} error={error} onCancel={closeForm} onSubmit={saveQuestionnaire} />}
    <section className="content-section entity-section"><div className="section-heading"><div><p className="eyebrow">Structure du questionnaire</p><h2>Questions <span className="count-label">{questions.length}</span></h2></div><button className="button button-primary" type="button" onClick={() => { setEditingId(null); setFormKind("question"); }}><span aria-hidden="true">+</span> Ajouter une question</button></div>
      {formKind === "question" && <QuestionForm question={editingQuestion} objectives={objectives} nextOrder={questions.length + 1} isSubmitting={isSubmitting} error={error} onCancel={closeForm} onSubmit={saveQuestion} />}
      {questions.length === 0 ? <div className="empty-inline">Aucune question définie.</div> : <div className="work-list">{questions.map((question) => <div className="question-card" key={question.id}><div className="work-row"><span className="phase-order">{String(question.order).padStart(2, "0")}</span><div className="work-main"><h3>{question.text} {question.required && <span className="required-label">Requis</span>}</h3><p>{question.type} · {question.description || "Aucune description"}</p></div><div className="row-controls"><button className="icon-button" type="button" onClick={() => { setEditingId(question.id); setFormKind("question"); }} aria-label="Modifier la question">✎</button><button className="icon-button icon-button-danger" type="button" onClick={() => void removeQuestion(question.id)} aria-label="Supprimer la question">×</button></div></div><div className="option-area"><div className="option-heading"><span>Options</span><button className="text-link" type="button" onClick={() => { setActiveQuestionId(question.id); setEditingId(null); setFormKind("option"); }}>+ Ajouter</button></div>{activeQuestionId === question.id && formKind === "option" && <OptionForm option={editingOption} nextOrder={question.options.length + 1} isSubmitting={isSubmitting} error={error} onCancel={closeForm} onSubmit={saveOption} />}{question.options.map((option) => <div className="option-row" key={option.id}><span>{option.order}. {option.label}</span><small>{option.value}</small><div className="row-controls"><button className="icon-button" type="button" onClick={() => { setActiveQuestionId(question.id); setEditingId(option.id); setFormKind("option"); }} aria-label="Modifier l’option">✎</button><button className="icon-button icon-button-danger" type="button" onClick={() => void removeOption(question.id, option.id)} aria-label="Supprimer l’option">×</button></div></div>)}</div></div>)}</div>}
    </section>
  </main>;
}