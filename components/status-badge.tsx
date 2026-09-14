import type { PhaseStatus } from "@/types/domain";

const labels: Record<PhaseStatus, string> = {
  LOCKED: "Verrouillée",
  PLANNED: "Planifiée",
  IN_PROGRESS: "En cours",
  VALIDATED: "Validée",
  REOPENED: "Rouverte",
};

export function StatusBadge({ status }: { status: PhaseStatus }) {
  return <span className={`status-badge status-${status.toLowerCase()}`}><span aria-hidden="true" />{labels[status]}</span>;
}