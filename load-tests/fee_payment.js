/**
 * Hot path 4 — Fee payment recording
 *
 * Simulates a Branch Admin or Class Admin recording fee payments:
 *   1. Login → get JWT
 *   2. GET /api/fees/structures → pick a fee structure id
 *   3. POST /api/fees/payment  → record a payment
 *
 * This path writes to the DB (unlike the read-only dashboard),
 * so watch for 5xx errors under load — a sign of DB connection exhaustion.
 *
 * Usage: k6 run load-tests/fee_payment.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import { BASE_URL, DEMO_EMAIL, DEMO_PASSWORD, THRESHOLDS } from './config.js';

const paymentDuration = new Trend('fee_payment_duration', true);
const dbErrors        = new Counter('fee_db_errors');
const paymentErrors   = new Rate('fee_payment_error_rate');

export const options = {
  stages: [
    { duration: '30s', target: 20  },
    { duration: '2m',  target: 100 },
    { duration: '3m',  target: 200 },
    { duration: '1m',  target: 0   },
  ],
  thresholds: {
    ...THRESHOLDS,
    fee_payment_duration:    ['p(95)<3000'],  // write path can be slower than reads
    fee_payment_error_rate:  ['rate<0.02'],
    fee_db_errors:           ['count<5'],     // trigger: >5 DB errors = Supabase connection cap hit
  },
};

export function setup() {
  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  if (res.status !== 200) {
    console.error(`Setup login failed: ${res.status} ${res.body}`);
    return { token: null, feeStructureId: null };
  }
  const token = res.json('access_token');

  // Fetch a fee structure to use in payment tests
  const feesRes = http.get(
    `${BASE_URL}/api/fees/structures`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  let feeStructureId = null;
  if (feesRes.status === 200) {
    const structures = feesRes.json();
    if (Array.isArray(structures) && structures.length > 0) {
      feeStructureId = structures[0].id;
    }
  }

  return { token, feeStructureId };
}

export default function (data) {
  if (!data.token) { sleep(1); return; }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.token}`,
  };

  // Generate a unique student reference per iteration so payments don't collide
  const studentRef = `load-test-student-${__VU}-${__ITER}`;
  const amount = 500 + Math.floor(Math.random() * 4500); // ₹500–₹5000

  const payload = JSON.stringify({
    student_id:       studentRef,
    fee_structure_id: data.feeStructureId,
    amount_paid:      amount,
    payment_mode:     'Cash',
    payment_date:     new Date().toISOString().split('T')[0],
    remarks:          'k6 load test payment',
  });

  const res = http.post(`${BASE_URL}/api/fees/payment`, payload, { headers });

  paymentDuration.add(res.timings.duration);

  // 5xx = likely DB connection issue (Supabase free tier caps at 60 connections)
  if (res.status >= 500) {
    dbErrors.add(1);
    console.error(`DB error ${res.status} on VU ${__VU} iter ${__ITER}: ${res.body}`);
  }

  const ok = check(res, {
    'payment 200 or 201': r => r.status === 200 || r.status === 201,
    'has receipt':        r => r.json('receipt_number') !== undefined,
    'amount correct':     r => r.json('amount_paid') === amount,
  });

  paymentErrors.add(!ok ? 1 : 0);

  sleep(1 + Math.random());
}
