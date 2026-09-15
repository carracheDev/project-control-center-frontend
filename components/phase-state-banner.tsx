import type { GatingResult, Phase, PhaseReadinessResult, PhaseWorkflowState } from "@/types/domain";

export function PhaseStateBanner({ phase, workflow, readiness, gating }: { phase: Phase; workflow: PhaseWorkflowState | null; readiness: PhaseReadinessResult | null; gating: GatingResult | null }) {
  const state = phase.status === "VALIDATED" ? { tone: "success", title: "Phase validée", detail: "La validation officielle est enregistrée." }
    : workflow?.locked ? { tone: "blocked", title: "Phase verrouillée", detail: workflow.reason || "La phase précédente doit être validée." }
    : gating?.canValidate ? { tone: "success", title: "Phase prête à être validée", detail: "Les conditions de gating sont remplies." }
    : readiness && !readiness.ready ? { tone: "blocked", title: "Phase bloquée", detail: readiness.blockers[0]?.message || "Des éléments doivent encore être complétés." }
    : { tone: "neutral", title: "Phase en préparation", detail: "Consultez le résumé et les éléments de la phase." };

  const toneClass = state.tone === "success" ? "border-green-200 bg-green-50 text-success" : state.tone === "blocked" ? "border-red-200 bg-red-50 text-danger" : "border-line bg-panel text-muted";

  return (
    <section className={`flex items-center justify-between gap-4 rounded-xl border p-5 ${toneClass}`} aria-live="polite">
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-[.14em] opacity-75">État de la phase</p>
        <h2 className="mt-1 text-lg font-bold text-ink">{state.title}</h2>
        <p className="mt-1 text-sm">{state.detail}</p>
      </div>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/70 text-lg font-bold" aria-hidden="true">
        {state.tone === "success" ? "✓" : state.tone === "blocked" ? "!" : "·"}
      </span>
    </section>
  );
}
