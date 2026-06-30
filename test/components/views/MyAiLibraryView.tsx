import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { SavedAiContent, AiContentType } from '../../types';

const TYPE_COLORS: Record<AiContentType, string> = {
  quiz:          'bg-blue-100 text-blue-700',
  flashcards:    'bg-purple-100 text-purple-700',
  study_material:'bg-green-100 text-green-700',
  summary:       'bg-orange-100 text-orange-700',
};

const TYPE_ICONS: Record<AiContentType, string> = {
  quiz: '📝', flashcards: '🃏', study_material: '📖', summary: '⚡',
};

const ContentModal: React.FC<{ item: SavedAiContent; onClose: () => void }> = ({ item, onClose }) => {
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const renderContent = () => {
    try {
      if (item.contentType === 'quiz') {
        const data = JSON.parse(item.content);
        let score = 0;
        if (submitted) {
          data.questions.forEach((q: any, i: number) => { if (quizAnswers[i] === q.correctAnswerIndex) score++; });
        }
        return (
          <div className="space-y-4">
            {submitted && (
              <div className={`p-4 rounded-xl text-center font-bold text-lg ${score >= data.questions.length * 0.7 ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                Score: {score}/{data.questions.length} ({Math.round(score/data.questions.length*100)}%)
              </div>
            )}
            {data.questions.map((q: any, i: number) => (
              <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-sm font-semibold text-slate-800 mb-3">Q{i+1}. {q.questionText}</p>
                <div className="space-y-2">
                  {q.options.map((o: string, j: number) => {
                    let cls = 'border-slate-200 bg-white text-slate-700';
                    if (submitted) {
                      if (j === q.correctAnswerIndex) cls = 'border-green-400 bg-green-50 text-green-800 font-semibold';
                      else if (quizAnswers[i] === j) cls = 'border-red-300 bg-red-50 text-red-700';
                    } else if (quizAnswers[i] === j) {
                      cls = 'border-indigo-400 bg-indigo-50 text-indigo-800';
                    }
                    return (
                      <button key={j} disabled={submitted} onClick={() => setQuizAnswers(p => ({ ...p, [i]: j }))}
                        className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${cls}`}>
                        {String.fromCharCode(65+j)}. {o}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {!submitted && (
              <button onClick={() => setSubmitted(true)}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors">
                Submit Quiz
              </button>
            )}
          </div>
        );
      }
      if (item.contentType === 'flashcards') {
        const cards = JSON.parse(item.content);
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cards.map((c: any, i: number) => (
              <FlipCard key={i} front={c.front} back={c.back} />
            ))}
          </div>
        );
      }
      return (
        <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed text-sm">
          {item.content}
        </div>
      );
    } catch {
      return <p className="text-sm text-slate-600 whitespace-pre-wrap">{item.content}</p>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xl">{TYPE_ICONS[item.contentType]}</span>
              <span className={`badge text-xs ${TYPE_COLORS[item.contentType]}`}>{item.contentType.replace('_', ' ')}</span>
            </div>
            <h3 className="font-bold text-slate-800 text-base">{item.title}</h3>
            <p className="text-xs text-slate-400">{item.subjectName} · {item.className} · {item.generatedAt}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 text-xl leading-none">✕</button>
        </div>
        <div className="overflow-y-auto p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

const FlipCard: React.FC<{ front: string; back: string }> = ({ front, back }) => {
  const [flipped, setFlipped] = useState(false);
  return (
    <div onClick={() => setFlipped(!flipped)} className="cursor-pointer min-h-24 rounded-xl border-2 border-slate-200 hover:border-indigo-300 transition-all p-4 select-none">
      {!flipped ? (
        <div>
          <p className="text-xs font-bold text-indigo-500 mb-1.5">QUESTION · Click to flip</p>
          <p className="text-sm font-semibold text-slate-800">{front}</p>
        </div>
      ) : (
        <div>
          <p className="text-xs font-bold text-green-500 mb-1.5">ANSWER · Click to flip back</p>
          <p className="text-sm text-slate-700">{back}</p>
        </div>
      )}
    </div>
  );
};

const MyAiLibraryView: React.FC = () => {
  const { savedAiContent, setSavedAiContent, currentUser } = useAppContext();
  const [filter, setFilter] = useState<AiContentType | 'all'>('all');
  const [selected, setSelected] = useState<SavedAiContent | null>(null);

  const myContent = savedAiContent
    .filter(c => c.ownerId === currentUser?.id)
    .filter(c => filter === 'all' || c.contentType === filter)
    .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());

  const handleDelete = (id: string) => {
    setSavedAiContent(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">My AI Library</h2>
          <p className="text-sm text-slate-500">{myContent.length} saved items</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[{ id: 'all', label: 'All' }, ...Object.entries(TYPE_ICONS).map(([id, icon]) => ({ id, label: `${icon} ${id.replace('_', ' ')}` }))].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id as any)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors capitalize ${
              filter === f.id ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {myContent.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <div className="text-5xl mb-4">🧠</div>
          <p className="font-semibold">No saved content yet</p>
          <p className="text-sm mt-1">Use the AI Generator to create quizzes, flashcards and notes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myContent.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-all hover:border-indigo-200 group">
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{TYPE_ICONS[item.contentType]}</span>
                <div className="flex items-center gap-1">
                  {item.isSharedWithParent && <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">Shared</span>}
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    🗑️
                  </button>
                </div>
              </div>
              <h4 className="font-bold text-slate-800 text-sm leading-tight mb-1">{item.title}</h4>
              <p className="text-xs text-slate-400 mb-3">{item.topic} · {item.subjectName}</p>
              <div className="flex items-center justify-between">
                <span className={`badge text-xs ${TYPE_COLORS[item.contentType]}`}>{item.contentType.replace('_', ' ')}</span>
                <span className="text-xs text-slate-400">{item.generatedAt}</span>
              </div>
              <button onClick={() => setSelected(item)}
                className="mt-3 w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors">
                Open & Study
              </button>
            </div>
          ))}
        </div>
      )}

      {selected && <ContentModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default MyAiLibraryView;
