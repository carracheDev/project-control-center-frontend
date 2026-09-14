"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { StatusBadge } from "@/components/status-badge";
import { deleteProject, getProjects } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Project } from "@/types/domain";

export default function ProjectsPage() {
  return (
    <Suspense fallback={<main className="page-shell"><LoadingState label="Chargement des projets..." /></main>}>
      <ProjectsContent />
    </Suspense>
  );
}

function ProjectsContent() {
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(searchParams.get("deleted") ? "Projet supprimé avec succès." : null);

  useEffect(() => {
    getProjects()
      .then((loadedProjects) => {
        setProjects(loadedProjects);
        setError(null);
      })
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleDelete(project: Project) {
    if (!window.confirm(`Supprimer le projet « ${project.name} » et ses phases ?`)) return;
    setDeletingId(project.id);
    try {
      await deleteProject(project.id);
      setProjects((current) => current.filter((item) => item.id !== project.id));
      setSuccess("Projet supprimé avec succès.");
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Impossible de supprimer le projet");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="page-shell">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Espace de travail</p>
          <h1>Projets</h1>
          <p className="page-lede">Pilotez vos projets et gardez une lecture nette des phases, états et prochaines actions.</p>
        </div>
        <Link className="button button-primary" href="/projects/new">
          <span aria-hidden="true">+</span> Nouveau projet
        </Link>
      </section>

      {success && <div className="alert alert-success" role="status">{success}</div>}
      {error && <div className="alert alert-error" role="alert">{error}</div>}

      <section className="content-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Tous les projets</p>
            <h2>{isLoading ? "Chargement" : `${projects.length} projet${projects.length === 1 ? "" : "s"}`}</h2>
          </div>
        </div>

        {isLoading ? (
          <LoadingState label="Chargement des projets..." />
        ) : projects.length === 0 ? (
          <EmptyState
            title="Aucun projet"
            description="Votre premier espace de pilotage apparaîtra ici dès qu’un premier projet sera créé."
            actionLabel="Créer un projet"
            actionHref="/projects/new"
          />
        ) : (
          <div className="project-card-grid" aria-label="Liste des projets">
            {projects.map((project) => {
              const validatedCount = project.phases.filter((phase) => phase.status === "VALIDATED").length;
              const progress = project.phases.length ? Math.round((validatedCount / project.phases.length) * 100) : 0;
              const currentPhase = project.phases[0] ?? null;

              return (
                <div className="project-overview-card" key={project.id}>
                  <div className="project-overview-top">
                    <div className="project-overview-title">
                      <span className="project-mark" aria-hidden="true">
                        {project.name.slice(0, 1).toUpperCase()}
                      </span>
                      <div>
                        <p className="mini-label">Projet</p>
                        <h3>{project.name}</h3>
                      </div>
                    </div>
                    {currentPhase && <StatusBadge status={currentPhase.status} />}
                  </div>

                  <p className="project-card-description">{project.description || "Aucune description"}</p>

                  <div className="project-overview-meta">
                    <div>
                      <span>Phases</span>
                      <strong>{project.phases.length}</strong>
                    </div>
                    <div>
                      <span>Progression</span>
                      <strong>{progress}%</strong>
                    </div>
                    <div>
                      <span>Période</span>
                      <strong>{formatDate(project.startDate)}</strong>
                    </div>
                  </div>

                  <div className="dashboard-progress-block">
                    <div className="dashboard-progress-header">
                      <span>Phase actuelle</span>
                      <strong>{currentPhase ? `${String(currentPhase.order).padStart(2, "0")} · ${currentPhase.name}` : "Aucune phase"}</strong>
                    </div>
                    <div className="dashboard-progress-track">
                      <span style={{ width: `${progress}%` }} />
                    </div>
                    <small>
                      {validatedCount}/{project.phases.length} phases validées
                    </small>
                  </div>

                  <div className="project-overview-actions">
                    <Link className="button button-secondary" href={`/projects/${project.id}`}>
                      Ouvrir
                    </Link>
                    <button
                      className="button button-danger"
                      type="button"
                      onClick={() => void handleDelete(project)}
                      disabled={deletingId === project.id}
                    >
                      {deletingId === project.id ? "Suppression..." : "Supprimer"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}