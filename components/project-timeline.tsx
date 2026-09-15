"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, CircleDot, Clock3 } from "lucide-react";
import { formatDate } from "@/lib/format";
import { getProjectTimeline } from "@/lib/api";
import type { ProjectTimeline } from "@/types/domain";

export function ProjectTimelineView({ projectId }: { projectId: string }) {
  const [timeline, setTimeline] = useState<ProjectTimeline | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { getProjectTimeline(projectId).then(setTimeline).catch((reason: Error) => setError(reason.message)); }, [projectId]);
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">Impossible de charger la timeline : {error}</div>;
  if (!timeline) return <div className="grid min-h-40 place-items-center border border-dashed border-line text-sm text-muted">Chargement de la timeline...</div>;
  return <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6"><div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Vue temporelle</p><h2 className="mt-1 font-display text-xl font-semibold text-ink">Timeline du projet</h2></div><span className="text-xs font-semibold text-muted">{timeline.phases.length} phases</span></div><div className="space-y-0">{timeline.phases.map((phase, index) => { const validated = phase.status === "VALIDATED"; const inProgress = phase.status === "IN_PROGRESS"; const Icon = validated ? CheckCircle2 : inProgress ? Clock3 : CircleDot; return <article className="grid gap-3 border-t border-line py-4 sm:grid-cols-[150px_1fr]" key={phase.id}><div className="text-xs text-muted"><strong className="block text-sm text-ink">{phase.startDate ? formatDate(phase.startDate) : "Date de début non renseignée"}</strong><span>{formatDate(phase.endDate || phase.deadline)}</span></div><div className="flex gap-3"><span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${validated ? "bg-emerald-50 text-success" : inProgress ? "bg-amber-50 text-warning" : "bg-panel text-muted"}`}><Icon size={15} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-ink">{phase.order}. {phase.name}</h3><span className="rounded bg-panel px-2 py-1 text-[10px] font-semibold text-muted">{phase.status}</span></div><div className="mt-2 flex flex-wrap gap-2">{phase.tasks.map((task) => <span className="rounded-md border border-line px-2 py-1 text-xs text-muted" key={task.id} title={task.deadline ? `Deadline ${formatDate(task.deadline)}` : undefined}>{task.title}</span>)}</div></div></div></article>; })}</div></section>;
}
