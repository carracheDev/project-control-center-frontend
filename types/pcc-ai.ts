export type PccAiStatus = "READY" | "NOT_READY" | "ATTENTION";

export interface PccAiAnalysis {
  status: PccAiStatus;
  summary: string;
  strengths: string[];
  blockers: string[];
  missingInformation: string[];
  contradictions: string[];
  recommendations: string[];
  validationAdvice: string;
}

export interface PccAiMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  speechText?: string;
  analysis?: PccAiAnalysis;
}

export interface PccAiChatRequest {
  message: string;
}

export function buildSpeechText(response: PccAiAnalysis): string {
  const parts = ["Voici l'analyse de votre phase.", response.summary];
  if (response.blockers.length > 0) parts.push(`Le principal blocage est : ${response.blockers.slice(0, 2).join(". ")}.`);
  if (response.missingInformation.length > 0) parts.push(`Il manque : ${response.missingInformation.slice(0, 2).join(". ")}.`);
  if (response.recommendations.length > 0) parts.push(`Je recommande : ${response.recommendations.slice(0, 2).join(". ")}.`);
  parts.push(response.validationAdvice);
  return parts.join(" ");
}
