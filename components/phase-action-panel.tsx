import type { GatingResult, Phase, PhaseWorkflowState } from "@/types/domain";

export function PhaseActionPanel({ phase, workflow, gating, isSubmitting, onValidate, onShowBlockers }: { phase: Phase; workflow: PhaseWorkflowState | null; gating: GatingResult | null; isSubmitting: boolean; onValidate: () => void; onShowBlockers: () => void }) {
  const locked = workflow?.locked === true;
  const validated = phase.status === "VALIDATED";
  const canValidate = gating?.canValidate === true && !locked && !validated;
  return <section className="flex items-center justify-between gap-4 rounded-md border border-[var(--line)] bg-[#edf4ef] p-5"><div><p className="eyebrow">Prochaine action</p><h2>{validated ? "Phase validée" : locked ? "Phase verrouillée" : canValidate ? "Valider la phase" : "Corriger les blocages"}</h2><p className="mt-1.5 text-xs text-[var(--muted)]">{validated ? "Aucune action supplémentaire n'est nécessaire." : locked ? "La phase précédente doit être validée." : canValidate ? "Les conditions sont remplies." : "Consultez les bloqueurs avant de poursuivre."}</p></div>{validated ? <span className="font-bold text-[#33754f]">✓ Validée</span> : locked ? <span className="font-bold text-[#9e4035]">Verrouillée</span> : canValidate ? <button className="button button-primary" type="button" disabled={isSubmitting} onClick={onValidate}>{isSubmitting ? "Validation..." : "Valider la phase"}</button> : <button className="button button-secondary" type="button" onClick={onShowBlockers}>Voir les blocages</button>}</section>;
}
