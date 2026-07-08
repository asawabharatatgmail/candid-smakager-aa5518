/**
 * apiClient.ts
 * Tries the user's configured AI provider (Gemini / OpenAI) first.
 * Falls back to the Python FastAPI backend when no key is set.
 * All function signatures stay the same so no components need to change.
 */
import { Quiz, UserRole, QuizType, FlashcardSet, Lead, LeadStatus, AcademicClass, Teacher, Subject, AiSchedulerRule, ScheduleEvent, GameLevel } from '../types';
import { GoogleGenAI } from '@google/genai';

// ── Helpers ───────────────────────────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL || 'https://eduveda-api.onrender.com';

function getSettings() {
  try {
    const s = localStorage.getItem('settings');
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

function getGeminiKey(): string {
  const s = getSettings();
  return s?.aiProviders?.geminiApiKey || (process.env.GEMINI_API_KEY as string) || '';
}

function getOpenAIKey(): string {
  const s = getSettings();
  return s?.aiProviders?.openaiApiKey || '';
}

function getActiveProvider(): string {
  const s = getSettings();
  return s?.aiProviders?.activeProvider || 'backend';
}

function canUseDirect(): boolean {
  const p = getActiveProvider();
  if (p === 'backend') return !!getGeminiKey(); // auto-use if key exists
  // Any non-backend provider with a key configured
  const s = getSettings()?.aiProviders || {};
  const keyMap: Record<string, string> = {
    gemini: s.geminiApiKey, openai: s.openaiApiKey, anthropic: s.anthropicApiKey,
    mistral: s.mistralApiKey, groq: s.groqApiKey, cohere: s.cohereApiKey,
    deepseek: s.deepseekApiKey, perplexity: s.perplexityApiKey, custom: s.customApiKey,
  };
  return !!(keyMap[p]);
}

// ── Direct AI call — delegates to geminiDirect which handles all providers ───
import { directGenerate as _directGenerate } from './geminiDirect';

async function aiGenerate(prompt: string): Promise<string> {
  return _directGenerate(prompt + '\n\nIMPORTANT: Respond with valid JSON only.');
}

async function aiGenerateText(prompt: string): Promise<string> {
  const provider = getActiveProvider();

  if (provider === 'openai' && getOpenAIKey()) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getOpenAIKey()}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
      }),
    });
    if (!res.ok) throw new Error(`OpenAI error ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  const key = getGeminiKey();
  if (!key) throw new Error('No AI key configured');
  const ai = new GoogleGenAI({ apiKey: key });
  const response = await ai.models.generateContent({ model: 'gemini-2.0-flash', contents: prompt });
  return response.text || '';
}

// ── Backend HTTP helpers ──────────────────────────────────────────────────────

function getAuthHeader(): HeadersInit {
  const token = localStorage.getItem('eduveda_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function post<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `API error ${res.status}`);
  }
  return res.json();
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { headers: { ...getAuthHeader() } });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

async function* streamPost(path: string, body: object): AsyncGenerator<{ text: string }> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(body),
  });
  if (!res.ok || !res.body) throw new Error(`Stream error ${res.status}`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const text = line.slice(6);
        if (text && text !== '[DONE]') yield { text };
      }
    }
  }
}

// ── Quiz ──────────────────────────────────────────────────────────────────────

export const generateMcqQuiz = async (
  topic: string, numQuestions: number, difficulty: string, quizType: QuizType
): Promise<Pick<Quiz, 'quizTitle' | 'questions' | 'topic'> | null> => {
  if (canUseDirect()) {
    const prompt = `Create a ${difficulty} difficulty ${quizType} quiz about "${topic}" with exactly ${numQuestions} questions.
Return ONLY a valid JSON object with this exact structure:
{
  "quizTitle": "string",
  "questions": [
    {
      "questionText": "string",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "string"
    }
  ]
}`;
    const raw = await aiGenerate(prompt);
    const data = JSON.parse(raw);
    return { quizTitle: data.quizTitle, questions: data.questions, topic };
  }
  try {
    const data = await post<any>('/api/ai/quiz/generate', { topic, num_questions: numQuestions, difficulty, quiz_type: quizType });
    return { quizTitle: data.quizTitle || data.quiz_title, questions: data.questions, topic };
  } catch { throw new Error('Failed to generate quiz. Please configure an AI key in Settings.'); }
};

// ── Flashcards ────────────────────────────────────────────────────────────────

export const generateFlashcards = async (
  topic: string, numFlashcards: number
): Promise<Pick<FlashcardSet, 'title' | 'flashcards' | 'topic'> | null> => {
  if (canUseDirect()) {
    const prompt = `Create ${numFlashcards} educational flashcards about "${topic}".
Return ONLY a valid JSON object:
{
  "title": "string",
  "flashcards": [{"front": "Question or term", "back": "Answer or definition"}]
}`;
    const raw = await aiGenerate(prompt);
    const data = JSON.parse(raw);
    return { title: data.title, flashcards: data.flashcards, topic };
  }
  try {
    const data = await post<any>('/api/ai/flashcards/generate', { topic, num_flashcards: numFlashcards });
    return { title: data.title, flashcards: data.flashcards, topic };
  } catch { throw new Error('Failed to generate flashcards. Please configure an AI key in Settings.'); }
};

// ── Study Material ────────────────────────────────────────────────────────────

export const generateStudyMaterial = async (
  topic: string, gradeLevel: string, difficulty: string
): Promise<{ title: string; content: string } | null> => {
  if (canUseDirect()) {
    const prompt = `Create a comprehensive study guide for "${topic}" suitable for ${gradeLevel} students at ${difficulty} level.
Return ONLY a valid JSON object:
{
  "title": "string",
  "content": "Detailed markdown-formatted study guide content with sections, bullet points, and examples"
}`;
    const raw = await aiGenerate(prompt);
    return JSON.parse(raw);
  }
  try {
    return await post<{ title: string; content: string }>('/api/ai/study-material/generate', { topic, grade_level: gradeLevel, difficulty });
  } catch { throw new Error('Failed to generate study material. Please configure an AI key in Settings.'); }
};

// ── Schedule ──────────────────────────────────────────────────────────────────

export const generateSchedule = async (
  classes: AcademicClass[], teachers: Teacher[], subjects: Subject[], rules: AiSchedulerRule[]
): Promise<Omit<ScheduleEvent, 'id'>[] | null> => {
  if (canUseDirect()) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const times = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00'];
    const events: Omit<ScheduleEvent, 'id'>[] = [];
    rules.forEach(rule => {
      const subject = subjects.find(s => s.id === rule.subjectId);
      const teacher = teachers.find(t => t.subjectIds?.includes(rule.subjectId));
      if (!subject || !teacher) return;
      classes.forEach(cls => {
        for (let i = 0; i < Math.min(rule.lecturesPerWeek, 5); i++) {
          events.push({
            classId: cls.id, subjectId: subject.id, teacherId: teacher.id,
            day: days[i % days.length],
            startTime: times[i % times.length],
            endTime: `${String(parseInt(times[i % times.length]) + 1).padStart(2, '0')}:00`,
            instituteId: cls.instituteId,
          });
        }
      });
    });
    return events;
  }
  try {
    const data = await post<any[]>('/api/ai/schedule/generate', {
      institute_id: classes[0]?.instituteId,
      rules: rules.map(r => ({ subjectId: r.subjectId, lecturesPerWeek: r.lecturesPerWeek })),
    });
    return data;
  } catch { throw new Error('Failed to generate schedule.'); }
};

// ── Lead Summary ──────────────────────────────────────────────────────────────

export const generateLeadSummary = async (leads: Lead[]): Promise<any | null> => {
  if (!leads.length) return null;
  if (canUseDirect()) {
    const prompt = `Analyze these ${leads.length} student leads and provide a brief summary.
Leads by status: ${JSON.stringify(leads.reduce((acc: any, l) => { acc[l.status] = (acc[l.status] || 0) + 1; return acc; }, {}))}
Sources: ${JSON.stringify(leads.reduce((acc: any, l) => { acc[l.source] = (acc[l.source] || 0) + 1; return acc; }, {}))}
Return JSON: {"summary": "2-3 sentence analysis", "topSource": "string", "conversionTip": "string"}`;
    const raw = await aiGenerate(prompt);
    return JSON.parse(raw);
  }
  try {
    return await get<any>(`/api/ai/leads/summary?institute_id=${(leads[0]?.instituteId) ?? ''}`);
  } catch { throw new Error('Could not generate lead analysis.'); }
};

// ── Lead Email ────────────────────────────────────────────────────────────────

export const generateEmailForLead = async (
  lead: Lead, purpose: string
): Promise<{ subject: string; body: string } | null> => {
  if (canUseDirect()) {
    const prompt = `Write a professional email to ${lead.name} (source: ${lead.source}) for purpose: "${purpose}".
Return ONLY JSON: {"subject": "email subject line", "body": "full email body text"}`;
    const raw = await aiGenerate(prompt);
    return JSON.parse(raw);
  }
  try {
    return await post<{ subject: string; body: string }>('/api/ai/leads/email', { lead_id: lead.id, purpose });
  } catch { throw new Error('Failed to generate email.'); }
};

// ── Lead Form Script ──────────────────────────────────────────────────────────

export const generateLeadFormScript = async (
  fields: string[]
): Promise<{ 'Code.gs': string; 'Index.html': string } | null> => {
  if (canUseDirect()) {
    const codeGs = `function doGet() { return HtmlService.createHtmlOutputFromFile('Index'); }
function submitForm(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.appendRow([new Date(), ${fields.map(f => `data['${f}']`).join(', ')}]);
  return {success: true};
}`;
    const indexHtml = `<!DOCTYPE html><html><body>
<form><h2>Lead Form</h2>
${fields.map(f => `<label>${f}:<br><input name="${f}" required></label><br><br>`).join('')}
<button type="submit">Submit</button></form></body></html>`;
    return { 'Code.gs': codeGs, 'Index.html': indexHtml };
  }
  try {
    return await post('/api/ai/leads/form-script', { fields });
  } catch { throw new Error('AI failed to generate lead form script.'); }
};

// ── Game Levels ───────────────────────────────────────────────────────────────

export const generateGameLevels = async (
  topic: string, numLevels: number, questionsPerLevel: number
): Promise<GameLevel[] | null> => {
  if (canUseDirect()) {
    const prompt = `Create ${numLevels} progressive game levels about "${topic}", each with ${questionsPerLevel} quiz questions.
Return ONLY JSON array:
[{
  "levelNumber": 1,
  "title": "Level title",
  "description": "brief description",
  "questions": [{"questionText": "Q?", "options": ["A","B","C","D"], "correctAnswer": "A", "explanation": "why"}]
}]`;
    const raw = await aiGenerate(prompt);
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : arr.levels || [];
  }
  try {
    return await post<GameLevel[]>('/api/ai/game/generate', { topic, num_levels: numLevels, questions_per_level: questionsPerLevel });
  } catch { throw new Error('Failed to generate game.'); }
};

// ── Quote of the Day ──────────────────────────────────────────────────────────

export const generateQuote = async (): Promise<string> => {
  if (canUseDirect()) {
    try {
      const text = await aiGenerateText('Give me one inspiring educational quote with attribution. Just the quote and author, nothing else. Format: "Quote text" — Author Name');
      return text.trim().replace(/^["']|["']$/g, '');
    } catch {}
  }
  try {
    const data = await get<{ quote: string }>('/api/ai/quote');
    return data.quote;
  } catch {
    const quotes = [
      'Education is the most powerful weapon you can use to change the world. — Nelson Mandela',
      'The beautiful thing about learning is that no one can take it away from you. — B.B. King',
      'In learning you will teach, and in teaching you will learn. — Phil Collins',
      'The roots of education are bitter, but the fruit is sweet. — Aristotle',
      'Live as if you were to die tomorrow. Learn as if you were to live forever. — Mahatma Gandhi',
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
};

// ── Personalized Insight ──────────────────────────────────────────────────────

export const generatePersonalizedInsight = async (role: UserRole): Promise<string> => {
  if (canUseDirect()) {
    try {
      return await aiGenerateText(`Give a short (1-2 sentence) motivational tip for a ${role} in an educational institution. Be specific and actionable.`);
    } catch {}
  }
  try {
    const data = await post<{ insight: string }>('/api/ai/insight', { role });
    return data.insight;
  } catch {
    const insights: Record<string, string> = {
      [UserRole.ClassAdmin]: 'Review attendance trends this week — catching issues early improves outcomes by 30%.',
      [UserRole.BranchAdmin]: 'Check branch performance metrics and recognise your top-performing teacher today.',
      [UserRole.Teacher]: 'Try a quick 5-question exit ticket today to gauge student comprehension in real time.',
      [UserRole.Student]: 'Break your study session into 25-minute focus blocks for maximum retention.',
      [UserRole.Parent]: 'A 10-minute daily conversation about school boosts your child\'s engagement significantly.',
    };
    return insights[role] || 'Focus on collaboration to enhance the learning experience for everyone.';
  }
};

// ── AI Help Chatbot (streaming) ───────────────────────────────────────────────

export const getAiHelpResponse = async function*(query: string, role: UserRole): AsyncGenerator<{ text: string }> {
  if (canUseDirect()) {
    try {
      const key = getGeminiKey();
      const provider = getActiveProvider();
      if (provider === 'openai' && getOpenAIKey()) {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getOpenAIKey()}` },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: `You are a helpful AI assistant for a ${role} in an educational platform.` },
              { role: 'user', content: query }
            ],
            stream: true,
          }),
        });
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buf = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split('\n');
          buf = lines.pop() ?? '';
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const chunk = JSON.parse(line.slice(6));
                const text = chunk.choices?.[0]?.delta?.content;
                if (text) yield { text };
              } catch {}
            }
          }
        }
        return;
      }
      // Gemini non-streaming fallback
      if (key) {
        const ai = new GoogleGenAI({ apiKey: key });
        const res = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: `You are a helpful assistant for a ${role} in an educational platform. Answer this: ${query}`,
        });
        yield { text: res.text || 'I could not generate a response.' };
        return;
      }
    } catch (e: any) {
      yield { text: `AI error: ${e.message}` };
      return;
    }
  }
  yield* streamPost('/api/ai/help/stream', { query, role });
};

// ── AI Tutor "Veda" (streaming) ───────────────────────────────────────────────

export const getAiTutorResponse = async function*(query: string, subject: string): AsyncGenerator<{ text: string }> {
  if (canUseDirect()) {
    try {
      const key = getGeminiKey();
      if (key) {
        const ai = new GoogleGenAI({ apiKey: key });
        const res = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: `You are Veda, an expert ${subject} tutor. Explain clearly with examples: ${query}`,
        });
        yield { text: res.text || '' };
        return;
      }
    } catch (e: any) {
      yield { text: `Tutor error: ${e.message}` };
      return;
    }
  }
  yield* streamPost('/api/ai/tutor/stream', { query, subject });
};

// ── Note Tools ────────────────────────────────────────────────────────────────

export const summarizeNote = async (noteContent: string): Promise<string> => {
  if (canUseDirect()) {
    return await aiGenerateText(`Summarize this note in 3-5 bullet points:\n\n${noteContent}`);
  }
  try {
    const data = await post<{ summary: string }>('/api/ai/notes/summarize', { note_content: noteContent });
    return data.summary;
  } catch { throw new Error('Failed to summarize note.'); }
};

export const generateQuestionsFromNote = async (noteContent: string): Promise<string> => {
  if (canUseDirect()) {
    return await aiGenerateText(`Generate 5 study questions based on this note:\n\n${noteContent}`);
  }
  try {
    const data = await post<{ questions: string }>('/api/ai/notes/questions', { note_content: noteContent });
    return data.questions;
  } catch { throw new Error('Failed to generate questions.'); }
};

export const explainText = async (text: string): Promise<string> => {
  if (canUseDirect()) {
    return await aiGenerateText(`Explain this in simple, clear language suitable for a student:\n\n${text}`);
  }
  try {
    const data = await post<{ explanation: string }>('/api/ai/explain', { text });
    return data.explanation;
  } catch { throw new Error('Failed to explain text.'); }
};

// ── Video Finder ──────────────────────────────────────────────────────────────

// ── Auth: Forgot / Reset Password ────────────────────────────────────────────

export const forgotPassword = async (email: string): Promise<void> => {
  await post('/api/auth/forgot-password', { email });
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  await post('/api/auth/reset-password', { token, new_password: newPassword });
};

export const findEducationalVideos = async (
  topic: string, gradeLevel: string
): Promise<{ title: string; url: string }[] | null> => {
  if (canUseDirect()) {
    // Return curated YouTube search URLs (no API key needed)
    const searchQuery = encodeURIComponent(`${topic} ${gradeLevel} educational tutorial`);
    return [
      { title: `${topic} — Full Lesson (YouTube)`, url: `https://www.youtube.com/results?search_query=${searchQuery}` },
      { title: `Learn ${topic} for ${gradeLevel}`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' lesson')}` },
      { title: `${topic} Explained Simply`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent('easy ' + topic)}` },
    ];
  }
  try {
    return await post('/api/ai/videos/find', { topic, grade_level: gradeLevel });
  } catch { throw new Error('Failed to find videos.'); }
};
