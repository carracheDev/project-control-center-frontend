export type PhaseStatus = "LOCKED" | "PLANNED" | "IN_PROGRESS" | "VALIDATED" | "REOPENED";

export interface Phase {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  order: number;
  status: PhaseStatus;
  startDate: string | null;
  endDate: string | null;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PhaseWorkflowState {
  phaseId: string;
  status: PhaseStatus;
  previousPhase: { id: string; name: string; status: PhaseStatus } | null;
  accessible: boolean;
  locked: boolean;
  reason: string | null;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  phases: Phase[];
}

export interface ProjectTimeline {
  id: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
  phases: { id: string; name: string; order: number; status: PhaseStatus; startDate: string | null; endDate: string | null; deadline: string | null; tasks: { id: string; title: string; status: TaskStatus; deadline: string | null }[] }[];
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export type UpdateProjectInput = Partial<CreateProjectInput>;

export interface CreatePhaseInput {
  name: string;
  description?: string;
  order: number;
  startDate?: string;
  endDate?: string;
  deadline?: string;
}

export type UpdatePhaseInput = Partial<CreatePhaseInput>;

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "BLOCKED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Objective {
  id: string;
  phaseId: string;
  name: string;
  description: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Criterion {
  id: string;
  phaseId: string;
  objectiveId: string | null;
  name: string;
  description: string | null;
  required: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  assessment?: CriterionAssessment | null;
}

export type CriterionAssessmentStatus = "PENDING" | "SATISFIED" | "NOT_SATISFIED";

export interface CriterionAssessment {
  id: string;
  criterionId: string;
  status: CriterionAssessmentStatus;
  note: string | null;
  evidenceId: string | null;
  assessedAt: string | null;
  assessedBy: string | null;
  createdAt: string;
  updatedAt: string;
  evidence?: Pick<Evidence, "id" | "title" | "status"> | null;
}

export interface CreateCriterionAssessmentInput {
  status?: CriterionAssessmentStatus;
  note?: string;
  evidenceId?: string;
  assessedBy?: string;
}

export interface UpdateCriterionAssessmentInput {
  status?: CriterionAssessmentStatus;
  note?: string | null;
  evidenceId?: string | null;
  assessedBy?: string | null;
}

export interface Task {
  id: string;
  phaseId: string;
  objectiveId: string | null;
  criterionId: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateObjectiveInput {
  name: string;
  description?: string;
  order: number;
}

export type UpdateObjectiveInput = Partial<CreateObjectiveInput>;

export interface CreateCriterionInput {
  objectiveId?: string;
  name: string;
  description?: string;
  required: boolean;
  order: number;
}

export type UpdateCriterionInput = Partial<CreateCriterionInput> & { objectiveId?: string | null };

export type DashboardAttentionType = "PHASE" | "GATING" | "TASK" | "CRITERION" | "COVERAGE" | "EVIDENCE";
export type DashboardAttentionSeverity = "HIGH" | "WARNING";

export interface DashboardAttentionItem {
  type: DashboardAttentionType;
  severity: DashboardAttentionSeverity;
  phaseId: string;
  message: string;
}

export interface ProjectDashboardCard {
  id: string;
  name: string;
  description: string | null;
  phase: Pick<Phase, "id" | "name" | "order" | "status"> | null;
  progress: { completedPhases: number; totalPhases: number; percentage: number };
  tasks: { total: number; done: number; blocked: number };
  criteria: { required: number; satisfied: number; pending: number; notSatisfied: number };
  coverage: { total: number; required: number; satisfied: number; unsatisfied: number };
  interviews: { total: number; completed: number };
  evidence: { total: number; verified: number; pending: number; rejected: number };
  attention: { hasBlockers: boolean; items: DashboardAttentionItem[] };
}

export interface DashboardValidation {
  id: string;
  projectId: string;
  projectName: string;
  phaseId: string;
  phaseName: string;
  validatedAt: string;
  validatedBy: string | null;
  note: string | null;
}

export interface ProjectDashboardResult {
  summary: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    blockedProjects: number;
    projectsNeedingAttention: number;
  };
  projects: ProjectDashboardCard[];
  recentValidations: DashboardValidation[];
  attentionItems: (DashboardAttentionItem & { projectId: string; projectName: string })[];
  evaluatedAt: string;
}

export type DecisionType = "GO" | "PIVOT" | "NO_GO";

export interface DecisionSnapshot {
  projectId: string;
  projectName: string;
  phaseSummary: { total: number; validated: number; inProgress: number; planned: number; locked: number; reopened: number };
  progress: { completedPhases: number; totalPhases: number; percentage: number };
  objectivesSummary: { total: number };
  criteriaSummary: { total: number; required: number; satisfied: number; pending: number; notSatisfied: number };
  taskSummary: { total: number; todo: number; inProgress: number; done: number; blocked: number };
  interviewSummary: { total: number; completed: number };
  coverageSummary: { total: number; required: number; satisfied: number; unsatisfied: number };
  evidenceSummary: { total: number; verified: number; pending: number; rejected: number };
  validationSummary: { total: number; recent: unknown[] };
  reportGeneratedAt: string;
}

export interface ProjectDecision {
  id: string;
  projectId: string;
  type: DecisionType;
  rationale: string;
  nextSteps: string | null;
  decidedBy: string | null;
  decidedAt: string;
  reportSnapshot: DecisionSnapshot;
}

export interface CreateProjectDecisionInput {
  type: DecisionType;
  rationale: string;
  nextSteps?: string;
  decidedBy?: string;
}

export interface CreateTaskInput {
  objectiveId?: string;
  criterionId?: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  deadline?: string;
}

export type UpdateTaskInput = Partial<CreateTaskInput> & {
  objectiveId?: string | null;
  criterionId?: string | null;
  deadline?: string | null;
};

export type QuestionnaireStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
export type QuestionType = "TEXT" | "LONG_TEXT" | "NUMBER" | "BOOLEAN" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "DATE";
export type InterviewStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface QuestionOption {
  id: string;
  questionId: string;
  label: string;
  value: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  questionnaireId: string;
  text: string;
  description: string | null;
  type: QuestionType;
  required: boolean;
  order: number;
  objectiveId: string | null;
  createdAt: string;
  updatedAt: string;
  options: QuestionOption[];
}

export interface Questionnaire {
  id: string;
  phaseId: string;
  name: string;
  description: string | null;
  version: number;
  status: QuestionnaireStatus;
  createdAt: string;
  updatedAt: string;
  questions?: Question[];
}

export interface Interview {
  id: string;
  phaseId: string;
  questionnaireId: string;
  respondentName: string;
  respondentRole: string | null;
  organization: string | null;
  startedAt: string | null;
  completedAt: string | null;
  status: InterviewStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  questionnaire?: Pick<Questionnaire, "id" | "name" | "version"> & { questions?: Question[] };
  responses?: Response[];
}

export interface Response {
  id: string;
  interviewId: string;
  questionId: string;
  value: string;
  createdAt: string;
  updatedAt: string;
  question?: Pick<Question, "id" | "text" | "type" | "required" | "order">;
}

export interface CreateQuestionnaireInput {
  name: string;
  description?: string;
  version: number;
  status?: QuestionnaireStatus;
}

export type UpdateQuestionnaireInput = Partial<CreateQuestionnaireInput>;

export interface CreateQuestionInput {
  text: string;
  description?: string;
  type: QuestionType;
  required: boolean;
  order: number;
  objectiveId?: string;
}

export type UpdateQuestionInput = Partial<CreateQuestionInput> & { objectiveId?: string | null };

export interface CreateOptionInput {
  label: string;
  value: string;
  order: number;
}

export type UpdateOptionInput = Partial<CreateOptionInput>;

export interface CreateInterviewInput {
  questionnaireId: string;
  respondentName: string;
  respondentRole?: string;
  organization?: string;
  startedAt?: string;
  completedAt?: string;
  status?: InterviewStatus;
  notes?: string;
}

export type UpdateInterviewInput = Partial<CreateInterviewInput>;

export interface CreateResponseInput {
  questionId: string;
  value: string;
}

export type UpdateResponseInput = Partial<CreateResponseInput>;

export type EvidenceType = "DOCUMENT" | "IMAGE" | "SPREADSHEET" | "LINK" | "INTERVIEW" | "NOTE" | "OTHER";
export type EvidenceStatus = "PENDING" | "VERIFIED" | "REJECTED";

export interface Evidence {
  id: string;
  phaseId: string;
  criterionId: string | null;
  taskId: string | null;
  interviewId: string | null;
  title: string;
  description: string | null;
  type: EvidenceType;
  source: string;
  url: string | null;
  filePath: string | null;
  originalFileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  note: string | null;
  status: EvidenceStatus;
  collectedAt: string | null;
  verifiedAt: string | null;
  verifiedBy: string | null;
  createdAt: string;
  updatedAt: string;
  criterion?: Pick<Criterion, "id" | "name"> | null;
  task?: Pick<Task, "id" | "title"> | null;
  interview?: Pick<Interview, "id" | "respondentName"> | null;
}

export interface CreateEvidenceInput {
  criterionId?: string;
  taskId?: string;
  interviewId?: string;
  title: string;
  description?: string;
  type: EvidenceType;
  source: string;
  url?: string;
  filePath?: string;
  note?: string;
  collectedAt?: string;
}

export type UpdateEvidenceInput = Partial<CreateEvidenceInput> & {
  criterionId?: string | null;
  taskId?: string | null;
  interviewId?: string | null;
  url?: string | null;
  filePath?: string | null;
  note?: string | null;
};

export interface CoverageRequirement {
  id: string;
  phaseId: string;
  objectiveId: string | null;
  name: string;
  description: string | null;
  minimumInterviews: number;
  required: boolean;
  createdAt: string;
  updatedAt: string;
  objective?: Pick<Objective, "id" | "name"> | null;
}

export interface CoverageResult {
  requirementId: string;
  name: string;
  objectiveId: string | null;
  minimumInterviews: number;
  coveredInterviews: number;
  percentage: number;
  satisfied: boolean;
}

export interface PhaseCoverageResult {
  phaseId: string;
  totalInterviews: number;
  completedInterviews: number;
  requirements: CoverageResult[];
  allRequiredSatisfied: boolean;
}

export interface CreateCoverageRequirementInput {
  objectiveId?: string;
  name: string;
  description?: string;
  minimumInterviews: number;
  required?: boolean;
}

export type UpdateCoverageRequirementInput = Partial<CreateCoverageRequirementInput> & { objectiveId?: string | null };

export interface ReadinessBlocker {
  type: string;
  message: string;
  relatedEntityId: string | null;
}

export type ReadinessCondition = ReadinessBlocker;
export type ReadinessAction = ReadinessBlocker;

export interface PhaseReadinessResult {
  phaseId: string;
  ready: boolean;
  blockers: ReadinessBlocker[];
  satisfiedConditions: ReadinessCondition[];
  nextActions: ReadinessAction[];
  evaluatedAt: string;
}

export interface GatingCondition {
  code: string;
  label: string;
  required: boolean;
  satisfied: boolean;
  reason?: string;
}

export interface GatingResult {
  phaseId: string;
  canValidate: boolean;
  blockers: string[];
  satisfiedConditions: string[];
  conditions: GatingCondition[];
  evaluatedAt: string;
}

export interface PhaseValidation {
  id: string;
  phaseId: string;
  validatedAt: string;
  validatedBy: string | null;
  note: string | null;
  gatingSnapshot: GatingResult;
}

export interface PhaseValidationResult {
  phase: Phase;
  validation: PhaseValidation;
}

export interface CreatePhaseValidationInput {
  validatedBy?: string;
  note?: string;
}