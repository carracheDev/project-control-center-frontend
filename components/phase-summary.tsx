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
    ["Progression", progress], ["Bloqueurs", blockers], ["Objectifs", objectives], ["Critères", criteria], ["Tâches", tasks], ["Interviews", interviews], ["Preuves", evidence],
    ["Readiness", readiness ? (readiness.ready ? "READY" : "À compléter") : "—"], ["Gating", gating ? (gating.canValidate ? "CAN VALIDATE" : "BLOQUÉ") : "—"],
  ];
  return <section className="my-6 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7" aria-label="Résumé de la phase">{items.map(([label, value]) => <article className="min-h-[76px] rounded-md border border-[var(--line)] bg-[var(--panel)] p-3" key={label}><span className="block text-[10px] text-[var(--muted)]">{label}</span><strong className="mt-2 block font-['Space_Grotesk'] text-base">{value}</strong></article>)}</section>;
}
