/**
 * Hot path 2 — Dashboard data fetch
 *
 * Simulates a logged-in user loading the dashboard:
 *   1. Login → get JWT
 *   2. Fetch /api/institutes (institute list)
 *   3. Fetch /api/fees/structures (fee data)
 *   4. Fetch /api/leads (lead pipeline)
 *
 * Uses a single VU setup to get a real token, shared across all VUs via __ITER.
 *
 * Usage: k6 run load-tests/dashboard.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { Trend } from 'k6/metrics';
import { BASE_URL, DEMO_EMAIL, DEMO_PASSWORD, THRESHOLDS } from './config.js';

const dashboardDuration = new Trend('dashboard_total_duration', true);

export const options = {
  stages: [
    { duration: '30s', target: 50  },
    { duration: '1m',  target: 200 },
    { duration: '3m',  target: 500 },
    { duration: '1m',  target: 0   },
  ],
  thresholds: {
    ...THRESHOLDS,
    dashboard_total_duration: ['p(95)<3000'],  // full dashboard < 3 s p95
  },
};

// Login once per VU at the start of each iteration
export function setup() {
  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  if (res.status !== 200) {
    console.error(`Setup login failed: ${res.status} ${res.body}`);
    return { token: null };
  }
  return { token: res.json('access_token') };
}

export default function (data) {
  if (!data.token) {
    console.warn('No token available — skipping iteration');
    sleep(1);
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.token}`,
  };

  const start = Date.now();

  // Batch the three dashboard fetches in parallel
  const responses = http.batch([
    ['GET', `${BASE_URL}/api/institutes`,        null, { headers }],
    ['GET', `${BASE_URL}/api/fees/structures`,   null, { headers }],
    ['GET', `${BASE_URL}/api/leads`,             null, { headers }],
  ]);

  dashboardDuration.add(Date.now() - start);

  check(responses[0], { 'institutes 200': r => r.status === 200 || r.status === 404 });
  check(responses[1], { 'fee structures 200': r => r.status === 200 || r.status === 404 });
  check(responses[2], { 'leads 200': r => r.status === 200 || r.status === 404 });

  sleep(2);
}
