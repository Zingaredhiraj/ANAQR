import { apiFetch, apiClient } from './client';
import type {
  User,
  LoginDto,
  RegisterDto,
  Organ,
  OrganDetail,
  AnatomicalSystem,
  LearningModule,
  Quiz,
  QuizWithQuestions,
  QuizAttemptResult,
  Feedback,
  AnalyticsOverview,
  PaginatedResult,
  QRCode,
} from '@/types';

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (dto: LoginDto) =>
    apiFetch<User>('/auth/login', { method: 'POST', data: dto }),

  register: (dto: RegisterDto) =>
    apiFetch<User>('/auth/register', { method: 'POST', data: dto }),

  logout: () =>
    apiFetch<null>('/auth/logout', { method: 'POST' }),

  me: () =>
    apiFetch<User>('/auth/me'),
};

// ── Organs ───────────────────────────────────────────────────────────────────
export const organsApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    systemId?: string;
    status?: string;
  }) =>
    apiFetch<PaginatedResult<Organ>>('/organs', { params }),

  getBySlug: (slug: string) =>
    apiFetch<OrganDetail>(`/organs/${slug}`),

  getBySystem: (systemSlug: string) =>
    apiFetch<Organ[]>(`/organs/system/${systemSlug}`),

  create: (data: Partial<Organ>) =>
    apiFetch<Organ>('/organs', { method: 'POST', data }),

  update: (id: string, data: Partial<Organ>) =>
    apiFetch<Organ>(`/organs/${id}`, { method: 'PATCH', data }),

  updateStatus: (id: string, status: string, note?: string) =>
    apiFetch<Organ>(`/organs/${id}/status`, { method: 'PATCH', data: { status, note } }),

  delete: (id: string) =>
    apiFetch<null>(`/organs/${id}`, { method: 'DELETE' }),
};

// ── Anatomical Systems ────────────────────────────────────────────────────────
export const systemsApi = {
  list: () => apiFetch<AnatomicalSystem[]>('/anatomy-systems'),
  getBySlug: (slug: string) => apiFetch<AnatomicalSystem>(`/anatomy-systems/${slug}`),
  create: (data: Partial<AnatomicalSystem>) =>
    apiFetch<AnatomicalSystem>('/anatomy-systems', { method: 'POST', data }),
  update: (id: string, data: Partial<AnatomicalSystem>) =>
    apiFetch<AnatomicalSystem>(`/anatomy-systems/${id}`, { method: 'PATCH', data }),
};

// ── QR Codes ─────────────────────────────────────────────────────────────────
export const qrApi = {
  generate: (organId: string) =>
    apiFetch<QRCode>(`/qr/generate/${organId}`, { method: 'POST' }),

  getForOrgan: (organId: string) =>
    apiFetch<QRCode[]>(`/qr/${organId}`),

  downloadUrl: (organId: string, format: 'png' | 'svg' = 'png') =>
    `${process.env.NEXT_PUBLIC_API_URL}/qr/${organId}/download?format=${format}`,

  bulkGenerate: (organIds: string[]) =>
    apiFetch<null>('/qr/bulk-generate', { method: 'POST', data: { organIds } }),
};

// ── Scanner ───────────────────────────────────────────────────────────────────
export const scannerApi = {
  scan: (url: string, sessionId?: string) =>
    apiFetch<{ slug: string; organ: Organ }>('/scanner/scan', {
      method: 'POST',
      data: { url, sessionId },
    }),
};

// ── Learning Modules ──────────────────────────────────────────────────────────
export const modulesApi = {
  getByOrgan: (organId: string) =>
    apiFetch<LearningModule[]>(`/organs/${organId}/modules`),

  getById: (id: string) =>
    apiFetch<LearningModule>(`/learning-modules/${id}`),
};

// ── Quizzes ───────────────────────────────────────────────────────────────────
export const quizzesApi = {
  getByOrgan: (organId: string) =>
    apiFetch<Quiz[]>(`/organs/${organId}/quizzes`),

  getById: (id: string) =>
    apiFetch<QuizWithQuestions>(`/quizzes/${id}`),

  submitAttempt: (quizId: string, answers: Record<string, string>) =>
    apiFetch<QuizAttemptResult>(`/quizzes/${quizId}/attempts`, {
      method: 'POST',
      data: { answers },
    }),

  getHistory: (quizId: string) =>
    apiFetch<QuizAttemptResult[]>(`/quizzes/${quizId}/results`),
};

// ── Feedback ──────────────────────────────────────────────────────────────────
export const feedbackApi = {
  submit: (data: {
    organId: string;
    overallRating: number;
    contentClarity?: number;
    educationalUsefulness?: number;
    accuracyRating?: number;
    confidenceLevel?: number;
    comment?: string;
    suggestions?: string;
  }) => apiFetch<Feedback>('/feedback', { method: 'POST', data }),

  list: (params?: { organId?: string; page?: number; limit?: number }) =>
    apiFetch<PaginatedResult<Feedback>>('/feedback', { params }),
};

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsApi = {
  overview: () => apiFetch<AnalyticsOverview>('/admin/analytics/overview'),
  scans: (params: { from?: string; to?: string; groupBy?: string }) =>
    apiFetch<{ date: string; count: number }[]>('/admin/analytics/scans', { params }),
  organs: () => apiFetch<{ organ: string; scans: number }[]>('/admin/analytics/organs'),
  feedback: () => apiFetch<{ rating: number; count: number }[]>('/admin/analytics/feedback'),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  list: (params?: { page?: number; limit?: number; role?: string; search?: string }) =>
    apiFetch<PaginatedResult<User>>('/users', { params }),

  createFaculty: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    apiFetch<User>('/users/faculty', { method: 'POST', data }),

  createStudent: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    apiFetch<User>('/users/students', { method: 'POST', data }),

  deactivate: (id: string) =>
    apiFetch<User>(`/users/${id}`, { method: 'PATCH', data: { isActive: false } }),
};

// ── Bookmarks ─────────────────────────────────────────────────────────────────
export const bookmarksApi = {
  toggle: (organId: string) =>
    apiFetch<{ bookmarked: boolean }>(`/bookmarks/${organId}/toggle`, { method: 'POST' }),

  list: () => apiFetch<Organ[]>('/bookmarks'),
};

// ── Error Reports ─────────────────────────────────────────────────────────────
export const errorReportsApi = {
  submit: (data: {
    organId: string;
    category: string;
    description: string;
    pageUrl?: string;
  }) => apiFetch('/error-reports', { method: 'POST', data }),

  list: (params?: { status?: string; organId?: string }) =>
    apiFetch('/error-reports', { params }),
};
