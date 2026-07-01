/**
 * Hot path 1 — Login
 *
 * Ramps to 500 VUs over 2 min, holds for 3 min, ramps down.
 * Each VU logs in once and verifies the token is present.
 *
 * Usage:
 *   k6 run load-tests/login.js
 *   k6 run -e BASE_URL=http://localhost:8000 load-tests/login.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter } from 'k6/metrics';
import { BASE_URL, DEMO_EMAIL, DEMO_PASSWORD, THRESHOLDS } from './config.js';

const loginDuration = new Trend('login_duration', true);
const loginErrors   = new Counter('login_errors');

export const options = {
  stages: [
    { duration: '30s', target: 50  },   // warm up
    { duration: '1m',  target: 200 },   // ramp
    { duration: '2m',  target: 500 },   // peak — target load
    { duration: '1m',  target: 200 },   // ramp down
    { duration: '30s', target: 0   },   // cool down
  ],
  thresholds: {
    ...THRESHOLDS,
    login_duration: ['p(95)<1500'],     // login-specific: p95 < 1.5 s
  },
};

export default function () {
  const payload = JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
  const headers = { 'Content-Type': 'application/json' };

  const res = http.post(`${BASE_URL}/api/auth/login`, payload, { headers });

  loginDuration.add(res.timings.duration);

  const ok = check(res, {
    'login 200':          r => r.status === 200,
    'has access_token':   r => r.json('access_token') !== undefined,
    'token_type bearer':  r => r.json('token_type') === 'bearer',
    'no password_hash':   r => r.json('user.password_hash') === undefined,
  });

  if (!ok) loginErrors.add(1);

  sleep(1);
}
