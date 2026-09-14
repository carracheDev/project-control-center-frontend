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

  return <main className="page-shell narrow-page"><Link className="back-link" href="/projects">← Retour aux projets</Link><section className="page-heading compact-heading"><div><p className="eyebrow">Nouveau projet</p><h1>Créer un espace de pilotage</h1><p className="page-lede">Commencez par poser le cadre général. Les phases pourront être ajoutées ensuite.</p></div></section><ProjectForm error={error} isSubmitting={isSubmitting} onCancel={() => router.push("/projects")} onSubmit={handleSubmit} /></main>;
}