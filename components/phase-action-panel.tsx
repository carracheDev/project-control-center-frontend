import type { GatingResult, Phase, PhaseWorkflowState } from "@/types/domain";

export function PhaseActionPanel({ phase, workflow, gating, isSubmitting, onValidate, onShowBlockers }: { phase: Phase; workflow: PhaseWorkflowState | null; gating: GatingResult | null; isSubmitting: boolean; onValidate: () => void; onShowBlockers: () => void }) {
  const locked = workflow?.locked === true;
  const validated = phase.status === "VALIDATED";
  const canValidate = gating?.canValidate === true && !locked && !validated;

  return (
    <section className="phase-action-panel">
      <div>
        <p className="eyebrow">Prochaine action</p>
        <h2>{validated ? "Phase validée" : locked ? "Phase verrouillée" : canValidate ? "Valider la phase" : "Corriger les blocages"}</h2>
        <p>
          {validated
            ? "Aucune action supplémentaire n'est nécessaire."
            : locked
              ? "La phase précédente doit être validée."
              : canValidate
                ? "Les conditions sont remplies."
                : "Consultez les bloqueurs avant de poursuivre."}
        </p>
      </div>

      {validated ? (
        <span className="phase-panel-status success">✓ Validée</span>
      ) : locked ? (
        <span className="phase-panel-status danger">Verrouillée</span>
      ) : canValidate ? (
        <button className="button button-primary" type="button" disabled={isSubmitting} onClick={onValidate}>
          {isSubmitting ? "Validation..." : "Valider la phase"}
        </button>
      ) : (
        <button className="button button-secondary" type="button" onClick={onShowBlockers}>
          Voir les blocages
        </button>
      )}
    </section>
  );
}
