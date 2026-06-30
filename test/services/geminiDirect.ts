/**
 * geminiDirect.ts — Direct AI API calls using user-supplied keys
 * Supports: Gemini, OpenAI, Anthropic, Mistral, Groq, Cohere, DeepSeek, Perplexity, Custom
 */
import { GoogleGenAI } from '@google/genai';

function getSettings() {
  try {
    const stored = localStorage.getItem('settings');
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
}

const getKey = (field: string): string => {
  const s = getSettings();
  return s?.aiProviders?.[field] || '';
};

export function getActiveProvider(): string {
  return getSettings()?.aiProviders?.activeProvider || 'backend';
}

export function hasDirectAiKey(): boolean {
  const p = getActiveProvider();
  const keyMap: Record<string, string> = {
    gemini: 'geminiApiKey', openai: 'openaiApiKey', anthropic: 'anthropicApiKey',
    mistral: 'mistralApiKey', groq: 'groqApiKey', cohere: 'cohereApiKey',
    deepseek: 'deepseekApiKey', perplexity: 'perplexityApiKey', custom: 'customApiKey',
  };
  if (p === 'backend') return false;
  return !!getKey(keyMap[p] || '');
}

// ── OpenAI-compatible fetch (used by many providers) ──────────────────────────
async function openAiCompatible(
  endpoint: string,
  apiKey: string,
  model: string,
  prompt: string,
  extraHeaders: Record<string, string> = {}
): Promise<string> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'You are a helpful educational AI assistant.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 2000,
    }),
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || data.text || '';
}

export async function directGenerate(prompt: string): Promise<string> {
  const p = getActiveProvider();
  const s = getSettings()?.aiProviders || {};

  switch (p) {
    case 'gemini': {
      const key = s.geminiApiKey;
      if (!key) throw new Error('No Gemini API key');
      const ai = new GoogleGenAI({ apiKey: key });
      const r = await ai.models.generateContent({ model: 'gemini-2.0-flash', contents: prompt });
      return r.text || '';
    }
    case 'openai':
      return openAiCompatible('https://api.openai.com/v1/chat/completions', s.openaiApiKey, 'gpt-4o-mini', prompt);
    case 'anthropic': {
      const key = s.anthropicApiKey;
      if (!key) throw new Error('No Anthropic key');
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({ model: 'claude-haiku-20240307', max_tokens: 2000, messages: [{ role: 'user', content: prompt }] }),
      });
      if (!res.ok) throw new Error(`Anthropic error ${res.status}`);
      const d = await res.json();
      return d.content?.[0]?.text || '';
    }
    case 'mistral':
      return openAiCompatible('https://api.mistral.ai/v1/chat/completions', s.mistralApiKey, 'mistral-small-latest', prompt);
    case 'groq':
      return openAiCompatible('https://api.groq.com/openai/v1/chat/completions', s.groqApiKey, 'llama3-8b-8192', prompt);
    case 'cohere': {
      const key = s.cohereApiKey;
      if (!key) throw new Error('No Cohere key');
      const res = await fetch('https://api.cohere.com/v1/generate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'command-r', prompt, max_tokens: 1500 }),
      });
      if (!res.ok) throw new Error(`Cohere error ${res.status}`);
      const d = await res.json();
      return d.generations?.[0]?.text || '';
    }
    case 'deepseek':
      return openAiCompatible('https://api.deepseek.com/v1/chat/completions', s.deepseekApiKey, 'deepseek-chat', prompt);
    case 'perplexity':
      return openAiCompatible('https://api.perplexity.ai/chat/completions', s.perplexityApiKey, 'llama-3.1-sonar-small-128k-chat', prompt);
    case 'custom': {
      const url = s.customApiUrl || '';
      if (!url) throw new Error('No custom API URL configured');
      return openAiCompatible(url, s.customApiKey, s.customModelName || 'default', prompt);
    }
    default: {
      // Auto-fallback: use Gemini if key exists
      const gKey = s.geminiApiKey;
      if (gKey) {
        const ai = new GoogleGenAI({ apiKey: gKey });
        const r = await ai.models.generateContent({ model: 'gemini-2.0-flash', contents: prompt });
        return r.text || '';
      }
      throw new Error('No AI provider configured');
    }
  }
}

// ── Test connection for any provider ─────────────────────────────────────────
export async function testApiKey(
  provider: string,
  key: string,
  extra?: { url?: string; model?: string }
): Promise<{ ok: boolean; message: string }> {
  try {
    switch (provider) {
      case 'gemini': {
        const ai = new GoogleGenAI({ apiKey: key });
        await ai.models.generateContent({ model: 'gemini-2.0-flash', contents: 'Say ok.' });
        return { ok: true, message: 'Gemini connected ✓' };
      }
      case 'openai': {
        const r = await fetch('https://api.openai.com/v1/models', { headers: { Authorization: `Bearer ${key}` } });
        if (!r.ok) throw new Error('Invalid key');
        return { ok: true, message: 'OpenAI connected ✓' };
      }
      case 'anthropic': {
        const r = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
          body: JSON.stringify({ model: 'claude-haiku-20240307', max_tokens: 10, messages: [{ role: 'user', content: 'Hi' }] }),
        });
        if (!r.ok) throw new Error('Invalid key');
        return { ok: true, message: 'Claude connected ✓' };
      }
      case 'mistral': {
        const r = await fetch('https://api.mistral.ai/v1/models', { headers: { Authorization: `Bearer ${key}` } });
        if (!r.ok) throw new Error('Invalid key');
        return { ok: true, message: 'Mistral connected ✓' };
      }
      case 'groq': {
        const r = await fetch('https://api.groq.com/openai/v1/models', { headers: { Authorization: `Bearer ${key}` } });
        if (!r.ok) throw new Error('Invalid key');
        return { ok: true, message: 'Groq connected ✓' };
      }
      case 'cohere': {
        const r = await fetch('https://api.cohere.com/v1/check-api-key', {
          method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        });
        if (!r.ok) throw new Error('Invalid key');
        return { ok: true, message: 'Cohere connected ✓' };
      }
      case 'deepseek': {
        const r = await fetch('https://api.deepseek.com/v1/models', { headers: { Authorization: `Bearer ${key}` } });
        if (!r.ok) throw new Error('Invalid key');
        return { ok: true, message: 'DeepSeek connected ✓' };
      }
      case 'perplexity': {
        const r = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'llama-3.1-sonar-small-128k-chat', messages: [{ role: 'user', content: 'Hi' }], max_tokens: 5 }),
        });
        if (!r.ok) throw new Error('Invalid key');
        return { ok: true, message: 'Perplexity connected ✓' };
      }
      case 'custom': {
        if (!extra?.url) return { ok: false, message: 'No API URL provided' };
        const r = await fetch(extra.url, {
          method: 'POST',
          headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: extra?.model || 'default', messages: [{ role: 'user', content: 'Hi' }], max_tokens: 5 }),
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return { ok: true, message: 'Custom API connected ✓' };
      }
      default:
        return { ok: false, message: 'Unknown provider' };
    }
  } catch (e: any) {
    return { ok: false, message: e.message || 'Connection failed' };
  }
}
