"use client";

import { AlertCircle, LoaderCircle, Mic, Send, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { askPccPhase, getPccPhaseAnalysis } from "@/lib/api";
import { buildChatSpeechText, buildSpeechText, type PccAiAnalysis, type PccAiMessage } from "@/types/pcc-ai";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { PccAnalysis } from "./pcc-analysis";
import { SpeechControls } from "./speech-controls";

export function PccIntelligencePanel({ phaseId, phaseName, open, onClose }: { phaseId: string; phaseName: string; open: boolean; onClose: () => void }) {
  const [analysis, setAnalysis] = useState<PccAiAnalysis | null>(null);
  const [messages, setMessages] = useState<PccAiMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { speak, pause, resume, cancel, isSpeaking, isPaused, isSupported: speechSupported } = useSpeechSynthesis();
  const inputRef = useRef<HTMLInputElement>(null);
  const handleTranscript = useCallback((transcript: string) => {
    setInput(transcript);
    inputRef.current?.focus();
  }, []);
  const recognition = useSpeechRecognition(handleTranscript);

  const loadAnalysis = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getPccPhaseAnalysis(phaseId);
      setAnalysis(result);
      const speechText = buildSpeechText(result);
      setMessages([{ id: `analysis-${Date.now()}`, role: "assistant", content: result.summary, speechText, analysis: result }]);
      speak(speechText);
    } catch {
      setError("Je n'arrive pas à analyser cette phase pour le moment.");
    } finally {
      setIsLoading(false);
    }
  }, [phaseId, speak]);

  useEffect(() => {
    if (!open) { cancel(); return; }
    const loadTimer = window.setTimeout(() => void loadAnalysis(), 0);
    return () => { window.clearTimeout(loadTimer); cancel(); };
  }, [open, loadAnalysis, cancel]);

  async function submitQuestion(message: string) {
    if (!message || isSending) return;
    setInput("");
    setMessages((items) => [...items, { id: `question-${Date.now()}`, role: "user", content: message }]);
    setIsSending(true);
    setError(null);
    try {
      const result = await askPccPhase(phaseId, message, { sessionId });
      setSessionId(result.sessionId);
      const speechText = buildChatSpeechText(result);
      setMessages((items) => [...items, { id: `answer-${Date.now()}`, role: "assistant", content: result.answer, speechText, chat: result }]);
      speak(speechText);
    } catch {
      setError("Je n'arrive pas à répondre pour le moment.");
    } finally {
      setIsSending(false);
    }
  }

  async function sendQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitQuestion(input.trim());
  }

  if (!open) return null;
  const latestAssistant = [...messages].reverse().find((message) => message.role === "assistant");

  return <div className="fixed inset-0 z-50 flex justify-end bg-brand-950/20 p-0 backdrop-blur-[2px] sm:p-4" role="dialog" aria-modal="true" aria-labelledby="pcc-intelligence-title">
    <aside className="flex h-full w-full flex-col bg-surface shadow-2xl sm:max-w-xl sm:rounded-2xl sm:border sm:border-line">
      <header className="flex items-start justify-between border-b border-line bg-brand-900 px-5 py-5 text-white sm:rounded-t-2xl">
        <div><p className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="text-accent-400" size={17} /> PCC Intelligence</p><h2 id="pcc-intelligence-title" className="mt-1 font-display text-xl font-semibold">Analyse intelligente de votre phase</h2><p className="mt-1 text-xs text-slate-300">{phaseName}</p></div>
        <button className="rounded-md p-1.5 text-slate-300 hover:bg-white/10 hover:text-white" type="button" onClick={onClose} aria-label="Fermer PCC Intelligence"><X size={19} /></button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {isLoading && <div className="flex min-h-52 flex-col items-center justify-center gap-3 text-sm text-muted"><LoaderCircle className="animate-spin text-accent-400" size={25} />Analyse de votre phase...</div>}
        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-danger"><p className="flex items-center gap-2"><AlertCircle size={16} />{error}</p><button className="mt-3 rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold" type="button" onClick={() => void loadAnalysis()}>Réessayer</button></div>}
        {!isLoading && !error && analysis && <>
          <PccAnalysis analysis={analysis} />
          {latestAssistant && <div className="mt-4 rounded-xl border border-line bg-panel p-4"><div className="mb-3 flex items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-[.12em] text-muted">PCC Intelligence</p>{isSpeaking && <span className="flex items-center gap-1.5 text-xs font-semibold text-accent-400"><span className="h-2 w-2 animate-pulse rounded-full bg-accent-400" /> PCC parle</span>}</div><p className="text-sm leading-6 text-ink">{latestAssistant.content}</p>{latestAssistant.chat && <div className="mt-4 space-y-3 text-xs"><div><p className="font-bold uppercase tracking-[.1em] text-muted">Sources</p>{latestAssistant.chat.evidence.length > 0 ? <ul className="mt-1 space-y-1 text-ink">{latestAssistant.chat.evidence.map((item) => <li key={item.id}>[{item.type}] {item.label}{item.excerpt ? ` : ${item.excerpt}` : ""}</li>)}</ul> : <p className="mt-1 text-muted">Aucune source citée.</p>}</div>{latestAssistant.chat.missingInformation.length > 0 && <div><p className="font-bold uppercase tracking-[.1em] text-warning">Informations manquantes</p><p className="mt-1 text-ink">{latestAssistant.chat.missingInformation.join(" • ")}</p></div>}{latestAssistant.chat.suggestedNextQuestions.length > 0 && <div><p className="font-bold uppercase tracking-[.1em] text-accent-700">Questions suggérées</p><div className="mt-1 space-y-2">{latestAssistant.chat.suggestedNextQuestions.map((question) => <button className="block w-full rounded-lg border border-line bg-surface px-3 py-2 text-left text-ink hover:border-brand-900 disabled:opacity-50" type="button" key={question} onClick={() => setInput(question)} disabled={isSending}>Utiliser cette question : {question}</button>)}</div></div>}</div>}<div className="mt-3"><SpeechControls isSpeaking={isSpeaking} isPaused={isPaused} isSupported={speechSupported} onSpeak={() => speak(latestAssistant.speechText ?? latestAssistant.content)} onPause={pause} onResume={resume} onCancel={cancel} /></div></div>}
          <div className="mt-4 space-y-3">{messages.slice(0, -1).map((message) => <div className={`rounded-xl p-3 text-sm ${message.role === "user" ? "ml-8 bg-brand-900 text-white" : "mr-8 border border-line bg-panel text-ink"}`} key={message.id}><p className="mb-1 text-[10px] font-bold uppercase tracking-[.12em] opacity-60">{message.role === "user" ? "Vous" : "PCC Intelligence"}</p>{message.content}</div>)}</div>
        </>}
      </div>
      <form className="border-t border-line bg-panel p-4 sm:rounded-b-2xl" onSubmit={sendQuestion}>
        <div className="flex items-center gap-2 rounded-xl border border-line bg-surface p-2 focus-within:border-brand-900"><input ref={inputRef} className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Demander quelque chose à PCC..." aria-label="Question à PCC" disabled={isSending} /><button className={`rounded-lg p-2 text-muted hover:bg-panel hover:text-brand-900 ${recognition.isListening ? "bg-amber-100 text-warning" : ""}`} type="button" onClick={recognition.isListening ? recognition.stopListening : recognition.startListening} aria-label="Activer le microphone" disabled={!recognition.isSupported}>{recognition.isListening ? <span className="relative flex"><Mic size={17} /><span className="absolute -right-1 -top-1 h-1.5 w-1.5 animate-pulse rounded-full bg-danger" /></span> : <Mic size={17} />}</button><button className="rounded-lg bg-brand-900 p-2 text-white disabled:opacity-40" type="submit" aria-label="Envoyer la question" disabled={!input.trim() || isSending}>{isSending ? <LoaderCircle className="animate-spin" size={17} /> : <Send size={17} />}</button></div><p className="mt-2 text-xs text-muted">{recognition.isListening ? "Je vous écoute..." : recognition.isSupported ? "Parlez ou écrivez votre question." : "Le microphone n'est pas disponible sur ce navigateur."}</p>
      </form>
    </aside>
  </div>;
}
