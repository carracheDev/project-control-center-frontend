import { AlertTriangle, CheckCircle2, CircleHelp, Lightbulb, ShieldAlert } from "lucide-react";
import type { PccAiAnalysis } from "@/types/pcc-ai";

const sections = [
  { key: "strengths", title: "Points forts", icon: CheckCircle2, tone: "text-success" },
  { key: "blockers", title: "Blocages", icon: ShieldAlert, tone: "text-danger" },
  { key: "missingInformation", title: "Informations manquantes", icon: CircleHelp, tone: "text-warning" },
  { key: "contradictions", title: "Contradictions", icon: AlertTriangle, tone: "text-warning" },
  { key: "recommendations", title: "Recommandations", icon: Lightbulb, tone: "text-accent-400" },
] as const;

export function PccAnalysis({ analysis }: { analysis: PccAiAnalysis }) {
  const statusLabel = analysis.status === "READY" ? "Analyse : conditions actuellement réunies" : analysis.status === "NOT_READY" ? "Analyse : des blocages restent à traiter" : "Analyse : une vérification humaine est recommandée";
  return <div className="space-y-4">
    <div className={`rounded-xl border p-4 ${analysis.status === "READY" ? "border-emerald-200 bg-emerald-50" : analysis.status === "NOT_READY" ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}>
      <p className="text-xs font-bold uppercase tracking-[.12em] text-muted">{statusLabel}</p>
      <p className="mt-2 text-sm leading-6 text-ink">{analysis.summary}</p>
    </div>
    {sections.map(({ key, title, icon: Icon, tone }) => analysis[key].length > 0 && <section key={key} className="rounded-xl border border-line bg-panel p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-ink"><Icon className={tone} size={16} />{title}</h3>
      <ul className="mt-3 space-y-2 text-sm leading-5 text-muted">{analysis[key].map((item) => <li className="border-l-2 border-line pl-3" key={item}>{item}</li>)}</ul>
    </section>)}
    <section className="rounded-xl border border-line bg-panel p-4">
      <h3 className="text-sm font-semibold text-ink">Conseil avant validation</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{analysis.validationAdvice}</p>
    </section>
  </div>;
}
