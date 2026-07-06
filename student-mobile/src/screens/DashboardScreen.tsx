import { User, trialDaysLeft } from '../services/api';

interface Props {
  user: User;
  onNavigate: (s: 'study' | 'challenges' | 'profile') => void;
}

function greet(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function DashboardScreen({ user, onNavigate }: Props) {
  const days = trialDaysLeft(user);
  const firstName = user.name.split(' ')[0];

  const trialLabel =
    user.subscription_status === 'trial'
      ? `${days} day${days !== 1 ? 's' : ''} left in trial`
      : user.subscription_status === 'active'
      ? 'Active Subscription'
      : 'Trial Expired';

  const trialClass =
    user.subscription_status === 'active' ? 'good'
    : days > 3 ? 'good'
    : '';

  return (
    <div className="screen">
      <div className="screen-inner">
        {/* Hero Banner */}
        <div className="hero-banner">
          <div className="hero-greeting">{greet()},</div>
          <div className="hero-name">{firstName} 👋</div>
          <div className={`trial-badge ${trialClass}`}>
            {user.subscription_status === 'trial' ? '⏱' : user.subscription_status === 'active' ? '✅' : '❌'}
            {' '}{trialLabel}
          </div>
        </div>

        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-val">7</div>
            <div className="stat-lbl">Days Trial</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">∞</div>
            <div className="stat-lbl">AI Questions</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">50+</div>
            <div className="stat-lbl">Challenges</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="section-title">Quick Actions</div>
        <div className="qa-grid">
          <div className="qa-card card-glow" onClick={() => onNavigate('study')}>
            <div className="qa-icon">🤖</div>
            <div className="qa-title">AI Study Help</div>
            <div className="qa-desc">Ask anything, get instant answers</div>
          </div>
          <div className="qa-card" onClick={() => onNavigate('challenges')}>
            <div className="qa-icon">🏆</div>
            <div className="qa-title">Challenges</div>
            <div className="qa-desc">Test your knowledge with quizzes</div>
          </div>
          <div className="qa-card" onClick={() => onNavigate('study')}>
            <div className="qa-icon">📖</div>
            <div className="qa-title">Concept Explainer</div>
            <div className="qa-desc">Understand any topic in depth</div>
          </div>
          <div className="qa-card" onClick={() => onNavigate('profile')}>
            <div className="qa-icon">📊</div>
            <div className="qa-title">My Progress</div>
            <div className="qa-desc">Track your learning journey</div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="section-title">What You Can Do</div>

        {[
          { icon: '💡', title: 'Instant AI Answers', desc: 'Ask any academic question — Maths, Science, English, History — and get clear, detailed explanations instantly.' },
          { icon: '🧠', title: 'Smart Quizzes', desc: 'Test yourself with subject-wise challenges. Track which topics need more attention.' },
          { icon: '📈', title: 'Progress Tracking', desc: 'See your improvement over time and identify areas to focus on.' },
          { icon: '🎯', title: 'Personalised Learning', desc: 'The AI adapts to your learning style and level over time.' },
        ].map(item => (
          <div className="card" key={item.title} style={{ marginBottom: 10, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>{item.icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          </div>
        ))}

        {user.subscription_status === 'trial' && days <= 3 && (
          <div className="card" style={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)', marginTop: 16, textAlign: 'center', padding: 20 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>⚡</div>
            <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--warn)' }}>Trial ending soon!</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Only {days} day{days !== 1 ? 's' : ''} left. Contact your institute to upgrade and keep full access.</div>
          </div>
        )}
      </div>
    </div>
  );
}
