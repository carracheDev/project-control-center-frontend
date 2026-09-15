import type { GatingResult, Phase, PhaseReadinessResult, PhaseValidation, PhaseWorkflowState } from "@/types/domain";
import { PhaseActionPanel } from "@/components/phase-action-panel";
import { PhaseStateBanner } from "@/components/phase-state-banner";

export function PhaseOverview({ phase, workflow, readiness, gating, validations, isSubmitting, onValidate, onShowBlockers }: { phase: Phase; workflow: PhaseWorkflowState | null; readiness: PhaseReadinessResult | null; gating: GatingResult | null; validations: PhaseValidation[]; isSubmitting: boolean; onValidate: () => void; onShowBlockers: () => void }) {
  return (
    <section className="space-y-5" id="phase-overview">
      {workflow?.locked && (
        <div className="flex flex-col gap-1 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="status">
          <strong>Phase verrouillée</strong>
          <span>{workflow.reason || "Validez d'abord la phase précédente pour accéder à cette phase."}</span>
          {workflow.previousPhase && <small className="text-xs text-amber-800">Phase précédente : {workflow.previousPhase.name}</small>}
        </div>
      )}

      <PhaseStateBanner phase={phase} workflow={workflow} readiness={readiness} gating={gating} />
      <PhaseActionPanel phase={phase} workflow={workflow} gating={gating} isSubmitting={isSubmitting} onValidate={onValidate} onShowBlockers={onShowBlockers} />

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-xl border border-line bg-surface p-5 shadow-sm transition duration-150 hover:border-accent-400 hover:shadow-[0_8px_20px_rgba(15,23,42,.06)]">
          <h3 className="font-display text-lg font-semibold text-ink">Bloqueurs</h3>
          {readiness?.blockers.length || gating?.blockers.length ? (
            <ul className="mt-3 space-y-2 text-sm leading-5 text-muted">
              {[...(readiness?.blockers.map((item) => item.message) ?? []), ...(gating?.blockers ?? [])].slice(0, 5).map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">Aucun bloqueur détecté.</p>
          )}
        </article>

        <article className="rounded-xl border border-line bg-surface p-5 shadow-sm transition duration-150 hover:border-accent-400 hover:shadow-[0_8px_20px_rgba(15,23,42,.06)]">
          <h3 className="font-display text-lg font-semibold text-ink">Prochaine action</h3>
          {readiness?.nextActions.length ? (
            <ul className="mt-3 space-y-2 text-sm leading-5 text-muted">
              {readiness.nextActions.slice(0, 3).map((item, index) => (
                <li key={`${item.message}-${index}`}>{item.message}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">{phase.status === "VALIDATED" ? "Phase validée." : "Aucune action suggérée."}</p>
          )}
        </article>

        <article className="rounded-xl border border-line bg-surface p-5 shadow-sm transition duration-150 hover:border-accent-400 hover:shadow-[0_8px_20px_rgba(15,23,42,.06)]">
          <h3 className="font-display text-lg font-semibold text-ink">Validation</h3>
          <div className="mt-3 space-y-2 text-sm text-muted">
            <p>{gating?.canValidate ? "Gating : CAN VALIDATE" : "Gating : conditions non remplies"}</p>
            <p>{readiness?.ready ? "Readiness : READY" : "Readiness : à compléter"}</p>
            <p>{validations.length ? `${validations.length} validation(s) enregistrée(s)` : "Aucune validation enregistrée"}</p>
          </div>
        </article>
      </div>
    </section>
  );
}
