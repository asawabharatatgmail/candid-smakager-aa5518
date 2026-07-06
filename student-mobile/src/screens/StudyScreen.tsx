import { useState } from 'react';
import { api } from '../services/api';

const SUBJECTS = ['General', 'Mathematics', 'Science', 'English', 'History', 'Geography', 'Computer', 'Physics', 'Chemistry', 'Biology'];

const QUICK_PROMPTS = [
  'Explain Newton\'s Laws of Motion',
  'What is photosynthesis?',
  'How do I solve quadratic equations?',
  'Explain the water cycle',
  'What causes tides?',
  'What is DNA and RNA?',
];

interface Props {
  showToast: (msg: string, type?: 'error' | 'success') => void;
}

export default function StudyScreen({ showToast }: Props) {
  const [subject, setSubject] = useState('General');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ q: string; a: string }[]>([]);

  async function ask(q?: string) {
    const qText = (q ?? question).trim();
    if (!qText) { showToast('Please type a question first', 'error'); return; }
    setLoading(true);
    setAnswer('');
    try {
      const resp = await api.aiHelp(qText, subject === 'General' ? undefined : subject);
      setAnswer(resp.answer);
      setHistory(prev => [{ q: qText, a: resp.answer }, ...prev.slice(0, 9)]);
      if (q) setQuestion(q);
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.toLowerCase().includes('402') || msg.toLowerCase().includes('trial')) {
        showToast('Trial expired — please upgrade to continue', 'error');
      } else if (msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network')) {
        showToast('Server is waking up — please try again in a moment', 'error');
      } else {
        showToast(msg || 'Could not get an answer — please try again', 'error');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen">
      <div className="screen-inner">
        <div style={{ padding: '16px 0 8px' }}>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>🤖 AI Study Assistant</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Ask any academic question and get instant, detailed answers.</div>
        </div>

        {/* Subject Pills */}
        <div className="subject-pills">
          {SUBJECTS.map(s => (
            <button key={s} className={`pill ${subject === s ? 'active' : ''}`} onClick={() => setSubject(s)}>
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="study-input-wrap">
          <textarea
            className="study-textarea"
            placeholder={`Ask a ${subject} question…`}
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(); } }}
          />
          <button className="btn btn-primary btn-full" onClick={() => ask()} disabled={loading}>
            {loading ? (
              <><span className="spinner" /> Thinking…</>
            ) : (
              '✨ Get AI Answer'
            )}
          </button>
        </div>

        {/* Quick prompts */}
        {!answer && !loading && (
          <>
            <div className="section-title" style={{ marginTop: 8 }}>Try These Questions</div>
            {QUICK_PROMPTS.map(p => (
              <div
                key={p}
                className="card"
                style={{ marginBottom: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}
                onClick={() => { setQuestion(p); ask(p); }}
              >
                <span style={{ color: 'var(--primary-l)', fontSize: 16 }}>→</span>
                <span style={{ fontSize: 14, color: 'var(--text-2)' }}>{p}</span>
              </div>
            ))}
          </>
        )}

        {/* AI Answer */}
        {loading && (
          <div className="ai-answer" style={{ textAlign: 'center', padding: 32 }}>
            <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 12px', borderWidth: 3 }} />
            <div style={{ color: 'var(--text-2)', fontSize: 14 }}>AI is generating your answer…</div>
          </div>
        )}

        {answer && !loading && (
          <div className="ai-answer">
            <div className="ai-answer-header">
              <span>✨</span>
              <span>AI Answer — {subject}</span>
            </div>
            <div className="ai-answer-text">{answer}</div>
            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <button
                className="btn btn-outline"
                style={{ flex: 1, padding: '10px 14px', fontSize: 13 }}
                onClick={() => { setQuestion(''); setAnswer(''); }}
              >
                New Question
              </button>
              <button
                className="btn btn-outline"
                style={{ flex: 1, padding: '10px 14px', fontSize: 13 }}
                onClick={() => ask()}
              >
                Ask Again
              </button>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 1 && (
          <>
            <div className="section-title">Recent Questions</div>
            {history.slice(1, 5).map((item, i) => (
              <div
                key={i}
                className="card"
                style={{ marginBottom: 8, cursor: 'pointer' }}
                onClick={() => { setQuestion(item.q); setAnswer(item.a); }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: 'var(--text-2)' }}>Q: {item.q}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {item.a}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
