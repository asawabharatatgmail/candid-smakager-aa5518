/**
 * Shared config for all EduVeda load tests.
 *
 * Override BASE_URL for local testing:
 *   k6 run -e BASE_URL=http://localhost:8000 login.js
 */
export const BASE_URL = __ENV.BASE_URL || 'https://eduveda-api.onrender.com';

// Demo credentials — institute must exist in the DB.
// On Render free tier the first request after idle takes ~30s (cold start).
// Run the health check first: k6 run health.js
export const DEMO_EMAIL    = __ENV.DEMO_EMAIL    || 'admin@demo.com';
export const DEMO_PASSWORD = __ENV.DEMO_PASSWORD || 'demo123';

// Scale targets from Phase 6 plan
export const TARGETS = {
  VUS:       500,   // virtual concurrent users
  STUDENTS:  5000,
  INSTITUTES: 50,
};

// Thresholds used across all scripts
export const THRESHOLDS = {
  http_req_failed:   ['rate<0.02'],          // <2% error rate
  http_req_duration: ['p(95)<2000'],         // p95 < 2 s
};
