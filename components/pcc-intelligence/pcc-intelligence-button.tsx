import { Sparkles } from "lucide-react";

export function PccIntelligenceButton({ onClick }: { onClick: () => void }) {
  return <button className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-brand-900 transition-colors hover:border-accent-400 hover:bg-amber-100" type="button" onClick={onClick} aria-label="Ouvrir PCC Intelligence"><Sparkles size={16} /> PCC Intelligence</button>;
}
