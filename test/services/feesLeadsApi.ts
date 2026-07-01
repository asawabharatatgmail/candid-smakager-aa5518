/**
 * feesLeadsApi.ts
 * Write-through sync for fee structures, discounts, lead reminders,
 * and email templates. Same fail-soft pattern as the other API services
 * — returns null on any error, never throws, never blocks the UI.
 *
 * NOTE: Fee profiles and payment recording sync are intentionally
 * deferred (Phase 2d). They require fee_profile_id and installment_id
 * to match real backend UUIDs, which only happens after profile
 * hydration is implemented. Until then, recordPayment stays
 * localStorage-only.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('eduveda_token');
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

async function safeFetch<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { ...authHeaders(), ...(options?.headers ?? {}) },
    });
    if (!res.ok) return null;
    if (res.status === 204) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// ─── Fee Structures ────────────────────────────────────────────────────────────
// No PUT endpoint in backend — only create and delete are synced.

export const apiListFeeStructures = (instituteId: string) =>
  safeFetch<any[]>(`/api/fees/structures?institute_id=${instituteId}`);

export const apiCreateFeeStructure = (record: any, instituteId: string) =>
  safeFetch<any>('/api/fees/structures', {
    method: 'POST',
    body: JSON.stringify({
      name: record.name,
      academic_year: record.academicYear,
      total_amount: record.totalAmount,
      class_id: record.classId,
      branch_id: record.branchId,
      payment_mode: record.paymentMode ?? 'Lumpsum',
      late_fee_per_day: record.lateFeePerDay ?? 0,
      institute_id: instituteId,
      installments: (record.installments ?? []).map((i: any) => ({
        name: i.name,
        percentage: i.percentage,
        dueDate: i.dueDate,
      })),
    }),
  });

export const apiDeleteFeeStructure = (id: string) =>
  safeFetch<null>(`/api/fees/structures/${id}`, { method: 'DELETE' });

// ─── Discounts ─────────────────────────────────────────────────────────────────
// No PUT endpoint in backend — only create and delete are synced.

export const apiListDiscounts = (instituteId: string) =>
  safeFetch<any[]>(`/api/fees/discounts?institute_id=${instituteId}`);

export const apiCreateDiscount = (record: any, instituteId: string) =>
  safeFetch<any>('/api/fees/discounts', {
    method: 'POST',
    body: JSON.stringify({
      name: record.name,
      type: record.type ?? 'Percentage',
      value: record.value,
      institute_id: instituteId,
    }),
  });

export const apiDeleteDiscount = (id: string) =>
  safeFetch<null>(`/api/fees/discounts/${id}`, { method: 'DELETE' });

// ─── Lead Reminders ────────────────────────────────────────────────────────────

export const apiCreateLeadReminder = (leadId: string, dateTime: string, notes?: string) =>
  safeFetch<any>('/api/leads/reminders', {
    method: 'POST',
    body: JSON.stringify({ lead_id: leadId, date_time: dateTime, notes: notes ?? '' }),
  });

// ─── Email Templates ───────────────────────────────────────────────────────────

export const apiListEmailTemplates = (instituteId: string) =>
  safeFetch<any[]>(`/api/leads/email-templates?institute_id=${instituteId}`);

export const apiCreateEmailTemplate = (template: any, instituteId: string) =>
  safeFetch<any>('/api/leads/email-templates', {
    method: 'POST',
    body: JSON.stringify({
      name: template.name,
      subject: template.subject,
      body: template.body,
      status_target: template.statusTarget ?? 'General',
      institute_id: instituteId,
    }),
  });

export const apiDeleteEmailTemplate = (id: string) =>
  safeFetch<null>(`/api/leads/email-templates/${id}`, { method: 'DELETE' });
