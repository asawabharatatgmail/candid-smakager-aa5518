import { useState } from 'react';

interface Quiz {
  q: string;
  options: string[];
  answer: number;
  explanation: string;
}

interface Challenge {
  id: number;
  title: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: number;
  points: number;
  icon: string;
  quizzes: Quiz[];
}

const CHALLENGES: Challenge[] = [
  {
    id: 1, title: 'Basic Algebra', subject: 'Mathematics', difficulty: 'easy',
    questions: 3, points: 30, icon: '➕',
    quizzes: [
      { q: 'Solve for x: 2x + 6 = 14', options: ['x = 3', 'x = 4', 'x = 5', 'x = 6'], answer: 1, explanation: 'Subtract 6 from both sides: 2x = 8, then divide by 2: x = 4.' },
      { q: 'What is 15% of 200?', options: ['25', '30', '35', '40'], answer: 1, explanation: '15/100 × 200 = 30.' },
      { q: 'Factor: x² - 9', options: ['(x-3)(x+3)', '(x-9)(x+1)', '(x-3)²', '(x+9)(x-1)'], answer: 0, explanation: 'Difference of squares: a²-b² = (a-b)(a+b) where a=x, b=3.' },
    ],
  },
  {
    id: 2, title: 'Human Body Systems', subject: 'Biology', difficulty: 'medium',
    questions: 3, points: 45, icon: '🫀',
    quizzes: [
      { q: 'Which organ pumps blood throughout the body?', options: ['Lungs', 'Liver', 'Heart', 'Kidney'], answer: 2, explanation: 'The heart is a muscular organ that pumps blood through the circulatory system.' },
      { q: 'What is the basic unit of life?', options: ['Atom', 'Cell', 'Tissue', 'Organ'], answer: 1, explanation: 'The cell is the smallest structural and functional unit of all living organisms.' },
      { q: 'Where does digestion primarily occur?', options: ['Stomach', 'Mouth', 'Small Intestine', 'Large Intestine'], answer: 2, explanation: 'Most digestion and nutrient absorption occurs in the small intestine.' },
    ],
  },
  {
    id: 3, title: 'Forces & Motion', subject: 'Physics', difficulty: 'medium',
    questions: 3, points: 45, icon: '⚡',
    quizzes: [
      { q: 'What is Newton\'s First Law also called?', options: ['Law of Acceleration', 'Law of Inertia', 'Law of Gravity', 'Law of Action'], answer: 1, explanation: 'Newton\'s First Law states an object at rest stays at rest — this is the principle of inertia.' },
      { q: 'Force = Mass × ___?', options: ['Velocity', 'Speed', 'Acceleration', 'Distance'], answer: 2, explanation: 'F = ma — Force equals mass multiplied by acceleration (Newton\'s Second Law).' },
      { q: 'What is the SI unit of force?', options: ['Joule', 'Watt', 'Pascal', 'Newton'], answer: 3, explanation: 'The Newton (N) is the SI unit of force, defined as kg·m/s².' },
    ],
  },
  {
    id: 4, title: 'World History', subject: 'History', difficulty: 'hard',
    questions: 3, points: 60, icon: '🏛',
    quizzes: [
      { q: 'In which year did World War II end?', options: ['1943', '1944', '1945', '1946'], answer: 2, explanation: 'World War II ended in 1945 with Germany\'s surrender in May and Japan\'s in September.' },
      { q: 'Who wrote the Indian national anthem?', options: ['Mahatma Gandhi', 'Jawaharlal Nehru', 'Rabindranath Tagore', 'Subhas Chandra Bose'], answer: 2, explanation: 'Jana Gana Mana was composed by Rabindranath Tagore and adopted in 1950.' },
      { q: 'The French Revolution began in which year?', options: ['1776', '1789', '1799', '1815'], answer: 1, explanation: 'The French Revolution began in 1789 with the storming of the Bastille on July 14.' },
    ],
  },
  {
    id: 5, title: 'Chemical Reactions', subject: 'Chemistry', difficulty: 'hard',
    questions: 3, points: 60, icon: '⚗️',
    quizzes: [
      { q: 'What is the chemical symbol for Gold?', options: ['Go', 'Gd', 'Au', 'Ag'], answer: 2, explanation: 'Gold\'s symbol Au comes from the Latin word "Aurum".' },
      { q: 'pH of pure water is?', options: ['5', '6', '7', '8'], answer: 2, explanation: 'Pure water is neutral with a pH of exactly 7 at 25°C.' },
      { q: 'What type of bond holds water molecules together?', options: ['Ionic', 'Covalent', 'Metallic', 'Hydrogen'], answer: 3, explanation: 'Hydrogen bonds form between water molecules due to the polar nature of O-H bonds.' },
    ],
  },
];

interface Props {
  showToast: (msg: string, type?: 'error' | 'success') => void;
}

export default function ChallengesScreen({ showToast }: Props) {
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  function startChallenge(c: Challenge) {
    setActiveChallenge(c);
    setQIndex(0);
    setSelected(null);
    setScore(0);
    setDone(false);
  }

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === activeChallenge!.quizzes[qIndex].answer) {
      setScore(s => s + 1);
    }
  }

  function next() {
    const q = activeChallenge!;
    if (qIndex + 1 >= q.quizzes.length) {
      setDone(true);
      setCompleted(prev => new Set(prev).add(q.id));
      const pct = Math.round(((score + (selected === q.quizzes[qIndex].answer ? 1 : 0)) / q.quizzes.length) * 100);
      showToast(pct >= 67 ? `🎉 Great job! ${pct}% score` : `Keep practising! ${pct}% score`, pct >= 67 ? 'success' : 'error');
    } else {
      setQIndex(i => i + 1);
      setSelected(null);
    }
  }

  const diffClass = (d: string) => `challenge-badge badge-${d}`;
  const diffLabel = (d: string) => d.charAt(0).toUpperCase() + d.slice(1);

  return (
    <div className="screen">
      <div className="screen-inner">
        <div style={{ padding: '16px 0 8px' }}>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>🏆 Study Challenges</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Test your knowledge with subject-wise quizzes.</div>
        </div>

        {/* Challenge List */}
        {CHALLENGES.map(c => (
          <div key={c.id} className="challenge-card" onClick={() => startChallenge(c)}>
            <div className="challenge-top">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 28 }}>{c.icon}</span>
                <div>
                  <div className="challenge-title">{c.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{c.subject}</div>
                </div>
              </div>
              <span className={diffClass(c.difficulty)}>{diffLabel(c.difficulty)}</span>
            </div>
            <div className="challenge-meta">
              <span>📝 {c.questions} questions</span>
              <span>⭐ {c.points} pts</span>
              {completed.has(c.id) && <span style={{ color: 'var(--success)' }}>✅ Done</span>}
            </div>
            <div className="progress-bar-wrap">
              <div className="progress-bar-fill" style={{ width: completed.has(c.id) ? '100%' : '0%' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Quiz Modal */}
      {activeChallenge && (
        <div className="quiz-overlay" onClick={e => { if (e.target === e.currentTarget && !done) setActiveChallenge(null); }}>
          <div className="quiz-sheet">
            {done ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 56, marginBottom: 12 }}>
                  {score === activeChallenge.quizzes.length ? '🏆' : score >= activeChallenge.quizzes.length / 2 ? '🎉' : '📚'}
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
                  {score === activeChallenge.quizzes.length ? 'Perfect Score!' : 'Challenge Complete!'}
                </div>
                <div style={{ fontSize: 16, color: 'var(--text-2)', marginBottom: 24 }}>
                  You got <strong style={{ color: 'var(--primary-l)' }}>{score}/{activeChallenge.quizzes.length}</strong> correct
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 24 }}>
                  {score === activeChallenge.quizzes.length
                    ? 'Excellent! You\'ve mastered this topic.'
                    : score >= activeChallenge.quizzes.length / 2
                    ? 'Good work! Review the answers and try again.'
                    : 'Keep practising! Use the AI Study tool to review these concepts.'}
                </div>
                <button className="btn btn-primary btn-full" onClick={() => setActiveChallenge(null)}>
                  Back to Challenges
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 600 }}>
                    {activeChallenge.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                    {qIndex + 1}/{activeChallenge.quizzes.length}
                  </div>
                </div>
                <div className="progress-bar-wrap" style={{ marginBottom: 20 }}>
                  <div className="progress-bar-fill" style={{ width: `${((qIndex) / activeChallenge.quizzes.length) * 100}%` }} />
                </div>

                <div className="quiz-q">{activeChallenge.quizzes[qIndex].q}</div>

                <div className="quiz-options">
                  {activeChallenge.quizzes[qIndex].options.map((opt, i) => {
                    const correct = activeChallenge.quizzes[qIndex].answer;
                    let cls = 'quiz-option';
                    if (selected !== null) {
                      if (i === correct) cls += ' correct';
                      else if (i === selected && i !== correct) cls += ' wrong';
                      else cls += ' reveal';
                    }
                    return (
                      <button key={i} className={cls} onClick={() => handleSelect(i)}>
                        <strong>{String.fromCharCode(65 + i)}.</strong> {opt}
                      </button>
                    );
                  })}
                </div>

                {selected !== null && (
                  <>
                    <div className={`quiz-result ${selected === activeChallenge.quizzes[qIndex].answer ? 'correct' : 'wrong'}`}>
                      {selected === activeChallenge.quizzes[qIndex].answer ? '✅ Correct!' : '❌ Wrong'}
                      <div style={{ fontSize: 13, fontWeight: 400, marginTop: 6, opacity: 0.9 }}>
                        {activeChallenge.quizzes[qIndex].explanation}
                      </div>
                    </div>
                    <button className="btn btn-primary btn-full" style={{ marginTop: 12 }} onClick={next}>
                      {qIndex + 1 >= activeChallenge.quizzes.length ? 'See Results' : 'Next Question →'}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
