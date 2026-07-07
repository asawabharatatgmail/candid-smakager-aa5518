const BASE = 'https://eduveda-api.onrender.com';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  city?: string;
  subscription_status: 'trial' | 'active' | 'expired' | 'none';
  subscription_expiry?: string;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface AIResponse {
  answer: string;
}

function token(): string | null {
  return localStorage.getItem('s4l_token');
}

function authHdr(): Record<string, string> {
  const t = token();
  return t
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` }
    : { 'Content-Type': 'application/json' };
}

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

// Retry up to 3 times with 15s gaps — covers Render's 30-60s cold start.
async function safeFetch(input: string, init: RequestInit): Promise<Response> {
  const attempts = 3;
  const delayMs = 15000;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(input, init);
      return res;
    } catch {
      if (i < attempts - 1) {
        await wait(delayMs);
      } else {
        throw new Error('Server is starting up. Please wait a moment and try again.');
      }
    }
  }
  throw new Error('Server unreachable');
}

async function post<T>(path: string, body: object, auth = false): Promise<T> {
  const headers = auth ? authHdr() : { 'Content-Type': 'application/json' };
  const res = await safeFetch(`${BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any).detail || 'Request failed');
  return data as T;
}

async function get<T>(path: string): Promise<T> {
  const res = await safeFetch(`${BASE}${path}`, { headers: authHdr() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any).detail || 'Request failed');
  return data as T;
}

export const api = {
  ping: () => fetch(`${BASE}/health`).catch(() => {}),

  register: (name: string, email: string, password: string, mobile: string, grade = 'General') =>
    post<AuthResponse>('/api/external/student/register', { name, email, password, mobile: mobile || undefined, grade }),

  login: (email: string, password: string) =>
    post<AuthResponse>('/api/external/student/login', { email, password }),

  me: () => get<User>('/api/external/me'),

  aiHelp: (question: string, subject?: string) =>
    post<AIResponse>('/api/external/student/ai-help', { question, subject }, true),
};

export function saveSession(resp: AuthResponse) {
  localStorage.setItem('s4l_token', resp.access_token);
  localStorage.setItem('s4l_user', JSON.stringify(resp.user));
}

export function clearSession() {
  localStorage.removeItem('s4l_token');
  localStorage.removeItem('s4l_user');
}

export function getCachedUser(): User | null {
  const raw = localStorage.getItem('s4l_user');
  return raw ? JSON.parse(raw) : null;
}

export function trialDaysLeft(user: User): number {
  if (user.subscription_status !== 'trial' || !user.subscription_expiry) return 0;
  const diff = new Date(user.subscription_expiry).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}
