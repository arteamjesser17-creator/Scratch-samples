export interface TaskQuestion {
  id: string;
  type: 'multiple_choice' | 'code_analysis' | 'conceptual' | 'debugging' | 'calculation';
  question: string;
  options?: string[];
  correctAnswer: string;
  maxMarks: number;
  hints: [string, string, string];
  explanation: string;
}

export interface TaskItem {
  id: string;
  day: number;
  dayTitle: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  title: string;
  tagline: string;
  estimatedTime: string;
  iconName: string;
  colorScheme: {
    bg: string;
    border: string;
    badge: string;
    accent: string;
  };
  objectives: string[];
  projectDescription: string;
  challengeSteps: {
    stepNumber: number;
    title: string;
    instruction: string;
    scratchBlocksTip: string;
  }[];
  starterUrl: string;
  expectedBlocks: {
    opcodes: string[];
    labels: string[];
    minSprites: number;
    minBlocks: number;
    requiresVariables?: string[];
    requiresBroadcasts?: string[];
    requiresClones?: boolean;
  };
  questions: TaskQuestion[];
  reflectionPrompt: string;
}

export interface ParsedSb3Report {
  success: boolean;
  fileName: string;
  fileSizeBytes: number;
  spriteCount: number;
  stageIncluded: boolean;
  spriteNames: string[];
  totalBlocks: number;
  blockCategoryCounts: Record<string, number>;
  opcodesFound: string[];
  variablesFound: string[];
  broadcastsFound: string[];
  hasClones: boolean;
  costumeCount: number;
  soundCount: number;
  staticAnalysisScore: number;
  requirementChecks: {
    name: string;
    passed: boolean;
    detail: string;
  }[];
  summary: string;
  staticNotice: string;
}

export interface QuestionAssessment {
  qId: string;
  score: number;
  maxScore: number;
  isCorrect: boolean;
  feedback: string;
}

export interface AiAssessmentResult {
  overallScore: number;
  worksheetScore: number;
  projectScore: number;
  reflectionScore: number;
  isProjectPending: boolean;
  questionAssessments: QuestionAssessment[];
  projectFeedback: string;
  reflectionFeedback: string;
  strengths: string[];
  actionableImprovements: string[];
  teacherReviewFlagged: boolean;
  flagReason?: string;
  confidenceScore: number;
  engineUsed: 'gemini-3.8-flash' | 'deterministic-rubric';
  evaluatedAt: string;
}

export interface SubmissionRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  taskId: string;
  taskTitle: string;
  day: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  answers: Record<string, string>;
  scratchUrl?: string;
  sb3Report?: ParsedSb3Report | null;
  reflectionText: string;
  attemptNumber: number;
  submittedAt: string;
  aiAssessment: AiAssessmentResult;
  teacherAdjustment?: {
    originalScore: number;
    adjustedScore: number;
    reason: string;
    teacherNotes: string;
    adjustedBy: string;
    adjustedAt: string;
  };
  status: 'ai_evaluated' | 'needs_review' | 'teacher_approved';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  avatar: string;
  gradeLevel: string;
  streakDays: number;
  totalMarksEarned: number;
  bestScorePerTask: Record<string, number>;
  badges: string[];
}

export type ViewMode =
  | 'landing'
  | 'dashboard'
  | 'day_select'
  | 'task_select'
  | 'worksheet'
  | 'assessment'
  | 'progress'
  | 'teacher_dashboard'
  | 'worksheet_manager';
