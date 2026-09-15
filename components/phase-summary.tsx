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

export function PhaseSummary({ phase, blockers, objectives, criteria, tasks }: PhaseSummaryProps) {
  const progress = phase.status === "VALIDATED" ? "Validée" : phase.status === "LOCKED" ? "Verrouillée" : phase.status === "IN_PROGRESS" ? "En cours" : "À préparer";
  const items = [
    ["Progression", progress],
    ["Bloqueurs", blockers],
    ["Objectifs", objectives],
    ["Critères", criteria],
    ["Tâches", tasks],
  ];

  return (
    <section className="phase-summary-grid" aria-label="Résumé de la phase">
      {items.map(([label, value]) => (
        <article className="phase-summary-card" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </article>
      ))}
    </section>
  );
}
