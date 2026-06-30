import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { PersonalAiConfig, AiProvider } from '../../types';

const PROVIDERS: { id: AiProvider; label: string; logo: string; keyLabel: string; placeholder: string; docsUrl: string }[] = [
  { id: 'gemini',    label: 'Google Gemini',  logo: '🔵', keyLabel: 'Gemini API Key',    placeholder: 'AIzaSy...', docsUrl: 'https://aistudio.google.com/app/apikey' },
  { id: 'openai',   label: 'OpenAI',          logo: '🟢', keyLabel: 'OpenAI API Key',    placeholder: 'sk-...', docsUrl: 'https://platform.openai.com/api-keys' },
  { id: 'anthropic',label: 'Claude (Anthropic)', logo: '🟠', keyLabel: 'Anthropic API Key', placeholder: 'sk-ant-...', docsUrl: 'https://console.anthropic.com/' },
  { id: 'groq',     label: 'Groq',            logo: '⚡', keyLabel: 'Groq API Key',      placeholder: 'gsk_...', docsUrl: 'https://console.groq.com/keys' },
  { id: 'custom',   label: 'Custom / OpenAI-compatible', logo: '⚙️', keyLabel: 'API Key', placeholder: 'your-api-key', docsUrl: '#' },
];

const PersonalAiConfigView: React.FC = () => {
  const { personalAiConfigs, setPersonalAiConfigs, currentUser } = useAppContext();
  const myConfig = personalAiConfigs.find(c => c.ownerId === currentUser?.id);

  const [selectedProvider, setSelectedProvider] = useState<AiProvider>(myConfig?.activeProvider ?? 'gemini');
  const [keys, setKeys] = useState<Partial<Record<string, string>>>({
    gemini:    myConfig?.geminiApiKey ?? '',
    openai:    myConfig?.openaiApiKey ?? '',
    anthropic: myConfig?.anthropicApiKey ?? '',
    groq:      myConfig?.groqApiKey ?? '',
    custom:    myConfig?.customApiKey ?? '',
  });
  const [customUrl, setCustomUrl]   = useState(myConfig?.customApiUrl ?? '');
  const [customModel, setCustomModel] = useState(myConfig?.customModelName ?? '');
  const [showKey, setShowKey]       = useState(false);
  const [saved, setSaved]           = useState(false);

  const handleSave = () => {
    const now = new Date().toISOString().split('T')[0];
    const updated: PersonalAiConfig = {
      id:             myConfig?.id ?? `pai_${Date.now()}`,
      ownerId:        currentUser!.id,
      ownerRole:      (currentUser?.role === 'Student' ? 'Student' : 'Parent') as 'Student' | 'Parent',
      activeProvider: selectedProvider,
      geminiApiKey:   keys['gemini'],
      openaiApiKey:   keys['openai'],
      anthropicApiKey:keys['anthropic'],
      groqApiKey:     keys['groq'],
      customApiKey:   keys['custom'],
      customApiUrl:   customUrl,
      customModelName:customModel,
      createdAt: myConfig?.createdAt ?? now,
      updatedAt: now,
    };
    setPersonalAiConfigs(prev => prev.some(c => c.ownerId === currentUser!.id)
      ? prev.map(c => c.ownerId === currentUser!.id ? updated : c)
      : [...prev, updated]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const providerInfo = PROVIDERS.find(p => p.id === selectedProvider)!;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">My AI Configuration</h2>
        <p className="text-sm text-slate-500 mt-1">
          Add your personal AI API key to generate quizzes, study materials, and get AI-powered suggestions tailored to your profile.
        </p>
      </div>

      {/* Why personal config? */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm text-indigo-800">
        <p className="font-semibold mb-1">🔑 Why add your own AI key?</p>
        <ul className="space-y-1 list-disc list-inside text-indigo-700">
          <li>Generate unlimited quizzes and study materials based on your class and subjects</li>
          <li>Get personalised AI study suggestions based on your quiz performance</li>
          <li>All content is saved privately to your account</li>
          <li>Your key is stored only in your browser — never shared</li>
        </ul>
      </div>

      {/* Provider Selection */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h3 className="font-semibold text-slate-700">Choose AI Provider</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PROVIDERS.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedProvider(p.id)}
              className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all text-sm font-medium
                ${selectedProvider === p.id ? 'border-indigo-500 bg-indigo-50 text-indigo-800' : 'border-slate-200 hover:border-indigo-300 text-slate-600'}`}
            >
              <span className="text-xl">{p.logo}</span>
              <span className="leading-tight">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* API Key Input */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-700">{providerInfo.keyLabel}</h3>
          {providerInfo.docsUrl !== '#' && (
            <a href={providerInfo.docsUrl} target="_blank" rel="noreferrer"
               className="text-xs text-indigo-600 hover:underline">Get free API key →</a>
          )}
        </div>

        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={keys[selectedProvider] ?? ''}
            onChange={e => setKeys(prev => ({ ...prev, [selectedProvider]: e.target.value }))}
            placeholder={providerInfo.placeholder}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-indigo-400 pr-24"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-indigo-600 font-medium"
          >
            {showKey ? 'Hide' : 'Show'}
          </button>
        </div>

        {selectedProvider === 'custom' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">API Base URL</label>
              <input type="url" value={customUrl} onChange={e => setCustomUrl(e.target.value)}
                placeholder="https://api.yourprovider.com/v1"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Model Name</label>
              <input type="text" value={customModel} onChange={e => setCustomModel(e.target.value)}
                placeholder="gpt-4o-mini / llama-3-70b / etc."
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
            </div>
          </div>
        )}

        <p className="text-xs text-slate-400">
          🔒 Your API key is stored only in this browser's local storage and never sent to our servers.
        </p>
      </div>

      {/* All configured keys status */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-700 mb-3">Configured Keys</h3>
        <div className="space-y-2">
          {PROVIDERS.filter(p => p.id !== 'custom').map(p => (
            <div key={p.id} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2 text-sm">
                <span>{p.logo}</span>
                <span className={selectedProvider === p.id ? 'font-semibold text-indigo-700' : 'text-slate-600'}>{p.label}</span>
                {selectedProvider === p.id && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Active</span>}
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${keys[p.id] ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                {keys[p.id] ? '✓ Set' : 'Not set'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
          saved ? 'bg-green-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
        }`}
      >
        {saved ? '✓ Saved Successfully!' : 'Save AI Configuration'}
      </button>
    </div>
  );
};

export default PersonalAiConfigView;
