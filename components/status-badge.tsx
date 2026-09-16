import type { PhaseStatus } from "@/types/domain";

const labels: Record<PhaseStatus, string> = {
  LOCKED: "Verrouillée",
  PLANNED: "Planifiée",
  IN_PROGRESS: "En cours",
  VALIDATED: "Validée",
  REOPENED: "Rouverte",
};

export function StatusBadge({ status }: { status: PhaseStatus }) {
  const tones: Record<PhaseStatus, string> = {
    LOCKED: "bg-slate-400/10 text-slate-300",
    PLANNED: "bg-amber-300/10 text-amber-200",
    IN_PROGRESS: "bg-cyan-300/10 text-cyan-200",
    VALIDATED: "bg-emerald-300/10 text-emerald-200",
    REOPENED: "bg-red-300/10 text-red-200",
  };
  return <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold ${tones[status]}`}><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />{labels[status]}</span>;
}
