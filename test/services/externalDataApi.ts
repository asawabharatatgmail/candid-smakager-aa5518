/**
 * externalDataApi.ts
 * Thin fetch wrapper for /api/external-data/* — children, personal AI
 * config, saved AI content, activity sessions, progress reports, and
 * student plans/subscriptions.
 *
 * Pattern: write-through, not fail-closed. Unlike auth (where an
 * unreachable backend must fail the login), these are read/write data
 * calls — localStorage remains the offline cache per the market-
 * readiness plan, so every function here returns null/false on
 * failure instead of throwing, and callers keep using their local
 * state as the fallback.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('eduveda_token');
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

async function safeFetch<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, { ...options, headers: { ...authHeaders(), ...(options?.headers ?? {}) } });
    if (!res.ok) return null;
    if (res.status === 204) return null;
    return (await res.json()) as T;
  } catch {
    return null; // backend unreachable — caller falls back to local cache
  }
}

// ── Children ───────────────────────────────────────────────────────────────
export const apiListChildren = () => safeFetch<any[]>('/api/external-data/children');
export const apiCreateChild = (data: object) => safeFetch<any>('/api/external-data/children', { method: 'POST', body: JSON.stringify(data) });
export const apiUpdateChild = (id: string, data: object) => safeFetch<any>(`/api/external-data/children/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const apiDeleteChild = (id: string) => safeFetch<null>(`/api/external-data/children/${id}`, { method: 'DELETE' });

// ── AI Config ──────────────────────────────────────────────────────────────
export const apiGetAiConfig = () => safeFetch<any>('/api/external-data/ai-config');
export const apiUpsertAiConfig = (data: object) => safeFetch<any>('/api/external-data/ai-config', { method: 'PUT', body: JSON.stringify(data) });

// ── Saved AI Content ───────────────────────────────────────────────────────
export const apiListAiContent = () => safeFetch<any[]>('/api/external-data/ai-content');
export const apiCreateAiContent = (data: object) => safeFetch<any>('/api/external-data/ai-content', { method: 'POST', body: JSON.stringify(data) });
export const apiDeleteAiContent = (id: string) => safeFetch<null>(`/api/external-data/ai-content/${id}`, { method: 'DELETE' });

// ── Activity ───────────────────────────────────────────────────────────────
export const apiListActivity = () => safeFetch<any[]>('/api/external-data/activity');
export const apiLogActivity = (data: object) => safeFetch<any>('/api/external-data/activity', { method: 'POST', body: JSON.stringify(data) });

// ── Progress Reports ───────────────────────────────────────────────────────
export const apiListProgressReports = () => safeFetch<any[]>('/api/external-data/progress-reports');
export const apiCreateProgressReport = (data: object) => safeFetch<any>('/api/external-data/progress-reports', { method: 'POST', body: JSON.stringify(data) });

// ── Student Plans / Subscriptions ─────────────────────────────────────────
export const apiListStudentPlans = () => safeFetch<any[]>('/api/external-data/student-plans');
export const apiGetMyStudentSubscription = () => safeFetch<any>('/api/external-data/student-subscriptions/me');
export const apiCreateStudentSubscription = (data: object) => safeFetch<any>('/api/external-data/student-subscriptions', { method: 'POST', body: JSON.stringify(data) });
