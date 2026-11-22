"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmitErrorReportSchema = exports.SubmitFeedbackSchema = exports.CreateOrganSchema = exports.RegisterSchema = exports.LoginSchema = exports.AuditAction = exports.ModuleType = exports.QuizDifficulty = exports.IssueStatus = exports.ModelStatus = exports.ContentStatus = exports.Role = void 0;
const zod_1 = require("zod");
var Role;
(function (Role) {
    Role["SUPER_ADMIN"] = "SUPER_ADMIN";
    Role["FACULTY"] = "FACULTY";
    Role["STUDENT"] = "STUDENT";
    Role["GUEST"] = "GUEST";
})(Role || (exports.Role = Role = {}));
var ContentStatus;
(function (ContentStatus) {
    ContentStatus["DRAFT"] = "DRAFT";
    ContentStatus["PENDING_REVIEW"] = "PENDING_REVIEW";
    ContentStatus["APPROVED"] = "APPROVED";
    ContentStatus["REJECTED"] = "REJECTED";
    ContentStatus["ARCHIVED"] = "ARCHIVED";
})(ContentStatus || (exports.ContentStatus = ContentStatus = {}));
var ModelStatus;
(function (ModelStatus) {
    ModelStatus["PROCESSING"] = "PROCESSING";
    ModelStatus["READY"] = "READY";
    ModelStatus["FAILED"] = "FAILED";
    ModelStatus["ARCHIVED"] = "ARCHIVED";
})(ModelStatus || (exports.ModelStatus = ModelStatus = {}));
var IssueStatus;
(function (IssueStatus) {
    IssueStatus["OPEN"] = "OPEN";
    IssueStatus["IN_PROGRESS"] = "IN_PROGRESS";
    IssueStatus["RESOLVED"] = "RESOLVED";
    IssueStatus["REJECTED"] = "REJECTED";
})(IssueStatus || (exports.IssueStatus = IssueStatus = {}));
var QuizDifficulty;
(function (QuizDifficulty) {
    QuizDifficulty["EASY"] = "EASY";
    QuizDifficulty["MEDIUM"] = "MEDIUM";
    QuizDifficulty["HARD"] = "HARD";
})(QuizDifficulty || (exports.QuizDifficulty = QuizDifficulty = {}));
var ModuleType;
(function (ModuleType) {
    ModuleType["NORMAL_WORKING"] = "NORMAL_WORKING";
    ModuleType["WHAT_GOES_WRONG"] = "WHAT_GOES_WRONG";
    ModuleType["HOW_IT_IS_MEASURED"] = "HOW_IT_IS_MEASURED";
})(ModuleType || (exports.ModuleType = ModuleType = {}));
var AuditAction;
(function (AuditAction) {
    AuditAction["CREATE"] = "CREATE";
    AuditAction["UPDATE"] = "UPDATE";
    AuditAction["DELETE"] = "DELETE";
    AuditAction["LOGIN"] = "LOGIN";
    AuditAction["LOGOUT"] = "LOGOUT";
    AuditAction["PUBLISH"] = "PUBLISH";
    AuditAction["REJECT"] = "REJECT";
    AuditAction["APPROVE"] = "APPROVE";
    AuditAction["UPLOAD"] = "UPLOAD";
    AuditAction["DOWNLOAD"] = "DOWNLOAD";
    AuditAction["SCAN"] = "SCAN";
    AuditAction["ATTEMPT_QUIZ"] = "ATTEMPT_QUIZ";
})(AuditAction || (exports.AuditAction = AuditAction = {}));
// Zod schemas
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
});
exports.RegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    role: zod_1.z.nativeEnum(Role).optional(),
});
exports.CreateOrganSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    scientificName: zod_1.z.string().optional(),
    latinName: zod_1.z.string().optional(),
    systemId: zod_1.z.string().uuid(),
    description: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.SubmitFeedbackSchema = zod_1.z.object({
    organId: zod_1.z.string().uuid(),
    overallRating: zod_1.z.number().min(1).max(5),
    contentClarity: zod_1.z.number().min(1).max(5).optional(),
    educationalUsefulness: zod_1.z.number().min(1).max(5).optional(),
    accuracyRating: zod_1.z.number().min(1).max(5).optional(),
    confidenceLevel: zod_1.z.number().min(1).max(10).optional(),
    comment: zod_1.z.string().optional(),
    suggestions: zod_1.z.string().optional(),
});
exports.SubmitErrorReportSchema = zod_1.z.object({
    organId: zod_1.z.string().uuid(),
    category: zod_1.z.string().min(1),
    description: zod_1.z.string().min(1),
    pageUrl: zod_1.z.string().optional(),
});
