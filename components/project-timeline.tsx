"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, CircleDot, Clock3 } from "lucide-react";
import { formatDate } from "@/lib/format";
import { getProjectTimeline } from "@/lib/api";
import type { ProjectTimeline } from "@/types/domain";

const DAY_MS = 24 * 60 * 60 * 1000;

export function ProjectTimelineView({ projectId }: { projectId: string }) {
  const [timeline, setTimeline] = useState<ProjectTimeline | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProjectTimeline(projectId).then(setTimeline).catch((reason: Error) => setError(reason.message));
  }, [projectId]);

  const range = useMemo(() => timeline ? getDateRange(timeline) : null, [timeline]);
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">Impossible de charger le planning : {error}</div>;
  if (!timeline || !range) return <div className="grid min-h-40 place-items-center border border-dashed border-line text-sm text-muted">Chargement du planning...</div>;

  return <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6">
    <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Planification</p><h2 className="mt-1 font-display text-xl font-semibold text-ink">Planning du projet</h2></div><span className="inline-flex items-center gap-1 text-xs font-semibold text-muted"><CalendarDays size={13} /> {range.days} jours</span></div>
    <div className="overflow-x-auto">
      <div className="min-w-[760px]">
        <div className="mb-2 grid grid-cols-[220px_1fr] gap-4 text-[10px] font-bold uppercase tracking-[.1em] text-muted"><span>Phases et tâches</span><div className="flex justify-between"><span>{formatDate(range.start.toISOString())}</span><span>{formatDate(range.end.toISOString())}</span></div></div>
        <div className="space-y-3">{timeline.phases.map((phase) => { const start = phase.startDate ? new Date(phase.startDate) : range.start; const end = phase.endDate || phase.deadline ? new Date(phase.endDate || phase.deadline || range.end) : range.end; const left = position(start, range); const width = Math.max(4, position(end, range) - left); const validated = phase.status === "VALIDATED"; const inProgress = phase.status === "IN_PROGRESS"; const Icon = validated ? CheckCircle2 : inProgress ? Clock3 : CircleDot; return <div key={phase.id} className="grid grid-cols-[220px_1fr] items-center gap-4"><div className="min-w-0"><div className="flex items-center gap-2"><Icon className={validated ? "text-success" : inProgress ? "text-warning" : "text-muted"} size={14} /><strong className="truncate text-xs text-ink">{phase.order}. {phase.name}</strong></div><span className="ml-5 text-[10px] text-muted">{phase.tasks.length} tâche{phase.tasks.length > 1 ? "s" : ""} · {phase.status}</span></div><div className="relative h-9 rounded-md bg-panel"><span className={`absolute top-1.5 h-6 rounded-md px-2 text-[10px] font-bold leading-6 text-white ${validated ? "bg-success" : inProgress ? "bg-accent-400 text-brand-950" : phase.status === "LOCKED" ? "bg-danger" : "bg-brand-900"}`} style={{ left: `${left}%`, width: `${width}%` }} title={`${phase.name} · ${formatDate(phase.startDate || range.start.toISOString())} - ${formatDate(new Date(phase.endDate || phase.deadline || range.end).toISOString())}`}>{width > 18 ? phase.name : ""}</span></div></div>; })}</div>
      </div>
    </div>
    <div className="mt-5 flex flex-wrap gap-4 border-t border-line pt-4 text-[11px] text-muted"><Legend color="bg-success" label="Validée" /><Legend color="bg-accent-400" label="En cours" /><Legend color="bg-brand-900" label="Planifiée" /><Legend color="bg-danger" label="Verrouillée" /></div>
  </section>;
}

function Legend({ color, label }: { color: string; label: string }) { return <span className="inline-flex items-center gap-2"><i className={`h-2.5 w-2.5 rounded-sm ${color}`} />{label}</span>; }

function getDateRange(timeline: ProjectTimeline) {
  const dates = timeline.phases.flatMap((phase) => [phase.startDate, phase.endDate, phase.deadline, ...phase.tasks.map((task) => task.deadline)]).filter(Boolean).map((date) => new Date(date as string).getTime()).filter((date) => Number.isFinite(date));
  const now = Date.now();
  const start = new Date(Math.min(...dates, timeline.startDate ? new Date(timeline.startDate).getTime() : now));
  const end = new Date(Math.max(...dates, timeline.endDate ? new Date(timeline.endDate).getTime() : now + 30 * DAY_MS));
  if (end.getTime() <= start.getTime()) end.setTime(start.getTime() + 30 * DAY_MS);
  return { start, end, days: Math.max(1, Math.ceil((end.getTime() - start.getTime()) / DAY_MS)) };
}

function position(date: Date, range: { start: Date; end: Date }) {
  const total = range.end.getTime() - range.start.getTime();
  return Math.min(100, Math.max(0, ((date.getTime() - range.start.getTime()) / total) * 100));
}
