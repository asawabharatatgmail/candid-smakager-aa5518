/**
 * Hot path 3 — AI quiz generation
 *
 * The most expensive endpoint: calls Anthropic Claude to generate a quiz.
 * Rate-limited by both the backend Anthropic key and Render's CPU.
 *
 * Run at LOW concurrency — 20 VUs is realistic given AI rate limits.
 * Watch for 429s from Anthropic; that's your upgrade trigger.
 *
 * Usage: k6 run load-tests/ai_quiz.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import { BASE_URL, DEMO_EMAIL, DEMO_PASSWORD } from './config.js';

const quizDuration  = new Trend('ai_quiz_duration', true);
const rateLimitHits = new Counter('ai_rate_limit_hits');
const aiErrors      = new Rate('ai_error_rate');

export const options = {
  // AI endpoint: low VU count, longer think-time
  stages: [
    { duration: '30s', target: 5  },
    { duration: '2m',  target: 20 },
    { duration: '2m',  target: 20 },
    { duration: '30s', target: 0  },
  ],
  thresholds: {
    http_req_failed:    ['rate<0.05'],       // <5% error — AI can be slow
    ai_quiz_duration:   ['p(95)<30000'],     // p95 < 30 s (AI generation)
    ai_error_rate:      ['rate<0.05'],
    ai_rate_limit_hits: ['count<10'],        // trigger: >10 rate-limit hits = upgrade AI plan
  },
};

const TOPICS = [
  'Photosynthesis', 'Quadratic Equations', 'Indian History',
  'Newton\'s Laws', 'Python Basics', 'World Geography',
  'Human Anatomy', 'Chemical Bonding', 'Shakespeare',
];

export function setup() {
  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  return { token: res.status === 200 ? res.json('access_token') : null };
}

export default function (data) {
  if (!data.token) { sleep(2); return; }

  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  const payload = JSON.stringify({
    topic,
    num_questions: 5,
    difficulty: 'Medium',
    quiz_type: 'MCQ',
  });

  const res = http.post(
    `${BASE_URL}/api/ai/quiz/generate`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.token}`,
      },
      timeout: '60s',
    }
  );

  quizDuration.add(res.timings.duration);

  if (res.status === 429) {
    rateLimitHits.add(1);
    console.warn(`Rate limited — topic: ${topic}`);
    sleep(5);
    return;
  }

  const ok = check(res, {
    'quiz 200':           r => r.status === 200,
    'has questions':      r => Array.isArray(r.json('questions')),
    '5 questions':        r => (r.json('questions') || []).length === 5,
  });

  aiErrors.add(!ok ? 1 : 0);

  // Long think-time: AI endpoint should not be hammered
  sleep(3 + Math.random() * 3);
}
