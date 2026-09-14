import type { GatingResult, Phase, PhaseReadinessResult, PhaseValidation, PhaseWorkflowState } from "@/types/domain";
import { PhaseActionPanel } from "@/components/phase-action-panel";
import { PhaseStateBanner } from "@/components/phase-state-banner";

export function PhaseOverview({ phase, workflow, readiness, gating, validations, isSubmitting, onValidate, onShowBlockers }: { phase: Phase; workflow: PhaseWorkflowState | null; readiness: PhaseReadinessResult | null; gating: GatingResult | null; validations: PhaseValidation[]; isSubmitting: boolean; onValidate: () => void; onShowBlockers: () => void }) {
  return (
    <section className="phase-overview-shell" id="phase-overview">
      {workflow?.locked && (
        <div className="phase-locked-banner" role="status">
          <strong>Phase verrouillée</strong>
          <span>{workflow.reason || "Validez d'abord la phase précédente pour accéder à cette phase."}</span>
          {workflow.previousPhase && <small>Phase précédente : {workflow.previousPhase.name}</small>}
        </div>
      )}

      <PhaseStateBanner phase={phase} workflow={workflow} readiness={readiness} gating={gating} />
      <PhaseActionPanel phase={phase} workflow={workflow} gating={gating} isSubmitting={isSubmitting} onValidate={onValidate} onShowBlockers={onShowBlockers} />

      <div className="phase-overview-grid">
        <article className="phase-overview-card">
          <h3>Bloqueurs</h3>
          {readiness?.blockers.length || gating?.blockers.length ? (
            <ul>
              {[...(readiness?.blockers.map((item) => item.message) ?? []), ...(gating?.blockers ?? [])].slice(0, 5).map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>Aucun bloqueur détecté.</p>
          )}
        </article>

        <article className="phase-overview-card">
          <h3>Prochaine action</h3>
          {readiness?.nextActions.length ? (
            <ul>
              {readiness.nextActions.slice(0, 3).map((item, index) => (
                <li key={`${item.message}-${index}`}>{item.message}</li>
              ))}
            </ul>
          ) : (
            <p>{phase.status === "VALIDATED" ? "Phase validée." : "Aucune action suggérée."}</p>
          )}
        </article>

        <article className="phase-overview-card">
          <h3>Validation</h3>
          <p>{gating?.canValidate ? "Gating : CAN VALIDATE" : "Gating : conditions non remplies"}</p>
          <p>{readiness?.ready ? "Readiness : READY" : "Readiness : à compléter"}</p>
          <p>{validations.length ? `${validations.length} validation(s) enregistrée(s)` : "Aucune validation enregistrée"}</p>
        </article>
      </div>
    </section>
  );
}
