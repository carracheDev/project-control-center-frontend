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
  return <Suspense fallback={<main className="page-shell"><LoadingState label="Chargement des projets..." /></main>}><ProjectsContent /></Suspense>;
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
        <div><p className="eyebrow">Espace de travail</p><h1>Projets</h1><p className="page-lede">Structurez les étapes et gardez une lecture nette de chaque projet.</p></div>
        <Link className="button button-primary" href="/projects/new"><span aria-hidden="true">+</span> Nouveau projet</Link>
      </section>
      {success && <div className="alert alert-success" role="status">{success}</div>}
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      <section className="content-section">
        <div className="section-heading"><div><p className="eyebrow">Tous les projets</p><h2>{isLoading ? "Chargement" : `${projects.length} projet${projects.length === 1 ? "" : "s"}`}</h2></div></div>
        {isLoading ? <LoadingState label="Chargement des projets..." /> : projects.length === 0 ? <EmptyState title="Aucun projet" description="Votre premier espace de pilotage apparaîtra ici." actionLabel="Créer un projet" actionHref="/projects/new" /> : (
          <div className="project-table-wrap">
            <div className="project-table" role="table" aria-label="Liste des projets">
              <div className="table-header" role="row"><span>Projet</span><span>Phases</span><span>Période</span><span>État</span><span /></div>
              {projects.map((project) => (
                <div className="table-row" role="row" key={project.id}>
                  <Link className="table-project" href={`/projects/${project.id}`}><span className="project-mark" aria-hidden="true">{project.name.slice(0, 1).toUpperCase()}</span><span><strong>{project.name}</strong><small>{project.description || "Aucune description"}</small></span></Link>
                  <span>{project.phases.length} phase{project.phases.length === 1 ? "" : "s"}</span>
                  <span>{formatDate(project.startDate)}<small className="table-subtext">→ {formatDate(project.endDate)}</small></span>
                  <span><StatusBadge status={project.phases[0]?.status ?? "PLANNED"} /></span>
                  <span className="table-actions"><Link className="icon-button" href={`/projects/${project.id}`} aria-label={`Ouvrir ${project.name}`}>→</Link><button className="icon-button icon-button-danger" type="button" onClick={() => void handleDelete(project)} disabled={deletingId === project.id} aria-label={`Supprimer ${project.name}`}>×</button></span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}