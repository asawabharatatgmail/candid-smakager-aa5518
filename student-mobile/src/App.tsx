import { useState, useCallback } from 'react';
import { User, getCachedUser, clearSession } from './services/api';
import AuthScreen from './screens/AuthScreen';
import DashboardScreen from './screens/DashboardScreen';
import StudyScreen from './screens/StudyScreen';
import ChallengesScreen from './screens/ChallengesScreen';
import ProfileScreen from './screens/ProfileScreen';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';

type Screen = 'home' | 'study' | 'challenges' | 'profile';

interface ToastState {
  message: string;
  type: 'error' | 'success' | 'info';
  key: number;
}

function initials(name: string): string {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

export default function App() {
  const [user, setUser] = useState<User | null>(getCachedUser);
  const [screen, setScreen] = useState<Screen>('home');
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, type: 'error' | 'success' | 'info' = 'info') => {
    setToast({ message, type, key: Date.now() });
  }, []);

  function handleAuth() {
    const u = getCachedUser();
    setUser(u);
    setScreen('home');
  }

  function handleLogout() {
    clearSession();
    setUser(null);
    setScreen('home');
  }

  if (!user) {
    return (
      <>
        <AuthScreen onAuth={handleAuth} showToast={showToast} />
        {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
      </>
    );
  }

  return (
    <div className="app-shell">
      {/* Top Bar */}
      <header className="topbar">
        <div className="topbar-logo">
          {screen === 'home'       && 'System4Learn'}
          {screen === 'study'      && '🤖 AI Study'}
          {screen === 'challenges' && '🏆 Challenges'}
          {screen === 'profile'    && '👤 Profile'}
        </div>
        <div className="topbar-avatar" onClick={() => setScreen('profile')}>
          {initials(user.name)}
        </div>
      </header>

      {/* Screen Content */}
      {screen === 'home' && (
        <DashboardScreen user={user} onNavigate={s => setScreen(s)} />
      )}
      {screen === 'study' && (
        <StudyScreen showToast={showToast} />
      )}
      {screen === 'challenges' && (
        <ChallengesScreen showToast={showToast} />
      )}
      {screen === 'profile' && (
        <ProfileScreen user={user} onLogout={handleLogout} showToast={showToast} />
      )}

      {/* Bottom Navigation */}
      <BottomNav active={screen} onChange={setScreen} />

      {/* Toast Notifications */}
      {toast && (
        <Toast key={toast.key} message={toast.message} type={toast.type} onDone={() => setToast(null)} />
      )}
    </div>
  );
}
