"use client";

import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

  async function confirmRemoveQuestionnaire() {
    if (!questionnaire) return;
    setIsDeleteDialogOpen(false);
    try { await deleteQuestionnaire(questionnaire.id); router.push(`/projects/${questionnaire.phaseId}`); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Impossible de supprimer le questionnaire"); }
  }

  if (isLoading) return <main><LoadingState label="Chargement du questionnaire..." /></main>;
  if (!questionnaire) return <main><div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-danger">{error || "Questionnaire introuvable"}</div><Link className="mt-4 inline-block text-sm font-semibold text-muted" href="/projects">← Retour</Link></main>;
  const editingQuestion = editingId ? questions.find((question) => question.id === editingId) : undefined;
  const activeQuestion = questions.find((question) => question.id === activeQuestionId);
  const editingOption = editingId && activeQuestion ? activeQuestion.options.find((option) => option.id === editingId) : undefined;

  return <main className="space-y-6">
    <Link className="inline-block text-sm font-semibold text-muted hover:text-brand-900" href={`/phases/${questionnaire.phaseId}`}>← Retour à la phase</Link>
    {success && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-success" role="status">{success}</div>}
    {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-danger" role="alert">{error}</div>}
    <section className="flex flex-col justify-between gap-5 rounded-2xl border border-line bg-surface p-6 shadow-sm sm:flex-row sm:items-start"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-muted">Questionnaire · version {questionnaire.version}</p><h1 className="mt-2 font-display text-3xl font-semibold text-ink">{questionnaire.name}</h1><p className="mt-2 text-sm text-muted">{questionnaire.description || "Aucune description"}</p></div><div className="flex shrink-0 flex-nowrap items-center gap-2 whitespace-nowrap"><span className="rounded-md bg-panel px-2.5 py-1 text-xs font-semibold text-muted">{questionnaire.status}</span><button className="rounded-lg border border-line bg-panel px-3 py-2 text-sm font-semibold text-brand-900 transition-colors duration-200 hover:border-brand-900 hover:bg-brand-900 hover:text-white" type="button" onClick={() => setFormKind("questionnaire")}>Modifier</button><button className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-danger transition-colors duration-200 hover:border-danger hover:bg-danger hover:text-white" type="button" onClick={() => setIsDeleteDialogOpen(true)}>Supprimer</button></div></section>
    {formKind === "questionnaire" && <QuestionnaireForm questionnaire={questionnaire} isSubmitting={isSubmitting} error={error} onCancel={closeForm} onSubmit={saveQuestionnaire} />}
    <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6"><div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-muted">Structure du questionnaire</p><h2 className="mt-1 font-display text-xl font-semibold text-ink">Questions <span className="text-muted">{questions.length}</span></h2></div><button className="rounded-lg bg-brand-900 px-3 py-2 text-sm font-semibold text-white" type="button" onClick={() => { setEditingId(null); setFormKind("question"); }}><Plus aria-hidden="true" size={16} /> Ajouter une question</button></div>
      {formKind === "question" && <QuestionForm question={editingQuestion} objectives={objectives} nextOrder={questions.length + 1} isSubmitting={isSubmitting} error={error} onCancel={closeForm} onSubmit={saveQuestion} />}
      {questions.length === 0 ? <div className="border border-dashed border-line p-5 text-sm text-muted">Aucune question définie.</div> : <div className="space-y-4">{questions.map((question) => <div className="rounded-xl border border-line bg-panel p-5 transition duration-150 hover:border-accent-400 hover:shadow-[0_8px_20px_rgba(15,23,42,.06)]" key={question.id}><div className="flex flex-col gap-4 sm:flex-row sm:items-start"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-xs font-bold text-brand-900">{String(question.order).padStart(2, "0")}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold text-ink">{question.text} {question.required && <span className="ml-2 rounded bg-amber-50 px-2 py-1 text-[10px] font-bold text-warning">Requis</span>}</h3><p className="mt-1 text-xs text-muted">{question.type} · {question.description || "Aucune description"}</p></div><div className="flex gap-2"><button className="rounded-md border border-line px-2 py-1 text-xs text-muted" type="button" onClick={() => { setEditingId(question.id); setFormKind("question"); }} aria-label="Modifier la question"><Pencil aria-hidden="true" size={14} /></button><button className="rounded-md border border-red-200 px-2 py-1 text-xs text-danger" type="button" onClick={() => void removeQuestion(question.id)} aria-label="Supprimer la question"><Trash2 aria-hidden="true" size={14} /></button></div></div><div className="mt-4 border-t border-line pt-4"><div className="mb-3 flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wide text-muted">Options</span><button className="text-xs font-semibold text-brand-900" type="button" onClick={() => { setActiveQuestionId(question.id); setEditingId(null); setFormKind("option"); }}><Plus aria-hidden="true" size={14} /> Ajouter</button></div>{activeQuestionId === question.id && formKind === "option" && <OptionForm option={editingOption} nextOrder={question.options.length + 1} isSubmitting={isSubmitting} error={error} onCancel={closeForm} onSubmit={saveOption} />}{question.options.map((option) => <div className="flex items-center justify-between border-t border-line py-2 text-sm" key={option.id}><span className="text-ink">{option.order}. {option.label}</span><div className="flex items-center gap-3"><small className="text-muted">{option.value}</small><button className="text-xs text-muted" type="button" onClick={() => { setActiveQuestionId(question.id); setEditingId(option.id); setFormKind("option"); }} aria-label="Modifier l’option"><Pencil aria-hidden="true" size={14} /></button><button className="text-xs text-danger" type="button" onClick={() => void removeOption(question.id, option.id)} aria-label="Supprimer l’option"><Trash2 aria-hidden="true" size={14} /></button></div></div>)}</div></div></div></div>)}</div>}
    </section>
    {isDeleteDialogOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-brand-950/35 px-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsDeleteDialogOpen(false); }}><div className="w-full max-w-md rounded-xl border border-line bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,.2)]" role="dialog" aria-modal="true" aria-labelledby="delete-questionnaire-title"><p className="text-xs font-bold uppercase tracking-[.14em] text-danger">Action irréversible</p><h2 id="delete-questionnaire-title" className="mt-2 font-display text-xl font-semibold text-ink">Supprimer ce questionnaire ?</h2><p className="mt-3 text-sm leading-6 text-muted">Le questionnaire « {questionnaire.name} » et sa structure seront supprimés définitivement.</p><div className="mt-6 flex justify-end gap-3"><button className="rounded-lg border border-line bg-panel px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-brand-900 hover:bg-brand-900 hover:text-white" type="button" onClick={() => setIsDeleteDialogOpen(false)}>Annuler</button><button className="rounded-lg border border-danger bg-danger px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-red-700 hover:bg-red-700" type="button" onClick={() => void confirmRemoveQuestionnaire()}>Supprimer définitivement</button></div></div></div>}
  </main>;
}