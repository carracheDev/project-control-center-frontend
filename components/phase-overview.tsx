import type { GatingResult, Phase, PhaseReadinessResult, PhaseValidation, PhaseWorkflowState } from "@/types/domain";
import { PhaseActionPanel } from "@/components/phase-action-panel";
import { PhaseStateBanner } from "@/components/phase-state-banner";

export function PhaseOverview({ phase, workflow, readiness, gating, validations, isSubmitting, onValidate, onShowBlockers }: { phase: Phase; workflow: PhaseWorkflowState | null; readiness: PhaseReadinessResult | null; gating: GatingResult | null; validations: PhaseValidation[]; isSubmitting: boolean; onValidate: () => void; onShowBlockers: () => void }) {
  return <section className="grid gap-3" id="phase-overview">
    {workflow?.locked && (
      <div className="grid gap-1 rounded-md border border-[#f0c7bd] border-l-4 bg-[#fbe4df] p-4 text-sm text-[#9e4035]" role="status">
        <strong className="font-['Space_Grotesk'] text-sm">Phase verrouillée</strong>
        <span>{workflow.reason || "Validez d'abord la phase précédente pour accéder à cette phase."}</span>
        {workflow.previousPhase && <small className="text-xs text-[#8b6259]">Phase précédente : {workflow.previousPhase.name}</small>}
      </div>
    )}
    <PhaseStateBanner phase={phase} workflow={workflow} readiness={readiness} gating={gating} />
    <PhaseActionPanel phase={phase} workflow={workflow} gating={gating} isSubmitting={isSubmitting} onValidate={onValidate} onShowBlockers={onShowBlockers} />
    <div className="grid gap-3 md:grid-cols-3">
      <article className="min-h-[120px] rounded-md border border-[var(--line)] bg-[var(--panel)] p-4"><h3 className="mb-2 text-sm">Bloqueurs</h3>{readiness?.blockers.length || gating?.blockers.length ? <ul className="grid gap-2 pl-4 text-xs leading-relaxed text-[var(--muted)]">{[...(readiness?.blockers.map((item) => item.message) ?? []), ...(gating?.blockers ?? [])].slice(0, 5).map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul> : <p className="text-xs text-[var(--muted)]">Aucun bloqueur détecté.</p>}</article>
      <article className="min-h-[120px] rounded-md border border-[var(--line)] bg-[var(--panel)] p-4"><h3 className="mb-2 text-sm">Prochaine action</h3>{readiness?.nextActions.length ? <ul className="grid gap-2 pl-4 text-xs leading-relaxed text-[var(--muted)]">{readiness.nextActions.slice(0, 3).map((item, index) => <li key={`${item.message}-${index}`}>{item.message}</li>)}</ul> : <p className="text-xs text-[var(--muted)]">{phase.status === "VALIDATED" ? "Phase validée." : "Aucune action suggérée."}</p>}</article>
      <article className="min-h-[120px] rounded-md border border-[var(--line)] bg-[var(--panel)] p-4"><h3 className="mb-2 text-sm">Validation</h3><p className="text-xs text-[var(--muted)]">{gating?.canValidate ? "Gating : CAN VALIDATE" : "Gating : conditions non remplies"}</p><p className="text-xs text-[var(--muted)]">{readiness?.ready ? "Readiness : READY" : "Readiness : à compléter"}</p><p className="text-xs text-[var(--muted)]">{validations.length ? `${validations.length} validation(s) enregistrée(s)` : "Aucune validation enregistrée"}</p></article>
    </div>
  </section>;
}
