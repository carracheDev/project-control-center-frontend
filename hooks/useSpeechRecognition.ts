"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionResultEvent = Event & { results: { [index: number]: { [index: number]: { transcript: string } } }; resultIndex: number };
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;
type SpeechWindow = Window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor };

export function useSpeechRecognition(onTranscript?: (transcript: string) => void) {
  const isSupported = typeof window !== "undefined" && Boolean((window as SpeechWindow).SpeechRecognition ?? (window as SpeechWindow).webkitSpeechRecognition);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const speechWindow = window as SpeechWindow;
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) return;
    const recognition = new Recognition();
    recognition.lang = "fr-FR";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const value = event.results[event.resultIndex][0].transcript;
      setTranscript(value);
      onTranscript?.(value);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    return () => { recognition.stop(); recognitionRef.current = null; };
  }, [onTranscript]);

  const startListening = useCallback(() => {
    setTranscript("");
    recognitionRef.current?.start();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { startListening, stopListening, isListening, transcript, isSupported };
}
