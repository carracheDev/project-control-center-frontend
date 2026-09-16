"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const speechConfig = { rate: 1.02, pitch: 1, volume: 1 } as const;

export function selectFrenchVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const frenchVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith("fr"));
  if (frenchVoices.length === 0) return null;
  return frenchVoices.find((voice) => /male|homme|man/i.test(voice.name)) ?? frenchVoices[0];
}

export function useSpeechSynthesis() {
  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synthesis = window.speechSynthesis;
    const updateVoices = () => setVoice(selectFrenchVoice(synthesis.getVoices()));
    const voiceTimer = window.setTimeout(updateVoices, 0);
    synthesis.addEventListener("voiceschanged", updateVoices);
    return () => {
      window.clearTimeout(voiceTimer);
      synthesis.cancel();
      synthesis.removeEventListener("voiceschanged", updateVoices);
    };
  }, []);

  const cancel = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setIsSpeaking(false);
    setIsPaused(false);
  }, [isSupported]);

  const speak = useCallback((text: string) => {
    if (!isSupported || !text.trim()) return;
    const synthesis = window.speechSynthesis;
    synthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = speechConfig.rate;
    utterance.pitch = speechConfig.pitch;
    utterance.volume = speechConfig.volume;
    if (voice) utterance.voice = voice;
    utterance.onend = () => { setIsSpeaking(false); setIsPaused(false); utteranceRef.current = null; };
    utterance.onerror = () => { setIsSpeaking(false); setIsPaused(false); utteranceRef.current = null; };
    utteranceRef.current = utterance;
    synthesis.speak(utterance);
    setIsSpeaking(true);
    setIsPaused(false);
  }, [isSupported, voice]);

  const pause = useCallback(() => {
    if (!isSupported || !window.speechSynthesis.speaking) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported || !window.speechSynthesis.paused) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [isSupported]);

  return { speak, pause, resume, cancel, isSpeaking, isPaused, isSupported };
}
