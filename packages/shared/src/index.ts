import { z } from 'zod';

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  FACULTY = 'FACULTY',
  STUDENT = 'STUDENT',
  GUEST = 'GUEST',
}

export enum ContentStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED',
}

export enum ModelStatus {
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  FAILED = 'FAILED',
  ARCHIVED = 'ARCHIVED',
}

export enum IssueStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

export enum QuizDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export enum ModuleType {
  NORMAL_WORKING = 'NORMAL_WORKING',
  WHAT_GOES_WRONG = 'WHAT_GOES_WRONG',
  HOW_IT_IS_MEASURED = 'HOW_IT_IS_MEASURED',
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  PUBLISH = 'PUBLISH',
  REJECT = 'REJECT',
  APPROVE = 'APPROVE',
  UPLOAD = 'UPLOAD',
  DOWNLOAD = 'DOWNLOAD',
  SCAN = 'SCAN',
  ATTEMPT_QUIZ = 'ATTEMPT_QUIZ',
}

// Zod schemas
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.nativeEnum(Role).optional(),
});

export const CreateOrganSchema = z.object({
  name: z.string().min(1),
  scientificName: z.string().optional(),
  latinName: z.string().optional(),
  systemId: z.string().uuid(),
  description: z.string().optional(),
  location: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const SubmitFeedbackSchema = z.object({
  organId: z.string().uuid(),
  overallRating: z.number().min(1).max(5),
  contentClarity: z.number().min(1).max(5).optional(),
  educationalUsefulness: z.number().min(1).max(5).optional(),
  accuracyRating: z.number().min(1).max(5).optional(),
  confidenceLevel: z.number().min(1).max(10).optional(),
  comment: z.string().optional(),
  suggestions: z.string().optional(),
});

export const SubmitErrorReportSchema = z.object({
  organId: z.string().uuid(),
  category: z.string().min(1),
  description: z.string().min(1),
  pageUrl: z.string().optional(),
});
