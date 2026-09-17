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

export interface PccAiChatResponse {
  sessionId: string;
  answer: string;
  intent: "QUESTION" | "SUMMARY" | "FIND_EVIDENCE" | "IDENTIFY_GAPS" | "COMPARE" | "NEXT_QUESTION" | "CRITERION_CHECK" | "ANALYZE";
  confidence: "HIGH" | "MEDIUM" | "LOW";
  evidence: { id: string; type: "INTERVIEW_ANSWER" | "EVIDENCE" | "CRITERION" | "OBJECTIVE"; label: string; excerpt?: string }[];
  missingInformation: string[];
  suggestedNextQuestions: string[];
  criterionAssessment?: { status: "SATISFIED" | "PARTIALLY_SATISFIED" | "NOT_SATISFIED" | "INSUFFICIENT_EVIDENCE"; reason: string };
}

export interface PccAiMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  speechText?: string;
  analysis?: PccAiAnalysis;
  chat?: PccAiChatResponse;
}

export interface PccAiChatRequest {
  message: string;
  sessionId?: string;
  interviewId?: string;
}

export function buildSpeechText(response: PccAiAnalysis): string {
  const parts = ["Voici l'analyse de votre phase.", response.summary];
  if (response.blockers.length > 0) parts.push(`Le principal blocage est : ${response.blockers.slice(0, 2).join(". ")}.`);
  if (response.missingInformation.length > 0) parts.push(`Il manque : ${response.missingInformation.slice(0, 2).join(". ")}.`);
  if (response.recommendations.length > 0) parts.push(`Je recommande : ${response.recommendations.slice(0, 2).join(". ")}.`);
  parts.push(response.validationAdvice);
  return parts.join(" ");
}

export function buildChatSpeechText(response: PccAiChatResponse): string {
  const parts = [response.answer];
  if (response.missingInformation.length > 0) parts.push(`Information manquante : ${response.missingInformation.slice(0, 2).join(". ")}.`);
  if (response.suggestedNextQuestions.length > 0) parts.push(`Question suggérée : ${response.suggestedNextQuestions[0]}`);
  return parts.join(" ");
}
