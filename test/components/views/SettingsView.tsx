import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { AiProviderConfig } from '../../types';
import { testApiKey } from '../../services/geminiDirect';

// ── Toggle Switch ─────────────────────────────────────────────────────────────
const Toggle: React.FC<{ enabled: boolean; onChange: () => void; label: string; description?: string }> = ({ enabled, onChange, label, description }) => (
  <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
    <div className="flex-1 pr-6">
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
    </div>
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none flex-shrink-0 ${enabled ? 'bg-blue-600' : 'bg-slate-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

// ── Section Card ──────────────────────────────────────────────────────────────
const Section: React.FC<{ icon: string; iconBg: string; iconColor: string; title: string; subtitle: string; children: React.ReactNode }> = ({ icon, iconBg, iconColor, title, subtitle, children }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <i className={`${icon} text-lg ${iconColor}`} />
      </div>
      <div>
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
    <div className="px-6 py-2">{children}</div>
  </div>
);

// ── AI Provider definitions ───────────────────────────────────────────────────
interface ProviderDef {
  id: string;
  logo: string;
  name: string;
  description: string;
  placeholder: string;
  docsUrl: string;
  accentBorder: string;
  accentBg: string;
  iconBg: string;
  iconText: string;
  badgeText: string;
  model: string;
  isFree?: boolean;
  keyField: keyof AiProviderConfig;
}

const PROVIDERS: ProviderDef[] = [
  {
    id: 'gemini', logo: 'G', name: 'Google Gemini', model: 'Gemini 2.0 Flash',
    description: 'Fast and powerful — great for quizzes, summaries, and study guides.',
    placeholder: 'AIza…', docsUrl: 'https://aistudio.google.com/app/apikey',
    accentBorder: 'border-blue-400', accentBg: 'bg-blue-50',
    iconBg: 'bg-blue-100', iconText: 'text-blue-700',
    badgeText: 'Free tier', isFree: true, keyField: 'geminiApiKey',
  },
  {
    id: 'openai', logo: '⊕', name: 'OpenAI / ChatGPT', model: 'GPT-4o Mini',
    description: 'Reliable and versatile — excellent for content generation and emails.',
    placeholder: 'sk-proj-…', docsUrl: 'https://platform.openai.com/api-keys',
    accentBorder: 'border-emerald-400', accentBg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100', iconText: 'text-emerald-700',
    badgeText: 'GPT-4o Mini', keyField: 'openaiApiKey',
  },
  {
    id: 'anthropic', logo: 'A', name: 'Anthropic Claude', model: 'Claude Haiku',
    description: 'Nuanced reasoning — ideal for tutoring and detailed explanations.',
    placeholder: 'sk-ant-…', docsUrl: 'https://console.anthropic.com/settings/keys',
    accentBorder: 'border-orange-400', accentBg: 'bg-orange-50',
    iconBg: 'bg-orange-100', iconText: 'text-orange-700',
    badgeText: 'Claude Haiku', keyField: 'anthropicApiKey',
  },
  {
    id: 'mistral', logo: 'M', name: 'Mistral AI', model: 'Mistral Small',
    description: 'European AI — privacy-focused and fast for multilingual content.',
    placeholder: 'Your Mistral API key…', docsUrl: 'https://console.mistral.ai/api-keys/',
    accentBorder: 'border-violet-400', accentBg: 'bg-violet-50',
    iconBg: 'bg-violet-100', iconText: 'text-violet-700',
    badgeText: 'Mistral Small', isFree: true, keyField: 'mistralApiKey',
  },
  {
    id: 'groq', logo: '⚡', name: 'Groq (Ultra Fast)', model: 'Llama 3 8B',
    description: 'Blazing fast inference using LPU chips — best for real-time features.',
    placeholder: 'gsk_…', docsUrl: 'https://console.groq.com/keys',
    accentBorder: 'border-pink-400', accentBg: 'bg-pink-50',
    iconBg: 'bg-pink-100', iconText: 'text-pink-700',
    badgeText: 'Free tier', isFree: true, keyField: 'groqApiKey',
  },
  {
    id: 'deepseek', logo: 'D', name: 'DeepSeek', model: 'DeepSeek Chat',
    description: 'Powerful open model with strong coding and reasoning capabilities.',
    placeholder: 'sk-…', docsUrl: 'https://platform.deepseek.com/api_keys',
    accentBorder: 'border-cyan-400', accentBg: 'bg-cyan-50',
    iconBg: 'bg-cyan-100', iconText: 'text-cyan-700',
    badgeText: 'Low cost', keyField: 'deepseekApiKey',
  },
  {
    id: 'perplexity', logo: 'P', name: 'Perplexity AI', model: 'Sonar Small',
    description: 'Web-connected AI — useful for up-to-date content and research.',
    placeholder: 'pplx-…', docsUrl: 'https://www.perplexity.ai/settings/api',
    accentBorder: 'border-teal-400', accentBg: 'bg-teal-50',
    iconBg: 'bg-teal-100', iconText: 'text-teal-700',
    badgeText: 'Sonar Small', keyField: 'perplexityApiKey',
  },
  {
    id: 'cohere', logo: 'C', name: 'Cohere', model: 'Command R',
    description: 'Enterprise-ready — strong at RAG, embeddings, and classification.',
    placeholder: 'Your Cohere API key…', docsUrl: 'https://dashboard.cohere.com/api-keys',
    accentBorder: 'border-amber-400', accentBg: 'bg-amber-50',
    iconBg: 'bg-amber-100', iconText: 'text-amber-700',
    badgeText: 'Free trial', isFree: true, keyField: 'cohereApiKey',
  },
];

// ── Provider Card ─────────────────────────────────────────────────────────────
const ProviderCard: React.FC<{
  def: ProviderDef;
  apiKey: string;
  isActive: boolean;
  onKeyChange: (v: string) => void;
  onSetActive: () => void;
  onTest: (id: string, key: string) => void;
  testStatus: { state: 'idle' | 'testing' | 'ok' | 'fail'; message: string };
}> = ({ def, apiKey, isActive, onKeyChange, onSetActive, onTest, testStatus }) => {
  const [showKey, setShowKey] = useState(false);
  return (
    <div className={`rounded-xl border-2 transition-all duration-200 ${isActive ? `${def.accentBorder} ${def.accentBg}` : 'border-slate-200 bg-white'}`}>
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${def.iconBg} flex items-center justify-center text-base font-bold flex-shrink-0`}>
            <span className={def.iconText}>{def.logo}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-slate-900">{def.name}</h4>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${def.iconBg} ${def.iconText}`}>{def.model}</span>
              {def.isFree && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Free tier</span>}
              {isActive && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700"><i className="ri-star-fill mr-1" />Active</span>}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{def.description}</p>
          </div>
        </div>
        {!isActive && apiKey && (
          <button onClick={onSetActive} className="text-xs font-semibold px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0">
            Set Active
          </button>
        )}
        {!isActive && !apiKey && (
          <button onClick={onSetActive} className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors flex-shrink-0">
            Use This
          </button>
        )}
      </div>
      <div className="px-4 pb-4 space-y-2">
        <div className="relative">
          <i className="ri-key-2-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={e => onKeyChange(e.target.value)}
            placeholder={def.placeholder}
            className="w-full pl-9 pr-16 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all font-mono"
          />
          <button type="button" onClick={() => setShowKey(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-blue-600 font-medium">
            {showKey ? 'Hide' : 'Show'}
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onTest(def.id, apiKey)}
            disabled={!apiKey || testStatus.state === 'testing'}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors"
          >
            {testStatus.state === 'testing' ? <><i className="ri-loader-4-line animate-spin" /> Testing…</> : <><i className="ri-wifi-line" /> Test</>}
          </button>
          {testStatus.state === 'ok' && <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg"><i className="ri-checkbox-circle-fill" /> {testStatus.message}</span>}
          {testStatus.state === 'fail' && <span className="flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded-lg"><i className="ri-close-circle-fill" /> {testStatus.message}</span>}
          <a href={def.docsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 font-medium ml-auto flex items-center gap-1">
            Get Key <i className="ri-external-link-line" />
          </a>
        </div>
      </div>
    </div>
  );
};

// ── Main Settings View ────────────────────────────────────────────────────────
const SettingsView: React.FC = () => {
  const { settings, updateSettings, currentUser, openConnectEmailModal, disconnectEmail } = useAppContext();
  const aiP = settings.aiProviders || {};

  const [localKeys, setLocalKeys] = useState<Record<string, string>>({
    gemini: aiP.geminiApiKey || '',
    openai: aiP.openaiApiKey || '',
    anthropic: aiP.anthropicApiKey || '',
    mistral: aiP.mistralApiKey || '',
    groq: aiP.groqApiKey || '',
    cohere: aiP.cohereApiKey || '',
    deepseek: aiP.deepseekApiKey || '',
    perplexity: aiP.perplexityApiKey || '',
    customApiKey: aiP.customApiKey || '',
    customApiUrl: aiP.customApiUrl || '',
    customModelName: aiP.customModelName || '',
  });

  const [testStatuses, setTestStatuses] = useState<Record<string, { state: 'idle' | 'testing' | 'ok' | 'fail'; message: string }>>(
    Object.fromEntries([...PROVIDERS.map(p => p.id), 'custom'].map(id => [id, { state: 'idle', message: '' }]))
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleToggle = (key: 'multiBranchEnabled' | 'isAiGloballyEnabled' | 'isMaintenanceMode') => {
    updateSettings({ [key]: !settings[key] });
  };

  const handleKeyChange = (field: string, value: string) => {
    setLocalKeys(prev => ({ ...prev, [field]: value }));
    const provider = PROVIDERS.find(p => p.keyField === field)?.id || field;
    setTestStatuses(prev => ({ ...prev, [provider]: { state: 'idle', message: '' } }));
  };

  const handleTest = async (providerId: string, key: string) => {
    if (!key) return;
    setTestStatuses(prev => ({ ...prev, [providerId]: { state: 'testing', message: '' } }));
    const result = await testApiKey(providerId, key, { url: localKeys.customApiUrl, model: localKeys.customModelName });
    setTestStatuses(prev => ({ ...prev, [providerId]: { state: result.ok ? 'ok' : 'fail', message: result.message } }));
  };

  const handleSetActive = (provider: string) => {
    updateSettings({
      aiProviders: {
        ...settings.aiProviders,
        activeProvider: provider as AiProviderConfig['activeProvider'],
        geminiApiKey: localKeys.gemini,
        openaiApiKey: localKeys.openai,
        anthropicApiKey: localKeys.anthropic,
        mistralApiKey: localKeys.mistral,
        groqApiKey: localKeys.groq,
        cohereApiKey: localKeys.cohere,
        deepseekApiKey: localKeys.deepseek,
        perplexityApiKey: localKeys.perplexity,
        customApiKey: localKeys.customApiKey,
        customApiUrl: localKeys.customApiUrl,
        customModelName: localKeys.customModelName,
      }
    });
  };

  const handleSaveKeys = () => {
    updateSettings({
      aiProviders: {
        ...settings.aiProviders,
        geminiApiKey: localKeys.gemini,
        openaiApiKey: localKeys.openai,
        anthropicApiKey: localKeys.anthropic,
        mistralApiKey: localKeys.mistral,
        groqApiKey: localKeys.groq,
        cohereApiKey: localKeys.cohere,
        deepseekApiKey: localKeys.deepseek,
        perplexityApiKey: localKeys.perplexity,
        customApiKey: localKeys.customApiKey,
        customApiUrl: localKeys.customApiUrl,
        customModelName: localKeys.customModelName,
      }
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const activeProvider = settings.aiProviders?.activeProvider || 'backend';

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md">
          <i className="ri-settings-3-line text-white text-xl" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500">Manage application preferences and AI integrations</p>
        </div>
      </div>

      {/* Application Settings */}
      <Section icon="ri-toggle-line" iconBg="bg-blue-100" iconColor="text-blue-600" title="Application Settings" subtitle="Control core platform features and behaviour">
        <Toggle enabled={settings.multiBranchEnabled} onChange={() => handleToggle('multiBranchEnabled')} label="Multi-Branch System" description="Allow assigning students and teachers to specific branches" />
        <Toggle enabled={settings.isAiGloballyEnabled} onChange={() => handleToggle('isAiGloballyEnabled')} label="AI Features Globally Enabled" description="When off, all AI-powered tools are hidden for all roles" />
        <Toggle enabled={settings.isMaintenanceMode} onChange={() => handleToggle('isMaintenanceMode')} label="Maintenance Mode" description="Show maintenance notice to regular users (admins can still log in)" />
      </Section>

      {/* AI Integrations */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
              <i className="ri-brain-line text-lg text-violet-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">AI Provider Integrations</h3>
              <p className="text-xs text-slate-500">Connect any AI provider — 8 options + custom API endpoint</p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-violet-100 text-violet-700 rounded-full capitalize">{activeProvider} active</span>
        </div>

        <div className="p-6 space-y-4">
          {/* Info */}
          <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
            <i className="ri-information-line text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              API keys are stored <strong>locally in your browser</strong> and never sent to our servers.
              Add your key, click <strong>"Test"</strong> to verify, then <strong>"Set Active"</strong> to use it for all AI features.
            </p>
          </div>

          {/* Backend (no-key option) */}
          <div className={`rounded-xl border-2 p-4 flex items-center justify-between gap-3 ${activeProvider === 'backend' ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <i className="ri-server-line text-slate-600 text-lg" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-slate-900">Platform Backend (Default)</h4>
                  {activeProvider === 'backend' && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700"><i className="ri-star-fill mr-1" />Active</span>}
                </div>
                <p className="text-xs text-slate-500">Built-in AI service — no API key required</p>
              </div>
            </div>
            {activeProvider !== 'backend' && (
              <button onClick={() => handleSetActive('backend')} className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex-shrink-0">
                Set Active
              </button>
            )}
          </div>

          {/* All Provider Cards */}
          {PROVIDERS.map(def => (
            <ProviderCard
              key={def.id}
              def={def}
              apiKey={localKeys[def.id] || ''}
              isActive={activeProvider === def.id}
              onKeyChange={v => handleKeyChange(def.id, v)}
              onSetActive={() => handleSetActive(def.id)}
              onTest={handleTest}
              testStatus={testStatuses[def.id] || { state: 'idle', message: '' }}
            />
          ))}

          {/* Custom API */}
          <div className={`rounded-xl border-2 transition-all duration-200 ${activeProvider === 'custom' ? 'border-slate-600 bg-slate-50' : 'border-slate-200 bg-white'}`}>
            <div className="p-4 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-base font-bold flex-shrink-0">
                  <i className="ri-code-s-slash-line text-slate-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-slate-900">Custom API Endpoint</h4>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">OpenAI-compatible</span>
                    {activeProvider === 'custom' && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700"><i className="ri-star-fill mr-1" />Active</span>}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Any API using OpenAI-format — Ollama, LM Studio, Together AI, etc.</p>
                </div>
              </div>
              <button onClick={() => handleSetActive('custom')} className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 ${activeProvider === 'custom' ? 'bg-slate-200 text-slate-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                {activeProvider === 'custom' ? 'Active' : 'Use This'}
              </button>
            </div>
            <div className="px-4 pb-4 space-y-2">
              <input type="url" value={localKeys.customApiUrl} onChange={e => handleKeyChange('customApiUrl', e.target.value)} placeholder="https://api.your-provider.com/v1/chat/completions" className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all" />
              <div className="grid grid-cols-2 gap-2">
                <input type="password" value={localKeys.customApiKey} onChange={e => handleKeyChange('customApiKey', e.target.value)} placeholder="API Key (optional)" className="px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all" />
                <input type="text" value={localKeys.customModelName} onChange={e => handleKeyChange('customModelName', e.target.value)} placeholder='Model name (e.g. "llama3")' className="px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => handleTest('custom', localKeys.customApiKey)} disabled={!localKeys.customApiUrl || testStatuses.custom?.state === 'testing'} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors">
                  {testStatuses.custom?.state === 'testing' ? <><i className="ri-loader-4-line animate-spin" /> Testing…</> : <><i className="ri-wifi-line" /> Test Connection</>}
                </button>
                {testStatuses.custom?.state === 'ok' && <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg"><i className="ri-checkbox-circle-fill" /> {testStatuses.custom.message}</span>}
                {testStatuses.custom?.state === 'fail' && <span className="flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded-lg"><i className="ri-close-circle-fill" /> {testStatuses.custom.message}</span>}
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-slate-500">Keys persist in browser localStorage across page reloads</p>
            <button onClick={handleSaveKeys} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
              {saveSuccess ? <><i className="ri-checkbox-circle-fill" /> Saved!</> : <><i className="ri-save-line" /> Save All Keys</>}
            </button>
          </div>
        </div>
      </div>

      {/* Connected Accounts */}
      <Section icon="ri-link-m" iconBg="bg-emerald-100" iconColor="text-emerald-600" title="Connected Accounts" subtitle="Link external services for scheduling and communication">
        <div className="py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
              <i className="ri-google-fill text-xl text-red-500" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800">Google Account</h4>
              {currentUser?.connectedEmail ? (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <p className="text-xs text-emerald-700 font-medium">{currentUser.connectedEmail}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-500 mt-0.5">Not connected — link for Google Meet scheduling</p>
              )}
            </div>
          </div>
          {currentUser?.connectedEmail ? (
            <button onClick={disconnectEmail} className="px-4 py-2 text-xs font-semibold bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition-colors">
              <i className="ri-logout-circle-line mr-1" />Disconnect
            </button>
          ) : (
            <button onClick={openConnectEmailModal} className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
              <i className="ri-link-m mr-1" />Connect
            </button>
          )}
        </div>
      </Section>

      {/* Account Info */}
      {currentUser && (
        <Section icon="ri-user-settings-line" iconBg="bg-slate-100" iconColor="text-slate-600" title="Your Account" subtitle="Current session information">
          <div className="py-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Name', value: currentUser.name, icon: 'ri-user-line' },
              { label: 'Email', value: currentUser.email, icon: 'ri-mail-line' },
              { label: 'Role', value: currentUser.role, icon: 'ri-shield-user-line' },
              { label: 'Mobile', value: (currentUser as any).mobile || '—', icon: 'ri-smartphone-line' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                  <i className={`${icon} text-slate-500 text-sm`} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="text-sm font-semibold text-slate-800 truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
};

export default SettingsView;
