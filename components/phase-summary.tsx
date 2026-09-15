import type { Phase, PhaseReadinessResult, GatingResult } from "@/types/domain";
import { AlertTriangle, CheckCircle2, Layers3, ListTodo, ShieldCheck, type LucideIcon } from "lucide-react";

interface PhaseSummaryProps {
  phase: Phase;
  blockers: number;
  objectives: number;
  criteria: number;
  tasks: number;
  interviews: number;
  evidence: number;
  readiness: PhaseReadinessResult | null;
  gating: GatingResult | null;
}

export function PhaseSummary({ phase, blockers, objectives, criteria, tasks, interviews, evidence, readiness, gating }: PhaseSummaryProps) {
  const progress = phase.status === "VALIDATED" ? "Validée" : phase.status === "LOCKED" ? "Verrouillée" : phase.status === "IN_PROGRESS" ? "En cours" : "À préparer";
  const items: [string, string | number, LucideIcon, string][] = [
    ["État", progress, CheckCircle2, "text-success"],
    ["Validation", gating?.canValidate ? "Prête" : readiness?.ready ? "À vérifier" : "À compléter", ShieldCheck, "text-brand-900"],
    ["Blocages", blockers, AlertTriangle, blockers ? "text-danger" : "text-muted"],
    ["Travail", `${tasks} tâches · ${objectives} objectifs`, ListTodo, "text-blue-600"],
    ["Matière", `${criteria} critères · ${interviews} interviews · ${evidence} preuves`, Layers3, "text-warning"],
  ];

  return (
    <section className="my-5 grid overflow-hidden rounded-xl border border-line bg-surface shadow-sm sm:grid-cols-2 lg:grid-cols-5" aria-label="Résumé de la phase">
      {items.map(([label, value, Icon, color]) => (
        <article className="flex min-h-20 items-center gap-3 border-b border-line px-4 py-3 last:border-b-0 sm:[&:nth-child(even)]:border-l lg:border-b-0 lg:border-l lg:first:border-l-0" key={label}>
          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-panel ${color}`}><Icon size={15} /></span>
          <span><span className="block text-[10px] font-bold uppercase tracking-[.12em] text-muted">{label}</span><strong className="mt-1 block text-sm font-semibold leading-5 text-ink">{value}</strong></span>
        </article>
      ))}
    </section>
  );
}
