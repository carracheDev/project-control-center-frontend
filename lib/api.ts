import type {
  CreatePhaseInput,
  CreatePhaseValidationInput,
  CreateCriterionAssessmentInput,
  CreateCriterionInput,
  CreateInterviewInput,
  CreateEvidenceInput,
  CreateCoverageRequirementInput,
  CreateObjectiveInput,
  CreateOptionInput,
  CreateProjectInput,
  CreateProjectDecisionInput,
  CreateQuestionInput,
  CreateQuestionnaireInput,
  CreateResponseInput,
  CreateTaskInput,
  Criterion,
  CriterionAssessment,
  Objective,
  Phase,
  PhaseWorkflowState,
  Project,
  ProjectTimeline,
  Interview,
  Evidence,
  CoverageRequirement,
  PhaseCoverageResult,
  PhaseReadinessResult,
  PhaseValidation,
  PhaseValidationResult,
  ProjectDashboardResult,
  ProjectDecision,
  GatingResult,
  Question,
  Questionnaire,
  QuestionOption,
  Response,
  Task,
  UpdateCriterionInput,
  UpdateCriterionAssessmentInput,
  UpdateInterviewInput,
  UpdateEvidenceInput,
  UpdateCoverageRequirementInput,
  UpdateObjectiveInput,
  UpdateOptionInput,
  UpdatePhaseInput,
  UpdateProjectInput,
  UpdateQuestionInput,
  UpdateQuestionnaireInput,
  UpdateResponseInput,
  UpdateTaskInput,
} from "@/types/domain";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export interface CurrentUser {
  id: string;
  email: string;
  globalRole: "ADMIN";
  memberships: { projectId: string; role: "PROJECT_MANAGER" | "VIEWER" }[];
}

class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL n'est pas configurée.");
  }

  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let message = `Erreur API (${response.status})`;
    try {
      const payload = (await response.json()) as { message?: string | string[] };
      if (payload.message) {
        message = Array.isArray(payload.message) ? payload.message.join(", ") : payload.message;
      }
    } catch {
      // Keep the HTTP status when the server does not return JSON.
    }
    if (response.status === 401 && typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
    throw new ApiError(response.status === 403 ? "Accès refusé." : message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function login(email: string, password: string): Promise<{ authenticated: boolean }> {
  return request<{ authenticated: boolean }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
}

export function logout(): Promise<{ authenticated: boolean }> {
  return request<{ authenticated: boolean }>("/auth/logout", { method: "POST" });
}

export function getCurrentUser(): Promise<CurrentUser> {
  return request<CurrentUser>("/auth/me");
}

export function registerPushToken(token: string, platform: "android" | "desktop" | "web" = "web"): Promise<unknown> {
  return request("/notifications/tokens", { method: "POST", body: JSON.stringify({ token, platform }) });
}

export function getDashboard(projectId?: string): Promise<ProjectDashboardResult> {
  return request<ProjectDashboardResult>(`/dashboard${projectId ? `?projectId=${encodeURIComponent(projectId)}` : ""}`);
}

export function getProjects(): Promise<Project[]> {
  return request<Project[]>("/projects");
}

export function getProject(id: string): Promise<Project> {
  return request<Project>(`/projects/${id}`);
}
export function getProjectTimeline(id: string): Promise<ProjectTimeline> { return request<ProjectTimeline>(`/projects/${id}/timeline`); }

export function createProjectDecision(projectId: string, input: CreateProjectDecisionInput): Promise<ProjectDecision> { return request<ProjectDecision>(`/projects/${projectId}/decisions`, { method: "POST", body: JSON.stringify(input) }); }
export function getProjectDecisions(projectId: string): Promise<ProjectDecision[]> { return request<ProjectDecision[]>(`/projects/${projectId}/decisions`); }

export function createProject(input: CreateProjectInput): Promise<Project> {
  return request<Project>("/projects", { method: "POST", body: JSON.stringify(input) });
}

export function updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
  return request<Project>(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export function deleteProject(id: string): Promise<Project> {
  return request<Project>(`/projects/${id}`, { method: "DELETE" });
}

export function getPhases(projectId: string): Promise<Phase[]> {
  return request<Phase[]>(`/projects/${projectId}/phases`);
}

export function getPhase(id: string): Promise<Phase> {
  return request<Phase>(`/phases/${id}`);
}

export function getPhaseWorkflow(id: string): Promise<PhaseWorkflowState> { return request<PhaseWorkflowState>(`/phases/${id}/workflow`); }

export function createPhase(projectId: string, input: CreatePhaseInput): Promise<Phase> {
  return request<Phase>(`/projects/${projectId}/phases`, { method: "POST", body: JSON.stringify(input) });
}

export function updatePhase(id: string, input: UpdatePhaseInput): Promise<Phase> {
  return request<Phase>(`/phases/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export function deletePhase(id: string): Promise<Phase> {
  return request<Phase>(`/phases/${id}`, { method: "DELETE" });
}

export function validatePhase(phaseId: string, input: CreatePhaseValidationInput = {}): Promise<PhaseValidationResult> { return request<PhaseValidationResult>(`/phases/${phaseId}/validate`, { method: "POST", body: JSON.stringify(input) }); }
export function getPhaseValidations(phaseId: string): Promise<PhaseValidation[]> { return request<PhaseValidation[]>(`/phases/${phaseId}/validations`); }

export function getObjectives(phaseId: string): Promise<Objective[]> {
  return request<Objective[]>(`/phases/${phaseId}/objectives`);
}

export function getObjective(id: string): Promise<Objective> {
  return request<Objective>(`/objectives/${id}`);
}

export function createObjective(phaseId: string, input: CreateObjectiveInput): Promise<Objective> {
  return request<Objective>(`/phases/${phaseId}/objectives`, { method: "POST", body: JSON.stringify(input) });
}

export function updateObjective(id: string, input: UpdateObjectiveInput): Promise<Objective> {
  return request<Objective>(`/objectives/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export function deleteObjective(id: string): Promise<Objective> {
  return request<Objective>(`/objectives/${id}`, { method: "DELETE" });
}

export function getCriteria(phaseId: string): Promise<Criterion[]> {
  return request<Criterion[]>(`/phases/${phaseId}/criteria`);
}

export function getCriterion(id: string): Promise<Criterion> {
  return request<Criterion>(`/criteria/${id}`);
}

export function createCriterion(phaseId: string, input: CreateCriterionInput): Promise<Criterion> {
  return request<Criterion>(`/phases/${phaseId}/criteria`, { method: "POST", body: JSON.stringify(input) });
}

export function updateCriterion(id: string, input: UpdateCriterionInput): Promise<Criterion> {
  return request<Criterion>(`/criteria/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export function deleteCriterion(id: string): Promise<Criterion> {
  return request<Criterion>(`/criteria/${id}`, { method: "DELETE" });
}

export function getCriterionAssessment(criterionId: string): Promise<CriterionAssessment | null> { return request<CriterionAssessment | null>(`/criteria/${criterionId}/assessment`); }
export function createCriterionAssessment(criterionId: string, input: CreateCriterionAssessmentInput): Promise<CriterionAssessment> { return request<CriterionAssessment>(`/criteria/${criterionId}/assessment`, { method: "POST", body: JSON.stringify(input) }); }
export function updateCriterionAssessment(id: string, input: UpdateCriterionAssessmentInput): Promise<CriterionAssessment> { return request<CriterionAssessment>(`/criterion-assessments/${id}`, { method: "PATCH", body: JSON.stringify(input) }); }
export function deleteCriterionAssessment(id: string): Promise<CriterionAssessment> { return request<CriterionAssessment>(`/criterion-assessments/${id}`, { method: "DELETE" }); }

export function getTasks(phaseId: string): Promise<Task[]> {
  return request<Task[]>(`/phases/${phaseId}/tasks`);
}

export function getTask(id: string): Promise<Task> {
  return request<Task>(`/tasks/${id}`);
}

export function createTask(phaseId: string, input: CreateTaskInput): Promise<Task> {
  return request<Task>(`/phases/${phaseId}/tasks`, { method: "POST", body: JSON.stringify(input) });
}

export function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  return request<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export function deleteTask(id: string): Promise<Task> {
  return request<Task>(`/tasks/${id}`, { method: "DELETE" });
}

export function getQuestionnaires(phaseId: string): Promise<Questionnaire[]> { return request<Questionnaire[]>(`/phases/${phaseId}/questionnaires`); }
export function getQuestionnaire(id: string): Promise<Questionnaire> { return request<Questionnaire>(`/questionnaires/${id}`); }
export function createQuestionnaire(phaseId: string, input: CreateQuestionnaireInput): Promise<Questionnaire> { return request<Questionnaire>(`/phases/${phaseId}/questionnaires`, { method: "POST", body: JSON.stringify(input) }); }
export function updateQuestionnaire(id: string, input: UpdateQuestionnaireInput): Promise<Questionnaire> { return request<Questionnaire>(`/questionnaires/${id}`, { method: "PATCH", body: JSON.stringify(input) }); }
export function deleteQuestionnaire(id: string): Promise<Questionnaire> { return request<Questionnaire>(`/questionnaires/${id}`, { method: "DELETE" }); }

export function getQuestions(questionnaireId: string): Promise<Question[]> { return request<Question[]>(`/questionnaires/${questionnaireId}/questions`); }
export function getQuestion(id: string): Promise<Question> { return request<Question>(`/questions/${id}`); }
export function createQuestion(questionnaireId: string, input: CreateQuestionInput): Promise<Question> { return request<Question>(`/questionnaires/${questionnaireId}/questions`, { method: "POST", body: JSON.stringify(input) }); }
export function updateQuestion(id: string, input: UpdateQuestionInput): Promise<Question> { return request<Question>(`/questions/${id}`, { method: "PATCH", body: JSON.stringify(input) }); }
export function deleteQuestion(id: string): Promise<Question> { return request<Question>(`/questions/${id}`, { method: "DELETE" }); }
export function getOptions(questionId: string): Promise<QuestionOption[]> { return request<QuestionOption[]>(`/questions/${questionId}/options`); }
export function createOption(questionId: string, input: CreateOptionInput): Promise<QuestionOption> { return request<QuestionOption>(`/questions/${questionId}/options`, { method: "POST", body: JSON.stringify(input) }); }
export function updateOption(id: string, input: UpdateOptionInput): Promise<QuestionOption> { return request<QuestionOption>(`/options/${id}`, { method: "PATCH", body: JSON.stringify(input) }); }
export function deleteOption(id: string): Promise<QuestionOption> { return request<QuestionOption>(`/options/${id}`, { method: "DELETE" }); }

export function getInterviews(phaseId: string): Promise<Interview[]> { return request<Interview[]>(`/phases/${phaseId}/interviews`); }
export function getInterview(id: string): Promise<Interview> { return request<Interview>(`/interviews/${id}`); }
export function createInterview(phaseId: string, input: CreateInterviewInput): Promise<Interview> { return request<Interview>(`/phases/${phaseId}/interviews`, { method: "POST", body: JSON.stringify(input) }); }
export function updateInterview(id: string, input: UpdateInterviewInput): Promise<Interview> { return request<Interview>(`/interviews/${id}`, { method: "PATCH", body: JSON.stringify(input) }); }
export function deleteInterview(id: string): Promise<Interview> { return request<Interview>(`/interviews/${id}`, { method: "DELETE" }); }
export function getResponses(interviewId: string): Promise<Response[]> { return request<Response[]>(`/interviews/${interviewId}/responses`); }
export function createResponse(interviewId: string, input: CreateResponseInput): Promise<Response> { return request<Response>(`/interviews/${interviewId}/responses`, { method: "POST", body: JSON.stringify(input) }); }
export function updateResponse(id: string, input: UpdateResponseInput): Promise<Response> { return request<Response>(`/responses/${id}`, { method: "PATCH", body: JSON.stringify(input) }); }
export function deleteResponse(id: string): Promise<Response> { return request<Response>(`/responses/${id}`, { method: "DELETE" }); }

export function getEvidence(phaseId: string, status?: Evidence["status"]): Promise<Evidence[]> { return request<Evidence[]>(`/phases/${phaseId}/evidence${status ? `?status=${status}` : ""}`); }
export function getEvidenceItem(id: string): Promise<Evidence> { return request<Evidence>(`/evidence/${id}`); }
export function createEvidence(phaseId: string, input: CreateEvidenceInput): Promise<Evidence> { return request<Evidence>(`/phases/${phaseId}/evidence`, { method: "POST", body: JSON.stringify(input) }); }
export function uploadEvidence(phaseId: string, input: CreateEvidenceInput, file: File): Promise<Evidence> {
  const body = new FormData();
  Object.entries({ ...input, source: "UPLOAD" }).forEach(([key, value]) => { if (value !== undefined) body.append(key, String(value)); });
  body.append("file", file);
  return request<Evidence>(`/phases/${phaseId}/evidence/upload`, { method: "POST", body });
}
export function updateEvidence(id: string, input: UpdateEvidenceInput): Promise<Evidence> { return request<Evidence>(`/evidence/${id}`, { method: "PATCH", body: JSON.stringify(input) }); }
export function deleteEvidence(id: string): Promise<Evidence> { return request<Evidence>(`/evidence/${id}`, { method: "DELETE" }); }
export function verifyEvidence(id: string, verifiedBy?: string): Promise<Evidence> { return request<Evidence>(`/evidence/${id}/verify`, { method: "POST", body: JSON.stringify(verifiedBy ? { verifiedBy } : {}) }); }
export function rejectEvidence(id: string, verifiedBy?: string): Promise<Evidence> { return request<Evidence>(`/evidence/${id}/reject`, { method: "POST", body: JSON.stringify(verifiedBy ? { verifiedBy } : {}) }); }

export function getCoverageRequirements(phaseId: string): Promise<CoverageRequirement[]> { return request<CoverageRequirement[]>(`/phases/${phaseId}/coverage-requirements`); }
export function getCoverage(phaseId: string): Promise<PhaseCoverageResult> { return request<PhaseCoverageResult>(`/phases/${phaseId}/coverage`); }
export function getPhaseReadiness(phaseId: string): Promise<PhaseReadinessResult> { return request<PhaseReadinessResult>(`/phases/${phaseId}/readiness`); }
export function getPhaseGating(phaseId: string): Promise<GatingResult> { return request<GatingResult>(`/phases/${phaseId}/gating`); }
export function createCoverageRequirement(phaseId: string, input: CreateCoverageRequirementInput): Promise<CoverageRequirement> { return request<CoverageRequirement>(`/phases/${phaseId}/coverage-requirements`, { method: "POST", body: JSON.stringify(input) }); }
export function updateCoverageRequirement(id: string, input: UpdateCoverageRequirementInput): Promise<CoverageRequirement> { return request<CoverageRequirement>(`/coverage-requirements/${id}`, { method: "PATCH", body: JSON.stringify(input) }); }
export function deleteCoverageRequirement(id: string): Promise<CoverageRequirement> { return request<CoverageRequirement>(`/coverage-requirements/${id}`, { method: "DELETE" }); }