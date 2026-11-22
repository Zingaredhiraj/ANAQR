import { z } from 'zod';
export declare enum Role {
    SUPER_ADMIN = "SUPER_ADMIN",
    FACULTY = "FACULTY",
    STUDENT = "STUDENT",
    GUEST = "GUEST"
}
export declare enum ContentStatus {
    DRAFT = "DRAFT",
    PENDING_REVIEW = "PENDING_REVIEW",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    ARCHIVED = "ARCHIVED"
}
export declare enum ModelStatus {
    PROCESSING = "PROCESSING",
    READY = "READY",
    FAILED = "FAILED",
    ARCHIVED = "ARCHIVED"
}
export declare enum IssueStatus {
    OPEN = "OPEN",
    IN_PROGRESS = "IN_PROGRESS",
    RESOLVED = "RESOLVED",
    REJECTED = "REJECTED"
}
export declare enum QuizDifficulty {
    EASY = "EASY",
    MEDIUM = "MEDIUM",
    HARD = "HARD"
}
export declare enum ModuleType {
    NORMAL_WORKING = "NORMAL_WORKING",
    WHAT_GOES_WRONG = "WHAT_GOES_WRONG",
    HOW_IT_IS_MEASURED = "HOW_IT_IS_MEASURED"
}
export declare enum AuditAction {
    CREATE = "CREATE",
    UPDATE = "UPDATE",
    DELETE = "DELETE",
    LOGIN = "LOGIN",
    LOGOUT = "LOGOUT",
    PUBLISH = "PUBLISH",
    REJECT = "REJECT",
    APPROVE = "APPROVE",
    UPLOAD = "UPLOAD",
    DOWNLOAD = "DOWNLOAD",
    SCAN = "SCAN",
    ATTEMPT_QUIZ = "ATTEMPT_QUIZ"
}
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const RegisterSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    role: z.ZodOptional<z.ZodNativeEnum<typeof Role>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: Role | undefined;
}, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: Role | undefined;
}>;
export declare const CreateOrganSchema: z.ZodObject<{
    name: z.ZodString;
    scientificName: z.ZodOptional<z.ZodString>;
    latinName: z.ZodOptional<z.ZodString>;
    systemId: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    systemId: string;
    scientificName?: string | undefined;
    latinName?: string | undefined;
    description?: string | undefined;
    location?: string | undefined;
    tags?: string[] | undefined;
}, {
    name: string;
    systemId: string;
    scientificName?: string | undefined;
    latinName?: string | undefined;
    description?: string | undefined;
    location?: string | undefined;
    tags?: string[] | undefined;
}>;
export declare const SubmitFeedbackSchema: z.ZodObject<{
    organId: z.ZodString;
    overallRating: z.ZodNumber;
    contentClarity: z.ZodOptional<z.ZodNumber>;
    educationalUsefulness: z.ZodOptional<z.ZodNumber>;
    accuracyRating: z.ZodOptional<z.ZodNumber>;
    confidenceLevel: z.ZodOptional<z.ZodNumber>;
    comment: z.ZodOptional<z.ZodString>;
    suggestions: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    organId: string;
    overallRating: number;
    contentClarity?: number | undefined;
    educationalUsefulness?: number | undefined;
    accuracyRating?: number | undefined;
    confidenceLevel?: number | undefined;
    comment?: string | undefined;
    suggestions?: string | undefined;
}, {
    organId: string;
    overallRating: number;
    contentClarity?: number | undefined;
    educationalUsefulness?: number | undefined;
    accuracyRating?: number | undefined;
    confidenceLevel?: number | undefined;
    comment?: string | undefined;
    suggestions?: string | undefined;
}>;
export declare const SubmitErrorReportSchema: z.ZodObject<{
    organId: z.ZodString;
    category: z.ZodString;
    description: z.ZodString;
    pageUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    description: string;
    organId: string;
    category: string;
    pageUrl?: string | undefined;
}, {
    description: string;
    organId: string;
    category: string;
    pageUrl?: string | undefined;
}>;
