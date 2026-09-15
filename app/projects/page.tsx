"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { EmptyState } from "@/components/empty-state";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { LoadingState } from "@/components/loading-state";
import { StatusBadge } from "@/components/status-badge";
import { deleteProject, getProjects } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Project } from "@/types/domain";

export default function ProjectsPage() {
  return (
    <Suspense fallback={<main><LoadingState label="Chargement des projets..." /></main>}>
      <ProjectsContent />
    </Suspense>
  );
}

function ProjectsContent() {
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
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
    setDeletingId(project.id);
    try {
      await deleteProject(project.id);
      setProjects((current) => current.filter((item) => item.id !== project.id));
      setSuccess("Projet supprimé avec succès.");
      setProjectToDelete(null);
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Impossible de supprimer le projet");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="space-y-7">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.14em] text-muted">Espace de travail</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">Projets</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Pilotez vos projets et gardez une lecture nette des phases, états et prochaines actions.</p>
        </div>
        <Link className="inline-flex items-center rounded-lg bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-950" href="/projects/new">
          <Plus aria-hidden="true" size={16} /> Nouveau projet
        </Link>
      </section>

      {success && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-success" role="status">{success}</div>}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-danger" role="alert">{error}</div>}

      <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.14em] text-muted">Tous les projets</p>
            <h2 className="mt-1 font-display text-xl font-semibold text-ink">{isLoading ? "Chargement" : `${projects.length} projet${projects.length === 1 ? "" : "s"}`}</h2>
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
          <div className="divide-y divide-line" aria-label="Liste des projets">
            {projects.map((project) => {
              const validatedCount = project.phases.filter((phase) => phase.status === "VALIDATED").length;
              const progress = project.phases.length ? Math.round((validatedCount / project.phases.length) * 100) : 0;
              const currentPhase = project.phases.find((phase) => phase.status !== "VALIDATED") ?? project.phases.at(-1) ?? null;
              const blocked = currentPhase?.status === "LOCKED" || currentPhase?.status === "REOPENED";

              return (
                <article className="group grid gap-5 rounded-xl border border-transparent px-3 py-5 transition duration-150 hover:border-accent-400 hover:bg-surface hover:shadow-[0_8px_20px_rgba(15,23,42,.06)] first:pt-5 last:pb-5 lg:grid-cols-[1.5fr_1fr_1.2fr_auto] lg:items-center" key={project.id}>
                  <div className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-900 text-sm font-bold text-white" aria-hidden="true">{project.name.slice(0, 1).toUpperCase()}</span>
                    <div><h3 className="font-semibold text-ink">{project.name}</h3><p className="mt-1 text-xs text-muted">{project.description || "Aucune description"}</p></div>
                  </div>
                  <div>
                    <span className="flex justify-between text-xs text-muted">Progression <strong className="text-ink">{progress}%</strong></span>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-panel"><span className="block h-full rounded-full bg-brand-900" style={{ width: `${progress}%` }} /></div>
                    <small className="mt-1 block text-[11px] text-muted">{validatedCount}/{project.phases.length} phases validées</small>
                  </div>
                  <div>
                    <span className={blocked ? "text-xs font-semibold text-danger" : "text-xs font-semibold text-muted"}>{blocked ? "Blocage" : "Prochaine action"}</span>
                    <strong className="mt-1 block text-sm text-ink">{currentPhase ? `Phase ${currentPhase.order} · ${currentPhase.name}` : "Créer une première phase"}</strong>
                    <small className="mt-1 block text-xs text-muted">{currentPhase ? formatDate(currentPhase.deadline) : formatDate(project.startDate)}</small>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    {currentPhase && <StatusBadge status={currentPhase.status} />}
                    <Link className="rounded-lg bg-brand-900 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-950" href={`/projects/${project.id}`}>Ouvrir</Link>
                    <button
                      className="px-2 py-2 text-xs font-semibold text-muted hover:text-danger"
                      type="button"
                      onClick={() => setProjectToDelete(project)}
                      disabled={deletingId === project.id}
                    >
                      {deletingId === project.id ? "Suppression..." : "Supprimer"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
      <ConfirmDialog open={projectToDelete !== null} title="Supprimer ce projet ?" description={projectToDelete ? `Le projet « ${projectToDelete.name} » et toutes ses phases seront supprimés définitivement.` : ""} isSubmitting={deletingId !== null} onCancel={() => setProjectToDelete(null)} onConfirm={() => projectToDelete && void handleDelete(projectToDelete)} />
    </main>
  );
}
