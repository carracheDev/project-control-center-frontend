import type { GatingResult, Phase, PhaseReadinessResult, PhaseWorkflowState } from "@/types/domain";

export function PhaseStateBanner({ phase, workflow, readiness, gating }: { phase: Phase; workflow: PhaseWorkflowState | null; readiness: PhaseReadinessResult | null; gating: GatingResult | null }) {
  const state = phase.status === "VALIDATED" ? { tone: "success", title: "Phase validée", detail: "La validation officielle est enregistrée." }
    : workflow?.locked ? { tone: "blocked", title: "Phase verrouillée", detail: workflow.reason || "La phase précédente doit être validée." }
    : gating?.canValidate ? { tone: "success", title: "Phase prête à être validée", detail: "Les conditions de gating sont remplies." }
    : readiness && !readiness.ready ? { tone: "blocked", title: "Phase bloquée", detail: readiness.blockers[0]?.message || "Des éléments doivent encore être complétés." }
    : { tone: "neutral", title: "Phase en préparation", detail: "Consultez le résumé et les éléments de la phase." };
  const toneClass = state.tone === "success" ? "border-l-[#5a9b6f]" : state.tone === "blocked" ? "border-l-[#c35c4c]" : "border-l-[#d29a3a]";
  return <section className={`flex items-center justify-between gap-4 rounded-md border border-[var(--line)] border-l-4 bg-[var(--panel)] p-5 ${toneClass}`} aria-live="polite"><div><p className="eyebrow">État de la phase</p><h2>{state.title}</h2><p className="mt-1.5 text-xs text-[var(--muted)]">{state.detail}</p></div><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#dcebe3] font-bold text-[var(--teal)]" aria-hidden="true">{state.tone === "success" ? "✓" : state.tone === "blocked" ? "!" : "·"}</span></section>;
}
