"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/format";
import { getProjectTimeline } from "@/lib/api";
import type { ProjectTimeline } from "@/types/domain";

export function ProjectTimelineView({ projectId }: { projectId: string }) {
  const [timeline, setTimeline] = useState<ProjectTimeline | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { getProjectTimeline(projectId).then(setTimeline).catch((reason: Error) => setError(reason.message)); }, [projectId]);
  if (error) return <div className="alert alert-error">Impossible de charger la timeline : {error}</div>;
  if (!timeline) return <div className="loading-state">Chargement de la timeline...</div>;
  return <section className="content-section project-timeline"><div className="section-heading"><div><p className="eyebrow">Vue temporelle</p><h2>Timeline du projet</h2></div><span className="panel-count">{timeline.phases.length} phases</span></div><div className="timeline-list">{timeline.phases.map((phase) => <article className="timeline-phase" key={phase.id}><div className="timeline-date"><strong>{formatDate(phase.startDate)}</strong><span>{formatDate(phase.endDate || phase.deadline)}</span></div><div className="timeline-track"><span className={`timeline-marker timeline-${phase.status.toLowerCase()}`} /><div className="timeline-content"><div><h3>{phase.order}. {phase.name}</h3><span className={`task-status task-${phase.status.toLowerCase()}`}>{phase.status}</span></div><div className="timeline-tasks">{phase.tasks.map((task) => <span key={task.id} title={task.deadline ? `Deadline ${formatDate(task.deadline)}` : undefined}>{task.title}</span>)}</div></div></div></article>)}</div></section>;
}
