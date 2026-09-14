"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingState } from "@/components/loading-state";
import { ProjectDecisionSection } from "@/components/project-decision-section";
import { PhaseForm } from "@/components/phase-form";
import { ProjectForm } from "@/components/project-form";
import { StatusBadge } from "@/components/status-badge";
import { ProjectTimelineView } from "@/components/project-timeline";
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
    } finally { setIsSubmitting(false); }
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
    } finally { setIsSubmitting(false); }
  }

  async function handleDelete() {
    if (!project || !window.confirm(`Supprimer le projet « ${project.name} » et ses phases ?`)) return;
    setIsSubmitting(true);
    try { await deleteProject(project.id); router.push("/projects?deleted=1"); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Impossible de supprimer le projet"); setIsSubmitting(false); }
  }

  if (isLoading) return <main className="page-shell"><LoadingState label="Chargement du projet..." /></main>;
  if (!project) return <main className="page-shell"><div className="alert alert-error">{error || "Projet introuvable"}</div><Link className="back-link" href="/projects">← Retour aux projets</Link></main>;

  return <main className="page-shell">
    <Link className="back-link" href="/projects">← Tous les projets</Link>
    {success && <div className="alert alert-success" role="status">{success}</div>}
    {error && <div className="alert alert-error" role="alert">{error}</div>}
    {isEditing ? <><section className="page-heading compact-heading"><div><p className="eyebrow">Modifier le projet</p><h1>{project.name}</h1></div></section><ProjectForm error={null} isSubmitting={isSubmitting} onCancel={() => setIsEditing(false)} onSubmit={handleUpdate} project={project} /></> : <>
      <section className="detail-hero"><div className="detail-title"><span className="project-mark project-mark-large" aria-hidden="true">{project.name.slice(0, 1).toUpperCase()}</span><div><p className="eyebrow">Projet</p><h1>{project.name}</h1><p>{project.description || "Aucune description"}</p></div></div><div className="detail-actions"><button className="button button-secondary" type="button" onClick={() => setIsEditing(true)}>Modifier</button><button className="button button-danger" type="button" onClick={() => void handleDelete()} disabled={isSubmitting}>Supprimer</button></div></section>
      <section className="detail-facts"><div><span>Date de début</span><strong>{formatDate(project.startDate)}</strong></div><div><span>Date de fin</span><strong>{formatDate(project.endDate)}</strong></div><div><span>Phases</span><strong>{project.phases.length}</strong></div></section>
      <ProjectTimelineView projectId={project.id} />
      <section className="content-section"><div className="section-heading"><div><p className="eyebrow">Séquence de travail</p><h2>Phases du projet</h2></div><button className="button button-primary" type="button" onClick={() => setIsAddingPhase((current) => !current)}><span aria-hidden="true">+</span> Nouvelle phase</button></div>
        {isAddingPhase && <PhaseForm error={null} isSubmitting={isSubmitting} nextOrder={project.phases.length + 1} onCancel={() => setIsAddingPhase(false)} onSubmit={handleCreatePhase} />}
        {project.phases.length === 0 ? <div className="empty-state"><span className="empty-mark" aria-hidden="true">+</span><h3>Aucune phase</h3><p>Ajoutez la première phase pour donner une séquence à ce projet.</p><button className="button button-secondary" type="button" onClick={() => setIsAddingPhase(true)}>Créer une phase</button></div> : <div className="phase-list">{project.phases.map((phase) => <Link className="phase-row" href={`/phases/${phase.id}`} key={phase.id}><span className="phase-order">{String(phase.order).padStart(2, "0")}</span><div className="phase-main"><h3>{phase.name}</h3><p>{phase.description || "Aucune description"}</p></div><div className="phase-meta"><StatusBadge status={phase.status} /><span>{formatDate(phase.deadline)}</span><span className="row-arrow" aria-hidden="true">→</span></div></Link>)}</div>}
      </section>
      <ProjectDecisionSection projectId={project.id} />
    </>}
  </main>;
}