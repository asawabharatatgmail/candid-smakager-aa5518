/**
 * institutionApi.ts
 * Write-through sync for institute-side core data: branches, students,
 * teachers, classes, subjects. Same pattern as externalDataApi.ts —
 * fails soft to null, never blocks the UI; localStorage stays the
 * source of truth for instant rendering, this is best-effort sync.
 *
 * KNOWN LIMITATION: institute admins create Student/Teacher accounts
 * without ever entering a password (the admin UI never collected one —
 * the frontend Student/Teacher types don't even have a password
 * field). The backend requires one to create a row, so new
 * students/teachers get their mobile number as an initial password.
 * This is a real account, not a placeholder — it just needs a proper
 * "generate + share securely" flow as a follow-up. The existing
 * Forgot Password flow lets them change it.
 */

const API_URL = import.meta.env.VITE_API_URL || 'https://eduveda-api.onrender.com';

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
    return null;
  }
}

type SyncableCategory = 'branches' | 'students' | 'teachers' | 'classes' | 'subjects' | 'leads';

const CATEGORY_PATH: Record<SyncableCategory, string> = {
  branches: '/api/branches/',
  students: '/api/students/',
  teachers: '/api/teachers/',
  classes: '/api/classes/',
  subjects: '/api/subjects/',
  leads: '/api/leads/',
};

export const isSyncableCategory = (category: string): category is SyncableCategory =>
  category in CATEGORY_PATH;

function toCreatePayload(category: SyncableCategory, record: any, instituteId: string): object {
  switch (category) {
    case 'branches':
      return { name: record.name, location: record.location, head: record.head, institute_id: instituteId };
    case 'students':
      return {
        name: record.name, email: record.email, mobile: record.mobile,
        class_id: record.classId, branch_ids: record.branchIds ?? [],
        subject_ids: record.subjectIds ?? [], institute_id: instituteId,
        password: record.mobile, // see file header — known limitation
        parent_name: record.parentName, parent_email: record.parentEmail, parent_mobile: record.parentMobile,
      };
    case 'teachers':
      return {
        name: record.name, email: record.email, mobile: record.mobile,
        subject_ids: record.subjectIds ?? [], class_ids: record.classIds ?? [], branch_ids: record.branchIds ?? [],
        institute_id: instituteId, password: record.mobile, // see file header — known limitation
      };
    case 'classes':
      return { name: record.name, institute_id: instituteId };
    case 'subjects':
      return { name: record.name, category: record.category ?? 'General', institute_id: instituteId };
    case 'leads':
      return {
        name: record.name, email: record.email, mobile: record.mobile,
        source: record.source ?? 'Website',
        status: 'New', // always New on creation; status set to 'active' by addRecord is ignored here
        institute_id: instituteId,
      };
  }
}

function toUpdatePayload(category: SyncableCategory, record: any): object {
  switch (category) {
    case 'branches':
      return { name: record.name, location: record.location, head: record.head };
    case 'students':
      return {
        name: record.name, mobile: record.mobile, class_id: record.classId,
        branch_ids: record.branchIds, subject_ids: record.subjectIds, status: record.status,
        parent_name: record.parentName, parent_email: record.parentEmail, parent_mobile: record.parentMobile,
      };
    case 'teachers':
      return { name: record.name, mobile: record.mobile, subject_ids: record.subjectIds, class_ids: record.classIds, branch_ids: record.branchIds, status: record.status };
    case 'classes':
      return { name: record.name, teacher_ids: record.teacherIds, student_ids: record.studentIds };
    case 'subjects':
      return { name: record.name, category: record.category };
    case 'leads':
      return { status: record.status, notes: record.notes, source: record.source };
  }
}

export const apiCreateInstituteRecord = (category: SyncableCategory, record: any, instituteId: string) =>
  safeFetch<any>(CATEGORY_PATH[category], { method: 'POST', body: JSON.stringify(toCreatePayload(category, record, instituteId)) });

export const apiUpdateInstituteRecord = (category: SyncableCategory, id: string, record: any) =>
  safeFetch<any>(`${CATEGORY_PATH[category]}${id}`, { method: 'PUT', body: JSON.stringify(toUpdatePayload(category, record)) });

export const apiDeleteInstituteRecord = (category: SyncableCategory, id: string) =>
  safeFetch<null>(`${CATEGORY_PATH[category]}${id}`, { method: 'DELETE' });

export const apiListInstituteRecords = (category: SyncableCategory, instituteId: string) =>
  safeFetch<any[]>(`${CATEGORY_PATH[category]}?institute_id=${instituteId}`);
