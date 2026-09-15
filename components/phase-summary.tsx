import type { Phase, PhaseReadinessResult, GatingResult } from "@/types/domain";

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
  const items = [
    ["État", progress],
    ["Validation", gating?.canValidate ? "Prête" : readiness?.ready ? "À vérifier" : "À compléter"],
    ["Blocages", blockers],
    ["Travail", `${tasks} tâches · ${objectives} objectifs`],
    ["Matière", `${criteria} critères · ${interviews} interviews · ${evidence} preuves`],
  ];

  return (
    <section className="my-5 grid overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:grid-cols-2 lg:grid-cols-5" aria-label="Résumé de la phase">
      {items.map(([label, value]) => (
        <article className="flex min-h-20 flex-col justify-center border-b border-slate-200 px-4 py-3 last:border-b-0 sm:[&:nth-child(even)]:border-l lg:border-b-0 lg:border-l lg:first:border-l-0" key={label}>
          <span className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-500">{label}</span>
          <strong className="mt-1.5 text-sm font-semibold leading-5 text-slate-900">{value}</strong>
        </article>
      ))}
    </section>
  );
}
