import type { GatingResult, Phase, PhaseWorkflowState } from "@/types/domain";
import { AlertTriangle, CheckCircle2, LockKeyhole, ShieldCheck } from "lucide-react";

export function PhaseActionPanel({ phase, workflow, gating, isSubmitting, onValidate, onShowBlockers }: { phase: Phase; workflow: PhaseWorkflowState | null; gating: GatingResult | null; isSubmitting: boolean; onValidate: () => void; onShowBlockers: () => void }) {
  const locked = workflow?.locked === true;
  const validated = phase.status === "VALIDATED";
  const canValidate = gating?.canValidate === true && !locked && !validated;

  return (
    <section className="flex flex-col justify-between gap-5 rounded-xl border border-amber-200 border-l-4 border-l-accent-400 bg-[#fff8ec] p-5 sm:flex-row sm:items-center">
      <div>
        <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[.14em] text-warning">Prochaine action</p>
        <h2 className="text-xl font-bold tracking-tight text-ink">{validated ? "Phase validée" : locked ? "Phase verrouillée" : canValidate ? "Valider la phase" : "Corriger les blocages"}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
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
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-green-100 px-3 py-2 text-xs font-bold text-success"><CheckCircle2 size={14} /> Validée</span>
      ) : locked ? (
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-red-100 px-3 py-2 text-xs font-bold text-danger"><LockKeyhole size={14} /> Verrouillée</span>
      ) : canValidate ? (
        <button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-brand-900 px-4 text-sm font-semibold text-white transition hover:bg-brand-950 disabled:cursor-wait disabled:opacity-60" type="button" disabled={isSubmitting} onClick={onValidate}>
          <ShieldCheck size={16} />
          {isSubmitting ? "Validation..." : "Valider la phase"}
        </button>
      ) : (
        <button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-4 text-sm font-semibold text-brand-900 transition hover:border-brand-900" type="button" onClick={onShowBlockers}>
          <AlertTriangle size={16} />
          Voir les blocages
        </button>
      )}
    </section>
  );
}
