import { Pause, Play, Square, Volume2 } from "lucide-react";

export function SpeechControls({ isSpeaking, isPaused, isSupported, onSpeak, onPause, onResume, onCancel }: { isSpeaking: boolean; isPaused: boolean; isSupported: boolean; onSpeak: () => void; onPause: () => void; onResume: () => void; onCancel: () => void }) {
  if (!isSupported) return <p className="text-xs text-muted">La lecture vocale n&apos;est pas disponible sur ce navigateur.</p>;
  return <div className="flex flex-wrap items-center gap-2">
    {!isSpeaking && <button className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-xs font-semibold text-brand-900 hover:border-brand-900" type="button" onClick={onSpeak} aria-label="Lire la réponse"><Volume2 size={14} /> Lire</button>}
    {isSpeaking && <button className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-xs font-semibold text-brand-900 hover:border-brand-900" type="button" onClick={isPaused ? onResume : onPause} aria-label={isPaused ? "Reprendre la lecture" : "Mettre la lecture en pause"}>{isPaused ? <Play size={14} /> : <Pause size={14} />} {isPaused ? "Reprendre" : "Pause"}</button>}
    {isSpeaking && <button className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-xs font-semibold text-muted hover:border-danger hover:text-danger" type="button" onClick={onCancel} aria-label="Arrêter la lecture"><Square size={14} /> Arrêter</button>}
  </div>;
}
