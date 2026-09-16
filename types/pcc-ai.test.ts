import { describe, expect, it } from "vitest";
import { buildSpeechText } from "./pcc-ai";
import { selectFrenchVoice } from "@/hooks/useSpeechSynthesis";

describe("PCC Intelligence voice helpers", () => {
  it("builds natural speech text without technical JSON field names", () => {
    const text = buildSpeechText({
      status: "NOT_READY",
      summary: "La phase est bloquée.",
      strengths: [],
      blockers: ["Le critère problème n'est pas satisfait."],
      missingInformation: ["Une preuve terrain."],
      contradictions: [],
      recommendations: ["Revoir le critère."],
      validationAdvice: "Ne validez pas encore.",
    });

    expect(text).toContain("La phase est bloquée.");
    expect(text).toContain("Le principal blocage est");
    expect(text).not.toContain("validationAdvice");
  });

  it("prefers a French male voice when the browser provides one", () => {
    const voices = [
      { lang: "fr-FR", name: "Claire" },
      { lang: "fr-FR", name: "French Male" },
      { lang: "en-US", name: "English" },
    ] as SpeechSynthesisVoice[];

    expect(selectFrenchVoice(voices)?.name).toBe("French Male");
  });

  it("falls back to the first French voice and handles no French voice", () => {
    const voices = [{ lang: "fr-CA", name: "Sophie" }] as SpeechSynthesisVoice[];
    expect(selectFrenchVoice(voices)?.name).toBe("Sophie");
    expect(selectFrenchVoice([{ lang: "en-US", name: "English" }] as SpeechSynthesisVoice[])).toBeNull();
  });
});
