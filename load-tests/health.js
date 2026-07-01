/**
 * Smoke test — hit /health to wake Render's free-tier service from cold start.
 * Run this first before any other k6 script.
 *
 * Usage: k6 run load-tests/health.js
 */
import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL, THRESHOLDS } from './config.js';

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    http_req_failed:   ['rate=0'],
    http_req_duration: ['p(99)<60000'], // allow up to 60 s for cold start
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/health`, { timeout: '60s' });
  check(res, {
    'status 200':   r => r.status === 200,
    'status is ok': r => r.json('status') === 'ok',
    'db connected': r => r.json('db') !== undefined,
  });
  console.log(`Health: ${res.status} — ${res.body} (${res.timings.duration.toFixed(0)} ms)`);
}
