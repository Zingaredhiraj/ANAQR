// AnatoScan AR – Shared TypeScript Types (Frontend)

export type Role = 'SUPER_ADMIN' | 'FACULTY' | 'STUDENT' | 'GUEST';
export type ContentStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
export type ModuleType = 'NORMAL_WORKING' | 'WHAT_GOES_WRONG' | 'HOW_IT_IS_MEASURED';
export type QuizDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

// ── Users ──────────────────────────────────────────────────────────────────
export interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  studentId?: string;
  batchYear?: number;
  avatarUrl?: string;
}

export interface FacultyProfile {
  id: string;
  firstName: string;
  lastName: string;
  employeeId?: string;
  designation?: string;
  qualification?: string;
  specialization?: string;
  avatarUrl?: string;
  bio?: string;
  department?: Department;
}

export interface User {
  id: string;
  name?: string;
  email: string;
  role: Role;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  studentProfile?: StudentProfile;
  facultyProfile?: FacultyProfile;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// ── Departments ───────────────────────────────────────────────────────────────
export interface Department {
  id: string;
  name: string;
  code?: string;
  description?: string;
  isActive: boolean;
}

// ── Anatomical Systems ────────────────────────────────────────────────────────
export interface AnatomicalSystem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  coverImageUrl?: string;
  color?: string;
  orderIndex: number;
  revisions?: {
    id: string;
    fieldName: string;
    note?: string;
    newValue?: string;
    createdAt: string;
  }[];
  _count?: { organs: number };
}

// ── Organs ────────────────────────────────────────────────────────────────────
export interface Organ {
  id: string;
  name: string;
  slug: string;
  scientificName?: string;
  latinName?: string;
  description?: string;
  location?: string;
  thumbnailUrl?: string;
  coverImageUrl?: string;
  status: ContentStatus;
  isPublished: boolean;
  publishedAt?: string;
  tags: string[];
  system: AnatomicalSystem;
  createdAt: string;
  updatedAt: string;
  revisions?: {
    id: string;
    fieldName: string;
    note?: string;
    newValue?: string;
    createdAt: string;
  }[];
  _count?: {
    models: number;
    disorders: number;
    learningModules: number;
  };
}

export interface OrganContent {
  externalStructure?: string;
  internalStructure?: string;
  chambers?: string;
  valves?: string;
  bloodSupply?: string;
  nerveSupply?: string;
  lymphaticDrainage?: string;
  anatomicalRelations?: string;
  normalFunctioning?: string;
  physiologicalConcepts?: string;
  clinicalCorrelation?: string;
  diagnosticMethods?: string;
}

export interface AnatomicalStructure {
  id: string;
  name: string;
  description?: string;
  location?: string;
  function?: string;
  meshName?: string;
  orderIndex: number;
}

export interface Disorder {
  id: string;
  name: string;
  description?: string;
  causes?: string;
  symptoms?: string;
  structuralEffect?: string;
  functionalEffect?: string;
  imageUrl?: string;
  status: ContentStatus;
}

export interface OrganDetail extends Organ {
  content?: OrganContent;
  structures: AnatomicalStructure[];
  disorders: Disorder[];
  learningModules: LearningModule[];
  models: ThreeDModel[];
  qrCodes: QRCode[];
  quizzes: Quiz[];
  educationalResources: EducationalResource[];
}

// ── 3D Models ─────────────────────────────────────────────────────────────────
export interface ThreeDModel {
  id: string;
  organId: string;
  name: string;
  description?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  status: 'PROCESSING' | 'READY' | 'FAILED' | 'ARCHIVED';
  isPrimary: boolean;
  isPublished: boolean;
  arEnabled: boolean;
  hasAnimations: boolean;
  hasLayers: boolean;
  hotspots: ModelHotspot[];
  layers: ModelLayer[];
  animations: ModelAnimation[];
}

export interface ModelHotspot {
  id: string;
  label: string;
  description?: string;
  positionX: number;
  positionY: number;
  positionZ: number;
  normalX: number;
  normalY: number;
  normalZ: number;
}

export interface ModelLayer {
  id: string;
  meshName: string;
  label: string;
  description?: string;
  orderIndex: number;
  isVisible: boolean;
}

export interface ModelAnimation {
  id: string;
  name: string;
  label: string;
  description?: string;
  durationSec?: number;
}

// ── QR Codes ──────────────────────────────────────────────────────────────────
export interface QRCode {
  id: string;
  organId: string;
  code: string;
  url: string;
  pngUrl?: string;
  svgUrl?: string;
  isActive: boolean;
  generatedAt: string;
}

// ── Learning Modules ──────────────────────────────────────────────────────────
export interface ModuleSection {
  id: string;
  title: string;
  content: string;
  contentType: 'markdown' | 'html' | 'flowchart';
  imageUrl?: string;
  videoUrl?: string;
  orderIndex: number;
}

export interface LearningModule {
  id: string;
  organId: string;
  type: ModuleType;
  title: string;
  description?: string;
  status: ContentStatus;
  estimatedMinutes?: number;
  sections: ModuleSection[];
}

// ── Quizzes ───────────────────────────────────────────────────────────────────
export interface QuizOption {
  id: string;
  optionText: string;
  orderIndex: number;
  // isCorrect is NOT returned to client until after submission
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  marks: number;
  orderIndex: number;
  imageUrl?: string;
  options: QuizOption[];
}

export interface Quiz {
  id: string;
  organId: string;
  moduleType?: ModuleType;
  title: string;
  description?: string;
  difficulty: QuizDifficulty;
  timeLimitSeconds?: number;
  passingScore: number;
  isPublished: boolean;
  revisions?: {
    id: string;
    fieldName: string;
    note?: string;
    newValue?: string;
    createdAt: string;
  }[];
  _count?: { questions: number };
}

export interface QuizWithQuestions extends Quiz {
  questions: QuizQuestion[];
}

export interface QuizAnswer {
  questionId: string;
  optionId: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface QuizAttemptResult {
  id: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  timeTakenSec?: number;
  answers: QuizAnswer[];
  completedAt: string;
}

// ── Feedback ──────────────────────────────────────────────────────────────────
export enum FeedbackType {
  GENERAL = 'GENERAL',
  CONTENT_ACCURACY = 'CONTENT_ACCURACY',
  MODEL_QUALITY = 'MODEL_QUALITY',
  AR_EXPERIENCE = 'AR_EXPERIENCE',
  QUIZ_CLARITY = 'QUIZ_CLARITY',
  SUGGESTION = 'SUGGESTION',
}

export interface Feedback {
  id: string;
  organId: string;
  overallRating: number;
  contentClarity?: number;
  educationalUsefulness?: number;
  accuracyRating?: number;
  confidenceLevel?: number;
  comment?: string;
  suggestions?: string;
  isAnonymous: boolean;
  createdAt: string;
}

// ── Educational Resources ─────────────────────────────────────────────────────
export interface EducationalResource {
  id: string;
  title: string;
  type: string;
  url?: string;
  description?: string;
  authors?: string;
  year?: number;
}

// ── Analytics ─────────────────────────────────────────────────────────────────
export interface AnalyticsOverview {
  totalOrgans: number;
  publishedOrgans: number;
  draftOrgans: number;
  totalFaculty: number;
  totalStudents: number;
  totalQrCodes: number;
  totalScans: number;
  totalModels: number;
  totalQuizAttempts: number;
  avgFeedbackRating: number;
  pendingApprovals: number;
  unresolvedReports: number;
}

// ── Pagination ────────────────────────────────────────────────────────────────
export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
