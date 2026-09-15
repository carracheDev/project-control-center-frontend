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
    LOCKED: "bg-slate-100 text-slate-600",
    PLANNED: "bg-amber-50 text-amber-700",
    IN_PROGRESS: "bg-blue-50 text-blue-700",
    VALIDATED: "bg-emerald-50 text-emerald-700",
    REOPENED: "bg-rose-50 text-rose-700",
  };
  return <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold ${tones[status]}`}><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />{labels[status]}</span>;
}
