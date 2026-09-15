"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, CalendarDays, CheckCircle2, Layers3, Plus } from "lucide-react";
import { LoadingState } from "@/components/loading-state";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ProjectDecisionSection } from "@/components/project-decision-section";
import { PhaseForm } from "@/components/phase-form";
import { ProjectForm } from "@/components/project-form";
import { StatusBadge } from "@/components/status-badge";
import { ProjectTimelineView } from "@/components/project-timeline";
import { ProjectRiskSection } from "@/components/project-risk-section";
import { createPhase, deleteProject, getProject, updateProject } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { CreatePhaseInput, CreateProjectInput, Project } from "@/types/domain";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingPhase, setIsAddingPhase] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(searchParams.get("created") ? "Projet créé avec succès." : null);

  useEffect(() => {
    getProject(params.id)
      .then((loadedProject) => {
        setProject(loadedProject);
        setError(null);
      })
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setIsLoading(false));
  }, [params.id]);

  async function handleUpdate(input: CreateProjectInput) {
    setIsSubmitting(true);
    try {
      setProject(await updateProject(params.id, input));
      setIsEditing(false);
      setSuccess("Projet mis à jour avec succès.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Impossible de modifier le projet");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCreatePhase(input: CreatePhaseInput) {
    if (!project) return;
    setIsSubmitting(true);
    try {
      const phase = await createPhase(project.id, input);
      setProject({ ...project, phases: [...project.phases, phase].sort((a, b) => a.order - b.order) });
      setIsAddingPhase(false);
      setSuccess("Phase créée avec succès.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Impossible de créer la phase");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!project) return;
    setIsDeleteDialogOpen(false);
    setIsSubmitting(true);
    try {
      await deleteProject(project.id);
      router.push("/projects?deleted=1");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Impossible de supprimer le projet");
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <main><LoadingState label="Chargement du projet..." /></main>;
  if (!project) return <main><div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-danger">{error || "Projet introuvable"}</div><Link className="mt-4 inline-block text-sm font-semibold text-muted" href="/projects">← Retour aux projets</Link></main>;

  const validatedPhases = project.phases.filter((phase) => phase.status === "VALIDATED").length;
  const blockers = project.phases.filter((phase) => phase.status === "LOCKED" || phase.status === "REOPENED").length;
  const nextPhase = project.phases.find((phase) => phase.status !== "VALIDATED") ?? project.phases[project.phases.length - 1] ?? null;

  return (
    <main className="space-y-6">
      <Link className="inline-block text-sm font-semibold text-muted hover:text-brand-900" href="/projects">
        ← Tous les projets
      </Link>

      {success && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-success" role="status">{success}</div>}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-danger" role="alert">{error}</div>}

      {isEditing ? (
        <>
          <section>
            <div>
              <p className="text-xs font-bold uppercase tracking-[.14em] text-muted">Modifier le projet</p>
              <h1 className="mt-2 font-display text-3xl font-semibold text-ink">{project.name}</h1>
            </div>
          </section>
          <ProjectForm error={null} isSubmitting={isSubmitting} onCancel={() => setIsEditing(false)} onSubmit={handleUpdate} project={project} />
        </>
      ) : (
        <>
          <section className="flex flex-col justify-between gap-5 rounded-2xl border border-line bg-surface p-6 shadow-sm sm:flex-row sm:items-start">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-900 text-lg font-bold text-white" aria-hidden="true">
                {project.name.slice(0, 1).toUpperCase()}
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[.14em] text-muted">Projet</p>
                <h1 className="mt-2 font-display text-3xl font-semibold text-ink">{project.name}</h1>
                <p className="mt-2 text-sm text-muted">{project.description || "Aucune description"}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="rounded-lg border border-line bg-panel px-3 py-2 text-sm font-semibold text-brand-900 transition-colors duration-200 hover:border-brand-900 hover:bg-brand-900 hover:text-white" type="button" onClick={() => setIsEditing(true)}>
                Modifier
              </button>
              <button className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-danger transition-colors duration-200 hover:border-danger hover:bg-danger hover:text-white disabled:opacity-50" type="button" onClick={() => setIsDeleteDialogOpen(true)} disabled={isSubmitting}>
                Supprimer
              </button>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-5" aria-label="Résumé du projet">
            <div className="flex gap-3 bg-surface p-4">
              <CalendarDays className="mt-0.5 shrink-0 text-muted" size={16} />
              <span><span className="block text-xs text-muted">Début</span><strong className="mt-1 block text-sm text-ink">{formatDate(project.startDate)}</strong></span>
            </div>
            <div className="flex gap-3 bg-surface p-4">
              <CalendarDays className="mt-0.5 shrink-0 text-muted" size={16} />
              <span><span className="block text-xs text-muted">Fin</span><strong className="mt-1 block text-sm text-ink">{formatDate(project.endDate)}</strong></span>
            </div>
            <div className="flex gap-3 bg-surface p-4">
              <Layers3 className="mt-0.5 shrink-0 text-muted" size={16} />
              <span><span className="block text-xs text-muted">Phases</span><strong className="mt-1 block text-sm text-ink">{project.phases.length}</strong></span>
            </div>
            <div className="flex gap-3 bg-surface p-4">
              <CheckCircle2 className="mt-0.5 shrink-0 text-success" size={16} />
              <span><span className="block text-xs text-muted">Validées</span><strong className="mt-1 block text-sm text-ink">{validatedPhases}</strong></span>
            </div>
            <div className="flex gap-3 bg-surface p-4">
              <AlertTriangle className={`mt-0.5 shrink-0 ${blockers ? "text-danger" : "text-muted"}`} size={16} />
              <span><span className="block text-xs text-muted">Blocages</span><strong className="mt-1 block text-sm text-ink">{blockers}</strong></span>
            </div>
          </section>

          {nextPhase && (
            <section className="flex flex-col justify-between gap-5 rounded-xl border border-amber-200 bg-[#fff8ec] p-5 transition hover:border-accent-400 hover:shadow-[0_8px_20px_rgba(245,158,11,.12)] sm:flex-row sm:items-center" aria-label="Prochaine action">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.14em] text-warning">Prochaine action</p>
                <h2 className="mt-1 font-display text-xl font-semibold text-ink">{nextPhase.name}</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                  {nextPhase.status === "LOCKED" || nextPhase.status === "REOPENED"
                    ? "Cette phase demande une action corrective avant de reprendre le cours du projet."
                    : "La phase suivante est le point d’attention principal pour ce projet."}
                </p>
              </div>
              <div className="text-sm text-muted">
                <span>{String(nextPhase.order).padStart(2, "0")} · {nextPhase.status}</span>
                <strong>{formatDate(nextPhase.deadline)}</strong>
              </div>
              <Link className="rounded-lg bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white" href={`/phases/${nextPhase.id}`}>
                Ouvrir la phase
              </Link>
            </section>
          )}

          <ProjectTimelineView projectId={project.id} />

          <ProjectRiskSection projectId={project.id} phases={project.phases} />

          <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.14em] text-muted">Séquence de travail</p>
                <h2 className="mt-1 font-display text-xl font-semibold text-ink">Phases du projet</h2>
              </div>
              <button className="rounded-lg bg-brand-900 px-3 py-2 text-sm font-semibold text-white" type="button" onClick={() => setIsAddingPhase((current) => !current)}>
                <Plus aria-hidden="true" size={16} /> Nouvelle phase
              </button>
            </div>

            {isAddingPhase && (
              <PhaseForm
                error={null}
                isSubmitting={isSubmitting}
                nextOrder={project.phases.length + 1}
                onCancel={() => setIsAddingPhase(false)}
                onSubmit={handleCreatePhase}
              />
            )}

            {project.phases.length === 0 ? (
              <div className="empty-state">
                <span className="empty-mark" aria-hidden="true">
                  +
                </span>
                <h3>Aucune phase</h3>
                <p>Ajoutez la première phase pour donner une séquence à ce projet.</p>
                <button className="rounded-lg border border-line bg-panel px-3 py-2 text-sm font-semibold text-brand-900" type="button" onClick={() => setIsAddingPhase(true)}>
                  Créer une phase
                </button>
              </div>
            ) : (
              <div className="divide-y divide-line">
                {project.phases.map((phase) => (
                  <Link className="flex items-center gap-4 py-4 first:pt-0 last:pb-0" href={`/phases/${phase.id}`} key={phase.id}>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-panel text-xs font-bold text-brand-900">{String(phase.order).padStart(2, "0")}</span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-ink">{phase.name}</h3>
                      <p className="mt-1 text-xs text-muted">{phase.description || "Aucune description"}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-xs text-muted">
                      <StatusBadge status={phase.status} />
                      <span>{formatDate(phase.deadline)}</span>
                      <ArrowRight className="text-muted" aria-hidden="true" size={16} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <ProjectDecisionSection projectId={project.id} />
          <ConfirmDialog open={isDeleteDialogOpen} title="Supprimer ce projet ?" description={`Le projet « ${project.name} » et toutes ses phases seront supprimés définitivement.`} isSubmitting={isSubmitting} onCancel={() => setIsDeleteDialogOpen(false)} onConfirm={() => void handleDelete()} />
        </>
      )}
    </main>
  );
}