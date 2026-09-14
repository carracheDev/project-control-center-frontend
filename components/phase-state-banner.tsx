import type { GatingResult, Phase, PhaseReadinessResult, PhaseWorkflowState } from "@/types/domain";

export function PhaseStateBanner({ phase, workflow, readiness, gating }: { phase: Phase; workflow: PhaseWorkflowState | null; readiness: PhaseReadinessResult | null; gating: GatingResult | null }) {
  const state = phase.status === "VALIDATED" ? { tone: "success", title: "Phase validée", detail: "La validation officielle est enregistrée." }
    : workflow?.locked ? { tone: "blocked", title: "Phase verrouillée", detail: workflow.reason || "La phase précédente doit être validée." }
    : gating?.canValidate ? { tone: "success", title: "Phase prête à être validée", detail: "Les conditions de gating sont remplies." }
    : readiness && !readiness.ready ? { tone: "blocked", title: "Phase bloquée", detail: readiness.blockers[0]?.message || "Des éléments doivent encore être complétés." }
    : { tone: "neutral", title: "Phase en préparation", detail: "Consultez le résumé et les éléments de la phase." };

  const toneClass = state.tone === "success" ? "success" : state.tone === "blocked" ? "danger" : "neutral";

  return (
    <section className={`phase-state-banner ${toneClass}`} aria-live="polite">
      <div>
        <p className="eyebrow">État de la phase</p>
        <h2>{state.title}</h2>
        <p>{state.detail}</p>
      </div>
      <span className="phase-state-icon" aria-hidden="true">
        {state.tone === "success" ? "✓" : state.tone === "blocked" ? "!" : "·"}
      </span>
    </section>
  );
}
