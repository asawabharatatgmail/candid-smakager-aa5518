import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { SavedAiContent, AiContentType, AiProvider } from '../../types';

const CONTENT_TYPES: { id: AiContentType; label: string; desc: string; icon: string }[] = [
  { id: 'quiz',          label: 'Quiz (MCQ)',       desc: 'Multiple-choice questions to test knowledge', icon: '📝' },
  { id: 'flashcards',    label: 'Flashcards',       desc: 'Q&A cards for quick revision',                icon: '🃏' },
  { id: 'study_material',label: 'Study Notes',      desc: 'Detailed notes with examples',                icon: '📖' },
  { id: 'summary',       label: 'Topic Summary',    desc: 'Concise summary of a topic',                  icon: '⚡' },
];

const DIFFICULTY = ['Easy', 'Medium', 'Hard'];

// Deterministic mock AI generator — creates realistic content without any API call
const generateMockContent = (type: AiContentType, topic: string, subject: string, numItems: number, difficulty: string): string => {
  if (type === 'quiz') {
    const questions = Array.from({ length: numItems }, (_, i) => ({
      questionText: `[${difficulty}] Question ${i + 1} about ${topic} in ${subject}?`,
      options: [`Option A for Q${i+1}`, `Option B for Q${i+1}`, `Option C for Q${i+1}`, `Option D for Q${i+1}`],
      correctAnswerIndex: i % 4,
    }));
    return JSON.stringify({ quizTitle: `${topic} Quiz`, quizType: 'Multiple Choice', questions });
  }
  if (type === 'flashcards') {
    const cards = Array.from({ length: numItems }, (_, i) => ({
      front: `Key concept ${i + 1} about ${topic}`,
      back: `Explanation of concept ${i + 1}: This is the detailed answer about ${topic} in ${subject}. Important for ${difficulty} level.`,
    }));
    return JSON.stringify(cards);
  }
  if (type === 'study_material' || type === 'summary') {
    return `# ${topic} — ${subject}\n\n## Overview\nThis ${type === 'summary' ? 'summary' : 'study guide'} covers **${topic}** at ${difficulty} level for ${subject}.\n\n## Key Concepts\n\n### 1. Introduction to ${topic}\n${topic} is a fundamental concept in ${subject}. Understanding it requires knowledge of...\n\n### 2. Core Principles\n- **Principle 1**: First important aspect of ${topic}\n- **Principle 2**: Second important aspect with examples\n- **Principle 3**: Application in real-world scenarios\n\n### 3. Important Formulas / Rules\n$$\\text{Key Formula} = \\text{Concept} \\times \\text{Application}$$\n\n### 4. Examples\n**Example 1**: A basic example of ${topic}...\n\n**Example 2**: An advanced application...\n\n## Practice Tips\n1. Review ${topic} daily for 15 minutes\n2. Apply concepts to practice problems\n3. Connect to related topics in ${subject}\n\n## Quick Revision Points\n- Remember: ${topic} is essential for ${subject}\n- Common mistakes to avoid...\n- Exam tips for this topic...`;
  }
  return '';
};

const AiGeneratorView: React.FC = () => {
  const { currentUser, students, classes, subjects, personalAiConfigs, savedAiContent, setSavedAiContent, setActivitySessions, activitySessions } = useAppContext();
  const myConfig = personalAiConfigs.find(c => c.ownerId === currentUser?.id);

  const student = students.find(s => s.email === currentUser?.email || s.id === currentUser?.id);
  const studentClass = classes.find(c => c.id === student?.classId);
  const studentSubjects = subjects.filter(s => student?.subjectIds?.includes(s.id));

  const [contentType, setContentType] = useState<AiContentType>('quiz');
  const [topic, setTopic]             = useState('');
  const [selectedSubject, setSelectedSubject] = useState(studentSubjects[0]?.id ?? '');
  const [numItems, setNumItems]       = useState(5);
  const [difficulty, setDifficulty]   = useState('Medium');
  const [generating, setGenerating]   = useState(false);
  const [result, setResult]           = useState<SavedAiContent | null>(null);
  const [shareWithParent, setShareWithParent] = useState(false);

  const hasKey = !!myConfig && !!(
    myConfig.geminiApiKey || myConfig.openaiApiKey || myConfig.anthropicApiKey ||
    myConfig.groqApiKey || myConfig.customApiKey
  );

  const subjectName = subjects.find(s => s.id === selectedSubject)?.name ?? 'General';
  const className   = studentClass?.name ?? 'My Class';

  const handleGenerate = () => {
    if (!topic.trim()) return;
    setGenerating(true);
    setResult(null);

    // Simulate API delay (1.5s)
    setTimeout(() => {
      const content = generateMockContent(contentType, topic, subjectName, numItems, difficulty);
      const item: SavedAiContent = {
        id:             `sac_${Date.now()}`,
        ownerId:        currentUser!.id,
        ownerRole:      'Student',
        contentType,
        title:          `${topic} — ${CONTENT_TYPES.find(t => t.id === contentType)?.label}`,
        topic,
        subjectName,
        className,
        content,
        generatedAt:    new Date().toISOString().split('T')[0],
        isSharedWithParent: shareWithParent,
        aiProvider:     (myConfig?.activeProvider ?? 'gemini') as AiProvider,
      };
      setResult(item);
      setGenerating(false);
    }, 1500);
  };

  const handleSave = () => {
    if (!result) return;
    setSavedAiContent(prev => [result, ...prev]);
    // Log activity
    const session = {
      id: `act_${Date.now()}`,
      studentId: currentUser!.id,
      date: new Date().toISOString().split('T')[0],
      durationMinutes: 5,
      activity: 'ai_generate' as const,
      subjectId: selectedSubject,
      contentTitle: result.title,
    };
    setActivitySessions(prev => [session, ...prev]);
    setResult(null);
    setTopic('');
  };

  const renderPreview = () => {
    if (!result) return null;
    try {
      if (result.contentType === 'quiz') {
        const data = JSON.parse(result.content);
        return (
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800">{data.quizTitle}</h4>
            {data.questions.slice(0, 3).map((q: any, i: number) => (
              <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <p className="text-sm font-semibold text-slate-700 mb-2">Q{i+1}. {q.questionText}</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {q.options.map((o: string, j: number) => (
                    <div key={j} className={`text-xs px-2.5 py-1.5 rounded-lg border ${j === q.correctAnswerIndex ? 'bg-green-50 border-green-300 text-green-700 font-semibold' : 'bg-white border-slate-200 text-slate-600'}`}>
                      {String.fromCharCode(65+j)}. {o}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {data.questions.length > 3 && <p className="text-xs text-slate-400 text-center">... and {data.questions.length - 3} more questions</p>}
          </div>
        );
      }
      if (result.contentType === 'flashcards') {
        const cards = JSON.parse(result.content);
        return (
          <div className="grid grid-cols-2 gap-3">
            {cards.slice(0, 4).map((c: any, i: number) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-3">
                <p className="text-xs font-bold text-indigo-600 mb-1">FRONT</p>
                <p className="text-sm font-semibold text-slate-800">{c.front}</p>
                <p className="text-xs font-bold text-green-600 mt-2 mb-1">BACK</p>
                <p className="text-xs text-slate-600">{c.back.substring(0, 80)}...</p>
              </div>
            ))}
          </div>
        );
      }
      // study_material / summary — render first 500 chars
      return (
        <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">
          {result.content.substring(0, 600)}...
        </div>
      );
    } catch {
      return <p className="text-sm text-slate-600">{result.content.substring(0, 400)}...</p>;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">AI Content Generator</h2>
        <p className="text-sm text-slate-500 mt-1">Generate personalised quizzes, flashcards and study materials based on your class and subjects.</p>
      </div>

      {!hasKey && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">AI key not configured</p>
            <p className="text-sm text-amber-700 mt-0.5">Please set up your personal AI API key in <strong>AI Config</strong> to use this feature. It's free on Google Gemini!</p>
          </div>
        </div>
      )}

      {/* Student Profile Info */}
      {student && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 flex items-center gap-4 text-sm">
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {student.name[0]}
          </div>
          <div>
            <span className="font-semibold text-indigo-800">{student.name}</span>
            <span className="text-indigo-600 ml-2">· {className}</span>
            <span className="text-indigo-500 ml-2 text-xs">· {studentSubjects.length} subjects</span>
          </div>
          <div className="ml-auto text-xs text-indigo-600 font-medium">
            Content tailored to your profile
          </div>
        </div>
      )}

      {/* Content Type */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h3 className="font-semibold text-slate-700">What do you want to create?</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CONTENT_TYPES.map(t => (
            <button key={t.id} onClick={() => setContentType(t.id)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${contentType === t.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'}`}>
              <div className="text-2xl mb-1.5">{t.icon}</div>
              <p className={`text-sm font-bold ${contentType === t.id ? 'text-indigo-800' : 'text-slate-700'}`}>{t.label}</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-tight">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Parameters */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h3 className="font-semibold text-slate-700">Configure Content</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Topic / Chapter *</label>
            <input type="text" value={topic} onChange={e => setTopic(e.target.value)}
              placeholder={`e.g. Photosynthesis, Quadratic Equations, World War I...`}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Subject</label>
            <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400">
              {studentSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              {studentSubjects.length === 0 && <option value="">General</option>}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Difficulty</label>
            <div className="flex gap-2">
              {DIFFICULTY.map(d => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    difficulty === d ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:border-indigo-300'
                  }`}>{d}</button>
              ))}
            </div>
          </div>
          {(contentType === 'quiz' || contentType === 'flashcards') && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Number of {contentType === 'quiz' ? 'Questions' : 'Cards'}: <span className="text-indigo-600 font-bold">{numItems}</span>
              </label>
              <input type="range" min={3} max={20} value={numItems} onChange={e => setNumItems(parseInt(e.target.value))}
                className="w-full accent-indigo-600" />
              <div className="flex justify-between text-xs text-slate-400 mt-0.5"><span>3</span><span>20</span></div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input type="checkbox" id="shareParent" checked={shareWithParent} onChange={e => setShareWithParent(e.target.checked)}
              className="w-4 h-4 rounded accent-indigo-600" />
            <label htmlFor="shareParent" className="text-sm text-slate-600 cursor-pointer">Share with parent</label>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!topic.trim() || generating}
          className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all
            ${!topic.trim() || generating ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
        >
          {generating ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating with AI...</>
          ) : (
            <><span>✨</span> Generate {CONTENT_TYPES.find(t => t.id === contentType)?.label}</>
          )}
        </button>
      </div>

      {/* Result Preview */}
      {result && (
        <div className="bg-white rounded-xl border-2 border-indigo-300 p-5 space-y-4 fade-in">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-green-600 font-bold text-sm">✓ Generated!</span>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{result.contentType.replace('_', ' ')}</span>
              </div>
              <h4 className="font-bold text-slate-800">{result.title}</h4>
              <p className="text-xs text-slate-400">{result.subjectName} · {result.className} · {difficulty}</p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            {renderPreview()}
          </div>

          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <button onClick={handleSave} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold text-sm transition-colors">
              💾 Save to My AI Library
            </button>
            <button onClick={() => { setResult(null); setTopic(''); }} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded-xl font-bold text-sm transition-colors">
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiGeneratorView;
