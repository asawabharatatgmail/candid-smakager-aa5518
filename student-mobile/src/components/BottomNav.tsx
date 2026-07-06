type Screen = 'home' | 'study' | 'challenges' | 'profile';

interface Props {
  active: Screen;
  onChange: (s: Screen) => void;
}

const ITEMS: { id: Screen; icon: string; label: string }[] = [
  { id: 'home',       icon: '🏠', label: 'Home' },
  { id: 'study',      icon: '🤖', label: 'AI Study' },
  { id: 'challenges', icon: '🏆', label: 'Challenges' },
  { id: 'profile',    icon: '👤', label: 'Profile' },
];

export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="bottom-nav">
      {ITEMS.map(item => (
        <button
          key={item.id}
          className={`nav-item ${active === item.id ? 'active' : ''}`}
          onClick={() => onChange(item.id)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
