"use client";

import Link from "next/link";
import { ArrowUpRight, ClipboardList, FileCheck, History, LayoutDashboard, ListChecks, ListTodo, MessagesSquare, Plus, Target, type LucideIcon } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { CriterionForm } from "@/components/criterion-form";
import { CriterionAssessmentControls } from "@/components/criterion-assessment-controls";
import { InterviewForm } from "@/components/interview-form";
import { EvidenceForm } from "@/components/evidence-form";
import { CoverageRequirementForm } from "@/components/coverage-requirement-form";
import { LoadingState } from "@/components/loading-state";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PhaseHeader } from "@/components/phase-header";
import { PhaseOverview } from "@/components/phase-overview";
import { PhaseSummary } from "@/components/phase-summary";
import { ObjectiveForm } from "@/components/objective-form";
import { QuestionnaireForm } from "@/components/questionnaire-form";
import { TaskForm } from "@/components/task-form";
import { TaskKanban } from "@/components/task-kanban";
import { createCoverageRequirement, createCriterion, createEvidence, createInterview, createObjective, createQuestionnaire, createTask, deleteCoverageRequirement, deleteCriterion, deleteEvidence, deleteInterview, deleteObjective, deleteQuestionnaire, deleteTask, getCoverage, getCoverageRequirements, getCriteria, getEvidence, getInterviews, getObjectives, getPhase, getPhaseGating, getPhaseReadiness, getPhaseValidations, getPhaseWorkflow, getProject, getProjectMembers, getQuestionnaires, getTasks, rejectEvidence, updateCoverageRequirement, updateCriterion, updateEvidence, updateInterview, updateObjective, updateQuestionnaire, updateTask, uploadEvidence, validatePhase, verifyEvidence } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Criterion, CreateCoverageRequirementInput, CreateCriterionInput, CreateEvidenceInput, CreateInterviewInput, CreateObjectiveInput, CreateQuestionnaireInput, CreateTaskInput, CoverageRequirement, Evidence, GatingResult, Interview, Objective, Phase, PhaseCoverageResult, PhaseReadinessResult, PhaseValidation, PhaseWorkflowState, Project, ProjectMember, Questionnaire, Task } from "@/types/domain";

type FormKind = "objective" | "criterion" | "task" | "questionnaire" | "interview" | "evidence" | "coverage" | null;
type PhaseTab = "overview" | "objectives" | "criteria" | "tasks" | "questionnaires" | "interviews" | "evidence" | "history";

export default function PhaseDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<Phase | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [coverageRequirements, setCoverageRequirements] = useState<CoverageRequirement[]>([]);
  const [coverage, setCoverage] = useState<PhaseCoverageResult | null>(null);
  const [readiness, setReadiness] = useState<PhaseReadinessResult | null>(null);
  const [gating, setGating] = useState<GatingResult | null>(null);
  const [validations, setValidations] = useState<PhaseValidation[]>([]);
  const [workflow, setWorkflow] = useState<PhaseWorkflowState | null>(null);
  const [formKind, setFormKind] = useState<FormKind>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ kind: Exclude<FormKind, null>; id: string } | null>(null);
  const [activeTab, setActiveTab] = useState<PhaseTab>(() => {
    const requestedTab = searchParams.get("tab");
    const validTabs: PhaseTab[] = ["overview", "objectives", "criteria", "tasks", "questionnaires", "interviews", "evidence", "history"];
    return requestedTab && validTabs.includes(requestedTab as PhaseTab) ? requestedTab as PhaseTab : "overview";
  });

  useEffect(() => {
    Promise.all([getPhase(params.id), getObjectives(params.id), getCriteria(params.id), getTasks(params.id), getQuestionnaires(params.id), getInterviews(params.id), getEvidence(params.id), getCoverageRequirements(params.id), getCoverage(params.id), getPhaseReadiness(params.id), getPhaseGating(params.id), getPhaseValidations(params.id), getPhaseWorkflow(params.id)])
      .then(async ([loadedPhase, loadedObjectives, loadedCriteria, loadedTasks, loadedQuestionnaires, loadedInterviews, loadedEvidence, loadedCoverageRequirements, loadedCoverage, loadedReadiness, loadedGating, loadedValidations, loadedWorkflow]) => {
        const loadedProject = await getProject(loadedPhase.projectId);
        const loadedMembers = await getProjectMembers(loadedPhase.projectId);
        setProject(loadedProject);
        setPhase(loadedPhase);
        setObjectives(loadedObjectives);
        setCriteria(loadedCriteria);
        setTasks(loadedTasks);
        setMembers(loadedMembers);
        setQuestionnaires(loadedQuestionnaires);
        setInterviews(loadedInterviews);
        setEvidence(loadedEvidence);
        setCoverageRequirements(loadedCoverageRequirements);
        setCoverage(loadedCoverage);
        setReadiness(loadedReadiness);
        setGating(loadedGating);
        setValidations(loadedValidations);
        setWorkflow(loadedWorkflow);
      })
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setIsLoading(false));
  }, [params.id]);

  async function refreshDiagnostics() {
    const [loadedReadiness, loadedGating] = await Promise.all([getPhaseReadiness(params.id), getPhaseGating(params.id)]);
    setReadiness(loadedReadiness);
    setGating(loadedGating);
  }

  async function validateCurrentPhase() {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await validatePhase(params.id);
      const [loadedReadiness, loadedGating, loadedValidations, loadedWorkflow] = await Promise.all([getPhaseReadiness(params.id), getPhaseGating(params.id), getPhaseValidations(params.id), getPhaseWorkflow(params.id)]);
      setPhase(result.phase);
      setReadiness(loadedReadiness);
      setGating(loadedGating);
      setValidations(loadedValidations);
      setWorkflow(loadedWorkflow);
      setSuccess("Phase validée.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Impossible de valider la phase");
    } finally {
      setIsSubmitting(false);
    }
  }

  function closeForm() {
    setFormKind(null);
    setEditingId(null);
    setError(null);
  }

  async function saveObjective(input: CreateObjectiveInput) {
    setIsSubmitting(true);
    try {
      if (editingId) {
        const updated = await updateObjective(editingId, input);
        setObjectives((items) => items.map((item) => item.id === editingId ? updated : item));
      } else {
        const created = await createObjective(params.id, input);
        setObjectives((items) => [...items, created].sort((a, b) => a.order - b.order));
      }
      setSuccess(editingId ? "Objectif mis à jour." : "Objectif créé.");
      closeForm();
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Impossible d’enregistrer l’objectif"); }
    finally { setIsSubmitting(false); }
  }

  async function saveCriterion(input: CreateCriterionInput) {
    setIsSubmitting(true);
    try {
      if (editingId) {
        const updated = await updateCriterion(editingId, input);
        setCriteria((items) => items.map((item) => item.id === editingId ? updated : item));
      } else {
        const created = await createCriterion(params.id, input);
        setCriteria((items) => [...items, created].sort((a, b) => a.order - b.order));
      }
      setSuccess(editingId ? "Critère mis à jour." : "Critère créé.");
      closeForm();
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Impossible d’enregistrer le critère"); }
    finally { setIsSubmitting(false); }
  }

  async function saveTask(input: CreateTaskInput) {
    setIsSubmitting(true);
    try {
      if (editingId) {
        const updated = await updateTask(editingId, input);
        setTasks((items) => items.map((item) => item.id === editingId ? updated : item));
      } else {
        const created = await createTask(params.id, input);
        setTasks((items) => [...items, created]);
      }
      setSuccess(editingId ? "Tâche mise à jour." : "Tâche créée.");
      closeForm();
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Impossible d’enregistrer la tâche"); }
    finally { setIsSubmitting(false); }
  }

  async function changeTaskStatus(task: Task, status: Task["status"]) {
    const previousTasks = tasks;
    setTasks((items) => items.map((item) => item.id === task.id ? { ...item, status } : item));
    try {
      const updated = await updateTask(task.id, { status });
      setTasks((items) => items.map((item) => item.id === task.id ? updated : item));
    } catch (requestError) {
      setTasks(previousTasks);
      setError(requestError instanceof Error ? requestError.message : "Impossible de changer le statut de la tâche");
    }
  }

  async function saveQuestionnaire(input: CreateQuestionnaireInput) {
    setIsSubmitting(true);
    try {
      if (editingId) {
        const updated = await updateQuestionnaire(editingId, input);
        setQuestionnaires((items) => items.map((item) => item.id === editingId ? { ...item, ...updated } : item));
      } else {
        const created = await createQuestionnaire(params.id, input);
        setQuestionnaires((items) => [...items, created]);
      }
      setSuccess(editingId ? "Questionnaire mis à jour." : "Questionnaire créé.");
      closeForm();
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Impossible d’enregistrer le questionnaire"); }
    finally { setIsSubmitting(false); }
  }

  async function saveInterview(input: CreateInterviewInput) {
    setIsSubmitting(true);
    try {
      if (editingId) {
        const updated = await updateInterview(editingId, input);
        setInterviews((items) => items.map((item) => item.id === editingId ? { ...item, ...updated } : item));
      } else {
        const created = await createInterview(params.id, input);
        setInterviews((items) => [...items, created]);
      }
      setSuccess(editingId ? "Interview mise à jour." : "Interview planifiée.");
      closeForm();
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Impossible d’enregistrer l’interview"); }
    finally { setIsSubmitting(false); }
  }

  async function saveEvidence(input: CreateEvidenceInput) {
    setIsSubmitting(true);
    try {
      if (editingId) {
        const updated = await updateEvidence(editingId, input);
        setEvidence((items) => items.map((item) => item.id === editingId ? { ...item, ...updated } : item));
      } else {
        const created = await createEvidence(params.id, input);
        setEvidence((items) => [created, ...items]);
      }
      setSuccess(editingId ? "Preuve mise à jour." : "Preuve ajoutée.");
      closeForm();
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Impossible d’enregistrer la preuve"); }
    finally { setIsSubmitting(false); }
  }

  async function uploadEvidenceFile(input: CreateEvidenceInput, file: File) {
    setIsSubmitting(true);
    try {
      const created = await uploadEvidence(params.id, input, file);
      setEvidence((items) => [created, ...items]);
      setSuccess("Fichier téléversé et preuve ajoutée.");
      closeForm();
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Impossible de téléverser le fichier"); }
    finally { setIsSubmitting(false); }
  }

  async function saveCoverageRequirement(input: CreateCoverageRequirementInput) {
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateCoverageRequirement(editingId, input);
      } else {
        await createCoverageRequirement(params.id, input);
      }
      setCoverageRequirements(await getCoverageRequirements(params.id));
      setCoverage(await getCoverage(params.id));
      setSuccess(editingId ? "Requirement de couverture mis à jour." : "Requirement de couverture ajouté.");
      closeForm();
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Impossible d’enregistrer le requirement"); }
    finally { setIsSubmitting(false); }
  }

  async function remove(kind: Exclude<FormKind, null>, id: string) {
    setPendingDelete({ kind, id });
  }

  async function confirmRemove(kind: Exclude<FormKind, null>, id: string) {
    setPendingDelete(null);
    try {
      if (kind === "objective") { await deleteObjective(id); setObjectives((items) => items.filter((item) => item.id !== id)); }
      if (kind === "criterion") { await deleteCriterion(id); setCriteria((items) => items.filter((item) => item.id !== id)); }
      if (kind === "task") { await deleteTask(id); setTasks((items) => items.filter((item) => item.id !== id)); }
      if (kind === "questionnaire") { await deleteQuestionnaire(id); setQuestionnaires((items) => items.filter((item) => item.id !== id)); }
      if (kind === "interview") { await deleteInterview(id); setInterviews((items) => items.filter((item) => item.id !== id)); }
      if (kind === "evidence") { await deleteEvidence(id); setEvidence((items) => items.filter((item) => item.id !== id)); }
      if (kind === "coverage") { await deleteCoverageRequirement(id); setCoverageRequirements((items) => items.filter((item) => item.id !== id)); setCoverage(await getCoverage(params.id)); }
      setSuccess("Élément supprimé.");
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Impossible de supprimer l’élément"); }
  }

  if (isLoading) return <main><LoadingState label="Chargement de la phase..." /></main>;
  if (!phase) return <main><div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-danger">{error || "Phase introuvable"}</div><Link className="mt-4 inline-block text-sm font-semibold text-muted" href="/projects">← Retour aux projets</Link></main>;

  const editingObjective = editingId ? objectives.find((item) => item.id === editingId) : undefined;
  const editingCriterion = editingId ? criteria.find((item) => item.id === editingId) : undefined;
  const editingTask = editingId ? tasks.find((item) => item.id === editingId) : undefined;
  const editingQuestionnaire = editingId ? questionnaires.find((item) => item.id === editingId) : undefined;
  const editingInterview = editingId ? interviews.find((item) => item.id === editingId) : undefined;
  const editingEvidence = editingId ? evidence.find((item) => item.id === editingId) : undefined;
  const editingCoverageRequirement = editingId ? coverageRequirements.find((item) => item.id === editingId) : undefined;

  const readinessBlockers = readiness?.blockers.length ?? 0;
  const gatingBlockers = gating?.blockers.length ?? 0;
  const tabs: { id: PhaseTab; label: string; icon: LucideIcon }[] = [
    { id: "overview", label: "Vue d'ensemble", icon: LayoutDashboard }, { id: "objectives", label: "Objectifs", icon: Target }, { id: "criteria", label: "Critères", icon: ListChecks }, { id: "tasks", label: "Tâches", icon: ListTodo }, { id: "questionnaires", label: "Questionnaires", icon: ClipboardList }, { id: "interviews", label: "Interviews", icon: MessagesSquare }, { id: "evidence", label: "Preuves", icon: FileCheck }, { id: "history", label: "Historique", icon: History },
  ];

  return <main className="space-y-6">
    <PhaseHeader phase={phase} project={project} />
    <PhaseSummary phase={phase} blockers={readinessBlockers + gatingBlockers} objectives={objectives.length} criteria={criteria.length} tasks={tasks.length} interviews={interviews.length} evidence={evidence.length} readiness={readiness} gating={gating} />
    <PhaseOverview phase={phase} workflow={workflow} readiness={readiness} gating={gating} validations={validations} isSubmitting={isSubmitting} onValidate={() => void validateCurrentPhase()} onShowBlockers={() => setActiveTab("overview")} />
    <nav className="flex items-stretch gap-1 overflow-x-auto border-b border-line" aria-label="Navigation locale de la phase">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-xs font-semibold transition-colors ${activeTab === tab.id ? "border-accent-400 text-brand-900" : "border-transparent text-muted hover:border-line hover:text-ink"}`}
          onClick={() => setActiveTab(tab.id)}
        >
          <tab.icon size={14} /> {tab.label}
        </button>
      ))}
    </nav>
    {success && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-success" role="status">{success}</div>}
    {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-danger" role="alert">{error}</div>}
    <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6"><div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-muted">Mesure de recherche</p><h2>Couverture de recherche</h2></div><button className="rounded-lg border border-line bg-panel px-3 py-2 text-sm font-semibold text-brand-900" type="button" onClick={() => { setEditingId(null); setFormKind("coverage"); }}><Plus aria-hidden="true" size={16} /> Ajouter un requirement</button></div><div className="mb-5 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3"><div><span>Interviews complétées</span><strong>{coverage?.completedInterviews ?? 0} / {coverage?.totalInterviews ?? 0}</strong></div><div><span>Requirements obligatoires satisfaits</span><strong>{coverage?.requirements.filter((requirement) => requirement.satisfied && coverageRequirements.find((item) => item.id === requirement.requirementId)?.required).length ?? 0} / {coverage?.requirements.filter((requirement) => coverageRequirements.find((item) => item.id === requirement.requirementId)?.required).length ?? 0}</strong></div><div><span>Information de couverture</span><strong>{coverage?.allRequiredSatisfied ? "Tous couverts" : "À compléter"}</strong></div></div>{formKind === "coverage" && <CoverageRequirementForm requirement={editingCoverageRequirement} objectives={objectives} isSubmitting={isSubmitting} error={error} onCancel={closeForm} onSubmit={saveCoverageRequirement} />}{coverageRequirements.length === 0 ? <EmptyInline label="Aucun requirement de couverture défini." /> : <div className="grid gap-3 md:grid-cols-2">{coverageRequirements.map((requirement) => { const result = coverage?.requirements.find((item) => item.requirementId === requirement.id); return <article className="rounded-xl border border-line bg-panel p-4" key={requirement.id}><div className="flex items-start justify-between gap-3"><div><h3>{requirement.name}</h3><p>{requirement.objective?.name || "Couverture de phase"}{requirement.required ? " · Obligatoire" : " · Optionnel"}</p></div><div className="flex shrink-0 items-center gap-2"><button className="rounded-md border border-line px-2 py-1 text-xs text-muted" type="button" onClick={() => { setEditingId(requirement.id); setFormKind("coverage"); }} aria-label="Modifier le requirement">✎</button><button className="rounded-md border border-red-200 px-2 py-1 text-xs text-danger" type="button" onClick={() => void remove("coverage", requirement.id)} aria-label="Supprimer le requirement">×</button></div></div><strong className="text-sm font-semibold text-ink">{result?.coveredInterviews ?? 0} / {requirement.minimumInterviews}</strong><span className="text-xs font-semibold text-muted">{result?.percentage ?? 0} %</span><span className={`coverage-state ${result?.satisfied ? "coverage-state-satisfied" : "coverage-state-unsatisfied"}`}>{result?.satisfied ? "✓ Couvert" : "✕ Insuffisant"}</span></article>; })}</div>}</section>
    <EntitySection activeTab={activeTab} title="Objectifs" actionLabel="Ajouter un objectif" count={objectives.length} action={() => { setEditingId(null); setFormKind("objective"); }}>
      {formKind === "objective" && <ObjectiveForm objective={editingObjective} nextOrder={objectives.length + 1} isSubmitting={isSubmitting} error={error} onCancel={closeForm} onSubmit={saveObjective} />}
      {objectives.length === 0 ? <EmptyInline label="Aucun objectif défini." /> : <div className="divide-y divide-line">{objectives.map((objective) => <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start" key={objective.id}><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-panel text-xs font-bold text-brand-900">{String(objective.order).padStart(2, "0")}</span><div className="min-w-0 flex-1"><h3>{objective.name}</h3><p>{objective.description || "Aucune description"}</p></div><div className="flex shrink-0 items-center gap-2"><button className="rounded-md border border-line px-2 py-1 text-xs text-muted" type="button" onClick={() => { setEditingId(objective.id); setFormKind("objective"); }} aria-label="Modifier l’objectif">✎</button><button className="rounded-md border border-red-200 px-2 py-1 text-xs text-danger" type="button" onClick={() => void remove("objective", objective.id)} aria-label="Supprimer l’objectif">×</button></div></div>)}</div>}
    </EntitySection>
    <EntitySection activeTab={activeTab} title="Critères" actionLabel="Ajouter un critère" count={criteria.length} action={() => { setEditingId(null); setFormKind("criterion"); }}>
      {formKind === "criterion" && <CriterionForm criterion={editingCriterion} objectives={objectives} nextOrder={criteria.length + 1} isSubmitting={isSubmitting} error={error} onCancel={closeForm} onSubmit={saveCriterion} />}
      {criteria.length === 0 ? <EmptyInline label="Aucun critère défini." /> : <div className="divide-y divide-line">{criteria.map((criterion) => <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start" key={criterion.id}><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-panel text-xs font-bold text-brand-900">{String(criterion.order).padStart(2, "0")}</span><div className="min-w-0 flex-1"><h3>{criterion.name} {criterion.required && <span className="ml-2 rounded bg-amber-50 px-2 py-1 text-[10px] font-bold text-warning">Requis</span>}</h3><p>{criterion.description || "Aucune description"}</p><CriterionAssessmentControls criterion={criterion} evidence={evidence} onChanged={(assessment) => { setCriteria((items) => items.map((item) => item.id === criterion.id ? { ...item, assessment } : item)); void refreshDiagnostics().catch((requestError: Error) => setError(requestError.message)); }} /></div><div className="flex shrink-0 items-center gap-2"><button className="rounded-md border border-line px-2 py-1 text-xs text-muted" type="button" onClick={() => { setEditingId(criterion.id); setFormKind("criterion"); }} aria-label="Modifier le critère">✎</button><button className="rounded-md border border-red-200 px-2 py-1 text-xs text-danger" type="button" onClick={() => void remove("criterion", criterion.id)} aria-label="Supprimer le critère">×</button></div></div>)}</div>}
    </EntitySection>
    <EntitySection activeTab={activeTab} title="Tâches" actionLabel="Ajouter une tâche" count={tasks.length} action={() => { setEditingId(null); setFormKind("task"); }}>
      {formKind === "task" && <TaskForm task={editingTask} objectives={objectives} criteria={criteria} members={members} isSubmitting={isSubmitting} error={error} onCancel={closeForm} onSubmit={saveTask} />}
      {tasks.length === 0 ? <EmptyInline label="Aucune tâche définie." /> : <TaskKanban tasks={tasks} onStatusChange={changeTaskStatus} onEdit={(task) => { setEditingId(task.id); setFormKind("task"); }} onDelete={(task) => void remove("task", task.id)} />}
    </EntitySection>
    <EntitySection activeTab={activeTab} title="Questionnaires" actionLabel="Ajouter un questionnaire" count={questionnaires.length} action={() => { setEditingId(null); setFormKind("questionnaire"); }}>
      {formKind === "questionnaire" && <QuestionnaireForm questionnaire={editingQuestionnaire} isSubmitting={isSubmitting} error={error} onCancel={closeForm} onSubmit={saveQuestionnaire} />}
      {questionnaires.length === 0 ? <EmptyInline label="Aucun questionnaire défini." /> : <div className="divide-y divide-line">{questionnaires.map((questionnaire) => <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start" key={questionnaire.id}><div className="min-w-0 flex-1"><h3><Link className="group inline-flex max-w-full items-center gap-1.5 font-semibold text-brand-900 underline decoration-transparent decoration-2 underline-offset-4 transition-colors hover:text-accent-400 hover:decoration-accent-400 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-900" href={`/questionnaires/${questionnaire.id}`} aria-label={`Ouvrir le questionnaire ${questionnaire.name}`}>{questionnaire.name}<ArrowUpRight className="shrink-0 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-400" size={15} /></Link></h3><p>{questionnaire.description || "Aucune description"} · version {questionnaire.version}</p></div><span className={`task-status questionnaire-${questionnaire.status.toLowerCase()}`}>{questionnaire.status}</span><div className="flex shrink-0 items-center gap-2"><Link className="rounded-md border border-line px-2 py-1 text-xs text-muted transition-colors hover:border-brand-900 hover:bg-brand-900 hover:text-white" href={`/questionnaires/${questionnaire.id}`} aria-label="Ouvrir le questionnaire">Ouvrir</Link><button className="rounded-md border border-line px-2 py-1 text-xs text-muted transition-colors hover:border-brand-900 hover:bg-brand-900 hover:text-white" type="button" onClick={() => { setEditingId(questionnaire.id); setFormKind("questionnaire"); }} aria-label="Modifier le questionnaire">✎</button><button className="rounded-md border border-red-200 px-2 py-1 text-xs text-danger transition-colors hover:border-danger hover:bg-danger hover:text-white" type="button" onClick={() => void remove("questionnaire", questionnaire.id)} aria-label="Supprimer le questionnaire">×</button></div></div>)}</div>}
    </EntitySection>
    <EntitySection activeTab={activeTab} title="Interviews" actionLabel="Ajouter une interview" count={interviews.length} action={() => { setEditingId(null); setFormKind("interview"); }}>
      {formKind === "interview" && <InterviewForm interview={editingInterview} questionnaires={questionnaires} isSubmitting={isSubmitting} error={error} onCancel={closeForm} onSubmit={saveInterview} />}
      {interviews.length === 0 ? <EmptyInline label="Aucune interview planifiée." /> : <div className="divide-y divide-line">{interviews.map((interview) => <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start" key={interview.id}><div className="min-w-0 flex-1"><h3><Link href={`/interviews/${interview.id}`}>{interview.respondentName}</Link></h3><p>{interview.respondentRole || "Rôle non défini"} · {questionnaires.find((item) => item.id === interview.questionnaireId)?.name || "Questionnaire"}</p></div><span className={`task-status task-${interview.status.toLowerCase()}`}>{interview.status.replace("_", " ")}</span><div className="flex shrink-0 items-center gap-2"><Link className="rounded-md border border-line px-2 py-1 text-xs text-muted" href={`/interviews/${interview.id}`} aria-label="Ouvrir l’interview">→</Link><button className="rounded-md border border-line px-2 py-1 text-xs text-muted" type="button" onClick={() => { setEditingId(interview.id); setFormKind("interview"); }} aria-label="Modifier l’interview">✎</button><button className="rounded-md border border-red-200 px-2 py-1 text-xs text-danger" type="button" onClick={() => void remove("interview", interview.id)} aria-label="Supprimer l’interview">×</button></div></div>)}</div>}
    </EntitySection>
    <EntitySection activeTab={activeTab} title="Evidences" actionLabel="Ajouter une preuve" count={evidence.length} action={() => { setEditingId(null); setFormKind("evidence"); }}>
      {formKind === "evidence" && <EvidenceForm evidence={editingEvidence} criteria={criteria} tasks={tasks} interviews={interviews} isSubmitting={isSubmitting} error={error} onCancel={closeForm} onSubmit={saveEvidence} onUpload={uploadEvidenceFile} />}
      {evidence.length === 0 ? <EmptyInline label="Aucune preuve enregistrée." /> : <div className="divide-y divide-line">{evidence.map((item) => <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start" key={item.id}><div className="min-w-0 flex-1"><h3>{item.title}</h3><p>{item.type} · {item.source} · {item.criterion?.name || "Sans criterion"}</p></div><span className={`task-status evidence-${item.status.toLowerCase()}`}>{item.status}</span><div className="flex shrink-0 items-center gap-2"><button className="rounded-md border border-line px-2 py-1 text-xs text-muted" type="button" onClick={() => { setEditingId(item.id); setFormKind("evidence"); }} aria-label="Modifier la preuve">✎</button>{item.status === "PENDING" && <><button className="rounded-md border border-line px-2 py-1 text-xs text-muted" type="button" onClick={() => void verifyEvidence(item.id).then((updated) => { setEvidence((items) => items.map((entry) => entry.id === item.id ? updated : entry)); setSuccess("Preuve vérifiée par le backend."); }).catch((requestError: Error) => setError(requestError.message))} aria-label="Vérifier la preuve">✓</button><button className="rounded-md border border-red-200 px-2 py-1 text-xs text-danger" type="button" onClick={() => void rejectEvidence(item.id).then((updated) => { setEvidence((items) => items.map((entry) => entry.id === item.id ? updated : entry)); setSuccess("Preuve rejetée par le backend."); }).catch((requestError: Error) => setError(requestError.message))} aria-label="Rejeter la preuve">!</button></>}<button className="rounded-md border border-red-200 px-2 py-1 text-xs text-danger" type="button" onClick={() => void remove("evidence", item.id)} aria-label="Supprimer la preuve">×</button></div></div>)}</div>}
    </EntitySection>
    <section className={`${activeTab === "overview" ? "block" : "hidden"} rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6`} aria-live="polite">
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-muted">Diagnostic calculé à la demande</p><h2>État de préparation</h2></div><span className="rounded-md bg-panel px-2 py-1 text-xs font-semibold text-muted">{readiness?.ready ? "READY" : "NOT READY"}</span></div>
      <div className="grid gap-3 lg:grid-cols-3">
        <ReadinessList title="Bloqueurs" items={readiness?.blockers ?? []} emptyLabel="Aucun bloqueur détecté." />
        <ReadinessList title="Satisfait" items={readiness?.satisfiedConditions ?? []} emptyLabel="Aucune condition satisfaite signalée." />
        <ReadinessList title="Prochaines actions" items={readiness?.nextActions ?? []} emptyLabel="Aucune action suggérée." />
      </div>
    </section>
    <section className={`${activeTab === "overview" ? "block" : "hidden"} rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6`} aria-live="polite">
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-muted">Conditions de sortie configurées</p><h2>Gating</h2></div><span className="rounded-md bg-panel px-2 py-1 text-xs font-semibold text-muted">{gating?.canValidate ? "CAN VALIDATE" : "CANNOT VALIDATE"}</span></div>
      <p className="my-4 text-sm text-muted">{gating?.canValidate ? "Conditions de validation remplies." : "Conditions de validation non remplies."} Ce diagnostic ne valide pas la phase et ne modifie pas son statut.</p>
      <div className="grid gap-3 lg:grid-cols-3">
        <GatingList title="Bloqueurs" items={gating?.blockers ?? []} emptyLabel="Aucun bloqueur configuré." />
        <GatingList title="Conditions satisfaites" items={gating?.satisfiedConditions ?? []} emptyLabel="Aucune condition satisfaite." />
        <div className="rounded-xl border border-line bg-panel p-4"><h3>Conditions</h3>{gating?.conditions.length ? <ul>{gating.conditions.map((condition) => <li key={condition.code}><strong>{condition.label}</strong><span>{condition.required ? "Requise" : "Informative"} · {condition.satisfied ? "Satisfaite" : "Non satisfaite"}</span>{condition.reason && <small>{condition.reason}</small>}</li>)}</ul> : <p>Aucune condition configurée.</p>}</div>
      </div>
    </section>
    <section className={`${activeTab === "history" ? "block" : "hidden"} rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6`} aria-live="polite">
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-muted">Opération officielle</p><h2>Validation de la phase</h2></div><span className="rounded-md bg-panel px-2 py-1 text-xs font-semibold text-muted">{phase.status === "VALIDATED" ? "VALIDÉE" : "NON VALIDÉE"}</span></div>
      {phase.status === "VALIDATED" ? <p className="rounded-lg bg-green-50 p-3 text-sm text-success">Phase validée. Une validation supplémentaire n’est pas autorisée.</p> : gating?.canValidate ? <p className="rounded-lg bg-green-50 p-3 text-sm text-success">Conditions de validation remplies.</p> : <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-danger"><p className="text-sm text-danger">Validation impossible.</p><ul>{(gating?.blockers ?? []).map((blocker) => <li key={blocker}>{blocker}</li>)}</ul></div>}
      <button className="rounded-lg bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50" type="button" disabled={!gating?.canValidate || workflow?.locked || phase.status === "VALIDATED" || isSubmitting} onClick={() => void validateCurrentPhase()}>{isSubmitting ? "Validation..." : "Valider la phase"}</button>
      <div className="mt-6 border-t border-line pt-4"><h3>Historique des validations</h3>{validations.length === 0 ? <p>Aucune validation enregistrée.</p> : <ol>{validations.map((validation) => <li key={validation.id}><strong>{formatDate(validation.validatedAt)}</strong><span>{validation.validatedBy || "Auteur non renseigné"}</span>{validation.note && <small>{validation.note}</small>}</li>)}</ol>}</div>
    </section>
    <ConfirmDialog open={pendingDelete !== null} title="Supprimer cet élément ?" description="Cette action est définitive et l’élément sera retiré de la phase." onCancel={() => setPendingDelete(null)} onConfirm={() => pendingDelete && void confirmRemove(pendingDelete.kind, pendingDelete.id)} />
  </main>;
}

function EntitySection({ activeTab, title, actionLabel, count, action, children }: { activeTab: PhaseTab; title: string; actionLabel: string; count: number; action: () => void; children: ReactNode }) {
  const tab = title === "Evidences" ? "evidence" : title.toLowerCase();
  const SectionIcon = title === "Objectifs" ? Target : title === "Critères" ? ListChecks : title === "Tâches" ? ListTodo : title === "Questionnaires" ? ClipboardList : title === "Interviews" ? MessagesSquare : FileCheck;
  return (
    <section className={`${activeTab === tab ? "block" : "hidden"} rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6`}>
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.14em] text-muted">Phase scope</p>
          <h2 className="mt-1 flex items-center gap-2 font-display text-xl font-semibold text-ink">
            <SectionIcon className="text-muted" size={17} />
            {title}
            <span className="ml-2 text-muted">{count}</span>
          </h2>
        </div>
        <button className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-line bg-panel px-3 py-2 text-sm font-semibold text-brand-900" type="button" onClick={action}>
          <Plus aria-hidden="true" size={16} /> {actionLabel}
        </button>
      </div>
      {children}
    </section>
  );
}

function EmptyInline({ label }: { label: string }) {
  return <div className="border border-dashed border-line p-5 text-sm text-muted">{label}</div>;
}

function ReadinessList({ title, items, emptyLabel }: { title: string; items: { type: string; message: string; relatedEntityId: string | null }[]; emptyLabel: string }) {
  return <div className="rounded-xl border border-line bg-panel p-4 transition hover:border-accent-400"><h3 className="font-semibold text-ink">{title}</h3>{items.length === 0 ? <p className="mt-2 text-sm text-muted">{emptyLabel}</p> : <ul className="mt-3 space-y-2 text-sm text-muted">{items.map((item, index) => <li className="border-l-2 border-accent-400 pl-3" key={`${item.relatedEntityId ?? item.type}-${index}`}>{item.message}</li>)}</ul>}</div>;
}

function GatingList({ title, items, emptyLabel }: { title: string; items: string[]; emptyLabel: string }) {
  return <div className="rounded-xl border border-line bg-panel p-4 transition hover:border-accent-400"><h3 className="font-semibold text-ink">{title}</h3>{items.length === 0 ? <p className="mt-2 text-sm text-muted">{emptyLabel}</p> : <ul className="mt-3 space-y-2 text-sm text-muted">{items.map((item) => <li className="border-l-2 border-accent-400 pl-3" key={item}>{item}</li>)}</ul>}</div>;
}
