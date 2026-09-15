"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProjectForm } from "@/components/project-form";
import { createProject } from "@/lib/api";
import type { CreateProjectInput } from "@/types/domain";

export default function NewProjectPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(input: CreateProjectInput) {
    setIsSubmitting(true);
    try {
      const project = await createProject(input);
      router.push(`/projects/${project.id}?created=1`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Impossible de créer le projet");
    } finally {
      setIsSubmitting(false);
    }
  }

  return <main className="mx-auto max-w-3xl space-y-6"><Link className="text-sm font-semibold text-muted hover:text-brand-900" href="/projects">← Retour aux projets</Link><section><p className="text-xs font-bold uppercase tracking-[.14em] text-muted">Nouveau projet</p><h1 className="mt-2 font-display text-3xl font-semibold text-ink">Créer un espace de pilotage</h1><p className="mt-2 text-sm text-muted">Commencez par poser le cadre général. Les phases pourront être ajoutées ensuite.</p></section><ProjectForm error={error} isSubmitting={isSubmitting} onCancel={() => router.push("/projects")} onSubmit={handleSubmit} /></main>;
}