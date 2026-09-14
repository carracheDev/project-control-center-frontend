"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { CriterionForm } from "@/components/criterion-form";
import { CriterionAssessmentControls } from "@/components/criterion-assessment-controls";
import { InterviewForm } from "@/components/interview-form";
import { EvidenceForm } from "@/components/evidence-form";
import { CoverageRequirementForm } from "@/components/coverage-requirement-form";
import { LoadingState } from "@/components/loading-state";
import { PhaseHeader } from "@/components/phase-header";
import { PhaseOverview } from "@/components/phase-overview";
import { PhaseSummary } from "@/components/phase-summary";
import { ObjectiveForm } from "@/components/objective-form";
import { QuestionnaireForm } from "@/components/questionnaire-form";
import { TaskForm } from "@/components/task-form";
import { createCoverageRequirement, createCriterion, createEvidence, createInterview, createObjective, createQuestionnaire, createTask, deleteCoverageRequirement, deleteCriterion, deleteEvidence, deleteInterview, deleteObjective, deleteQuestionnaire, deleteTask, getCoverage, getCoverageRequirements, getCriteria, getEvidence, getInterviews, getObjectives, getPhase, getPhaseGating, getPhaseReadiness, getPhaseValidations, getPhaseWorkflow, getProject, getQuestionnaires, getTasks, rejectEvidence, updateCoverageRequirement, updateCriterion, updateEvidence, updateInterview, updateObjective, updateQuestionnaire, updateTask, uploadEvidence, validatePhase, verifyEvidence } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Criterion, CreateCoverageRequirementInput, CreateCriterionInput, CreateEvidenceInput, CreateInterviewInput, CreateObjectiveInput, CreateQuestionnaireInput, CreateTaskInput, CoverageRequirement, Evidence, GatingResult, Interview, Objective, Phase, PhaseCoverageResult, PhaseReadinessResult, PhaseValidation, PhaseWorkflowState, Project, Questionnaire, Task } from "@/types/domain";

type FormKind = "objective" | "criterion" | "task" | "questionnaire" | "interview" | "evidence" | "coverage" | null;
type PhaseTab = "overview" | "objectives" | "criteria" | "tasks" | "questionnaires" | "interviews" | "evidence" | "history";

export default function PhaseDetailPage() {
  const params = useParams<{ id: string }>();
  const [phase, setPhase] = useState<Phase | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
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
  const [activeTab, setActiveTab] = useState<PhaseTab>("overview");

  useEffect(() => {
    Promise.all([getPhase(params.id), getObjectives(params.id), getCriteria(params.id), getTasks(params.id), getQuestionnaires(params.id), getInterviews(params.id), getEvidence(params.id), getCoverageRequirements(params.id), getCoverage(params.id), getPhaseReadiness(params.id), getPhaseGating(params.id), getPhaseValidations(params.id), getPhaseWorkflow(params.id)])
      .then(async ([loadedPhase, loadedObjectives, loadedCriteria, loadedTasks, loadedQuestionnaires, loadedInterviews, loadedEvidence, loadedCoverageRequirements, loadedCoverage, loadedReadiness, loadedGating, loadedValidations, loadedWorkflow]) => {
        const loadedProject = await getProject(loadedPhase.projectId);
        setProject(loadedProject);
        setPhase(loadedPhase);
        setObjectives(loadedObjectives);
        setCriteria(loadedCriteria);
        setTasks(loadedTasks);
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
    if (!window.confirm("Supprimer cet élément ?")) return;
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

  if (isLoading) return <main className="page-shell"><LoadingState label="Chargement de la phase..." /></main>;
  if (!phase) return <main className="page-shell"><div className="alert alert-error">{error || "Phase introuvable"}</div><Link className="back-link" href="/projects">← Retour aux projets</Link></main>;

  const editingObjective = editingId ? objectives.find((item) => item.id === editingId) : undefined;
  const editingCriterion = editingId ? criteria.find((item) => item.id === editingId) : undefined;
  const editingTask = editingId ? tasks.find((item) => item.id === editingId) : undefined;
  const editingQuestionnaire = editingId ? questionnaires.find((item) => item.id === editingId) : undefined;
  const editingInterview = editingId ? interviews.find((item) => item.id === editingId) : undefined;
  const editingEvidence = editingId ? evidence.find((item) => item.id === editingId) : undefined;
  const editingCoverageRequirement = editingId ? coverageRequirements.find((item) => item.id === editingId) : undefined;

  const readinessBlockers = readiness?.blockers.length ?? 0;
  const gatingBlockers = gating?.blockers.length ?? 0;
  const tabs: { id: PhaseTab; label: string }[] = [
    { id: "overview", label: "Vue d'ensemble" }, { id: "objectives", label: "Objectifs" }, { id: "criteria", label: "Critères" }, { id: "tasks", label: "Tâches" }, { id: "questionnaires", label: "Questionnaires" }, { id: "interviews", label: "Interviews" }, { id: "evidence", label: "Preuves" }, { id: "history", label: "Historique" },
  ];

  return <main className={`page-shell phase-page phase-tab-${activeTab}`}>
    <PhaseHeader phase={phase} project={project} />
    <PhaseSummary phase={phase} blockers={readinessBlockers + gatingBlockers} objectives={objectives.length} criteria={criteria.length} tasks={tasks.length} interviews={interviews.length} evidence={evidence.length} readiness={readiness} gating={gating} />
    <PhaseOverview phase={phase} workflow={workflow} readiness={readiness} gating={gating} validations={validations} isSubmitting={isSubmitting} onValidate={() => void validateCurrentPhase()} onShowBlockers={() => setActiveTab("overview")} />
    <nav className="phase-tab-nav" aria-label="Navigation locale de la phase">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`phase-tab-button ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
    {success && <div className="alert alert-success" role="status">{success}</div>}
    {error && <div className="alert alert-error" role="alert">{error}</div>}
    <section className="content-section coverage-section"><div className="section-heading"><div><p className="eyebrow">Mesure de recherche</p><h2>Couverture de recherche</h2></div><button className="button button-secondary" type="button" onClick={() => { setEditingId(null); setFormKind("coverage"); }}><span aria-hidden="true">+</span> Ajouter un requirement</button></div><div className="coverage-summary"><div><span>Interviews complétées</span><strong>{coverage?.completedInterviews ?? 0} / {coverage?.totalInterviews ?? 0}</strong></div><div><span>Requirements obligatoires satisfaits</span><strong>{coverage?.requirements.filter((requirement) => requirement.satisfied && coverageRequirements.find((item) => item.id === requirement.requirementId)?.required).length ?? 0} / {coverage?.requirements.filter((requirement) => coverageRequirements.find((item) => item.id === requirement.requirementId)?.required).length ?? 0}</strong></div><div><span>Information de couverture</span><strong>{coverage?.allRequiredSatisfied ? "Tous couverts" : "À compléter"}</strong></div></div>{formKind === "coverage" && <CoverageRequirementForm requirement={editingCoverageRequirement} objectives={objectives} isSubmitting={isSubmitting} error={error} onCancel={closeForm} onSubmit={saveCoverageRequirement} />}{coverageRequirements.length === 0 ? <EmptyInline label="Aucun requirement de couverture défini." /> : <div className="coverage-grid">{coverageRequirements.map((requirement) => { const result = coverage?.requirements.find((item) => item.requirementId === requirement.id); return <article className="coverage-card" key={requirement.id}><div className="coverage-card-heading"><div><h3>{requirement.name}</h3><p>{requirement.objective?.name || "Couverture de phase"}{requirement.required ? " · Obligatoire" : " · Optionnel"}</p></div><div className="row-controls"><button className="icon-button" type="button" onClick={() => { setEditingId(requirement.id); setFormKind("coverage"); }} aria-label="Modifier le requirement">✎</button><button className="icon-button icon-button-danger" type="button" onClick={() => void remove("coverage", requirement.id)} aria-label="Supprimer le requirement">×</button></div></div><strong className="coverage-numbers">{result?.coveredInterviews ?? 0} / {requirement.minimumInterviews}</strong><span className="coverage-percentage">{result?.percentage ?? 0} %</span><span className={`coverage-state ${result?.satisfied ? "coverage-state-satisfied" : "coverage-state-unsatisfied"}`}>{result?.satisfied ? "✓ Couvert" : "✕ Insuffisant"}</span></article>; })}</div>}</section>
    <EntitySection title="Objectifs" count={objectives.length} action={() => { setEditingId(null); setFormKind("objective"); }}>
      {formKind === "objective" && <ObjectiveForm objective={editingObjective} nextOrder={objectives.length + 1} isSubmitting={isSubmitting} error={error} onCancel={closeForm} onSubmit={saveObjective} />}
      {objectives.length === 0 ? <EmptyInline label="Aucun objectif défini." /> : <div className="work-list">{objectives.map((objective) => <div className="work-row" key={objective.id}><span className="phase-order">{String(objective.order).padStart(2, "0")}</span><div className="work-main"><h3>{objective.name}</h3><p>{objective.description || "Aucune description"}</p></div><div className="row-controls"><button className="icon-button" type="button" onClick={() => { setEditingId(objective.id); setFormKind("objective"); }} aria-label="Modifier l’objectif">✎</button><button className="icon-button icon-button-danger" type="button" onClick={() => void remove("objective", objective.id)} aria-label="Supprimer l’objectif">×</button></div></div>)}</div>}
    </EntitySection>
    <EntitySection title="Critères" count={criteria.length} action={() => { setEditingId(null); setFormKind("criterion"); }}>
      {formKind === "criterion" && <CriterionForm criterion={editingCriterion} objectives={objectives} nextOrder={criteria.length + 1} isSubmitting={isSubmitting} error={error} onCancel={closeForm} onSubmit={saveCriterion} />}
      {criteria.length === 0 ? <EmptyInline label="Aucun critère défini." /> : <div className="work-list">{criteria.map((criterion) => <div className="work-row" key={criterion.id}><span className="phase-order">{String(criterion.order).padStart(2, "0")}</span><div className="work-main"><h3>{criterion.name} {criterion.required && <span className="required-label">Requis</span>}</h3><p>{criterion.description || "Aucune description"}</p><CriterionAssessmentControls criterion={criterion} evidence={evidence} onChanged={(assessment) => { setCriteria((items) => items.map((item) => item.id === criterion.id ? { ...item, assessment } : item)); void refreshDiagnostics().catch((requestError: Error) => setError(requestError.message)); }} /></div><div className="row-controls"><button className="icon-button" type="button" onClick={() => { setEditingId(criterion.id); setFormKind("criterion"); }} aria-label="Modifier le critère">✎</button><button className="icon-button icon-button-danger" type="button" onClick={() => void remove("criterion", criterion.id)} aria-label="Supprimer le critère">×</button></div></div>)}</div>}
    </EntitySection>
    <EntitySection title="Tâches" count={tasks.length} action={() => { setEditingId(null); setFormKind("task"); }}>
      {formKind === "task" && <TaskForm task={editingTask} objectives={objectives} criteria={criteria} isSubmitting={isSubmitting} error={error} onCancel={closeForm} onSubmit={saveTask} />}
      {tasks.length === 0 ? <EmptyInline label="Aucune tâche définie." /> : <div className="work-list">{tasks.map((task) => <div className="work-row" key={task.id}><div className="work-main"><h3>{task.title}</h3><p>{task.description || "Aucune description"}</p></div><div className="task-meta"><span className={`task-status task-${task.status.toLowerCase()}`}>{task.status.replace("_", " ")}</span><span className={`task-priority priority-${task.priority.toLowerCase()}`}>{task.priority}</span><span>{formatDate(task.deadline)}</span></div><div className="row-controls"><button className="icon-button" type="button" onClick={() => { setEditingId(task.id); setFormKind("task"); }} aria-label="Modifier la tâche">✎</button><button className="icon-button icon-button-danger" type="button" onClick={() => void remove("task", task.id)} aria-label="Supprimer la tâche">×</button></div></div>)}</div>}
    </EntitySection>
    <EntitySection title="Questionnaires" count={questionnaires.length} action={() => { setEditingId(null); setFormKind("questionnaire"); }}>
      {formKind === "questionnaire" && <QuestionnaireForm questionnaire={editingQuestionnaire} isSubmitting={isSubmitting} error={error} onCancel={closeForm} onSubmit={saveQuestionnaire} />}
      {questionnaires.length === 0 ? <EmptyInline label="Aucun questionnaire défini." /> : <div className="work-list">{questionnaires.map((questionnaire) => <div className="work-row" key={questionnaire.id}><div className="work-main"><h3><Link href={`/questionnaires/${questionnaire.id}`}>{questionnaire.name}</Link></h3><p>{questionnaire.description || "Aucune description"} · version {questionnaire.version}</p></div><span className={`task-status questionnaire-${questionnaire.status.toLowerCase()}`}>{questionnaire.status}</span><div className="row-controls"><Link className="icon-button" href={`/questionnaires/${questionnaire.id}`} aria-label="Ouvrir le questionnaire">→</Link><button className="icon-button" type="button" onClick={() => { setEditingId(questionnaire.id); setFormKind("questionnaire"); }} aria-label="Modifier le questionnaire">✎</button><button className="icon-button icon-button-danger" type="button" onClick={() => void remove("questionnaire", questionnaire.id)} aria-label="Supprimer le questionnaire">×</button></div></div>)}</div>}
    </EntitySection>
    <EntitySection title="Interviews" count={interviews.length} action={() => { setEditingId(null); setFormKind("interview"); }}>
      {formKind === "interview" && <InterviewForm interview={editingInterview} questionnaires={questionnaires} isSubmitting={isSubmitting} error={error} onCancel={closeForm} onSubmit={saveInterview} />}
      {interviews.length === 0 ? <EmptyInline label="Aucune interview planifiée." /> : <div className="work-list">{interviews.map((interview) => <div className="work-row" key={interview.id}><div className="work-main"><h3><Link href={`/interviews/${interview.id}`}>{interview.respondentName}</Link></h3><p>{interview.respondentRole || "Rôle non défini"} · {questionnaires.find((item) => item.id === interview.questionnaireId)?.name || "Questionnaire"}</p></div><span className={`task-status task-${interview.status.toLowerCase()}`}>{interview.status.replace("_", " ")}</span><div className="row-controls"><Link className="icon-button" href={`/interviews/${interview.id}`} aria-label="Ouvrir l’interview">→</Link><button className="icon-button" type="button" onClick={() => { setEditingId(interview.id); setFormKind("interview"); }} aria-label="Modifier l’interview">✎</button><button className="icon-button icon-button-danger" type="button" onClick={() => void remove("interview", interview.id)} aria-label="Supprimer l’interview">×</button></div></div>)}</div>}
    </EntitySection>
    <EntitySection title="Evidences" count={evidence.length} action={() => { setEditingId(null); setFormKind("evidence"); }}>
      {formKind === "evidence" && <EvidenceForm evidence={editingEvidence} criteria={criteria} tasks={tasks} interviews={interviews} isSubmitting={isSubmitting} error={error} onCancel={closeForm} onSubmit={saveEvidence} onUpload={uploadEvidenceFile} />}
      {evidence.length === 0 ? <EmptyInline label="Aucune preuve enregistrée." /> : <div className="work-list">{evidence.map((item) => <div className="work-row" key={item.id}><div className="work-main"><h3>{item.title}</h3><p>{item.type} · {item.source} · {item.criterion?.name || "Sans criterion"}</p></div><span className={`task-status evidence-${item.status.toLowerCase()}`}>{item.status}</span><div className="row-controls"><button className="icon-button" type="button" onClick={() => { setEditingId(item.id); setFormKind("evidence"); }} aria-label="Modifier la preuve">✎</button>{item.status === "PENDING" && <><button className="icon-button" type="button" onClick={() => void verifyEvidence(item.id).then((updated) => { setEvidence((items) => items.map((entry) => entry.id === item.id ? updated : entry)); setSuccess("Preuve vérifiée par le backend."); }).catch((requestError: Error) => setError(requestError.message))} aria-label="Vérifier la preuve">✓</button><button className="icon-button icon-button-danger" type="button" onClick={() => void rejectEvidence(item.id).then((updated) => { setEvidence((items) => items.map((entry) => entry.id === item.id ? updated : entry)); setSuccess("Preuve rejetée par le backend."); }).catch((requestError: Error) => setError(requestError.message))} aria-label="Rejeter la preuve">!</button></>}<button className="icon-button icon-button-danger" type="button" onClick={() => void remove("evidence", item.id)} aria-label="Supprimer la preuve">×</button></div></div>)}</div>}
    </EntitySection>
    <section className="content-section readiness-section" aria-live="polite">
      <div className="section-heading"><div><p className="eyebrow">Diagnostic calculé à la demande</p><h2>État de préparation</h2></div><span className={`readiness-status readiness-${readiness?.ready ? "ready" : "not-ready"}`}>{readiness?.ready ? "READY" : "NOT READY"}</span></div>
      <div className="readiness-columns">
        <ReadinessList title="Bloqueurs" items={readiness?.blockers ?? []} className="readiness-blockers" emptyLabel="Aucun bloqueur détecté." />
        <ReadinessList title="Satisfait" items={readiness?.satisfiedConditions ?? []} className="readiness-satisfied" emptyLabel="Aucune condition satisfaite signalée." />
        <ReadinessList title="Prochaines actions" items={readiness?.nextActions ?? []} className="readiness-actions" emptyLabel="Aucune action suggérée." />
      </div>
    </section>
    <section className="content-section gating-section" aria-live="polite">
      <div className="section-heading"><div><p className="eyebrow">Conditions de sortie configurées</p><h2>Gating</h2></div><span className={`gating-status gating-${gating?.canValidate ? "can" : "cannot"}`}>{gating?.canValidate ? "CAN VALIDATE" : "CANNOT VALIDATE"}</span></div>
      <p className="gating-explanation">{gating?.canValidate ? "Conditions de validation remplies." : "Conditions de validation non remplies."} Ce diagnostic ne valide pas la phase et ne modifie pas son statut.</p>
      <div className="gating-columns">
        <GatingList title="Bloqueurs" items={gating?.blockers ?? []} className="gating-blockers" emptyLabel="Aucun bloqueur configuré." />
        <GatingList title="Conditions satisfaites" items={gating?.satisfiedConditions ?? []} className="gating-satisfied" emptyLabel="Aucune condition satisfaite." />
        <div className="gating-conditions"><h3>Conditions</h3>{gating?.conditions.length ? <ul>{gating.conditions.map((condition) => <li key={condition.code}><strong>{condition.label}</strong><span>{condition.required ? "Requise" : "Informative"} · {condition.satisfied ? "Satisfaite" : "Non satisfaite"}</span>{condition.reason && <small>{condition.reason}</small>}</li>)}</ul> : <p>Aucune condition configurée.</p>}</div>
      </div>
    </section>
    <section className="content-section validation-section" aria-live="polite">
      <div className="section-heading"><div><p className="eyebrow">Opération officielle</p><h2>Validation de la phase</h2></div><span className={`validation-status validation-${phase.status.toLowerCase()}`}>{phase.status === "VALIDATED" ? "VALIDÉE" : "NON VALIDÉE"}</span></div>
      {phase.status === "VALIDATED" ? <p className="validation-message validation-message-success">Phase validée. Une validation supplémentaire n’est pas autorisée.</p> : gating?.canValidate ? <p className="validation-message validation-message-success">Conditions de validation remplies.</p> : <div className="validation-blocked"><p className="validation-message">Validation impossible.</p><ul>{(gating?.blockers ?? []).map((blocker) => <li key={blocker}>{blocker}</li>)}</ul></div>}
      <button className="button button-primary" type="button" disabled={!gating?.canValidate || workflow?.locked || phase.status === "VALIDATED" || isSubmitting} onClick={() => void validateCurrentPhase()}>{isSubmitting ? "Validation..." : "Valider la phase"}</button>
      <div className="validation-history"><h3>Historique des validations</h3>{validations.length === 0 ? <p>Aucune validation enregistrée.</p> : <ol>{validations.map((validation) => <li key={validation.id}><strong>{formatDate(validation.validatedAt)}</strong><span>{validation.validatedBy || "Auteur non renseigné"}</span>{validation.note && <small>{validation.note}</small>}</li>)}</ol>}</div>
    </section>
  </main>;
}

function EntitySection({ title, count, action, children }: { title: string; count: number; action: () => void; children: ReactNode }) {
  return (
    <section className="content-section entity-section">
      <div className="phase-entity-header">
        <div>
          <p className="eyebrow">Phase scope</p>
          <h2>
            {title}
            <span className="count-label">{count}</span>
          </h2>
        </div>
        <button className="button button-secondary" type="button" onClick={action}>
          <span aria-hidden="true">+</span> Ajouter
        </button>
      </div>
      {children}
    </section>
  );
}

function EmptyInline({ label }: { label: string }) {
  return <div className="empty-inline">{label}</div>;
}

function ReadinessList({ title, items, className, emptyLabel }: { title: string; items: { type: string; message: string; relatedEntityId: string | null }[]; className: string; emptyLabel: string }) {
  return <div className={`readiness-list ${className}`}><h3>{title}</h3>{items.length === 0 ? <p>{emptyLabel}</p> : <ul>{items.map((item, index) => <li key={`${item.relatedEntityId ?? item.type}-${index}`}>{item.message}</li>)}</ul>}</div>;
}

function GatingList({ title, items, className, emptyLabel }: { title: string; items: string[]; className: string; emptyLabel: string }) {
  return <div className={`gating-list ${className}`}><h3>{title}</h3>{items.length === 0 ? <p>{emptyLabel}</p> : <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>}</div>;
}