"use client";

import { useState } from "react";
import { createCriterionAssessment, deleteCriterionAssessment, updateCriterionAssessment } from "@/lib/api";
import type { Criterion, CriterionAssessment, CriterionAssessmentStatus, Evidence } from "@/types/domain";

interface CriterionAssessmentControlsProps {
  criterion: Criterion;
  evidence: Evidence[];
  onChanged: (assessment: CriterionAssessment | null) => void;
}

export function CriterionAssessmentControls({ criterion, evidence, onChanged }: CriterionAssessmentControlsProps) {
  const [note, setNote] = useState(criterion.assessment?.note ?? "");
  const [evidenceId, setEvidenceId] = useState(criterion.assessment?.evidenceId ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const status = criterion.assessment?.status ?? "PENDING";

  async function save(nextStatus: CriterionAssessmentStatus) {
    setIsSaving(true);
    setError(null);
    try {
      const commonInput = { status: nextStatus, note: note.trim() || undefined };
      const saved = criterion.assessment
        ? await updateCriterionAssessment(criterion.assessment.id, { ...commonInput, evidenceId: evidenceId || null })
        : await createCriterionAssessment(criterion.id, { ...commonInput, evidenceId: evidenceId || undefined });
      onChanged(saved);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Impossible d'enregistrer l'évaluation");
    } finally {
      setIsSaving(false);
    }
  }

  async function reset() {
    if (!criterion.assessment) return;
    setIsSaving(true);
    setError(null);
    try {
      await deleteCriterionAssessment(criterion.assessment.id);
      onChanged(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Impossible de supprimer l'évaluation");
    } finally {
      setIsSaving(false);
    }
  }

  return <div className="mt-4 rounded-lg border border-line bg-white p-3">
    <div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold text-muted">Évaluation</span><strong className="rounded-md bg-panel px-2 py-1 text-[10px] font-bold text-brand-900">{status}</strong></div>
    <div className="mt-3 flex flex-wrap gap-2">
      <button className="rounded-md border border-line px-2 py-1 text-xs font-semibold text-muted hover:border-brand-900 hover:text-brand-900 disabled:opacity-50" type="button" disabled={isSaving} onClick={() => void save("SATISFIED")}>Satisfied</button>
      <button className="rounded-md border border-line px-2 py-1 text-xs font-semibold text-muted hover:border-brand-900 hover:text-brand-900 disabled:opacity-50" type="button" disabled={isSaving} onClick={() => void save("NOT_SATISFIED")}>Not satisfied</button>
      <button className="rounded-md border border-line px-2 py-1 text-xs font-semibold text-muted hover:border-brand-900 hover:text-brand-900 disabled:opacity-50" type="button" disabled={isSaving} onClick={() => void save("PENDING")}>Pending</button>
      {criterion.assessment && <button className="px-2 py-1 text-xs font-semibold text-muted hover:text-ink disabled:opacity-50" type="button" disabled={isSaving} onClick={() => void reset()}>Réinitialiser</button>}
    </div>
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      <input className="w-full rounded-lg border border-line bg-white px-3 py-2 text-xs text-ink outline-none focus:border-accent-400" aria-label={`Note pour ${criterion.name}`} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Note optionnelle" />
      <select className="w-full rounded-lg border border-line bg-white px-3 py-2 text-xs text-ink outline-none focus:border-accent-400" aria-label={`Evidence pour ${criterion.name}`} value={evidenceId} onChange={(event) => setEvidenceId(event.target.value)}>
        <option value="">Aucune evidence associée</option>
        {evidence.map((item) => <option key={item.id} value={item.id}>{item.title} · {item.status}</option>)}
      </select>
    </div>
    {error && <p className="mt-2 text-xs text-danger">{error}</p>}
  </div>;
}